require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';
const WEBAPP_URL = process.env.WEBAPP_URL || 'https://your-asra-client.vercel.app';

const REGIONS = ['Toshkent', 'Samarqand', 'Andijon', 'Buxoro', 'Namangan', 'Farg\'ona', 'Xorazm', 'Navoiy', 'Qashqadaryo', 'Surxondaryo', 'Sirdaryo', 'Jizzax', 'Qoraqalpog\'iston'];

// Track user onboarding state
const userStates = new Map();

function generateCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// /start command
bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;
    const tgId = String(msg.from.id);
    const firstName = msg.from.first_name || '';
    const lastName = msg.from.last_name || '';
    const fullName = `${firstName} ${lastName}`.trim() || 'Do\'stim';

    // Check if user exists for easy re-login
    try {
        const checkRes = await axios.get(`${BACKEND_URL}/api/bot/check-user/${tgId}`);
        if (checkRes.data.exists) {
            const user = checkRes.data.user;
            return bot.sendMessage(chatId, `👋 Xush kelibsiz qaytadan, *${user.full_name}*!\n\nSiz platformamizda ro'yxatdan o'tgansiz. Tizimga kirish uchun yangi tasdiqlash kodini olishingiz mumkin:`, {
                parse_mode: 'Markdown',
                reply_markup: {
                    inline_keyboard: [
                        [{ text: '🔑 Kirish kodini olish', callback_data: 'get_code' }],
                        [{ text: '🌐 Platformani ochish', web_app: { url: WEBAPP_URL } }]
                    ]
                }
            });
        }
    } catch (e) {
        // Not found or error, proceed to onboarding
    }

    // Capture profile photo immediately
    let photoUrl = null;
    let fileId = null;
    try {
        const photos = await bot.getUserProfilePhotos(msg.from.id, { limit: 1 });
        if (photos.total_count > 0) {
            fileId = photos.photos[0][0].file_id;
            const file = await bot.getFile(fileId);
            photoUrl = file.file_path;
        }
    } catch (e) {
        console.log('Photo error:', e.message);
    }

    userStates.set(chatId, {
        step: 'awaiting_region',
        data: {
            tg_id: tgId,
            full_name: fullName,
            username: msg.from.username || null,
            photo_url: photoUrl
        }
    });

    const welcomeMsg = `🍎 *ASRA - Oziq-ovqatni Tejash Platformasi*\n\nAssalomu alaykum, *${fullName}*! 👋\n\nXush kelibsiz! Ro'yxatdan o'tishni boshlash uchun quyidagi ro'yxatdan o'z viloyatingizni tanlang:`;

    // Create region keyboard (2 columns)
    const keyboard = [];
    for (let i = 0; i < REGIONS.length; i += 2) {
        const row = [{ text: REGIONS[i] }];
        if (REGIONS[i + 1]) row.push({ text: REGIONS[i + 1] });
        keyboard.push(row);
    }

    await bot.sendMessage(chatId, welcomeMsg, {
        parse_mode: 'Markdown',
        reply_markup: {
            keyboard: keyboard,
            resize_keyboard: true,
            one_time_keyboard: true
        }
    });
});

// Handle callback queries (Get Code)
bot.on('callback_query', async (callbackQuery) => {
    const chatId = callbackQuery.message.chat.id;
    const tgId = String(callbackQuery.from.id);
    const data = callbackQuery.data;

    if (data === 'get_code') {
        try {
            const referral_code = generateCode();
            // Just use the existing backend register route, it handles updates!
            await axios.post(`${BACKEND_URL}/api/bot/register`, {
                tg_id: tgId,
                full_name: callbackQuery.from.first_name || 'Foydalanuvchi',
                referral_code
            });

            await bot.answerCallbackQuery(callbackQuery.id);
            await bot.sendMessage(chatId, `🔑 Sizning yangi tasdiqlash kodingiz: \`${referral_code}\`\n\nUni nusxalab oling va platformaga kiriting.`, {
                parse_mode: 'Markdown'
            });
        } catch (err) {
            console.error('Get code error:', err.message);
            bot.sendMessage(chatId, '❌ Kod olishda xatolik yuz berdi.');
        }
    }
});

// Listen for all messages (onboarding flow)
bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const state = userStates.get(chatId);

    if (!state) return;

    // Step 1: Handle region selection
    if (state.step === 'awaiting_region' && msg.text && REGIONS.includes(msg.text)) {
        state.data.region = msg.text;
        state.step = 'awaiting_phone';

        await bot.sendMessage(chatId, `📍 Siz *${msg.text}* viloyatini tanladingiz.\n\nEndi ro'yxatdan o'tishni yakunlash uchun telefon raqamingizni yuboring:`, {
            parse_mode: 'Markdown',
            reply_markup: {
                keyboard: [[{ text: '📱 Telefon raqamni yuborish', request_contact: true }]],
                resize_keyboard: true,
                one_time_keyboard: true
            }
        });
        return;
    }

    // Step 2: Handle contact sharing
    if (msg.contact && state.step === 'awaiting_phone') {
        state.data.phone = msg.contact.phone_number;
        await completeRegistration(chatId, state.data);
        return;
    }
});

async function completeRegistration(chatId, data) {
    try {
        const referral_code = generateCode();
        data.referral_code = referral_code;

        // Register user via backend
        await axios.post(`${BACKEND_URL}/api/bot/register`, data);

        // Remove keyboard
        await bot.sendMessage(chatId,
            `✅ *Ro'yxatdan o'tish muvaffaqiyatli!*\n\n📍 Viloyat: *${data.region}*\n📞 Telefon: \`${data.phone}\`\n\n🔑 Tasdiqlash kodingiz: \`${referral_code}\`\n\nNusxalab oling va platformaga kiriting.`,
            {
                parse_mode: 'Markdown',
                reply_markup: { remove_keyboard: true }
            }
        );

        // Send WebApp button
        await bot.sendMessage(chatId,
            `🚀 Platformani ochish uchun quyidagi tugmani bosing:`,
            {
                reply_markup: {
                    inline_keyboard: [[
                        { text: '🌐 Platformani ochish', web_app: { url: WEBAPP_URL } }
                    ]]
                }
            }
        );

        // Clean up state
        userStates.delete(chatId);
    } catch (err) {
        console.error('Registration error:', err.message);
        bot.sendMessage(chatId, '❌ Xatolik yuz berdi. Iltimos, qaytadan urinib ko\'ring /start');
        userStates.delete(chatId);
    }
}

console.log('🤖 ASRA Bot is running...');
