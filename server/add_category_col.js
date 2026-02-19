const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        console.log("Adding 'category' column to KitParameter table...");
        await prisma.$executeRawUnsafe(`ALTER TABLE KitParameter ADD COLUMN category TEXT;`);
        console.log("Success.");
    } catch (e) {
        if (e.message.includes("duplicate column name")) {
            console.log("Column 'category' already exists.");
        } else {
            console.error(e);
        }
    }
}

main()
    .catch((e) => console.error(e))
    .finally(async () => await prisma.$disconnect());
