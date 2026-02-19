
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log("Starting force seed...");

    // Admin
    const adminEmail = 'admin@quicklab.com';
    const adminPassword = await bcrypt.hash('admin123', 10);

    console.log(`Upserting admin: ${adminEmail}`);
    const admin = await prisma.user.upsert({
        where: { email: adminEmail },
        update: { password: adminPassword },
        create: {
            email: adminEmail,
            name: 'System Admin',
            role: 'admin',
            password: adminPassword,
            region: 'Global',
            phone: '1234567890'
        }
    });
    console.log("Admin upserted:", admin);

    // Sales
    const salesEmail = 'rahul@quicklab.com';
    const salesPassword = await bcrypt.hash('sales123', 10);

    console.log(`Upserting sales: ${salesEmail}`);
    const sales = await prisma.user.upsert({
        where: { email: salesEmail },
        update: { password: salesPassword },
        create: {
            email: salesEmail,
            name: 'Rahul Sharma',
            role: 'sales',
            password: salesPassword,
            region: 'North',
            phone: '0987654321'
        }
    });
    console.log("Sales upserted:", sales);
}

main()
    .catch((e) => {
        console.error("Error:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
        console.log("Disconnected");
    });
