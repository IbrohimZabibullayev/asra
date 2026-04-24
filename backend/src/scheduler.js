const prisma = require('./prisma');

function startScheduler() {
    console.log('⏰ Starting order notification scheduler...');

    // Check every minute
    setInterval(async () => {
        try {
            const now = new Date();

            // 1) PENDING for exactly 10-11 minutes ago
            const tenMinsAgo = new Date(now.getTime() - 10 * 60 * 1000);
            const elevenMinsAgo = new Date(now.getTime() - 11 * 60 * 1000);

            const pendingOrders = await prisma.order.findMany({
                where: {
                    status: 'PENDING',
                    created_at: {
                        lte: tenMinsAgo,
                        gt: elevenMinsAgo
                    }
                }
            });

            for (const order of pendingOrders) {
                const botToken = process.env.BOT_TOKEN;
                if (botToken && order.merchant_id && !order.merchant_id.startsWith('merchant_')) {
                    const tgMessage = `⏳ *Eslatma!* Sizda kutilayotgan buyurtma bor.\n\nIltimos, ilovaga kirib buyurtmani qabul qiling yoki rad eting.`;
                    await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ chat_id: order.merchant_id, text: tgMessage, parse_mode: 'Markdown' })
                    }).catch(err => console.error('Bot fetch error:', err));
                }
            }

            // 2) ACCEPTED for exactly 60-61 minutes ago
            const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
            const oneHourOneMinAgo = new Date(now.getTime() - 61 * 60 * 1000);

            const acceptedOrders = await prisma.order.findMany({
                where: {
                    status: 'ACCEPTED',
                    updated_at: { // updated_at is when it was accepted
                        lte: oneHourAgo,
                        gt: oneHourOneMinAgo
                    }
                }
            });

            for (const order of acceptedOrders) {
                const botToken = process.env.BOT_TOKEN;
                if (botToken && order.customer_id) {
                    const tgMessage = `📦 *Buyurtma eslatmasi*\n\nSizning buyurtmangiz sotuvchi tomonidan qabul qilinganiga 1 soat bo'ldi. Agar xaridingizni olgan bo'lsangiz, iltimos ilovaga kirib "Qabul qildim" tugmasini bosing.`;
                    await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ chat_id: order.customer_id, text: tgMessage, parse_mode: 'Markdown' })
                    }).catch(err => console.error('Bot fetch error:', err));
                }
            }
        } catch (err) {
            console.error('Scheduler error:', err);
        }
    }, 60 * 1000);
}

module.exports = { startScheduler };
