import { Request, Response } from 'express';
import prisma from '../prisma';
import { generatePDF } from '../services/pdfService';
import { sendEmail } from '../services/emailService';
import { sendWhatsAppNotification } from '../services/whatsappService';


// Submit a new Demo Request
export const createRequest = async (req: Request, res: Response) => {
    try {
        const {
            distributorId, machineId, model, demoType, proposedDate, expectedDuration,
            applicationParams, sampleVolume, specialRequirements,
            kitItems, // Array of {kitId, quantity}
            businessPotential, competitorDetails, reasonForDemo, urgencyLevel,
            regionalManagerApproval, regionalManagerName, approvalDate,
            expectedPurchaseDate,
            doctorName, doctorDepartment, hospitalName, location, expectedReturnDate
        } = req.body;

        const salespersonId = req.user?.id;
        if (!salespersonId) return res.status(401).json({ error: "Unauthorized" });

        // Validate Kit Items (Basic check)
        // In a real app, we'd validate if kitId exists and matches machine

        // Generate 6-digit readable ID
        // Generate Custom Sequential ID: [UserIndex][Sequence]
        // Example: User 1 -> 100001, 100002...
        // Example: User 2 -> 200001, 200002...

        const salesUser = await prisma.user.findUnique({ where: { id: salespersonId } });
        const userIndex = salesUser?.userIndex || 0; // Should be set by authController/seed

        // Count requests by THIS salesperson to determine next sequence
        const userRequestCount = await prisma.demoRequest.count({
            where: { salespersonId }
        });

        // Sequence starts at 1
        const nextSequence = userRequestCount + 1;

        // Format: {UserIndex}{0000X} -> e.g. 100005
        const readableId = `${userIndex}${nextSequence.toString().padStart(5, '0')}`;

        const request = await prisma.demoRequest.create({
            data: {
                salespersonId,
                distributorId,
                machineId,
                model,
                demoType,
                proposedDate,
                expectedDuration,
                applicationParams: JSON.stringify(applicationParams), // Expecting array
                sampleVolume,
                specialRequirements,
                kitItems: JSON.stringify(kitItems || []),
                businessPotential,
                competitorDetails,
                reasonForDemo,
                urgencyLevel,
                regionalManagerApproval,
                regionalManagerName,
                approvalDate,
                expectedPurchaseDate: expectedPurchaseDate || null,
                doctorName,
                doctorDepartment,
                hospitalName,
                location,
                expectedReturnDate,
                status: 'pending',
                readableId, // Add generated ID
                logs: {
                    create: {
                        action: 'CREATED',
                        performedBy: salespersonId,
                        details: `Demo Request submitted (ID: ${readableId})`
                    }
                }
            }
        });

        // TODO: Trigger PDF Generation & Email/WhatsApp here (Async)

        res.status(201).json(request);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to submit request' });
    }
};

// Get all requests (Admin: All, Sales: Own)
export const getRequests = async (req: Request, res: Response) => {
    try {
        const { role, id } = req.user!;

        const whereClause = role === 'admin' ? {} : { salespersonId: id };

        const requests = await prisma.demoRequest.findMany({
            where: whereClause,
            include: {
                salesperson: { select: { name: true, region: true } },
                distributor: { select: { name: true, location: true } },
                machine: { select: { name: true } }
            },
            orderBy: { createdAt: 'desc' }
        });

        // Parse JSON fields for frontend
        const parsedRequests = requests.map(r => ({
            ...r,
            applicationParams: JSON.parse(r.applicationParams),
            kitItems: JSON.parse(r.kitItems)
        }));

        res.json(parsedRequests);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch requests' });
    }
};

