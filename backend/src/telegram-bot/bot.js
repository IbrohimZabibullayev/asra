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
        console.log('🤖 Telegram Bot instance created (singleton)');
    }
    return botInstance;
}

module.exports = { getBot };
