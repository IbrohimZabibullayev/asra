const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// POST /api/orders — Create a new order
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { items, total } = req.body;
        if (!items || items.length === 0) {
            return res.status(400).json({ error: 'Savat bo\'sh' });
        }

        const customer = await prisma.user.findUnique({ where: { id: req.userId } });

        // We'll create one order per merchant represented in the cart, or a single order with multiple items.
        // For simplicity and matching the existing UI, let's group by merchant if possible, 
        // but the current schema has one merchant_id per order. 
        // Let's create multiple orders if there are multiple merchants.

        const merchants = [...new Set(items.map(item => item.merchant_id))];
        const orders = [];

        for (const merchant_id of merchants) {
            if (!merchant_id) {
                console.warn('Skipping items with missing merchant_id');
                continue;
            }

            const merchantItems = items.filter(item => item.merchant_id === merchant_id);
            const merchantTotal = merchantItems.reduce((acc, item) => {
                const price = item.discount > 0 ? item.price * (1 - item.discount / 100) : item.price;
                return acc + (price * item.quantity);
            }, 0);

            const orderCode = Math.floor(100000 + Math.random() * 900000).toString();
            const order = await prisma.order.create({
                data: {
                    customer_id: customer.tg_id,
                    merchant_id: String(merchant_id),
                    total: merchantTotal,
                    items: JSON.stringify(merchantItems),
                    status: 'PENDING',
                    code: orderCode
                }
            });
            orders.push(order);

            // Only create notification if it's a real user ID (numeric-like or not a demo prefix)
            if (!merchant_id.startsWith('merchant_')) {
                try {
                    await prisma.notification.create({
                        data: {
                            user_id: merchant_id,
                            title: 'Yangi buyurtma!',
                            message: `${customer.full_name} tomonidan yangi buyurtma qabul qilindi.`,
                            type: 'ORDER'
                        }
                    });

                    // Send Telegram Alert to Merchant
                    const botToken = process.env.BOT_TOKEN;
                    if (botToken) {
                        const tgMessage = `🎉 *Yangi Buyurtma Kuryerda!* 🎉\n\n👤 Mijoz: _${customer.full_name}_\n📞 Tel: ${customer.phone}\n💳 Summa: ${merchantTotal.toLocaleString()} so'm\n\nIltimos, ilovangizga kirib buyurtmani tezda tayyorlang!`;
                        await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ chat_id: merchant_id, text: tgMessage, parse_mode: 'Markdown' })
                        });
                    }
                } catch (notifierErr) {
                    console.error('Merchant notification failed:', merchant_id);
                }
            }
        }

        res.json({ orders, message: 'Buyurtma muvaffaqiyatli rasmiylashtirildi' });
    } catch (err) {
        console.error('Create order error:', err);
        res.status(500).json({ error: 'Server xatosi' });
    }
});

// GET /api/orders/my — Get customer's orders
router.get('/my', authMiddleware, async (req, res) => {
    try {
        const user = await prisma.user.findUnique({ where: { id: req.userId } });
        const orders = await prisma.order.findMany({
            where: { customer_id: user.tg_id },
            orderBy: { created_at: 'desc' }
        });
        res.json({ orders });
    } catch (err) {
        console.error('Get my orders error:', err);
        res.status(500).json({ error: 'Server xatosi' });
    }
});

// GET /api/orders/merchant — Get merchant's orders
router.get('/merchant', authMiddleware, async (req, res) => {
    try {
        const user = await prisma.user.findUnique({ where: { id: req.userId } });
        if (user.role !== 'MERCHANT') {
            return res.status(403).json({ error: 'Ruxsat yo\'q' });
        }
        const orders = await prisma.order.findMany({
            where: { merchant_id: user.tg_id },
            orderBy: { created_at: 'desc' }
        });

        // Enrich with customer info
        const enrichedOrders = await Promise.all(orders.map(async (order) => {
            const customer = await prisma.user.findUnique({
                where: { tg_id: order.customer_id },
                select: { full_name: true, referral_code: true, phone: true }
            });
            return { ...order, customer };
        }));

        res.json({ orders: enrichedOrders });
    } catch (err) {
        console.error('Get merchant orders error:', err)
        res.status(500).json({ error: 'Server xatosi' })
    }
})

