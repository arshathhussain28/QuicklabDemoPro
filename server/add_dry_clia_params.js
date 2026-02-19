const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const parameters = [
    // Inflammation
    { name: 'CRP', category: 'Inflammation' }, { name: 'SAA', category: 'Inflammation' }, { name: 'IL-6', category: 'Inflammation' }, { name: 'PCT', category: 'Inflammation' }, { name: 'KL-6', category: 'Inflammation' }, { name: 'HBP', category: 'Inflammation' },
    // Cardiac
    { name: 'D-dimer', category: 'Cardiac' }, { name: 'BNP', category: 'Cardiac' }, { name: 'NT-proBNP', category: 'Cardiac' }, { name: 'CK-MB', category: 'Cardiac' }, { name: 'Myo', category: 'Cardiac' }, { name: 'hs-cTnT', category: 'Cardiac' },
    // Thyroid
    { name: 'FT4', category: 'Thyroid' }, { name: 'FT3', category: 'Thyroid' }, { name: 'TT4', category: 'Thyroid' }, { name: 'TT3', category: 'Thyroid' }, { name: 'TSH', category: 'Thyroid' },
    // Tumor Markers
    { name: 'tPSA', category: 'Tumor Markers' }, { name: 'fPSA', category: 'Tumor Markers' }, { name: 'CEA', category: 'Tumor Markers' }, { name: 'AFP', category: 'Tumor Markers' }, { name: 'CYFRA21-1', category: 'Tumor Markers' }, { name: 'CA199', category: 'Tumor Markers' }, { name: 'CA125', category: 'Tumor Markers' },
    // Hormones Fertility
    { name: 'beta-hCG', category: 'Hormones Fertility' }, { name: 'Prolactin', category: 'Hormones Fertility' }, { name: 'Prog', category: 'Hormones Fertility' }, { name: 'Cortisol', category: 'Hormones Fertility' }, { name: 'FSH', category: 'Hormones Fertility' }, { name: 'AMH', category: 'Hormones Fertility' }, { name: 'Testosterone', category: 'Hormones Fertility' }, { name: 'LH', category: 'Hormones Fertility' }, { name: 'Estradiol', category: 'Hormones Fertility' },
    // Diabetes
    { name: 'HbA1c', category: 'Diabetes' }, { name: 'Insulin', category: 'Diabetes' },
    // Bone Metabolism
    { name: '25-OH VD', category: 'Bone Metabolism' },
    // Anemia
    { name: 'AB12', category: 'Anemia' }, { name: 'Ferritin', category: 'Anemia' },
    // Allergy
    { name: 'IgE', category: 'Allergy' },
    // Preeclampsia
    { name: 'sFlt-1', category: 'Preeclampsia' }, { name: 'PlGF', category: 'Preeclampsia' }
];

async function main() {
    console.log('Adding Dry Clia Parameters with Categories...');

    try {
        // 1. Find the Machine (Dry Clia)
        const machine = await prisma.machine.findFirst({
            where: { name: { contains: 'Dry Clia' } }
        });

        if (!machine) {
            console.log('Machine "Dry Clia" NOT FOUND. Please ensure it exists.');
            return;
        }
        console.log(`Found Machine: ${machine.name} (${machine.id})`);

        // 2. Add Parameters using Raw SQL
        let count = 0;
        for (const param of parameters) {
            // Check if exists (Raw)
            const existing = await prisma.$queryRawUnsafe(`SELECT * FROM KitParameter WHERE machineId = '${machine.id}' AND name = '${param.name}'`);

            if (existing.length === 0) {
                const id = require('crypto').randomUUID();
                await prisma.$executeRawUnsafe(`
          INSERT INTO KitParameter (id, name, category, machineId) 
          VALUES ('${id}', '${param.name}', '${param.category}', '${machine.id}')
        `);
                console.log(`Added: ${param.name} (${param.category})`);
                count++;
            } else {
                // Optional: Update category if missing
                await prisma.$executeRawUnsafe(`UPDATE KitParameter SET category = '${param.category}' WHERE id = '${existing[0].id}'`);
                console.log(`Updated/Skipped: ${param.name}`);
            }
        }

        console.log(`\nDone. Processed ${parameters.length} parameters.`);

    } catch (e) {
        console.error("Critical Error:", e);
    }
}

main()
    .catch((e) => console.error(e))
    .finally(async () => await prisma.$disconnect());
