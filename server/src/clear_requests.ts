
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    await prisma.activityLog.deleteMany();
    await prisma.demoRequest.deleteMany();
    console.log("Deleted all demo requests.");
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
