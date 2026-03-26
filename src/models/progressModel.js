import { supabase } from '../config/supabase.js';

function ensureClient() {
  if (!supabase) {
    throw new Error('Supabase is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env');
  }
}

/**
 * Returns all completed examples for a user as flat rows.
 * @param {string} userId  Clerk user ID
 */
export async function getProgress(userId) {
  ensureClient();
  const { data, error } = await supabase
    .from('user_progress')
    .select('lesson_id, difficulty, example_id, completed_at')
    .eq('user_id', userId)
    .order('completed_at', { ascending: true });
  if (error) throw error;
  return data;
}

/**
 * Marks an example as complete (upsert — safe to call multiple times).
 */
export async function markComplete(userId, lessonId, difficulty, exampleId) {
  ensureClient();
  const { error } = await supabase.from('user_progress').upsert(
    { user_id: userId, lesson_id: lessonId, difficulty, example_id: exampleId },
    { onConflict: 'user_id,lesson_id,difficulty,example_id', ignoreDuplicates: true }
  );
  if (error) throw error;
}

/**
 * Deletes all progress for a user (full reset).
 */
export async function resetProgress(userId) {
  ensureClient();
  const { error } = await supabase
    .from('user_progress')
    .delete()
    .eq('user_id', userId);
  if (error) throw error;
}
