const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Fixing User Indices...');

    // Fix Arshath (1)
    const arshath = await prisma.user.findFirst({ where: { name: { contains: 'Arshath' } } });
    if (arshath) {
        await prisma.user.update({
            where: { id: arshath.id },
            data: { userIndex: 1 }
        });
        console.log(`Updated Arshath (${arshath.email}) -> Index 1`);
    } else {
        console.log('User Arshath not found');
    }

    // Fix Srikanth (2)
    const srikanth = await prisma.user.findFirst({ where: { name: { contains: 'Srikanth' } } });
    if (srikanth) {
        await prisma.user.update({
            where: { id: srikanth.id },
            data: { userIndex: 2 }
        });
        console.log(`Updated Srikanth (${srikanth.email}) -> Index 2`);
    } else {
        console.log('User Srikanth not found');
    }

    // List all users
    const allUsers = await prisma.user.findMany({ select: { name: true, role: true, userIndex: true } });
    console.log('All Users:', allUsers);
}

main()
    .catch((e) => console.error(e))
    .finally(async () => await prisma.$disconnect());
