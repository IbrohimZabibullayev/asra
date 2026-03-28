const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
async function run() {
    await p.product.deleteMany();
    await p.user.deleteMany();
    console.log("Database wiped successfully!");
}
run().catch(console.error).finally(() => p.$disconnect());
