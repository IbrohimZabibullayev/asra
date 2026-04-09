const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/products — List all active products from APPROVED merchants
router.get('/', async (req, res) => {
    try {
        const { region, merchant_id } = req.query;

        // Find all approved merchants to filter products
        const approvedMerchants = await prisma.user.findMany({
            where: { merchant_status: 'APPROVED' },
            select: { tg_id: true }
        });
        const approvedIds = approvedMerchants.map(m => m.tg_id);

        const where = {
            is_active: true,
            is_moderated: false,
            merchant_id: { in: approvedIds }
        };

        if (region) {
            const cleanRegion = region.replace(/ viloyati| sh\.| R\./gi, '').trim();
            where.region = { contains: cleanRegion };
        }
        if (merchant_id) where.merchant_id = merchant_id;

        const products = await prisma.product.findMany({
            where,
            orderBy: { created_at: 'desc' }
        });
        res.json({ products });
    } catch (err) {
        console.error('Get products error:', err);
        res.status(500).json({ error: 'Server xatosi' });
    }
});

// POST /api/products — Create a new product (merchant only)
router.post('/', authMiddleware, async (req, res) => {
    try {
        const user = await prisma.user.findUnique({ where: { id: req.userId } });
        if (!user || user.role !== 'MERCHANT' || (user.merchant_status !== 'APPROVED' && user.merchant_status !== 'PENDING')) {
            return res.status(403).json({ error: 'Faqat tasdiqlangan yoki kutilayotgan sotuvchilar mahsulot qo\'sha oladi' });
        }

        const { name, description, price, current_price, image_url, unit, stock } = req.body;
        if (!name || !price || !current_price) {
            return res.status(400).json({ error: 'Nomi, asl narxi va hozirgi narxi kiritilishi shart' });
        }

        const originalPrice = parseFloat(price);
        const currentPrice = parseFloat(current_price);
        const discount = originalPrice > 0 && originalPrice > currentPrice
            ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
            : 0;

        const product = await prisma.product.create({
            data: {
                name,
                description: description || '',
                price: originalPrice,
                discount: discount,
                unit: unit || 'dona',
                stock: stock ? parseFloat(stock) : 1,
                image_url: image_url || null,
                merchant_id: user.tg_id,
                merchant_name: user.store_name || user.full_name,
                merchant_address: [user.region, user.district, user.store_address].filter(Boolean).join(', ') || 'Manzil kiritilmagan',
                region: user.region || 'Toshkent'
            }
        });

        res.json({ product, message: 'Mahsulot muvaffaqiyatli qo\'shildi' });
    } catch (err) {
        console.error('Create product error:', err);
        res.status(500).json({ error: 'Server xatosi' });
    }
});

// GET /api/products/my — Get merchant's own products
router.get('/my', authMiddleware, async (req, res) => {
    try {
        const user = await prisma.user.findUnique({ where: { id: req.userId } });
        const products = await prisma.product.findMany({
            where: { merchant_id: user.tg_id },
            orderBy: { created_at: 'desc' }
        });
        res.json({ products });
    } catch (err) {
        console.error('Get my products error:', err);
        res.status(500).json({ error: 'Server xatosi' });
    }
});

// GET /api/products/:id — Get a single product
router.get('/:id', async (req, res) => {
    try {
        const product = await prisma.product.findUnique({ where: { id: parseInt(req.params.id) } });
        if (!product) return res.status(404).json({ error: 'Mahsulot topilmadi' });
        res.json({ product });
    } catch (err) {
        console.error('Get single product error:', err);
        res.status(500).json({ error: 'Server xatosi' });
    }
});

// PUT /api/products/:id — Update a product
router.put('/:id', authMiddleware, async (req, res) => {
    try {
        const user = await prisma.user.findUnique({ where: { id: req.userId } });

        let product = await prisma.product.findUnique({ where: { id: parseInt(req.params.id) } });
        if (!product) return res.status(404).json({ error: 'Mahsulot topilmadi' });
        if (product.merchant_id !== user.tg_id) return res.status(403).json({ error: 'Ruxsat yo\'q' });
        if (product.is_moderated) return res.status(403).json({ error: 'Bu mahsulot qoidalarni buzganligi sababli bloklangan, izoh uchun telegram botingizni tekshiring.' });

        const { name, price, current_price, image_url, unit, stock, is_active } = req.body;

        const originalPrice = parseFloat(price || product.price);
        const currentPrice = parseFloat(current_price || product.price);
        const discount = originalPrice > 0 && originalPrice > currentPrice
            ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
            : 0;

        product = await prisma.product.update({
            where: { id: parseInt(req.params.id) },
            data: {
                name: name || product.name,
                price: originalPrice,
                discount: discount,
                unit: unit || product.unit,
                stock: stock !== undefined ? parseFloat(stock) : product.stock,
                image_url: image_url !== undefined ? image_url : product.image_url,
                is_active: is_active !== undefined ? is_active : product.is_active
            }
        });

        res.json({ product, message: 'Mahsulot muvaffaqiyatli tahrirlandi' });
    } catch (err) {
        console.error('Edit product error:', err);
        res.status(500).json({ error: 'Server xatosi' });
    }
});

module.exports = router;
