import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import * as progressController from '../controllers/progressController.js';

const router = Router();

// All progress routes require a valid Firebase ID token
router.use(requireAuth);

router.get('/',            progressController.getProgress);
router.post('/complete',   progressController.markComplete);
router.delete('/reset',    progressController.resetProgress);

export default router;
