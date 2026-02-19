
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const requests = await prisma.demoRequest.findMany();
    console.log(`Found ${requests.length} requests.`);

    for (const r of requests) {
        console.log(`- ID: ${r.id}, ReadableID: ${r.readableId}, CreatedAt: ${r.createdAt}`);
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
