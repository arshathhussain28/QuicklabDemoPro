const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const users = await prisma.user.findMany();
    console.log("Current Users:");
    users.forEach(u => {
        console.log(`${u.name} (${u.email}) - Role: ${u.role}, Index: ${u.userIndex}`);
    });

    const requests = await prisma.demoRequest.findMany();
    console.log("\nCurrent Requests:");
    requests.forEach(r => {
        console.log(`ID: ${r.id}, ReadableID: ${r.readableId}, Sales: ${r.salespersonId}`);
    });
}

main()
    .catch((e) => console.error(e))
    .finally(async () => await prisma.$disconnect());
