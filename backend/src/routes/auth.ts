import express from 'express';
import { register, login, me, logout } from '../controllers/auth';
import { authenticate } from '../middleware/auth';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', authenticate, me);
router.post('/logout', authenticate, logout);

export default router;
