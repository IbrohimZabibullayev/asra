const express = require('express');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { PrismaClient } = require('@prisma/client');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// POST /api/verify — Match referral code, verify user, return JWT
router.post('/verify', async (req, res) => {
    try {
        const { code } = req.body;
        console.log(`[Verify] Attempting code: ${code}`);

        if (!code || code.length !== 6) {
            return res.status(400).json({ error: 'Noto\'g\'ri kod formati' });
        }

        const user = await prisma.user.findUnique({
            where: { referral_code: code }
        });

        if (!user) {
            return res.status(404).json({ error: 'Kod topilmadi' });
        }

        if (user.status === 'BLOCKED') {
            return res.status(403).json({ error: 'Sizning hisobingiz admin tomonidan bloklangan' });
        }

        // Check expiry
        if (user.referral_code_expires_at && new Date() > new Date(user.referral_code_expires_at)) {
            return res.status(400).json({ error: 'Kodning amal qilish muddati tugagan (2 daqiqa). Iltimos, botdan yangi kod oling.' });
        }

        if (user.is_verified) {
            // Already verified — still issue a token
            if (process.env.WAITLIST_MODE === 'true' && user.role !== 'MERCHANT') {
                if (!user.is_waitlisted) {
                    await prisma.user.update({ where: { id: user.id }, data: { is_waitlisted: true } });
                }
                const token = jwt.sign(
                    { userId: user.id, tgId: user.tg_id },
                    process.env.JWT_SECRET,
                    { expiresIn: '30d' }
                );
                return res.json({ token, user: sanitizeUser(user), waitlisted: true, waitlistMode: true, message: 'Siz waitlistdasiz' });
            }

            const token = jwt.sign(
                { userId: user.id, tgId: user.tg_id },
                process.env.JWT_SECRET,
                { expiresIn: '30d' }
            );
            return res.json({ token, user: sanitizeUser(user), waitlistMode: process.env.WAITLIST_MODE === 'true', message: 'Siz allaqachon tasdiqlangansiz' });
        }

        const isWaitlist = process.env.WAITLIST_MODE === 'true';
        
        const updatedUser = await prisma.user.update({
            where: { id: user.id },
            data: { 
                is_verified: true, 
                status: 'ACTIVE',
                ...(isWaitlist ? { is_waitlisted: true } : {})
            }
        });

        const token = jwt.sign(
            { userId: updatedUser.id, tgId: updatedUser.tg_id },
            process.env.JWT_SECRET,
            { expiresIn: '30d' }
        );

        if (isWaitlist && updatedUser.role !== 'MERCHANT') {
            return res.json({ token, user: sanitizeUser(updatedUser), waitlisted: true, waitlistMode: true, message: 'Muvaffaqiyatli ro\'yxatdan o\'tdingiz (Waitlist)!' });
        }

        res.json({ token, user: sanitizeUser(updatedUser), waitlistMode: isWaitlist, message: 'Muvaffaqiyatli tasdiqlandi!' });
    } catch (err) {
        console.error('Verify error:', err);
        res.status(500).json({ error: 'Server xatosi' });
    }
});

// POST /api/auth/telegram — Log in with Telegram Mini App data
router.post('/auth/telegram', async (req, res) => {
    try {
        const { initData } = req.body;
        if (!initData) return res.status(400).json({ error: 'Ma\'lumotlar topilmadi' });

        const BOT_TOKEN = process.env.BOT_TOKEN;
        if (!BOT_TOKEN) return res.status(500).json({ error: 'Server sozlamalari xatosi' });

        // 1. Verify Telegram signature
        const urlParams = new URLSearchParams(initData);
        const hash = urlParams.get('hash');
        urlParams.delete('hash');
        urlParams.sort();

        let dataCheckString = '';
        for (const [key, value] of urlParams.entries()) {
            dataCheckString += `${key}=${value}\n`;
        }
        dataCheckString = dataCheckString.slice(0, -1);

        const secretKey = crypto.createHmac('sha256', 'WebAppData').update(BOT_TOKEN).digest();
        const calculatedHash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');

        if (calculatedHash !== hash) {
            return res.status(401).json({ error: 'Telegram autentifikatsiyasi xatosi' });
        }

        // 2. Parse user data
        const userDataString = urlParams.get('user');
        if (!userDataString) return res.status(400).json({ error: 'Foydalanuvchi ma\'lumotlari topilmadi' });
        const tgUser = JSON.parse(userDataString);
        const tgId = String(tgUser.id);

        // 3. Find or create user
        const isWaitlist = process.env.WAITLIST_MODE === 'true';
        let user = await prisma.user.findUnique({ where: { tg_id: tgId } });

        if (!user) {
            user = await prisma.user.create({
                data: {
                    tg_id: tgId,
                    full_name: `${tgUser.first_name || ''} ${tgUser.last_name || ''}`.trim() || 'Telegram Foydalanuvchisi',
                    username: tgUser.username || null,
                    is_verified: true,
                    status: 'ACTIVE',
                    referral_code: Math.floor(100000 + Math.random() * 900000).toString(),
                    ...(isWaitlist ? { is_waitlisted: true } : {})
                }
            });
        }

        if (user.status === 'BLOCKED') {
            return res.status(403).json({ error: 'Sizning hisobingiz bloklangan' });
        }

        // 4. Issue token
        const token = jwt.sign(
            { userId: user.id, tgId: user.tg_id },
            process.env.JWT_SECRET,
            { expiresIn: '30d' }
        );

        if (isWaitlist && user.role !== 'MERCHANT') {
            if (!user.is_waitlisted) {
                user = await prisma.user.update({ where: { id: user.id }, data: { is_waitlisted: true } });
            }
            return res.json({ token, user: sanitizeUser(user), waitlisted: true, waitlistMode: true });
        }

        res.json({ token, user: sanitizeUser(user), waitlistMode: isWaitlist });
    } catch (err) {
        console.error('Telegram auth error:', err);
        res.status(500).json({ error: 'Server xatosi' });
    }
});

// POST /api/switch-role — Toggle between CUSTOMER and MERCHANT
router.post('/switch-role', authMiddleware, async (req, res) => {
    try {
        const user = await prisma.user.findUnique({ where: { id: req.userId } });

        if (!user) {
            return res.status(404).json({ error: 'Foydalanuvchi topilmadi' });
        }

        if (user.merchant_status !== 'APPROVED') {
            return res.status(403).json({ error: 'Siz hali sotuvchi sifatida tasdiqlanmagansiz' });
        }

        const newRole = user.role === 'CUSTOMER' ? 'MERCHANT' : 'CUSTOMER';
        const updatedUser = await prisma.user.update({
            where: { id: user.id },
            data: { role: newRole }
        });

        res.json({ user: sanitizeUser(updatedUser), message: `${newRole === 'MERCHANT' ? 'Sotuvchi' : 'Mijoz'} rejimiga o'tildi` });
    } catch (err) {
        console.error('Switch role error:', err);
        res.status(500).json({ error: 'Server xatosi' });
    }
});

function sanitizeUser(user) {
    return {
        id: user.id,
        tg_id: user.tg_id,
        full_name: user.full_name,
        username: user.username,
        phone: user.phone,
        photo_url: user.photo_url,
        role: user.role,
        is_verified: user.is_verified,
        status: user.status,
        merchant_status: user.merchant_status,
        store_name: user.store_name,
        store_description: user.store_description,
        store_address: user.store_address,
        is_waitlisted: user.is_waitlisted,
        referral_code_expires_at: user.referral_code_expires_at
    };
}

module.exports = router;
