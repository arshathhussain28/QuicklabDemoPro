import express from 'express';
import { login, getProfile, createUser, deleteUser, updateUserStatus, updateUser } from '../controllers/authController';
import { authenticate, requireRole } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/login', login);
router.get('/profile', authenticate, getProfile);
router.post('/register', authenticate, requireRole('admin'), createUser); // Only admin can register new users
router.patch('/users/:id/status', authenticate, requireRole('admin'), updateUserStatus);
router.put('/users/:id', authenticate, requireRole('admin'), updateUser);
router.delete('/users/:id', authenticate, requireRole('admin'), deleteUser);

export default router;
