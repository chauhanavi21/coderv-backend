import { requireAuth, clerkMiddleware } from '@clerk/express';

/**
 * Mounts Clerk on the request object (populates req.auth).
 * Use once globally in app.js.
 */
export { clerkMiddleware };

/**
 * Rejects unauthenticated requests with 401.
 * Use on individual routes or routers that need auth.
 */
export { requireAuth };
