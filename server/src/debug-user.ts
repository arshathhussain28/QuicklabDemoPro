import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function debugUser() {
    try {
        console.log("Checking for user: admin@medtech.com");
        const user = await prisma.user.findUnique({ where: { email: 'admin@medtech.com' } });

        if (!user) {
            console.log("User NOT FOUND in database.");
        } else {
            console.log("User FOUND.");
            console.log("Stored Hash:", user.password);
            const isValid = await bcrypt.compare('admin123', user.password);
            console.log("Password 'admin123' valid?", isValid);

            // Check sales user too
            const sales = await prisma.user.findUnique({ where: { email: 'rahul@medtech.com' } });
            if (sales) {
                const isSalesValid = await bcrypt.compare('sales123', sales.password);
                console.log("Sales user found. Password 'sales123' valid?", isSalesValid);
            }
        }
    } catch (e) {
        console.error("Error connecting to DB:", e);
    } finally {
        await prisma.$disconnect();
    }
}

debugUser();
