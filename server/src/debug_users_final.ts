
import { PrismaClient } from '@prisma/client';
import fs from 'fs';

const prisma = new PrismaClient();

async function listUsers() {
    const users = await prisma.user.findMany({
        orderBy: { createdAt: 'asc' }
    });

    const output = users.map(u => ({
        name: u.name,
        role: u.role,
        index: u.userIndex
    }));

    fs.writeFileSync('debug_users_output.json', JSON.stringify(output, null, 2));
}

listUsers()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
