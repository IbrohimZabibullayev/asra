/**
 * ASRA Telegram Bot - Main Integration Module
 * Bu modul botni backend ichida xavfsiz ishga tushiradi.
 */

const { getBot } = require('./bot');
const { setupHandlers } = require('./handlers');

function initBot() {
    try {
        console.log('⏳ Telegram bot integratsiyasi boshlanmoqda...');
        
        // Singleton bot instance ni olamiz
        const bot = getBot();
        
        // Handlerlarni o'rnatamiz
        setupHandlers(bot);
        
        console.log('🚀 Telegram Bot integrated and running successfully!');
    } catch (err) {
        // Botdagi xatolik butun backendni yiqitmasligi uchun log qilamiz
        console.error('⚠️ Telegram Bot integration failed:', err.message);
        console.log('ℹ️ Backend will continue running without the Telegram Bot.');
    }
}

module.exports = { initBot };
