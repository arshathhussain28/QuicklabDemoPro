
import axios from 'axios';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const API_URL = 'http://localhost:5000/api';

async function main() {
    try {
        console.log("--- Debugging Operations ---");

        // 1. Test Admin Login
        console.log("\n1. Testing Admin Login...");
        let adminToken = '';
        try {
            const res = await axios.post(`${API_URL}/auth/login`, {
                email: 'admin@quicklab.com',
                password: 'admin123'
            });
            console.log("✅ Admin Login Success:", res.data.user.email);
            adminToken = res.data.token;
        } catch (e: any) {
            console.error("❌ Admin Login Failed:", e.response?.data || e.message);
        }

        // 2. Test Sales Login
        console.log("\n2. Testing Sales Login...");
        try {
            const res = await axios.post(`${API_URL}/auth/login`, {
                email: 'rahul@quicklab.com',
                password: 'sales123'
            });
            console.log("✅ Sales Login Success:", res.data.user.email);
        } catch (e: any) {
            console.error("❌ Sales Login Failed:", e.response?.data || e.message);

            // Check if user exists in DB
            const user = await prisma.user.findUnique({ where: { email: 'rahul@quicklab.com' } });
            console.log("   User in DB:", user ? "Found" : "Not Found");
            if (user) console.log("   Active Status:", user.active);
        }

        if (!adminToken) {
            console.log("Skipping delete tests due to admin login failure.");
            return;
        }

        // 3. Test Create & Delete Dummy User
        console.log("\n3. Testing Delete User...");
        try {
            // Create dummy
            const dummyUser = await prisma.user.create({
                data: {
                    email: 'dummy@test.com',
                    password: 'password',
                    name: 'Dummy User',
                    role: 'sales',
                    active: true
                }
            });
            console.log("   Dummy User Created:", dummyUser.id);

            // Delete dummy via API
            const delRes = await axios.delete(`${API_URL}/auth/users/${dummyUser.id}`, {
                headers: { Authorization: `Bearer ${adminToken}` }
            });
            console.log("✅ Delete User API Success:", delRes.data);

            // Verify in DB
            const check = await prisma.user.findUnique({ where: { id: dummyUser.id } });
            console.log("   User in DB after delete:", check ? "Still Exists (FAIL)" : "Gone (PASS)");

        } catch (e: any) {
            console.error("❌ Delete User Failed:", e.response?.data || e.message);
        }

        // 4. Test Create & Delete Machine
        console.log("\n4. Testing Delete Machine...");
        try {
            // Create dummy
            const dummyMachine = await prisma.machine.create({
                data: {
                    name: 'Dummy Machine',
                    category: 'Test'
                }
            });
            console.log("   Dummy Machine Created:", dummyMachine.id);

            // Delete dummy via API
            const delRes = await axios.delete(`${API_URL}/master-data/machines/${dummyMachine.id}`, {
                headers: { Authorization: `Bearer ${adminToken}` }
            });
            console.log("✅ Delete Machine API Success:", delRes.data);

            // Verify in DB
            const check = await prisma.machine.findUnique({ where: { id: dummyMachine.id } });
            console.log("   Machine in DB after delete:", check ? "Still Exists (FAIL)" : "Gone (PASS)");

        } catch (e: any) {
            console.error("❌ Delete Machine Failed:", e.response?.data || e.message);
        }

    } catch (e) {
        console.error("Unexpected error:", e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
