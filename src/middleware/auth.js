import admin from '../config/firebase.js';

/**
 * Verifies a Firebase ID token from the Authorization: Bearer <token> header.
 * On success, populates req.auth = { userId, email, name, picture }.
 * On failure, returns 401.
 */
export async function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header.' });
  }

  const token = header.slice(7);
  try {
    const decoded = await admin.auth().verifyIdToken(token);
    req.auth = {
      userId:  decoded.uid,
      email:   decoded.email   ?? null,
      name:    decoded.name    ?? null,
      picture: decoded.picture ?? null,
    };
    next();
  } catch (err) {
    console.error('[requireAuth] Token verification failed:', err.message);
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
}
