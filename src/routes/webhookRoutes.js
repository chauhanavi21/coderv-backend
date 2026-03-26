import { Router } from 'express';
import { handleClerkWebhook } from '../controllers/webhookController.js';

const router = Router();

// POST /api/webhooks/clerk
// express.raw() middleware is applied in app.js BEFORE express.json(),
// so req.body here is a raw Buffer — required by svix for signature verification.
router.post('/clerk', handleClerkWebhook);

export default router;
