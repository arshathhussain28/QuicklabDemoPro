
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function listUsers() {
    console.log("Listing Users...");

    const users = await prisma.user.findMany({
        orderBy: { createdAt: 'asc' }
    });

    for (const u of users) {
        console.log(`User: ${u.name} | Role: ${u.role} | Index: ${u.userIndex} | Created: ${u.createdAt}`);
    }
}

listUsers()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
