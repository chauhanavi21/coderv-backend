import express from 'express';
import cors from 'cors';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 5000;

// Python command — override via PYTHON_CMD env var if 'python' isn't on PATH
// e.g. PYTHON_CMD=python3 on Linux/Mac, or full path on Windows
const PYTHON_CMD = process.env.PYTHON_CMD || 'python';

const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim());

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
      cb(new Error('Not allowed by CORS'));
    },
  })
);

app.use(express.json({ limit: '100kb' }));

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', python: PYTHON_CMD });
});

// ── Trace endpoint ────────────────────────────────────────────────────────────
app.post('/api/trace', async (req, res) => {
  const { code } = req.body ?? {};

  if (!code || typeof code !== 'string') {
    return res.status(400).json({ error: 'Request body must include a "code" string.' });
  }

  if (code.length > 8000) {
    return res.status(400).json({ error: 'Code is too long (max 8 000 characters).' });
  }

  // Basic allow-list check — block obviously dangerous patterns
  // NOTE: This is NOT a security sandbox; run behind a firewall for production.
  // For a full sandbox, use Docker/gVisor or a hosted judge API (Judge0, Piston).
  const BLOCKED = [
    'os.system', 'os.popen', 'os.exec',
    'subprocess', 'socket',
    '__import__', 'importlib',
    'open(',     // file I/O
    'eval(', 'exec(',
  ];
  for (const pattern of BLOCKED) {
    if (code.includes(pattern)) {
      return res.status(400).json({
        error: `"${pattern}" is not permitted in playground code.`,
      });
    }
  }

  const tracerPath = join(__dirname, 'tracer.py');

  try {
    const steps = await runPython(PYTHON_CMD, tracerPath, code);
    return res.json({ code, steps });
  } catch (err) {
    console.error('[trace]', err.message);
    return res.status(500).json({ error: err.message || 'Execution failed.' });
  }
});

// ── Python subprocess helper ──────────────────────────────────────────────────
function runPython(cmd, scriptPath, code) {
  return new Promise((resolve, reject) => {
    const proc = spawn(cmd, [scriptPath]);
    let stdout = '';
    let stderr = '';
    let killed = false;

    // Kill after 8 seconds to prevent infinite loops
    const timer = setTimeout(() => {
      killed = true;
      proc.kill('SIGTERM');
      reject(new Error('Execution timed out (8 s). Check for infinite loops.'));
    }, 8000);

    proc.stdout.on('data', (chunk) => { stdout += chunk; });
    proc.stderr.on('data', (chunk) => { stderr += chunk; });

    proc.on('close', (code_exit) => {
      clearTimeout(timer);
      if (killed) return;
      if (code_exit !== 0) {
        return reject(new Error(stderr.trim() || `Python exited with code ${code_exit}.`));
      }
      try {
        resolve(JSON.parse(stdout));
      } catch {
        reject(new Error('Tracer returned invalid JSON.'));
      }
    });

    proc.on('error', (err) => {
      clearTimeout(timer);
      if (err.code === 'ENOENT') {
        reject(
          new Error(
            `Python not found (tried "${cmd}"). ` +
            'Set PYTHON_CMD in backend/.env to the correct path.'
          )
        );
      } else {
        reject(err);
      }
    });

    proc.stdin.write(code);
    proc.stdin.end();
  });
}

app.listen(PORT, () => {
  console.log(`CoderV backend  →  http://localhost:${PORT}`);
  console.log(`Python command  →  ${PYTHON_CMD}`);
});
