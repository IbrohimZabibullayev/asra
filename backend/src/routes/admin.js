const express = require('express');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/admin/pending-stores — List pending merchant applications
router.get('/pending-stores', async (req, res) => {
    try {
        const pendingUsers = await prisma.user.findMany({
            where: { merchant_status: 'PENDING' },
            orderBy: { updated_at: 'desc' }
        });
        res.json({ stores: pendingUsers.map(sanitizeUser) });
    } catch (err) {
        console.error('Pending stores error:', err);
        res.status(500).json({ error: 'Server xatosi' });
    }
});
// GET /api/admin/products — List all products across the platform
router.get('/products', async (req, res) => {
    try {
        const products = await prisma.product.findMany({
            orderBy: { created_at: 'desc' }
        });
        res.json({ products });
    } catch (err) {
        console.error('Admin products error:', err);
        res.status(500).json({ error: 'Server xatosi' });
    }
});

// GET /api/admin/users — List all users
router.get('/users', async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            orderBy: { created_at: 'desc' }
        });
        res.json({ users: users.map(sanitizeUser) });
    } catch (err) {
        console.error('Admin users error:', err);
        res.status(500).json({ error: 'Server xatosi' });
    }
});

// POST /api/admin/approve/:id — Approve merchant application
router.post('/approve/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const user = await prisma.user.findUnique({ where: { id: parseInt(id) } });

        if (!user) {
            return res.status(404).json({ error: 'Foydalanuvchi topilmadi' });
        }

        if (user.merchant_status !== 'PENDING') {
            return res.status(400).json({ error: 'Bu ariza kutilayotgan holatda emas' });
        }

        const updatedUser = await prisma.user.update({
            where: { id: parseInt(id) },
            data: { merchant_status: 'APPROVED', role: 'MERCHANT' }
        });

        res.json({ user: sanitizeUser(updatedUser), message: 'Sotuvchi muvaffaqiyatli tasdiqlandi' });
    } catch (err) {
        console.error('Approve error:', err);
        res.status(500).json({ error: 'Server xatosi' });
    }
});

// POST /api/admin/reject/:id — Reject merchant application
router.post('/reject/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const user = await prisma.user.findUnique({ where: { id: parseInt(id) } });

        if (!user) {
            return res.status(404).json({ error: 'Foydalanuvchi topilmadi' });
        }

        const updatedUser = await prisma.user.update({
            where: { id: parseInt(id) },
            data: { merchant_status: 'REJECTED', role: 'CUSTOMER' }
        });

        res.json({ user: sanitizeUser(updatedUser), message: 'Ariza rad etildi' });
    } catch (err) {
        console.error('Reject error:', err);
        res.status(500).json({ error: 'Server xatosi' });
    }
});

