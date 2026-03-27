import express from 'express';
import cors from 'cors';
import healthRoutes   from './routes/healthRoutes.js';
import traceRoutes    from './routes/traceRoutes.js';
import progressRoutes from './routes/progressRoutes.js';
import userRoutes     from './routes/userRoutes.js';

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

// ── Body parser ───────────────────────────────────────────────────────────────
app.use(express.json({ limit: '100kb' }));

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/health',   healthRoutes);
app.use('/api/trace',    traceRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/users',    userRoutes);

// ── 404 ───────────────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found.' });
});

export default app;
