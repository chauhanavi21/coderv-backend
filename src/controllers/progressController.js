import * as progressModel from '../models/progressModel.js';
import * as userModel from '../models/userModel.js';

/** Ensures the user row exists in Supabase before any progress write. */
async function ensureUser(auth) {
  try {
    const exists = await userModel.getUserById(auth.userId);
    if (!exists) {
      const [firstName = '', ...rest] = (auth.name || '').trim().split(' ');
      await userModel.upsertUser({
        id:         auth.userId,
        email:      auth.email      ?? '',
        first_name: firstName,
        last_name:  rest.join(' '),
        image_url:  auth.picture    ?? null,
      });
    }
  } catch {
    // Non-fatal — progress write may still fail but we log it there
  }
}

export async function getProgress(req, res) {
  try {
    const { userId } = req.auth;
    const data = await progressModel.getProgress(userId);
    res.json({ progress: data });
  } catch (err) {
    console.error('[progressController.getProgress]', err.message);
    res.status(500).json({ error: err.message });
  }
}

export async function markComplete(req, res) {
  try {
    await ensureUser(req.auth);
    const { userId } = req.auth;
    const { lessonId, difficulty, exampleId } = req.body ?? {};

    if (!lessonId || !difficulty || !exampleId) {
      return res.status(400).json({
        error: 'lessonId, difficulty, and exampleId are all required.',
      });
    }

    await progressModel.markComplete(userId, lessonId, difficulty, exampleId);
    res.json({ success: true });
  } catch (err) {
    console.error('[progressController.markComplete]', err.message);
    res.status(500).json({ error: err.message });
  }
}

export async function resetProgress(req, res) {
  try {
    const { userId } = req.auth;
    await progressModel.resetProgress(userId);
    res.json({ success: true });
  } catch (err) {
    console.error('[progressController.resetProgress]', err.message);
    res.status(500).json({ error: err.message });
  }
}
