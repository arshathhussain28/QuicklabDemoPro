
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log("Resetting ALL Sales Passwords to 'sales123'...");

    const password = 'sales123';
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        const result = await prisma.user.updateMany({
            where: { role: 'sales' },
            data: { password: hashedPassword }
        });

        console.log(`✅ Updated ${result.count} sales users to password: '${password}'`);

        // List them for verification
        const users = await prisma.user.findMany({ where: { role: 'sales' } });
        users.forEach(u => {
            console.log(`- ${u.email} (Active: ${u.active})`);
        });

    } catch (e) {
        console.error("Error resetting passwords:", e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
