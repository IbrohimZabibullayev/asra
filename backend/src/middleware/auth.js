const jwt = require('jsonwebtoken');
const prisma = require('../prisma');

async function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Token topilmadi' });
    }

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Block check
        const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
        if (!user) {
            console.warn(`[Auth] 401: User not found for ID ${decoded.userId}`);
            return res.status(401).json({ error: 'Foydalanuvchi topilmadi' });
        }

        if (user.status === 'BLOCKED') {
            console.warn(`[Auth] 403: User ${user.tg_id} is BLOCKED`);
            return res.status(403).json({ error: 'Sizning hisobingiz admin tomonidan bloklangan' });
        }

        req.userId = decoded.userId;
        req.tgId = decoded.tgId;
        next();
    } catch (err) {
        console.warn(`[Auth] 401: Invalid token. Error: ${err.message}`);
        return res.status(401).json({ error: 'Yaroqsiz token' });
    }
}

module.exports = { authMiddleware };
