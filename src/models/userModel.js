import { supabase } from '../config/supabase.js';

function ensureClient() {
  if (!supabase) {
    throw new Error('Supabase not configured — set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env');
  }
}

/**
 * Creates or updates a user row synced from Clerk.
 * Called by the Clerk webhook on user.created / user.updated events.
 */
export async function upsertUser({ id, email, first_name, last_name, image_url }) {
  ensureClient();
  const { error } = await supabase.from('users').upsert(
    {
      id,
      email,
      first_name,
      last_name,
      image_url,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'id' }
  );
  if (error) throw error;
}

/**
 * Deletes a user and cascades to their progress.
 * Called by the Clerk webhook on user.deleted events.
 */
export async function deleteUser(userId) {
  ensureClient();
  const { error } = await supabase.from('users').delete().eq('id', userId);
  if (error) throw error;
}

/**
 * Looks up a user by Clerk user ID.
 * Returns null if the user has not been synced yet.
 */
export async function getUserById(userId) {
  ensureClient();
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();
  if (error && error.code !== 'PGRST116') throw error; // PGRST116 = row not found
  return data ?? null;
}
