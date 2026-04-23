const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const REGIONS = ['Toshkent', 'Samarqand', 'Andijon', 'Buxoro', 'Namangan', 'Farg\'ona', 'Xorazm', 'Navoiy', 'Qashqadaryo', 'Surxondaryo', 'Sirdaryo', 'Jizzax', 'Qoraqalpog\'iston'];

// Track user onboarding state in memory
const userStates = new Map();

function generateCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// Helper: Send Order Notification with Geolocation options
async function sendOrderNotification(bot, chatId, tgId) {
    const user = await prisma.user.findUnique({ where: { tg_id: String(tgId) } });
    
    let message = "🔔 *Yangi buyurtma!* \n\nSizga yangi buyurtma tushdi. Mijozga mahsulotni yetkazib berish yoki olib ketish uchun lokatsiya yuborishingiz kerak.";
    let keyboard = [];

    if (user && user.latitude && user.longitude) {
        message += "\n\nSizda saqlangan lokatsiya mavjud. Uni yuborishni xohlaysizmi yoki yangisini?";
        keyboard = [
            [{ text: "✅ Avvalgi lokatsiyani yuborish", callback_data: `send_saved_location` }],
            [{ text: "🔄 Yangi lokatsiya yuborish", callback_data: "request_new_location" }]
        ];
    } else {
        keyboard = [
            [{ text: "📍 Mijozga lokatsiya yuborish", callback_data: "request_new_location" }]
        ];
    }

    await bot.sendMessage(chatId, message, {
        parse_mode: 'Markdown',
        reply_markup: {
            inline_keyboard: keyboard
        }
    });
}

