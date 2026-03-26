// Patterns blocked from playground execution.
// NOTE: This is a basic allow-list, not a security sandbox.
// For production, run code inside Docker / gVisor / a hosted judge API.
const BLOCKED_PATTERNS = [
  'os.system',
  'os.popen',
  'os.exec',
  'subprocess',
  'socket',
  '__import__',
  'importlib',
  'open(',
  'eval(',
  'exec(',
];

export function validateCode(req, res, next) {
  const { code } = req.body ?? {};

  if (!code || typeof code !== 'string') {
    return res.status(400).json({ error: 'Request body must include a "code" string.' });
  }

  if (code.length > 8000) {
    return res.status(400).json({ error: 'Code is too long (max 8 000 characters).' });
  }

  for (const pattern of BLOCKED_PATTERNS) {
    if (code.includes(pattern)) {
      return res.status(400).json({
        error: `"${pattern}" is not permitted in playground code.`,
      });
    }
  }

  next();
}
