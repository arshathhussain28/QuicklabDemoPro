
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("Checking for admin@quicklab.com...");
    const admin = await prisma.user.findUnique({ where: { email: 'admin@quicklab.com' } });

    if (admin) {
        console.log("FOUND Admin:", { id: admin.id, email: admin.email, role: admin.role, active: admin.active });
    } else {
        console.log("NOT FOUND: admin@quicklab.com");
    }

    console.log("Checking for rahul@quicklab.com...");
    const sales = await prisma.user.findUnique({ where: { email: 'rahul@quicklab.com' } });

    if (sales) {
        console.log("FOUND Sales:", { id: sales.id, email: sales.email, role: sales.role, active: sales.active });
    } else {
        console.log("NOT FOUND: rahul@quicklab.com");
    }

    const allUsers = await prisma.user.findMany({ select: { email: true } });
    console.log("All User Emails:", allUsers.map(u => u.email));
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
