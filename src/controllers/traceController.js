import { runPythonTrace } from '../services/pythonTracer.js';

export async function trace(req, res) {
  const { code } = req.body;
  try {
    const steps = await runPythonTrace(code);
    return res.json({ code, steps });
  } catch (err) {
    console.error('[traceController]', err.message);
    return res.status(500).json({ error: err.message || 'Execution failed.' });
  }
}
