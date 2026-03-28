const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
async function run() {
    const users = await p.user.findMany({ select: { tg_id: true, region: true, role: true, merchant_status: true } });
    console.log('--- USERS ---');
    console.table(users);

    const products = await p.product.findMany();
    console.log('\n--- PRODUCTS ---');
    console.table(products);
}
run().finally(() => p.$disconnect());
