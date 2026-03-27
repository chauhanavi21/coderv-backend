import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { syncUser } from '../controllers/userController.js';

const router = Router();

router.post('/sync', requireAuth, syncUser);

export default router;
