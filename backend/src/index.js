require('dotenv').config();
const express = require('express');
const cors = require('cors');

const path = require('path');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const adminRoutes = require('./routes/admin');
const botRoutes = require('./routes/bot');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const uploadRoutes = require('./routes/upload');
const { startScheduler } = require('./scheduler');
const { initBot } = require('./telegram-bot');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.resolve(__dirname, '../uploads')));

// Request Logger
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// Routes
app.use('/api', authRoutes);
app.use('/api', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/bot', botRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/upload', uploadRoutes);

// Public waitlist status (no auth required — for guests)
app.get('/api/waitlist-status', (req, res) => {
    res.json({ waitlistMode: process.env.WAITLIST_MODE === 'true' });
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', service: 'ASRA Backend', timestamp: new Date().toISOString() });
});

// Start background scheduler
startScheduler();

// Start Telegram Bot
initBot();

// Global Error Handler
app.use((err, req, res, next) => {
    console.error('Unhandled Error:', err);
    res.status(400).json({
        error: 'Ichki server xatosi (Global)',
        details: err.message,
        path: req.path,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
});

app.listen(PORT, () => {
    console.log(`🚀 ASRA Backend server running on http://localhost:${PORT}`);
});
