
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("Reproducing ID Collision Bug...");

    try {
        // 1. Create Sales User
        const email = `test_bug_${Date.now()}@test.com`;
        const maxIndex = await prisma.user.aggregate({ _max: { userIndex: true } });
        const nextIndex = (maxIndex._max.userIndex || 0) + 1;

        const user = await prisma.user.create({
            data: {
                email, password: 'x', name: 'Tester', role: 'sales', userIndex: nextIndex, active: true
            }
        });
        console.log(`User Created: Index ${nextIndex}`);

        // Helper to create request
        const createReq = async (param: string) => {
            const count = await prisma.demoRequest.count({ where: { salespersonId: user.id } });
            const seq = count + 1;
            const rid = `${nextIndex}${seq.toString().padStart(5, '0')}`;
            console.log(`Attempting to create ID: ${rid} (Count was ${count})`);

            return await prisma.demoRequest.create({
                data: {
                    salespersonId: user.id,
                    readableId: rid,
                    // dummy required fields
                    distributorId: 'dummy', machineId: 'dummy', model: 'dummy', demoType: 'dummy',
                    proposedDate: '2025-01-01', expectedDuration: '1', applicationParams: '[]',
                    sampleVolume: '1', kitItems: '[]', businessPotential: '1', reasonForDemo: 'Test', urgencyLevel: 'Low'
                }
            });
        };

        // 2. Create Req 1
        await createReq("A");
        // 3. Create Req 2
        const r2 = await createReq("B");

        // 4. Delete Req 1
        // Actually, we need to delete the *first* one to break the count.
        // If we have 2 requests. Count is 2. Next is 3.
        // If we delete one. Count is 1. Next is 2.
        // Collides with r2 (which is ID ...2).

        const r1 = await prisma.demoRequest.findFirst({ where: { salespersonId: user.id, readableId: { endsWith: '00001' } } });
        if (r1) await prisma.demoRequest.delete({ where: { id: r1.id } });
        console.log("Deleted Req 1 (...00001)");

        // 5. Create Req 3 -> Should collide with Req 2
        await createReq("C");

    } catch (e) {
        if (e.message.includes('unique constraint')) {
            console.log("✅ Bug Reproduced: Unique constraint violation on readableId");
        } else {
            console.error("Error:", e);
        }
    } finally {
        await prisma.$disconnect();
    }
}

main();
