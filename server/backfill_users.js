const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Backfilling User Indices...');

    const users = await prisma.user.findMany({
        where: { role: 'sales', userIndex: null },
        orderBy: { createdAt: 'asc' }
    });

    console.log(`Found ${users.length} users to update.`);

    let currentIndex = 0;

    // Find max existing index
    const lastUser = await prisma.user.findFirst({
        where: { userIndex: { not: null } },
        orderBy: { userIndex: 'desc' }
    });
    if (lastUser) currentIndex = lastUser.userIndex || 0;

    for (const user of users) {
        currentIndex++;
        await prisma.user.update({
            where: { id: user.id },
            data: { userIndex: currentIndex }
        });
        console.log(`Updated ${user.email} -> Index ${currentIndex}`);
    }
}

main()
    .catch((e) => console.error(e))
    .finally(async () => await prisma.$disconnect());
