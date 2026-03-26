import express from 'express';
import cors from 'cors';
import { clerkMiddleware } from './middleware/auth.js';
import healthRoutes from './routes/healthRoutes.js';
import traceRoutes from './routes/traceRoutes.js';
import progressRoutes from './routes/progressRoutes.js';

const app = express();

// ── CORS ──────────────────────────────────────────────────────────────────────
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim());

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
      cb(new Error(`Origin "${origin}" not allowed by CORS`));
    },
  })
);

// ── Body parsing ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: '100kb' }));

// ── Clerk — populates req.auth on every request ───────────────────────────────
app.use(clerkMiddleware());

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/health', healthRoutes);
app.use('/api/trace', traceRoutes);
app.use('/api/progress', progressRoutes);

// ── 404 catch-all ─────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found.' });
});

export default app;
