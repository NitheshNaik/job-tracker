import { Router } from 'express';
import { register, login, getMe } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

// POST /api/auth/register   — create account
router.post('/register', register);

// POST /api/auth/login      — authenticate & get token
router.post('/login', login);

// GET  /api/auth/me         — revalidate token on app load (protected)
router.get('/me', protect, getMe);

export default router;
