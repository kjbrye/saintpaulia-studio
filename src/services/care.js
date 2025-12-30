/**
 * Care Service
 * 
 * All care log database operations live here.
 */

import { supabase } from '../api/supabase';

/**
 * Fetch care logs, optionally filtered by plant
 * @param {Object} options - Query options
 * @param {string} options.plantId - Filter by plant ID (optional)
 * @param {number} options.limit - Max records to return (default: 50)
 * @returns {Promise<Array>} Array of care log objects
 */
export async function getCareLogs({ plantId, limit = 50 } = {}) {
  let query = supabase
    .from('care_logs')
    .select('*')
    .order('care_date', { ascending: false })
    .limit(limit);

  if (plantId) {
    query = query.eq('plant_id', plantId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

/**
 * Create a new care log entry
 * @param {Object} careLog - Care log data
 * @returns {Promise<Object>} Created care log object
 */
export async function createCareLog(careLog) {
  const { data, error } = await supabase
    .from('care_logs')
    .insert(careLog)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Log a quick care action and update the plant's last care date
 * @param {string} plantId - Plant ID
 * @param {string} careType - Type of care ('watering', 'fertilizing', 'grooming')
 * @param {string} notes - Optional notes
 * @returns {Promise<Object>} Created care log object
 */
export async function logCare(plantId, careType, notes = '') {
  const now = new Date().toISOString();
  
  // Create the care log
  const careLog = await createCareLog({
    plant_id: plantId,
    care_type: careType,
    care_date: now,
    notes,
  });

  // Update the plant's last care date
  const updateField = {
    watering: 'last_watered',
    fertilizing: 'last_fertilized',
    grooming: 'last_groomed',
  }[careType];

  if (updateField) {
    const { error } = await supabase
      .from('plants')
      .update({ [updateField]: now })
      .eq('id', plantId);

    if (error) throw error;
  }

  return careLog;
}

/**
 * Fetch recent care logs across all plants with plant info
 * @param {number} limit - Max records to return (default: 10)
 * @returns {Promise<Array>} Array of care log objects with plant data
 */
export async function getRecentCareLogs(limit = 10) {
  const { data, error } = await supabase
    .from('care_logs')
    .select(`
      *,
      plants (
        id,
        nickname,
        cultivar_name,
        photo_url
      )
    `)
    .order('care_date', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data;
}
