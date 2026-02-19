
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixUserIndices() {
    console.log("Fixing User Indices...");

    // Get all users, ordered by creation time
    const users = await prisma.user.findMany({
        orderBy: { createdAt: 'asc' }
    });

    let currentIndex = 1;

    for (const user of users) {
        // If user already has an index, we might want to keep it OR overwrite it to ensure sequence.
        // The user request implies "first person admin added... start from 1".
        // So we should strictly re-sequence them based on creation order.

        console.log(`Updating user ${user.name} (${user.email}) to index ${currentIndex}`);

        await prisma.user.update({
            where: { id: user.id },
            data: { userIndex: currentIndex }
        });

        currentIndex++;
    }

    console.log("User indices updated successfully.");

    // Also update readableIds for existing requests?
    // The user didn't explicitly ask to fix *existing* requests, but it might be nice.
    // However, changing IDs of existing requests might be confusing if they are already printed.
    // "make it fix properly struture the request id generating"
    // I will primarily fix the User Indices so *new* requests are correct.
    // Changing existing Request IDs is risky (broken links etc).
    // I'll stick to fixing User Indices.
}

fixUserIndices()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