// GET /api/admin/stats — Dashboard statistics
router.get('/stats', async (req, res) => {
    try {
        const totalBotUsers = await prisma.botUser.count();
        const totalUsers = await prisma.user.count();
        const activeMerchants = await prisma.user.count({ where: { merchant_status: 'APPROVED' } });
        const pendingApplications = await prisma.user.count({ where: { merchant_status: 'PENDING' } });
        const totalOrders = await prisma.order.count();
        const totalProducts = await prisma.product.count();

        // Calculate turnover
        const now = new Date();
        const startOfDay = new Date(now.setHours(0, 0, 0, 0));

        // Fix start of week to exactly 7 days ago at midnight
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
        sevenDaysAgo.setHours(0, 0, 0, 0);

        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const dailyOrders = await prisma.order.findMany({ where: { created_at: { gte: startOfDay } } });
        const weeklyOrders = await prisma.order.findMany({ where: { created_at: { gte: sevenDaysAgo } } });
        const monthlyOrders = await prisma.order.findMany({ where: { created_at: { gte: startOfMonth } } });

        const isNotRejected = o => o.status !== 'REJECTED' && o.status !== 'CANCELLED';
        const isRejected = o => o.status === 'REJECTED' || o.status === 'CANCELLED';

        const dailyTurnover = dailyOrders.filter(isNotRejected).reduce((acc, curr) => acc + curr.total, 0);
        const weeklyTurnover = weeklyOrders.filter(isNotRejected).reduce((acc, curr) => acc + curr.total, 0);
        const monthlyTurnover = monthlyOrders.filter(isNotRejected).reduce((acc, curr) => acc + curr.total, 0);

        const dailyRejectedTotal = dailyOrders.filter(isRejected).reduce((acc, curr) => acc + curr.total, 0);
        const weeklyRejectedTotal = weeklyOrders.filter(isRejected).reduce((acc, curr) => acc + curr.total, 0);
        const monthlyRejectedTotal = monthlyOrders.filter(isRejected).reduce((acc, curr) => acc + curr.total, 0);

        // Calculate daily growth
        const yesterdayStart = new Date(startOfDay);
        yesterdayStart.setDate(yesterdayStart.getDate() - 1);
        const yesterdayOrders = await prisma.order.findMany({
            where: { created_at: { gte: yesterdayStart, lt: startOfDay } }
        });
        const yesterdayTurnover = yesterdayOrders.filter(isNotRejected).reduce((acc, curr) => acc + curr.total, 0);

        let dailyGrowth = 0;
        if (yesterdayTurnover === 0 && dailyTurnover > 0) {
            dailyGrowth = 100;
        } else if (yesterdayTurnover > 0) {
            dailyGrowth = ((dailyTurnover - yesterdayTurnover) / yesterdayTurnover) * 100;
        }

        // Calculate chart data (last 7 days individually)
        const chartDataMap = {};
        const dayNames = ['Yk', 'Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh'];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            chartDataMap[dateStr] = {
                name: dayNames[d.getDay()],
                value: 0,
                rejectedValue: 0
            };
        }

        weeklyOrders.forEach(order => {
            const dateStr = new Date(order.created_at).toISOString().split('T')[0];
            if (chartDataMap[dateStr]) {
                if (order.status === 'REJECTED' || order.status === 'CANCELLED') {
                    chartDataMap[dateStr].rejectedValue += order.total;
                } else {
                    chartDataMap[dateStr].value += order.total;
                }
            }
        });
        const chartData = Object.values(chartDataMap);

        // Calculate Top Sellers
        const topSellersAgg = await prisma.order.groupBy({
            by: ['merchant_id'],
            _sum: { total: true },
            orderBy: { _sum: { total: 'desc' } },
            take: 5
        });

        // Enrich Top Sellers with merchant names
        const topSellers = await Promise.all(topSellersAgg.map(async (agg) => {
            const user = await prisma.user.findUnique({ where: { tg_id: agg.merchant_id } });
            return {
                name: user ? (user.store_name || user.full_name) : 'Noma\'lum',
                total: agg._sum.total || 0,
                logo: user ? user.store_logo : null
            };
        }));

        // Order Statuses
        const orderStatusesAgg = await prisma.order.groupBy({
            by: ['status'],
            _count: { status: true }
        });
        const orderStatuses = orderStatusesAgg.map(agg => ({
            name: agg.status === 'PENDING' ? 'Kutilmoqda' :
                agg.status === 'ACCEPTED' ? 'Tayyorlanmoqda' :
                    agg.status === 'COMPLETED' ? 'Qabul qilindi' :
                        agg.status === 'REJECTED' ? 'Rad etildi' :
                            agg.status === 'CANCELLED' ? 'Bekor qilindi' : agg.status,
            value: agg._count.status
        }));

        res.json({
            stats: {
                totalUsers,
                activeMerchants,
                merchantPercentage: totalUsers > 0 ? (activeMerchants / totalUsers * 100).toFixed(1) : 0,
                customerPercentage: totalUsers > 0 ? ((totalUsers - activeMerchants) / totalUsers * 100).toFixed(1) : 0,
                pendingApplications,
                totalOrders,
                totalProducts,
                dailyTurnover,
                dailyGrowth: Number(dailyGrowth.toFixed(1)),
                weeklyTurnover,
                monthlyTurnover,
                dailyRejectedTotal,
                weeklyRejectedTotal,
                monthlyRejectedTotal,
                totalBotUsers,
                chartData,
                topSellers,
                orderStatuses
            }
        });
    } catch (err) {
        console.error('Stats error:', err);
        res.status(500).json({ error: 'Server xatosi' });
    }
});

// PATCH /api/admin/users/:id/status — Toggle user status (ACTIVE/BLOCKED)
router.patch('/users/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!['ACTIVE', 'BLOCKED'].includes(status)) {
            return res.status(400).json({ error: 'Noto\'g\'ri holat' });
        }

        const updatedUser = await prisma.user.update({
            where: { id: parseInt(id) },
            data: { status }
        });

        res.json({ user: sanitizeUser(updatedUser), message: `Foydalanuvchi holati ${status === 'ACTIVE' ? 'faollashtirildi' : 'bloklandi'}` });
    } catch (err) {
        console.error('Status update error:', err);
        res.status(500).json({ error: 'Server xatosi' });
    }
});

