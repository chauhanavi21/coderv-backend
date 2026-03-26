import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import * as progressController from '../controllers/progressController.js';

const router = Router();

// All progress routes require a valid Clerk session token
router.use(requireAuth());

// GET  /api/progress         — fetch all completed examples for the signed-in user
router.get('/', progressController.getProgress);

// POST /api/progress/complete — mark an example as done
router.post('/complete', progressController.markComplete);

// DELETE /api/progress/reset — wipe all progress for the signed-in user
router.delete('/reset', progressController.resetProgress);

export default router;
