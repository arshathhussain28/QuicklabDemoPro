
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    const email = 'admin@quicklab.com';
    const password = 'admin123';
    const hashedPassword = await bcrypt.hash(password, 10);

    console.log(`Resetting password for ${email}...`);

    try {
        const user = await prisma.user.update({
            where: { email },
            data: { password: hashedPassword }
        });
        console.log("Password updated successfully for:", user.email);
    } catch (error) {
        console.error("User not found or update failed, creating user...");
        try {
            const newUser = await prisma.user.create({
                data: {
                    email,
                    password: hashedPassword,
                    name: "System Admin",
                    role: "admin",
                    region: "Global",
                    active: true
                }
            });
            console.log("User created successfully:", newUser.email);
        } catch (createError) {
            console.error("Create failed:", createError);
        }
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