// PATCH /api/admin/products/:id/block — Block a product
router.patch('/products/:id/block', async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;

        if (!reason) {
            return res.status(400).json({ error: 'Maxsulotni bloklash sababi ko\'rsatilishi shart (izoh)' });
        }

        const product = await prisma.product.findUnique({ where: { id: parseInt(id) } });

        if (!product) {
            return res.status(404).json({ error: 'Mahsulot topilmadi' });
        }

        const updatedProduct = await prisma.product.update({
            where: { id: parseInt(id) },
            data: { is_moderated: true, is_active: false }
        });

        const botToken = process.env.BOT_TOKEN;
        if (botToken) {
            const tgMessage = `🚨 *DIQQAT: MAHSULOT BLOKLANDI!* 🚨\n\nHurmatli sotuvchi, sizning tizimga yuklagan mahsulotingiz moderasatordan o'tmadi.\n\n📦 *Mahsulot nomi:* ${product.name}\n💬 *Bloklanish sababi:* ${reason}\n\nIltimos, mahsulotni to'g'irlab qayta urinib ko'ring yoki qo'llab-quvvatlash bo'limi bilan bog'laning.`;
            await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ chat_id: product.merchant_id, text: tgMessage, parse_mode: 'Markdown' })
            }).catch(console.error);
        }

        res.json({ product: updatedProduct, message: 'Mahsulot muvaffaqiyatli bloklandi' });
    } catch (err) {
        console.error('Block product error:', err);
        res.status(500).json({ error: 'Server xatosi' });
    }
});

// DELETE /api/admin/users/:id — Thoroughly delete user and data
router.delete('/users/:id', async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`[Admin] Attempting to delete user ID: ${id}`);

        const user = await prisma.user.findUnique({ where: { id: parseInt(id) } });

        if (!user) {
            console.log(`[Admin] User not found during deletion (ID: ${id})`);
            return res.status(404).json({ error: 'Foydalanuvchi topilmadi' });
        }

        const tg_id = user.tg_id;
        console.log(`[Admin] Deleting user TG ID: ${tg_id} and their data...`);

        // Use transaction for atomic deletion
        await prisma.$transaction([
            prisma.product.deleteMany({ where: { merchant_id: tg_id } }),
            prisma.order.deleteMany({
                where: {
                    OR: [
                        { customer_id: tg_id },
                        { merchant_id: tg_id }
                    ]
                }
            }),
            prisma.notification.deleteMany({ where: { user_id: tg_id } }),
            prisma.user.delete({ where: { id: parseInt(id) } })
        ]);

        console.log(`[Admin] Successfully deleted user ${tg_id}`);
        res.json({ message: 'Foydalanuvchi va barcha bog\'liq ma\'lumotlar muvaffaqiyatli o\'chirildi' });
    } catch (err) {
        console.error('Delete user error details:', err);
        res.status(500).json({ error: 'Server xatosi: ' + err.message });
    }
});

function sanitizeUser(user) {
    return {
        id: user.id,
        tg_id: user.tg_id,
        full_name: user.full_name,
        username: user.username,
        phone: user.phone,
        role: user.role,
        is_verified: user.is_verified,
        status: user.status,
        merchant_status: user.merchant_status,
        store_name: user.store_name,
        store_description: user.store_description,
        store_logo: user.store_logo,
        store_address: user.store_address,
        region: user.region,
        district: user.district,
        business_type: user.business_type,
        inn: user.inn,
        company_name: user.company_name,
        responsible_person: user.responsible_person,
        created_at: user.created_at
    };
}

// GET /api/admin/bot-stats — Get bot starts within date range
router.get('/bot-stats', async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        let where = {};
        if (startDate || endDate) {
            where.created_at = {};
            if (startDate) where.created_at.gte = new Date(startDate);
            if (endDate) {
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                where.created_at.lte = end;
            }
        }
        const count = await prisma.botUser.count({ where });
        res.json({ count });
    } catch (err) {
        console.error('Bot stats error:', err);
        res.status(500).json({ error: 'Server xatosi' });
    }
});

module.exports = router;
