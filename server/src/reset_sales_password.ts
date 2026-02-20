
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    try {
        const hashedPassword = await bcrypt.hash('sales123', 10);

        // Find user
        const user = await prisma.user.findUnique({ where: { email: 'rahul@quicklab.com' } });

        if (!user) {
            console.log("User not found, creating...");
            await prisma.user.create({
                data: {
                    email: 'rahul@quicklab.com',
                    password: hashedPassword,
                    name: 'Rahul Sharma',
                    role: 'sales',
                    region: 'North',
                    active: true
                }
            });
        } else {
            console.log("User found, updating password...");
            await prisma.user.update({
                where: { email: 'rahul@quicklab.com' },
                data: { password: hashedPassword }
            });
        }
        console.log("Password reset successfully for rahul@quicklab.com -> sales123");

    } catch (e) {
        console.error("Error resetting password:", e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
