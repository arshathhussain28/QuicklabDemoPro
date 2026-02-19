
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixUserIndices() {
    console.log("Fixing User Indices (Admins -> 0, Sales -> 1+)...");

    // 1. Set all Admins to 0 (or a separate sequence if needed, but request implies sales sequence matters)
    const admins = await prisma.user.findMany({ where: { role: 'admin' } });
    for (const admin of admins) {
        console.log(`Setting Admin ${admin.name} to Index 0`);
        await prisma.user.update({
            where: { id: admin.id },
            data: { userIndex: 0 }
        });
    }

    // 2. Sequence Salespersons
    const salespersons = await prisma.user.findMany({
        where: { role: 'sales' },
        orderBy: { createdAt: 'asc' }
    });

    let currentIndex = 1;

    for (const user of salespersons) {
        console.log(`Setting Salesperson ${user.name} to Index ${currentIndex}`);
        await prisma.user.update({
            where: { id: user.id },
            data: { userIndex: currentIndex }
        });
        currentIndex++;
    }

    console.log("User indices updated successfully.");
}

fixUserIndices()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