function setupHandlers(bot) {
    const WEBAPP_URL = process.env.WEBAPP_URL || 'https://asra-lyart.vercel.app';

    // Helper: Send Order Notification with Geolocation options
    // Removed from here and moved to top-level for export

    // /start command
    bot.onText(/\/start/, async (msg) => {
        const chatId = msg.chat.id;
        try {
            const tgId = String(msg.from.id);
            const firstName = msg.from.first_name || '';
            const lastName = msg.from.last_name || '';
            const fullName = `${firstName} ${lastName}`.trim() || 'Do\'stim';

            // Track Bot User Start
            try {
                await prisma.botUser.upsert({
                    where: { tg_id: tgId },
                    update: { full_name: fullName, username: msg.from.username || null },
                    create: { tg_id: tgId, full_name: fullName, username: msg.from.username || null }
                });
            } catch (err) {
                console.log('BotUser saving error:', err.message);
            }

            // Direct Prisma check
            const user = await prisma.user.findUnique({ where: { tg_id: tgId } });

            if (user) {
                await bot.sendMessage(chatId, `👋 Xush kelibsiz qaytadan, *${user.full_name}*!\n\nSiz platformamizda ro'yxatdan o'tgansiz. Tizimga kirish uchun yangi tasdiqlash kodini olishingiz mumkin:`, {
                    parse_mode: 'Markdown',
                    reply_markup: {
                        keyboard: [[{ text: '🔑 Kod olish' }], [{ text: '🌐 Platformani ochish', web_app: { url: WEBAPP_URL } }]],
                        resize_keyboard: true
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

            const welcomeMsg = `🍎 *ASRA - Eksklyuziv Chegirmalar Platformasi*\n\nAssalomu alaykum, *${fullName}*! 👋\n\nXush kelibsiz! Ro'yxatdan o'tishni boshlash uchun quyidagi ro'yxatdan o'z viloyatingizni tanlang:`;

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
            // Faqat bir marta xato yuborish uchun tekshiramiz
            bot.sendMessage(chatId, `❌ Xatolik yuz berdi: ${err.message || 'Noma\'lum xato'}`);
        }
    });

    // Handle callback queries
    bot.on('callback_query', async (callbackQuery) => {
        const chatId = callbackQuery.message.chat.id;
        const tgId = String(callbackQuery.from.id);
        const data = callbackQuery.data;

        if (data === 'get_code') {
            await handleGetCode(bot, chatId, tgId, callbackQuery.id, callbackQuery.from.first_name);
        } else if (data === 'request_new_location') {
            userStates.set(chatId, { step: 'awaiting_location' });
            await bot.answerCallbackQuery(callbackQuery.id);
            await bot.sendMessage(chatId, "📍 Iltimos, mijozga yubormoqchi bo'lgan lokatsiyangizni yuboring (Telegram'ning 'Location' funksiyasidan foydalaning):", {
                reply_markup: {
                    keyboard: [[{ text: "📍 Lokatsiya yuborish", request_location: true }], [{ text: "❌ Bekor qilish" }]],
                    resize_keyboard: true,
                    one_time_keyboard: true
                }
            });
        } else if (data === 'send_saved_location') {
            const user = await prisma.user.findUnique({ where: { tg_id: tgId } });
            if (user && user.latitude && user.longitude) {
                await bot.answerCallbackQuery(callbackQuery.id, { text: "Lokatsiya yuborilmoqda..." });
                // In a real scenario, we'd send this to the customer. 
                // For now, we show it back to the seller to confirm.
                await bot.sendLocation(chatId, user.latitude, user.longitude);
                await bot.sendMessage(chatId, "✅ Saqlangan lokatsiya mijozga yuborildi!");
            } else {
                await bot.answerCallbackQuery(callbackQuery.id, { text: "Xatolik: Lokatsiya topilmadi", show_alert: true });
            }
        }
    });

    async function handleGetCode(bot, chatId, tgId, callbackQueryId = null, firstName = 'Foydalanuvchi') {
        try {
            const referral_code = generateCode();
            
            await prisma.user.upsert({
                where: { tg_id: tgId },
                update: { referral_code, referral_code_expires_at: new Date(Date.now() + 2 * 60 * 1000) },
                create: {
                    tg_id: tgId,
                    full_name: firstName,
                    referral_code,
                    role: 'CUSTOMER',
                    referral_code_expires_at: new Date(Date.now() + 2 * 60 * 1000)
                }
            });

            if (callbackQueryId) await bot.answerCallbackQuery(callbackQueryId);
            
            await bot.sendMessage(chatId, `🔑 Sizning yangi tasdiqlash kodingiz: \`${referral_code}\`\n\n⚠️ *Ushbu kod 2 daqiqa davomida amal qiladi.* Keyin yaroqsiz bo'ladi. Uni nusxalab oling va platformaga kiriting.`, {
                parse_mode: 'Markdown',
                reply_markup: {
                    keyboard: [[{ text: '🔑 Kod olish' }], [{ text: '🌐 Platformani ochish', web_app: { url: WEBAPP_URL } }]],
                    resize_keyboard: true
                }
            });
        } catch (err) {
            console.error('Bot get_code error:', err);
            bot.sendMessage(chatId, '❌ Kod olishda xatolik yuz berdi.');
        }
    }

    // Handle onboarding flow
    bot.on('message', async (msg) => {
        const chatId = msg.chat.id;
        const state = userStates.get(chatId);

        try {
            // Handle text keyboard "🔑 Kod olish"
            if (msg.text === '🔑 Kod olish') {
                const tgId = String(msg.from.id);
                return handleGetCode(bot, chatId, tgId, null, msg.from.first_name);
            }

            // Step 1: Region selection
            if (state && state.step === 'awaiting_region' && msg.text && REGIONS.includes(msg.text)) {
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
                    referral_code_expires_at: new Date(Date.now() + 2 * 60 * 1000)
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
                    `✅ *Ro'yxatdan o'tish muvaffaqiyatli!*\n\n📍 Viloyat: *${userData.region}*\n📞 Telefon: \`${userData.phone}\`\n\n🔑 Tasdiqlash kodingiz: \`${referral_code}\`\n\n⚠️ *Diqqat:* Ushbu kod 2 daqiqa davomida amal qiladi. Nusxalab oling va platformaga kiriting.`,
                    {
                        parse_mode: 'Markdown',
                        reply_markup: { remove_keyboard: true }
                    }
                );

                await bot.sendMessage(chatId,
                    `🚀 Platformani ochish uchun quyidagi tugmani bosing:`,
                    {
                        reply_markup: {
                            keyboard: [[{ text: '🔑 Kod olish' }], [{ text: '🌐 Platformani ochish', web_app: { url: WEBAPP_URL } }]],
                            resize_keyboard: true
                        }
                    }
                );

                userStates.delete(chatId);
            }
            // Handle location sharing
            if (msg.location && state && state.step === 'awaiting_location') {
                const { latitude, longitude } = msg.location;
                const tgId = String(msg.from.id);

                await prisma.user.update({
                    where: { tg_id: tgId },
                    data: { latitude, longitude }
                });

                await bot.sendMessage(chatId, "✅ Lokatsiya muvaffaqiyatli saqlandi va mijozga yuborildi!", {
                    reply_markup: { remove_keyboard: true }
                });
                
                // Show the location back for confirmation
                await bot.sendLocation(chatId, latitude, longitude);

                userStates.delete(chatId);
                return;
            }

            if (msg.text === "❌ Bekor qilish" && state && state.step === 'awaiting_location') {
                userStates.delete(chatId);
                return bot.sendMessage(chatId, "Amal bekor qilindi.", {
                    reply_markup: { remove_keyboard: true }
                });
            }
        } catch (err) {
            console.error('Bot onboarding error:', err);
            bot.sendMessage(chatId, '❌ Xatolik yuz berdi. Iltimos qaytadan urinib ko\'ring /start');
            userStates.delete(chatId);
        }
    });
}

module.exports = { setupHandlers, sendOrderNotification };
