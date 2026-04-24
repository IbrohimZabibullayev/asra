const express = require('express');
const prisma = require('../prisma');

const router = express.Router();

// GET /api/bot/check-user/:tg_id — Check if user exists for bot re-login
router.get('/check-user/:tg_id', async (req, res) => {
    try {
        const { tg_id } = req.params;
        const user = await prisma.user.findUnique({ where: { tg_id: String(tg_id) } });
        if (!user) return res.status(404).json({ exists: false });
        res.json({ exists: true, user: { id: user.id, full_name: user.full_name, region: user.region } });
    } catch (err) {
        console.error('Check user error:', err);
        res.status(500).json({ error: 'Server xatosi' });
    }
});

// POST /api/bot/register — Called by the Telegram bot to register a new user
router.post('/register', async (req, res) => {
    try {
        const { tg_id, full_name, username, phone, photo_url, referral_code, region } = req.body;

        if (!tg_id || !full_name || !referral_code) {
            return res.status(400).json({ error: 'tg_id, full_name, va referral_code kiritilishi shart' });
        }

        // Calculate expiry (24 hours from now)
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 24);

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({ where: { tg_id: String(tg_id) } });
        if (existingUser) {
            const updated = await prisma.user.update({
                where: { id: existingUser.id },
                data: {
                    full_name,
                    username: username || existingUser.username,
                    phone: phone || existingUser.phone,
                    photo_url: photo_url || existingUser.photo_url,
                    region: region || existingUser.region,
                    referral_code,
                    referral_code_expires_at: expiresAt,
                    is_verified: false // Require re-verification with new code
                }
            });
            return res.json({
                user: updated,
                message: 'Foydalanuvchi ma\'lumotlari yangilandi va yangi kod yuborildi',
                referral_code: updated.referral_code
            });
        }

        const user = await prisma.user.create({
            data: {
                tg_id: String(tg_id),
                full_name,
                username: username || null,
                phone: phone || null,
                photo_url: photo_url || null,
                region: region || 'Toshkent',
                referral_code,
                referral_code_expires_at: expiresAt,
                status: 'PENDING_VERIFICATION'
            }
        });

        res.json({ user, message: 'Foydalanuvchi muvaffaqiyatli ro\'yxatdan o\'tdi' });
    } catch (err) {
        console.error('Bot register error:', err);
        res.status(500).json({ error: 'Server xatosi' });
    }
});

module.exports = router;
