/**
 * ASRA Telegram Bot - Configuration and Singleton Instance
 * Bot ishga tushishida bitta TelegramBot instance yaratiladi va butun backend bo'ylab
 * share qilinadi — ortiqcha ulanishlar yaratilmaydi.
 */

const TelegramBot = require('node-telegram-bot-api');

let botInstance = null;

function getBot() {
    if (!botInstance) {
        const token = process.env.BOT_TOKEN;
        if (!token) {
            throw new Error('BOT_TOKEN environment variable is not set');
        }
        botInstance = new TelegramBot(token, { polling: true });
        
        botInstance.on('polling_error', (error) => {
            console.warn(`[Telegram Bot] Polling Error: ${error.code} - Bu xatolik odatda Railway (prod) va Local backend bir xil tokenni ulashganda kelib chiqadi. Server ishlashda davom etmoqda.`);
        });

        console.log('🤖 Telegram Bot instance created (singleton)');
    }
    return botInstance;
}

module.exports = { getBot };
