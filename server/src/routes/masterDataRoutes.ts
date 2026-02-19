import express from 'express';
import { getAllData, createDistributor, deleteDistributor, createMachine, deleteMachine, updateMachine, createKitParameter, deleteKitParameter, updateKitParameter } from '../controllers/masterDataController';
import { authenticate } from '../middleware/authMiddleware';

const router = express.Router();

// Public/Protected route for fetching dropdown data
// In strict mode, maybe only authenticated users? Yes.
router.get('/master-data', authenticate, getAllData);

// Distributors
router.post('/master-data/distributors', authenticate, createDistributor);
router.delete('/master-data/distributors/:id', authenticate, deleteDistributor);

// Machines
router.post('/master-data/machines', authenticate, createMachine);
router.put('/master-data/machines/:id', authenticate, updateMachine);
router.delete('/master-data/machines/:id', authenticate, deleteMachine);

// Kits
router.post('/master-data/kit-parameters', authenticate, createKitParameter);
router.put('/master-data/kit-parameters/:id', authenticate, updateKitParameter);
router.delete('/master-data/kit-parameters/:id', authenticate, deleteKitParameter);

export default router;
