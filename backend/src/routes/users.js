const express = require('express');
const jwt = require('jsonwebtoken');
const prisma = require('../prisma');
const { authMiddleware } = require('../middleware/auth');
const axios = require('axios');

const router = express.Router();
const BOT_TOKEN = process.env.BOT_TOKEN;

// GET /api/users/photo/:tg_id — Proxy Telegram profile photo
router.get('/users/photo/:tg_id', async (req, res) => {
    try {
        const { tg_id } = req.params;
        const user = await prisma.user.findUnique({ where: { tg_id: String(tg_id) } });

        if (!user || !user.photo_url) {
            return res.status(404).json({ error: 'Photo not found' });
        }

        let file_path = user.photo_url;

        if (file_path.includes('api.telegram.org')) {
            const parts = file_path.split('/');
            const botIndex = parts.findIndex(p => p.startsWith('bot'));
            if (botIndex !== -1) {
                file_path = parts.slice(botIndex + 1).join('/');
            }
        } else if (!file_path.includes('/')) {
            // If it doesn't contain '/', it's likely a file_id. Fetch the temporary file_path
            const getFileUrl = `https://api.telegram.org/bot${BOT_TOKEN}/getFile?file_id=${file_path}`;
            const fileResp = await axios.get(getFileUrl);
            if (fileResp.data && fileResp.data.ok) {
                file_path = fileResp.data.result.file_path;
            } else {
                return res.status(404).json({ error: 'Failed to resolve file_path for file_id' });
            }
        }

        const telegram_url = `https://api.telegram.org/file/bot${BOT_TOKEN}/${file_path}`;

        const response = await axios({
            method: 'get',
            url: telegram_url,
            responseType: 'stream'
        });

        res.setHeader('Content-Type', response.headers['content-type']);
        response.data.pipe(res);
    } catch (err) {
        console.error('Proxy photo error:', err.message);
        res.status(500).json({ error: 'Failed to fetch photo' });
    }
});

// GET /api/me — Get current user profile
router.get('/me', authMiddleware, async (req, res) => {
    try {
        const user = await prisma.user.findUnique({ where: { id: req.userId } });
        if (!user) {
            return res.status(404).json({ error: 'Foydalanuvchi topilmadi' });
        }
        res.json({ user: sanitizeUser(user), waitlistMode: process.env.WAITLIST_MODE === 'true' });
    } catch (err) {
        console.error('Get me error:', err);
        res.status(500).json({ error: 'Server xatosi' });
    }
});

// GET /api/users — List all users (admin)
router.get('/users', async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            orderBy: { created_at: 'desc' }
        });
        res.json({ users: users.map(sanitizeUser) });
    } catch (err) {
        console.error('Get users error:', err);
        res.status(500).json({ error: 'Server xatosi' });
    }
});

// GET /api/waitlist/stats — Get total number of waitlisted users
router.get('/waitlist/stats', async (req, res) => {
    try {
        const count = await prisma.user.count({ where: { is_waitlisted: true } });
        res.json({ count });
    } catch (err) {
        console.error('Waitlist stats error:', err);
        res.status(500).json({ error: 'Server xatosi' });
    }
});

