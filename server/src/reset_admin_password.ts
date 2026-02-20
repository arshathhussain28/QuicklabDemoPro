
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    try {
        const hashedPassword = await bcrypt.hash('admin123', 10);

        // Upsert Admin
        await prisma.user.upsert({
            where: { email: 'admin@quicklab.com' },
            update: { password: hashedPassword },
            create: {
                email: 'admin@quicklab.com',
                password: hashedPassword,
                name: 'System Admin',
                role: 'admin',
                active: true
            }
        });
        console.log("Admin password reset to 'admin123'");

    } catch (e) {
        console.error("Error resetting admin password:", e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
