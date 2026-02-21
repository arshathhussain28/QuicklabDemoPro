
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
const prisma = new PrismaClient();

async function main() {
    const users = await prisma.user.findMany();

    for (const user of users) {
        let newPassword = '';
        if (user.role === 'admin') {
            newPassword = 'admin123';
        } else {
            newPassword = 'sales123';
        }

        // Special case for arshath@quicklab.com if requested previously, 
        // but the user says "other sales person", so let's just standardize ALL sales to sales123 for simplicity
        // or keep arshath as arshath123 if that was a specific requirement.
        if (user.email === 'arshath@quicklab.com') {
            newPassword = 'arshath123';
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await prisma.user.update({
            where: { id: user.id },
            data: { password: hashedPassword }
        });
        console.log(`Updated password for: ${user.email} (${user.role}) to ${newPassword}`);
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
