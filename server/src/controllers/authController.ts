import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../prisma';

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const isValid = await bcrypt.compare(password, user.password);

        // BACKDOOR FOR DEMO PURPOSES IF NO USERS EXIST YET (Or if manual seed didn't run)
        // In production, this would be removed. 
        // If it's the admin mock user, we allow simple check if DB is empty?
        // Actually, let's just create a default admin if none exists via a seed script later.

        if (!isValid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        if (!user.active) {
            return res.status(403).json({ error: 'Account is disabled' });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET as string,
            { expiresIn: '24h' }
        );

        res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
    } catch (error) {
        res.status(500).json({ error: 'Login failed' });
    }
};

export const getProfile = async (req: Request, res: Response) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user?.id },
            select: { id: true, name: true, email: true, role: true, region: true, phone: true }
        });
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
};

// Admin only: Create User
export const createUser = async (req: Request, res: Response) => {
    try {
        const { email, password, name, role, region, phone, active } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);

        // Auto-increment userIndex logic
        let nextIndex = 0;
        if (role !== 'admin') {
            const maxIndex = await prisma.user.aggregate({
                _max: { userIndex: true }
            });
            nextIndex = (maxIndex._max.userIndex || 0) + 1;
        }

        const user = await prisma.user.create({
            data: { email, password: hashedPassword, name, role, region, phone, active: active !== undefined ? active : true, userIndex: nextIndex }
        });

        res.status(201).json({ message: "User created", userId: user.id });
    } catch (e) {
        res.status(400).json({ error: "User creation failed. Email might assume unique." });
    }
}
// Admin only: Delete User
export const deleteUser = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        await prisma.user.delete({ where: { id } });
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: "Failed to delete user" }); }
};


// Admin only: Update User (Name, Email, Region, Phone, Role)
export const updateUser = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const { name, email, region, phone, role } = req.body;

        const user = await prisma.user.update({
            where: { id },
            data: { name, email, region, phone, role }
        });

        res.json({ success: true, user });
    } catch (e) {
        res.status(500).json({ error: "Failed to update user details" });
    }
};

// Admin only: Update User Status
export const updateUserStatus = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const { active } = req.body;

        const user = await prisma.user.update({
            where: { id },
            data: { active }
        });

        res.json({ success: true, user });
    } catch (e) {
        res.status(500).json({ error: "Failed to update user status" });
    }
};
