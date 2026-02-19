const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const prisma = new PrismaClient();

async function main() {
    const log = [];

    try {
        // 1. Fix Srikanth User Index (Raw SQL)
        // We first find ID using standard client (safe)
        const srikanth = await prisma.user.findFirst({
            where: {
                OR: [
                    { name: { contains: 'Srikanth' } },
                    { email: { contains: 'srikanth' } }
                ]
            }
        });

        if (srikanth) {
            // Use Raw SQL to update userIndex
            await prisma.$executeRawUnsafe(`UPDATE User SET userIndex = 2 WHERE id = '${srikanth.id}'`);
            log.push(`Updated Srikanth (${srikanth.email}) to User Index 2 (RAW SQL)`);
        } else {
            log.push('User Srikanth not found! Cannot update index.');
        }

        // 2. Fix Request 900001 -> 200001 (Raw SQL)
        // Use raw update to ensure we catch it
        const count = await prisma.$executeRawUnsafe(`UPDATE DemoRequest SET readableId = '200001' WHERE readableId = '900001'`);
        if (count > 0) {
            log.push('Successfully renamed Request 900001 -> 200001');
        } else {
            // Check if 200001 already exists?
            const check = await prisma.demoRequest.findUnique({ where: { readableId: '200001' } });
            if (check) log.push('Request 200001 already exists. No need to rename.');
            else log.push('Request 900001 not found.');
        }

        // 3. Verify Users (Raw SQL)
        const rawUsers = await prisma.$queryRawUnsafe(`SELECT name, email, userIndex FROM User`);
        log.push('Verification - Current Users: ' + JSON.stringify(rawUsers));

    } catch (err) {
        log.push(`CRITICAL ERROR: ${err.message}`);
        console.error(err);
    }

    fs.writeFileSync('debug_output.json', JSON.stringify(log, null, 2));
    console.log(JSON.stringify(log, null, 2));
}

main()
    .catch((e) => console.error(e))
    .finally(async () => await prisma.$disconnect());
