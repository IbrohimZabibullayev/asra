const express = require('express');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { PrismaClient } = require('@prisma/client');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Helper to verify Telegram InitData
function verifyTelegramInitData(initData) {
    if (!initData) return null;
    try {
        const BOT_TOKEN = process.env.BOT_TOKEN;
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
        if (calculatedHash !== hash) return null;
        const userDataString = urlParams.get('user');
        return JSON.parse(userDataString);
    } catch (e) {
        return null;
    }
}

// POST /api/verify — Match referral code OR invite code
router.post('/verify', async (req, res) => {
    try {
        const { code, intendedRole, initData } = req.body;
        console.log(`[Verify] Attempting code: ${code}, Role: ${intendedRole}`);

        if (!code || code.length !== 6) {
            return res.status(400).json({ error: 'Noto\'g\'ri kod formati' });
        }

        // 1. Try to find as a regular referral code (Login/Registration)
        let user = await prisma.user.findUnique({
            where: { referral_code: code }
        });

        // 2. If not found, try to find as an invite code (Add Seller)
        if (!user) {
            const parentMerchant = await prisma.user.findUnique({
                where: { invite_code: code }
            });

            if (parentMerchant) {
                // Check invite code expiry
                if (parentMerchant.invite_code_expires_at && new Date() > new Date(parentMerchant.invite_code_expires_at)) {
                    return res.status(400).json({ error: 'Taklif kodi muddati tugagan (2 daqiqa).' });
                }

                // We need to know WHO is using this invite code
                const tgUser = verifyTelegramInitData(initData);
                if (!tgUser) {
                    return res.status(401).json({ error: 'Taklif kodini ishlatish uchun Telegram orqali kiring' });
                }

                const tgId = String(tgUser.id);

                // Link current user to parent merchant
                user = await prisma.user.upsert({
                    where: { tg_id: tgId },
                    update: {
                        parent_merchant_id: parentMerchant.tg_id,
                        role: 'MERCHANT',
                        merchant_status: 'APPROVED',
                        is_verified: true,
                        status: 'ACTIVE',
                        store_name: parentMerchant.store_name,
                        store_address: parentMerchant.store_address,
                        store_logo: parentMerchant.store_logo,
                        store_description: parentMerchant.store_description,
                        region: parentMerchant.region,
                        district: parentMerchant.district,
                        business_type: parentMerchant.business_type,
                        inn: parentMerchant.inn,
                        company_name: parentMerchant.company_name,
                        responsible_person: parentMerchant.responsible_person
                    },
                    create: {
                        tg_id: tgId,
                        full_name: `${tgUser.first_name || ''} ${tgUser.last_name || ''}`.trim() || 'Sotuvchi',
                        username: tgUser.username || null,
                        parent_merchant_id: parentMerchant.tg_id,
                        role: 'MERCHANT',
                        merchant_status: 'APPROVED',
                        is_verified: true,
                        status: 'ACTIVE',
                        store_name: parentMerchant.store_name,
                        store_address: parentMerchant.store_address,
                        store_logo: parentMerchant.store_logo,
                        store_description: parentMerchant.store_description,
                        region: parentMerchant.region,
                        district: parentMerchant.district,
                        business_type: parentMerchant.business_type,
                        inn: parentMerchant.inn,
                        company_name: parentMerchant.company_name,
                        responsible_person: parentMerchant.responsible_person,
                        referral_code: Math.floor(100000 + Math.random() * 900000).toString()
                    }
                });

                const token = jwt.sign(
                    { userId: user.id, tgId: user.tg_id },
                    process.env.JWT_SECRET,
                    { expiresIn: '30d' }
                );

                return res.json({ token, user: sanitizeUser(user), message: `Tabriklaymiz! Siz "${parentMerchant.store_name}" do'koniga sotuvchi sifatida qo'shildingiz.` });
            }
        }

        if (!user) {
            return res.status(404).json({ error: 'Kod topilmadi' });
        }

        if (user.status === 'BLOCKED') {
            return res.status(403).json({ error: 'Sizning hisobingiz admin tomonidan bloklangan' });
        }

        // VALIDATION: If logging in as merchant, check if shop exists
        if (intendedRole === 'MERCHANT') {
            const hasShop = user.role === 'MERCHANT' || (user.store_name && user.store_name.length > 0);
            if (!hasShop) {
                return res.status(404).json({ error: 'Do\'kon topilmadi. Qaytadan do\'kon oching.' });
            }
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

        // DO NOT Auto-login if user is not verified. They must go through VerifyPage and enter code!
        if (!user || !user.is_verified) {
            return res.status(401).json({ error: 'Tasdiqlanmagan foydalanuvchi. Iltimos kod orqali kiring.' });
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

// POST /api/merchant/invite-code — Generate/get invite code for adding sellers
router.post('/merchant/invite-code', authMiddleware, async (req, res) => {
    try {
        const user = await prisma.user.findUnique({ where: { id: req.userId } });

        if (!user || user.role !== 'MERCHANT') {
            return res.status(403).json({ error: 'Faqat do\'kon egalari sotuvchi qo\'sha oladi' });
        }

        // Generate new 6-digit code
        const invite_code = Math.floor(100000 + Math.random() * 900000).toString();
        const expires_at = new Date(Date.now() + 2 * 60 * 1000); // 2 minutes

        const updatedUser = await prisma.user.update({
            where: { id: user.id },
            data: {
                invite_code,
                invite_code_expires_at: expires_at
            }
        });

        res.json({
            invite_code: updatedUser.invite_code,
            expires_at: updatedUser.invite_code_expires_at
        });
    } catch (err) {
        console.error('Invite code generation error:', err);
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
        referral_code_expires_at: user.referral_code_expires_at,
        invite_code: user.invite_code,
        invite_code_expires_at: user.invite_code_expires_at,
        parent_merchant_id: user.parent_merchant_id
    };
}

module.exports = router;
