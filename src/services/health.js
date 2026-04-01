/**
 * Health Service
 *
 * All health log database operations live here.
 */

import { supabase, requireUserId } from '../api/supabase';

/**
 * Fetch health logs, optionally filtered by plant
 * @param {Object} options - Query options
 * @param {string} options.plantId - Filter by plant ID (optional)
 * @param {number} options.limit - Max records to return (default: 50)
 * @returns {Promise<Array>} Array of health log objects
 */
export async function getHealthLogs({ plantId, limit = 50 } = {}) {
  let query = supabase
    .from('health_log')
    .select('*')
    .order('observation_date', { ascending: false })
    .limit(limit);

  if (plantId) {
    query = query.eq('plant_id', plantId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

/**
 * Create a new health log entry
 * @param {Object} healthLog - Health log data
 * @returns {Promise<Object>} Created health log object
 */
export async function createHealthLog(healthLog) {
  const user_id = await requireUserId();
  const { data, error } = await supabase
    .from('health_log')
    .insert({ ...healthLog, user_id })
    .select()
    .single();

  if (error) throw error;

  // Update the plant's status if a health_status was provided
  if (healthLog.plant_id && healthLog.health_status) {
    await supabase
      .from('plants')
      .update({ status: healthLog.health_status })
      .eq('id', healthLog.plant_id);
  }

  return data;
}

/**
 * Update an existing health log entry
 * @param {string} id - Health log ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object>} Updated health log object
 */
export async function updateHealthLog(id, updates) {
  const { data, error } = await supabase
    .from('health_log')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Delete a health log entry
 * @param {string} id - Health log ID
 */
export async function deleteHealthLog(id) {
  const { error } = await supabase
    .from('health_log')
    .delete()
    .eq('id', id);

  if (error) throw error;
}