// POST /api/apply-merchant — Submit merchant application (Can be used by Guests with code)
router.post('/apply-merchant', async (req, res) => {
    console.log(`[Users] POST /apply-merchant reached. Body:`, req.body);
    try {
        const authHeader = req.headers.authorization;
        let userId = null;
        let newlyVerifiedToken = null;

        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1];
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                userId = decoded.userId;
            } catch (err) {
                // Invalid token? Continue to check code
            }
        }

        const {
            store_name,
            store_description,
            store_address,
            district,
            region,
            phone,
            logo_url,
            business_type,
            inn,
            company_name,
            responsible_person,
            verification_code
        } = req.body;

        let user = null;

        if (userId) {
            user = await prisma.user.findUnique({ where: { id: userId } });
        } else if (verification_code) {
            user = await prisma.user.findUnique({
                where: { referral_code: verification_code }
            });

            if (!user) {
                return res.status(404).json({ error: 'Tasdiqlash kodi noto\'g\'ri' });
            }

            if (user.referral_code_expires_at && new Date() > new Date(user.referral_code_expires_at)) {
                console.warn(`[ApplyMerchant] Expired code: ${verification_code}`);
                return res.status(400).json({ error: 'Kodning amal qilish muddati tugagan. Botdan yangi kod oling.' });
            }

            if (!user.is_verified) {
                user = await prisma.user.update({
                    where: { id: user.id },
                    data: { is_verified: true, status: 'ACTIVE' }
                });
            }

            newlyVerifiedToken = jwt.sign(
                { userId: user.id, tgId: user.tg_id },
                process.env.JWT_SECRET,
                { expiresIn: '30d' }
            );
        }

        if (!user) {
            return res.status(401).json({ error: 'Tizimga kirmagansiz yoki tasdiqlash kodi kiritilmadi' });
        }

        if (!store_name || !store_address) {
            console.warn(`[ApplyMerchant] Validation failed: store_name=${store_name}, store_address=${store_address}`);
            return res.status(400).json({ error: 'Do\'kon nomi va manzili kiritilishi shart' });
        }

        const updatedUser = await prisma.user.update({
            where: { id: user.id },
            data: {
                store_name,
                store_description: store_description || '',
                store_address,
                store_logo: logo_url || null,
                region: region || user.region,
                district: district || null,
                phone: phone || user.phone,
                business_type: business_type || null,
                inn: inn || null,
                company_name: company_name || null,
                responsible_person: responsible_person || null,
                merchant_status: 'PENDING',
                role: 'MERCHANT'
            }
        });

        // Sync address to products
        try {
            const formattedAddress = [updatedUser.region, updatedUser.district, updatedUser.store_address].filter(Boolean).join(', ') || 'Manzil kiritilmagan';
            await prisma.product.updateMany({
                where: { merchant_id: updatedUser.tg_id },
                data: {
                    merchant_address: formattedAddress,
                    merchant_name: updatedUser.store_name || updatedUser.full_name,
                    region: updatedUser.region || 'Toshkent'
                }
            });
        } catch (syncErr) {
            console.error('Sync products address error:', syncErr);
        }

        res.json({
            user: sanitizeUser(updatedUser),
            token: newlyVerifiedToken,
            message: 'So\'rov muvaffaqiyatli yuborildi! Admin tasdiqlashini kuting.'
        });
    } catch (err) {
        console.error('Apply merchant error:', err);
        res.status(500).json({ error: 'Server xatosi' });
    }
});

// GET /api/notifications — Get user notifications
router.get('/notifications', authMiddleware, async (req, res) => {
    try {
        const user = await prisma.user.findUnique({ where: { id: req.userId } });
        const notifications = await prisma.notification.findMany({
            where: { user_id: user.tg_id },
            orderBy: { created_at: 'desc' },
            take: 20
        });
        res.json({ notifications });
    } catch (err) {
        console.error('Get notifications error:', err);
        res.status(500).json({ error: 'Server xatosi' });
    }
});

// POST /api/notifications/read/:id — Mark notification as read
router.post('/notifications/read/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.notification.update({
            where: { id: parseInt(id) },
            data: { is_read: true }
        });
        res.json({ success: true });
    } catch (err) {
        console.error('Read notification error:', err);
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
        store_logo: user.store_logo,
        region: user.region,
        district: user.district,
        business_type: user.business_type,
        inn: user.inn,
        company_name: user.company_name,
        responsible_person: user.responsible_person,
        is_waitlisted: user.is_waitlisted,
        invite_code: user.invite_code,
        invite_code_expires_at: user.invite_code_expires_at,
        parent_merchant_id: user.parent_merchant_id
    };
}

module.exports = router;
