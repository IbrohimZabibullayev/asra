const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const REGIONS = ['Toshkent', 'Samarqand', 'Andijon', 'Buxoro', 'Namangan', 'Farg\'ona', 'Xorazm', 'Navoiy', 'Qashqadaryo', 'Surxondaryo', 'Sirdaryo', 'Jizzax', 'Qoraqalpog\'iston'];

// Track user onboarding state in memory
const userStates = new Map();

function generateCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

function setupHandlers(bot) {
    const WEBAPP_URL = process.env.WEBAPP_URL || 'https://asra-client.vercel.app';

    // /start command
    bot.onText(/\/start/, async (msg) => {
        const chatId = msg.chat.id;
        try {
            const tgId = String(msg.from.id);
            const firstName = msg.from.first_name || '';
            const lastName = msg.from.last_name || '';
            const fullName = `${firstName} ${lastName}`.trim() || 'Do\'stim';

            // Direct Prisma check
            const user = await prisma.user.findUnique({ where: { tg_id: tgId } });

            if (user) {
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

            // Capture profile photo logic (simplified for integration)
            let photoUrl = null;
            try {
                const photos = await bot.getUserProfilePhotos(msg.from.id, { limit: 1 });
                if (photos.total_count > 0) {
                    const fileId = photos.photos[0][0].file_id;
                    const file = await bot.getFile(fileId);
                    photoUrl = file.file_path;
                }
            } catch (e) {
                console.log('Bot photo error:', e.message);
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
        } catch (err) {
            console.error('Bot start error:', err);
            bot.sendMessage(chatId, '❌ Xatolik yuz berdi. Iltimos qaytadan urinib ko\'ring.');
        }
    });

    // Handle callback queries
    bot.on('callback_query', async (callbackQuery) => {
        const chatId = callbackQuery.message.chat.id;
        const tgId = String(callbackQuery.from.id);
        const data = callbackQuery.data;

        if (data === 'get_code') {
            try {
                const referral_code = generateCode();
                
                // Direct Prisma update
                await prisma.user.upsert({
                    where: { tg_id: tgId },
                    update: { referral_code, referral_code_expires_at: new Date(Date.now() + 10 * 60 * 1000) }, // 10 min
                    create: {
                        tg_id: tgId,
                        full_name: callbackQuery.from.first_name || 'Foydalanuvchi',
                        referral_code,
                        role: 'CUSTOMER'
                    }
                });

                await bot.answerCallbackQuery(callbackQuery.id);
                await bot.sendMessage(chatId, `🔑 Sizning yangi tasdiqlash kodingiz: \`${referral_code}\`\n\nUni nusxalab oling va platformaga kiriting.`, {
                    parse_mode: 'Markdown'
                });
            } catch (err) {
                console.error('Bot get_code error:', err);
                bot.sendMessage(chatId, '❌ Kod olishda xatolik yuz berdi.');
            }
        }
    });

    // Handle onboarding flow
    bot.on('message', async (msg) => {
        const chatId = msg.chat.id;
        const state = userStates.get(chatId);

        if (!state) return;

        try {
            // Step 1: Region selection
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

            // Step 2: Phone sharing
            if (msg.contact && state.step === 'awaiting_phone') {
                state.data.phone = msg.contact.phone_number;
                
                const referral_code = generateCode();
                const userData = {
                    ...state.data,
                    referral_code,
                    referral_code_expires_at: new Date(Date.now() + 10 * 60 * 1000)
                };

                // Direct Prisma registration
                await prisma.user.upsert({
                    where: { tg_id: userData.tg_id },
                    update: {
                        phone: userData.phone,
                        region: userData.region,
                        referral_code: userData.referral_code,
                        referral_code_expires_at: userData.referral_code_expires_at
                    },
                    create: {
                        tg_id: userData.tg_id,
                        full_name: userData.full_name,
                        username: userData.username,
                        phone: userData.phone,
                        region: userData.region,
                        photo_url: userData.photo_url,
                        referral_code: userData.referral_code,
                        referral_code_expires_at: userData.referral_code_expires_at,
                        role: 'CUSTOMER'
                    }
                });

                await bot.sendMessage(chatId,
                    `✅ *Ro'yxatdan o'tish muvaffaqiyatli!*\n\n📍 Viloyat: *${userData.region}*\n📞 Telefon: \`${userData.phone}\`\n\n🔑 Tasdiqlash kodingiz: \`${referral_code}\`\n\nNusxalab oling va platformaga kiriting.`,
                    {
                        parse_mode: 'Markdown',
                        reply_markup: { remove_keyboard: true }
                    }
                );

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

                userStates.delete(chatId);
            }
        } catch (err) {
            console.error('Bot onboarding error:', err);
            bot.sendMessage(chatId, '❌ Xatolik yuz berdi. Iltimos qaytadan urinib ko\'ring /start');
            userStates.delete(chatId);
        }
    });
}

module.exports = { setupHandlers };