// GET /api/orders/stats/merchant — Get merchant's store stats
router.get('/stats/merchant', authMiddleware, async (req, res) => {
    try {
        const user = await prisma.user.findUnique({ where: { id: req.userId } })
        if (user.role !== 'MERCHANT') return res.status(403).json({ error: 'Ruxsat yo\'q' })

        const productsCount = await prisma.product.count({ where: { merchant_id: user.tg_id } })
        const orders = await prisma.order.findMany({ where: { merchant_id: user.tg_id } })

        const totalOrders = orders.length
        const totalTurnover = orders.reduce((sum, o) => sum + o.total, 0)

        res.json({
            productsCount,
            totalOrders,
            totalTurnover
        })
    } catch (err) {
        console.error('Merchant stats error:', err)
        res.status(500).json({ error: 'Server xatosi' })
    }
})

// PUT /api/orders/:id/cancel — Cancel an order
router.put('/:id/cancel', authMiddleware, async (req, res) => {
    try {
        const user = await prisma.user.findUnique({ where: { id: req.userId } });
        const order = await prisma.order.findUnique({ where: { id: parseInt(req.params.id) } });

        if (!order) return res.status(404).json({ error: 'Buyurtma topilmadi' });
        if (order.customer_id !== user.tg_id) return res.status(403).json({ error: 'Ruxsat yo\'q' });
        if (order.status !== 'PENDING') return res.status(400).json({ error: 'Faqat kutilayotgan buyurtmani bekor qilish mumkin' });

        await prisma.order.update({
            where: { id: order.id },
            data: { status: 'CANCELLED' }
        });

        res.json({ message: 'Buyurtma bekor qilindi' });
    } catch (err) {
        console.error('Cancel order error:', err);
        res.status(500).json({ error: 'Server xatosi' });
    }
});

// PUT /api/orders/:id/accept — Merchant accepts an order
router.put('/:id/accept', authMiddleware, async (req, res) => {
    try {
        const user = await prisma.user.findUnique({ where: { id: req.userId } });
        const order = await prisma.order.findUnique({ where: { id: parseInt(req.params.id) } });

        if (!order) return res.status(404).json({ error: 'Buyurtma topilmadi' });
        if (order.merchant_id !== user.tg_id) return res.status(403).json({ error: 'Ruxsat yo\'q' });
        if (order.status !== 'PENDING') return res.status(400).json({ error: 'Faqat kutilayotgan buyurtmani qabul qilish mumkin' });

        await prisma.order.update({
            where: { id: order.id },
            data: { status: 'ACCEPTED' }
        });

        res.json({ message: 'Buyurtma qabul qilindi' });
    } catch (err) {
        console.error('Accept order error:', err);
        res.status(500).json({ error: 'Server xatosi' });
    }
});

// PUT /api/orders/:id/reject — Merchant rejects an order
router.put('/:id/reject', authMiddleware, async (req, res) => {
    try {
        const user = await prisma.user.findUnique({ where: { id: req.userId } });
        const order = await prisma.order.findUnique({ where: { id: parseInt(req.params.id) } });

        if (!order) return res.status(404).json({ error: 'Buyurtma topilmadi' });
        if (order.merchant_id !== user.tg_id) return res.status(403).json({ error: 'Ruxsat yo\'q' });
        if (order.status !== 'PENDING') return res.status(400).json({ error: 'Faqat kutilayotgan buyurtmani rad etish mumkin' });

        await prisma.order.update({
            where: { id: order.id },
            data: { status: 'REJECTED' }
        });

        res.json({ message: 'Buyurtma rad etildi' });
    } catch (err) {
        console.error('Reject order error:', err);
        res.status(500).json({ error: 'Server xatosi' });
    }
});

// PUT /api/orders/:id/receive — Customer receives an order
router.put('/:id/receive', authMiddleware, async (req, res) => {
    try {
        const user = await prisma.user.findUnique({ where: { id: req.userId } });
        const order = await prisma.order.findUnique({ where: { id: parseInt(req.params.id) } });

        if (!order) return res.status(404).json({ error: 'Buyurtma topilmadi' });
        if (order.customer_id !== user.tg_id) return res.status(403).json({ error: 'Ruxsat yo\'q' });
        if (order.status !== 'ACCEPTED') return res.status(400).json({ error: 'Buyurtma qabul qilingan holatida emas' });

        await prisma.order.update({
            where: { id: order.id },
            data: { status: 'COMPLETED' }
        });

        // Delete from notifications if needed or keep history
        res.json({ message: 'Buyurtma yetkazib berildi va yakunlandi' });
    } catch (err) {
        console.error('Receive order error:', err);
        res.status(500).json({ error: 'Server xatosi' });
    }
});

module.exports = router;
