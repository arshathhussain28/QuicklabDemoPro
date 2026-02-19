
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    const email = 'admin@quicklab.com';
    const password = 'admin123';

    console.log(`Testing login for ${email}...`);

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
        console.error("User NOT FOUND in DB.");
        return;
    }

    console.log("User found:", user.email, "Role:", user.role);
    console.log("Stored Password Hash:", user.password);

    const isValid = await bcrypt.compare(password, user.password);
    console.log("Password valid:", isValid);

    if (isValid) {
        console.log("LOGIN SUCCESSFUL (Simulation)");
    } else {
        console.error("LOGIN FAILED: Password mismatch");
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