// Get single request detail
export const getRequestById = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const request = await prisma.demoRequest.findUnique({
            where: { id },
            include: {
                salesperson: true,
                distributor: true,
                machine: true,
                logs: true
            }
        });

        if (!request) return res.status(404).json({ error: "Request not found" });

        // Security check
        if (req.user?.role !== 'admin' && request.salespersonId !== req.user?.id) {
            return res.status(403).json({ error: "Access denied" });
        }

        res.json({
            ...request,
            applicationParams: JSON.parse(request.applicationParams),
            kitItems: JSON.parse(request.kitItems)
        });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch request" });
    }
}

// Admin: Update Status / Logistics
export const updateRequestStatus = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const {
            status,
            machineSerialNumber,
            dispatchedBy,
            dispatchDate,
            courierDetails,
            trackingNumber,
            conditionOnReturn,
            remarks
        } = req.body;

        const updateData: any = {};
        if (status) updateData.status = status;
        if (machineSerialNumber) updateData.machineSerialNumber = machineSerialNumber;
        if (dispatchedBy) updateData.dispatchedBy = dispatchedBy;
        if (dispatchDate) updateData.dispatchDate = dispatchDate;
        if (courierDetails) updateData.courierDetails = courierDetails;
        if (trackingNumber) updateData.trackingNumber = trackingNumber;
        if (conditionOnReturn) updateData.conditionOnReturn = conditionOnReturn;
        if (remarks) updateData.remarks = remarks;

        // Validation for Dispatched status
        if (status === 'dispatched' && (!machineSerialNumber)) {
            // In a real scenario, we might want to enforce this more strictly
            // But for now, we'll allow it but maybe warn? 
            // The prompt said: "Mandatory before marking status = Dispatched"
            if (!machineSerialNumber) {
                // Check if it's already set in DB? 
                const existing = await prisma.demoRequest.findUnique({ where: { id: id as string } });
                if (!existing?.machineSerialNumber) {
                    return res.status(400).json({ error: "Machine Serial Number is mandatory for Dispatch" });
                }
            }
        }

        const request = await prisma.demoRequest.update({
            where: { id: id as string },
            data: {
                ...updateData,
                logs: {
                    create: {
                        action: 'STATUS_UPDATE',
                        performedBy: req.user!.id,
                        details: `Status updated to ${status}`
                    }
                }
            }
        });

        // TODO: Send notifications on status change

        res.json(request);
    } catch (error) {
        res.status(500).json({ error: "Failed to update request" });
    }
}

// Sales: Mark as Received
export const markRequestReceived = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const request = await prisma.demoRequest.findUnique({ where: { id } });

        if (!request) return res.status(404).json({ error: "Request not found" });

        // Verify ownership
        if (request.salespersonId !== req.user?.id) {
            return res.status(403).json({ error: "Access denied" });
        }

        // Verify status
        if (request.status !== 'dispatched') {
            return res.status(400).json({ error: "Only dispatched requests can be marked as received" });
        }

        const updatedRequest = await prisma.demoRequest.update({
            where: { id },
            data: {
                status: 'received',
                receivedDate: new Date().toISOString().split('T')[0], // Today YYYY-MM-DD
                logs: {
                    create: {
                        action: 'STATUS_UPDATE',
                        performedBy: req.user!.id,
                        details: 'Marked as Received by Sales'
                    }
                }
            }
        });

        res.json(updatedRequest);
    } catch (error) {
        res.status(500).json({ error: "Failed to update request" });
    }
};

// Delete Request (Sales/Admin)
export const deleteRequest = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const request = await prisma.demoRequest.findUnique({ where: { id } });

        if (!request) return res.status(404).json({ error: "Request not found" });

        // Security check: Only Admin or the Salesperson who created it can delete
        if (req.user?.role !== 'admin' && request.salespersonId !== req.user?.id) {
            return res.status(403).json({ error: "Access denied" });
        }

        await prisma.demoRequest.delete({ where: { id } });

        res.json({ success: true, message: "Request deleted successfully" });
    } catch (error) {
        console.error("Delete request error:", error);
        res.status(500).json({ error: "Failed to delete request" });
    }
};
