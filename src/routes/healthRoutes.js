import { Router } from 'express';

const router = Router();

router.get('/', (_req, res) => {
  res.json({
    status:   'ok',
    python:   process.env.PYTHON_CMD || 'python3',
    supabase: !!process.env.SUPABASE_URL,
    firebase: !!process.env.FIREBASE_PROJECT_ID,
  });
});

export default router;
