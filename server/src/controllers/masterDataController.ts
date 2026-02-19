import { Request, Response } from 'express';
import prisma from '../prisma';

export const getAllData = async (req: Request, res: Response) => {
    try {
        const [salespersons, distributors, machines, demoTypes, kitParameters] = await Promise.all([
            prisma.user.findMany({ where: { role: 'sales', active: true }, select: { id: true, name: true, email: true, phone: true, region: true, active: true } }),
            prisma.distributor.findMany(),
            prisma.machine.findMany({ include: { models: true } }),
            prisma.demoType.findMany().then(types => types.map(t => t.name)),
            prisma.kitParameter.findMany()
        ]);

        res.json({
            salespersons,
            distributors,
            machines,
            demoTypes,
            kitParameters
        });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch master data" });
    }
}

// Distributors
export const createDistributor = async (req: Request, res: Response) => {
    try {
        const distributor = await prisma.distributor.create({ data: req.body });
        res.json(distributor);
    } catch (e) { res.status(500).json({ error: "Failed to create distributor" }); }
};

export const deleteDistributor = async (req: Request, res: Response) => {
    try {
        await prisma.distributor.delete({ where: { id: req.params.id } });
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: "Failed to delete distributor" }); }
};

// Machines
export const createMachine = async (req: Request, res: Response) => {
    try {
        const { name, category, models } = req.body; // models is string[]
        const machine = await prisma.machine.create({
            data: {
                name,
                category,
                models: {
                    create: (models || []).map((m: string) => ({ name: m }))
                }
            },
            include: { models: true }
        });
        res.json(machine);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Failed to create machine" });
    }
};

export const deleteMachine = async (req: Request, res: Response) => {
    try {
        await prisma.machine.delete({ where: { id: req.params.id } });
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: "Failed to delete machine" }); }
};

// Kit Parameters
export const createKitParameter = async (req: Request, res: Response) => {
    try {
        const kit = await prisma.kitParameter.create({ data: req.body });
        res.json(kit);
    } catch (e) { res.status(500).json({ error: "Failed to create kit parameter" }); }
};



// Update Machine
export const updateMachine = async (req: Request, res: Response) => {
    try {
        const { name, category, models } = req.body;
        // First update the machine details
        const machine = await prisma.machine.update({
            where: { id: req.params.id },
            data: {
                name: name as string,
                category: category as string
            }
        });

        // If models provided, we need to handle them. 
        // Simplest is to delete all and recreate, or strict diff.
        // For now, let's assume models are just replaced if provided.
        if (models && Array.isArray(models)) {
            await prisma.machineModel.deleteMany({ where: { machineId: machine.id } });
            await prisma.machineModel.createMany({
                data: models.map((m: string) => ({ name: m, machineId: machine.id }))
            });
        }

        const updated = await prisma.machine.findUnique({ where: { id: machine.id }, include: { models: true } });
        res.json(updated);
    } catch (e) { res.status(500).json({ error: "Failed to update machine" }); }
};

export const deleteKitParameter = async (req: Request, res: Response) => {
    try {
        await prisma.kitParameter.delete({ where: { id: req.params.id } });
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: "Failed to delete kit parameter" }); }
};

// Update Kit Parameter
export const updateKitParameter = async (req: Request, res: Response) => {
    try {
        const { name, category, machineId } = req.body;
        // @ts-ignore - category might not be in client yet
        const kit = await prisma.kitParameter.update({
            where: { id: req.params.id },
            data: {
                name: name as string,
                category: category as string,
                machineId: machineId as string
            }
        });
        res.json(kit);
    } catch (e) { res.status(500).json({ error: "Failed to update kit parameter" }); }
};

