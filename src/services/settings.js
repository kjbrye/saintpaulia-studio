/**
 * Settings Service
 *
 * Persists user settings to Supabase.
 */

import { supabase, requireUserId } from '../api/supabase';

/**
 * Fetch the current user's settings from Supabase.
 * @returns {Promise<Object|null>} Settings object or null if none saved
 */
export async function getSettings() {
  const userId = await requireUserId();
  const { data, error } = await supabase
    .from('user_settings')
    .select('settings')
    .eq('user_id', userId)
    .single();

  // No row yet is not an error
  if (error?.code === 'PGRST116') return null;
  if (error) throw error;
  return data?.settings ?? null;
}

/**
 * Save settings to Supabase (upsert).
 * @param {Object} settings - The full settings object
 */
export async function saveSettings(settings) {
  const userId = await requireUserId();
  const { error } = await supabase
    .from('user_settings')
    .upsert(
      { user_id: userId, settings, updated_at: new Date().toISOString() },
      { onConflict: 'user_id' },
    );

  if (error) throw error;
}
