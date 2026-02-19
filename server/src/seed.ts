import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const salesPassword = await bcrypt.hash('sales123', 10);

    // Create Admin
    const admin = await prisma.user.upsert({
        where: { email: 'admin@quicklab.com' },
        update: {
            password: hashedPassword, // Ensure password is updated if user exists
        },
        create: {
            email: 'admin@quicklab.com',
            name: 'System Admin',
            role: 'admin',
            password: hashedPassword,
        },
    });

    // Create Salesperson
    const sales = await prisma.user.upsert({
        where: { email: 'rahul@quicklab.com' },
        update: {
            password: salesPassword, // Ensure password is updated if user exists
        },
        create: {
            email: 'rahul@quicklab.com',
            name: 'Rahul Sharma',
            role: 'sales',
            password: salesPassword,
            region: 'North',
        },
    });

    // Create Distributor
    const dist = await prisma.distributor.create({
        data: {
            name: 'MedSupply India Pvt Ltd',
            location: 'Mumbai',
            contactPerson: 'Vikram Mehta',
            phone: '+91 22 4567 8901'
        }
    });

    // Create Machine
    const machine = await prisma.machine.create({
        data: {
            name: 'Hematology Analyzer',
            category: 'Diagnostics',
            models: {
                create: [{ name: 'HA-3000' }, { name: 'HA-5000' }]
            },
            kitParameters: {
                create: [{ name: 'CBC Panel' }, { name: '5-Part Differential' }]
            }
        }
    });

    // Create Demo Types
    const demoTypes = [
        'Product Evaluation',
        'Pre-Purchase Demo',
        'Conference Demo',
        'Training Demo',
        'Comparative Study'
    ];

    for (const name of demoTypes) {
        await prisma.demoType.upsert({
            where: { name },
            update: {},
            create: { name }
        });
    }

    // Create Demo Request
    const demoRequest = await prisma.demoRequest.create({
        data: {
            salespersonId: sales.id,
            distributorId: dist.id,
            machineId: machine.id,
            model: 'HA-5000',
            demoType: 'Product Evaluation',
            proposedDate: '2026-03-01',
            expectedDuration: '1 week',
            applicationParams: JSON.stringify(['CBC']),
            sampleVolume: '50/day',
            specialRequirements: 'None',
            kitItems: JSON.stringify([{ kitId: '1', quantity: 2, unit: 'Box' }]),
            businessPotential: 'High',
            competitorDetails: 'None',
            reasonForDemo: 'Evaluation',
            urgencyLevel: 'Medium',
            readableId: '100001',
            status: 'pending',
            logs: {
                create: {
                    action: 'CREATED',
                    performedBy: sales.id,
                    details: 'Seeded Request (ID: 100001)'
                }
            }
        }
    });

    console.log({ admin, sales, dist, machine, demoRequest });
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
