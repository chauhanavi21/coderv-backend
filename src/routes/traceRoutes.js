import { Router } from 'express';
import { trace } from '../controllers/traceController.js';
import { validateCode } from '../middleware/validate.js';

const router = Router();

// POST /api/trace — public (no auth required for playground)
router.post('/', validateCode, trace);

export default router;
