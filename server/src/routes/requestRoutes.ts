import express from 'express';
import { createRequest, getRequests, getRequestById, updateRequestStatus, markRequestReceived, deleteRequest } from '../controllers/requestController';
import { authenticate, requireRole } from '../middleware/authMiddleware';

const router = express.Router();

router.use(authenticate);

router.post('/', requireRole('sales'), createRequest);
router.get('/', getRequests);
router.get('/:id', getRequestById);
router.patch('/:id/status', requireRole('admin'), updateRequestStatus);
router.patch('/:id/receive', requireRole('sales'), markRequestReceived);
router.delete('/:id', deleteRequest);
router.delete('/:id', deleteRequest);

export default router;
