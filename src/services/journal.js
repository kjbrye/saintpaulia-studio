/**
 * Journal Service
 *
 * CRUD operations for timestamped journal/notes entries.
 * Entries can be linked to a plant, propagation, or cross.
 */

import { supabase, requireUserId } from '../api/supabase';

/**
 * Fetch journal entries for a given parent entity
 * @param {Object} filter - One of { plant_id, propagation_id, cross_id }
 */
export async function getJournalEntries(filter) {
  let query = supabase
    .from('journal_entries')
    .select('*')
    .order('created_at', { ascending: false });

  if (filter.plant_id) query = query.eq('plant_id', filter.plant_id);
  if (filter.propagation_id) query = query.eq('propagation_id', filter.propagation_id);
  if (filter.cross_id) query = query.eq('cross_id', filter.cross_id);

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

/**
 * Create a journal entry
 */
export async function createJournalEntry(entry) {
  const user_id = await requireUserId();
  const { data, error } = await supabase
    .from('journal_entries')
    .insert({ ...entry, user_id })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Delete a journal entry
 */
export async function deleteJournalEntry(id) {
  const { error } = await supabase.from('journal_entries').delete().eq('id', id);

  if (error) throw error;
}
