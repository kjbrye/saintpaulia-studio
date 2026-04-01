/**
 * Bloom Service
 *
 * All bloom log database operations live here.
 */

import { supabase, requireUserId } from '../api/supabase';

/**
 * Fetch bloom logs for a plant
 * @param {Object} options - Query options
 * @param {string} options.plantId - Filter by plant ID (optional)
 * @param {number} options.limit - Max records to return (default: 50)
 * @returns {Promise<Array>} Array of bloom log objects
 */
export async function getBloomLogs({ plantId, limit = 50 } = {}) {
  let query = supabase
    .from('bloom_log')
    .select('*')
    .order('bloom_start_date', { ascending: false })
    .limit(limit);

  if (plantId) {
    query = query.eq('plant_id', plantId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

/**
 * Create a new bloom log entry and toggle is_blooming on the plant
 * @param {Object} bloomLog - Bloom log data
 * @returns {Promise<Object>} Created bloom log object
 */
export async function createBloomLog(bloomLog) {
  const user_id = await requireUserId();
  const { data, error } = await supabase
    .from('bloom_log')
    .insert({ ...bloomLog, user_id })
    .select()
    .single();

  if (error) throw error;

  // Mark the plant as blooming
  if (bloomLog.plant_id) {
    await supabase
      .from('plants')
      .update({ is_blooming: true })
      .eq('id', bloomLog.plant_id);
  }

  return data;
}

/**
 * Update an existing bloom log entry
 * @param {string} id - Bloom log ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object>} Updated bloom log object
 */
export async function updateBloomLog(id, updates) {
  const { data, error } = await supabase
    .from('bloom_log')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Delete a bloom log entry
 * @param {string} id - Bloom log ID
 */
export async function deleteBloomLog(id) {
  const { error } = await supabase
    .from('bloom_log')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

/**
 * End a bloom by setting the end date and updating is_blooming on the plant
 * @param {string} id - Bloom log ID
 * @param {string} plantId - Plant ID
 * @param {string} endDate - End date (YYYY-MM-DD)
 * @returns {Promise<Object>} Updated bloom log object
 */
export async function endBloom(id, plantId, endDate) {
  const log = await updateBloomLog(id, { bloom_end_date: endDate });

  // Check if the plant has any other active blooms
  const { data: activeBlooms } = await supabase
    .from('bloom_log')
    .select('id')
    .eq('plant_id', plantId)
    .is('bloom_end_date', null)
    .neq('id', id);

  // If no other active blooms, mark plant as not blooming
  if (!activeBlooms || activeBlooms.length === 0) {
    await supabase
      .from('plants')
      .update({ is_blooming: false })
      .eq('id', plantId);
  }

  return log;
}
