import { Router } from 'express';

const router = Router();

router.get('/', (_req, res) => {
  res.json({
    status: 'ok',
    python: process.env.PYTHON_CMD || 'python',
    supabase: !!process.env.SUPABASE_URL,
    clerk: !!process.env.CLERK_SECRET_KEY,
  });
});

export default router;
