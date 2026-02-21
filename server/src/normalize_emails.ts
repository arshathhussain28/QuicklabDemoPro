
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const users = await prisma.user.findMany();
    for (const user of users) {
        await prisma.user.update({
            where: { id: user.id },
            data: { email: user.email.toLowerCase() }
        });
        console.log(`Normalized: ${user.email} -> ${user.email.toLowerCase()}`);
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
