
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("Reassigning Indices (Admin -> 0)...");

    // 1. Update Admin to 0
    const admin = await prisma.user.findFirst({ where: { role: 'admin' } });
    if (admin) {
        await prisma.user.update({
            where: { id: admin.id },
            data: { userIndex: 0 }
        });
        console.log(`✅ Admin (${admin.email}) set to Index 0`);
    }

    // 2. Update Sales Users sequentially
    const salesUsers = await prisma.user.findMany({
        where: { role: 'sales' },
        orderBy: { createdAt: 'asc' }
    });

    for (let i = 0; i < salesUsers.length; i++) {
        const u = salesUsers[i];
        const newIndex = i + 1; // Start from 1
        await prisma.user.update({
            where: { id: u.id },
            data: { userIndex: newIndex }
        });
        console.log(`✅ Sales User (${u.email}) set to Index ${newIndex}`);
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
