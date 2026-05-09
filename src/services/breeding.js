/**
 * Breeding Service
 *
 * All database operations for breeding cross tracking and offspring.
 * Components never call Supabase directly - they use hooks that call these functions.
 */

import { supabase, requireUserId } from '../api/supabase';

// ============================================================
// Breeding Crosses
// ============================================================

/**
 * Fetch all breeding crosses for the current user
 */
export async function getCrosses() {
  const { data, error } = await supabase
    .from('breeding_crosses')
    .select(
      `
      *,
      pod_parent:plants!pod_parent_id(id, cultivar_name, nickname),
      pollen_parent:plants!pollen_parent_id(id, cultivar_name, nickname)
    `,
    )
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

/**
 * Fetch a single cross by ID with offspring
 */
export async function getCrossById(id) {
  const { data, error } = await supabase
    .from('breeding_crosses')
    .select(
      `
      *,
      pod_parent:plants!pod_parent_id(id, cultivar_name, nickname),
      pollen_parent:plants!pollen_parent_id(id, cultivar_name, nickname),
      offspring(id, notes, plant:plants(id, cultivar_name, nickname))
    `,
    )
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Create a new breeding cross
 */
export async function createCross(cross) {
  const user_id = await requireUserId();
  const { data, error } = await supabase
    .from('breeding_crosses')
    .insert({ ...cross, user_id })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Update an existing cross
 */
export async function updateCross(id, updates) {
  const { data, error } = await supabase
    .from('breeding_crosses')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Delete a cross
 */
export async function deleteCross(id) {
  const { error } = await supabase.from('breeding_crosses').delete().eq('id', id);

  if (error) throw error;
}

// ============================================================
// Offspring
// ============================================================

/**
 * Add an offspring record linking a cross to a plant
 */
export async function addOffspring(offspring) {
  const { data, error } = await supabase
    .from('offspring')
    .insert(offspring)
    .select('*, plant:plants(id, cultivar_name, nickname)')
    .single();

  if (error) throw error;
  return data;
}

/**
 * Remove an offspring record
 */
export async function removeOffspring(id) {
  const { error } = await supabase.from('offspring').delete().eq('id', id);

  if (error) throw error;
}

// ============================================================
// Cross Stage Logs
// ============================================================

/**
 * Fetch all stage logs for a cross, ordered chronologically
 */
export async function getStageLogs(crossId) {
  const { data, error } = await supabase
    .from('cross_stage_logs')
    .select('*')
    .eq('cross_id', crossId)
    .order('entered_at', { ascending: true });

  if (error) throw error;
  return data;
}

/**
 * Create a stage log entry
 */
export async function createStageLog(log) {
  const user_id = await requireUserId();
  const { data, error } = await supabase
    .from('cross_stage_logs')
    .insert({ ...log, user_id })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Update a stage log entry
 */
export async function updateStageLog(id, updates) {
  const { data, error } = await supabase
    .from('cross_stage_logs')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Advance a cross to the next stage, creating a stage log and updating the cross
 */
export async function advanceStage(crossId, newStage, { notes, data: stageData } = {}) {
  const user_id = await requireUserId();

  // Create stage log entry
  const { error: logError } = await supabase.from('cross_stage_logs').insert({
    cross_id: crossId,
    user_id,
    stage: newStage,
    notes: notes || null,
    data: stageData || null,
  });

  if (logError) throw logError;

  // Determine status based on stage
  let status = 'active';
  if (newStage === 'blooming') status = 'complete';
  if (newStage === 'failed') status = 'failed';

  // Update the cross stage and status
  const { data: updated, error: updateError } = await supabase
    .from('breeding_crosses')
    .update({ stage: newStage, status, updated_at: new Date().toISOString() })
    .eq('id', crossId)
    .select()
    .single();

  if (updateError) throw updateError;
  return updated;
}

/**
 * Mark a cross as failed. Records a "failed" stage log and sets status='failed'.
 * The cross's `stage` column is left untouched so the timeline still shows
 * which stage it failed at.
 */
export async function markFailed(id, { notes } = {}) {
  const user_id = await requireUserId();
  const { error: logError } = await supabase.from('cross_stage_logs').insert({
    cross_id: id,
    user_id,
    stage: 'failed',
    notes: notes || null,
  });
  if (logError) throw logError;

  const { data, error } = await supabase
    .from('breeding_crosses')
    .update({ status: 'failed', updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

/**
 * Restore a previously-failed cross back to active. Removes any failed-stage
 * logs so the timeline returns to its prior state.
 */
export async function unmarkFailed(id) {
  const { error: delError } = await supabase
    .from('cross_stage_logs')
    .delete()
    .eq('cross_id', id)
    .eq('stage', 'failed');
  if (delError) throw delError;

  const { data, error } = await supabase
    .from('breeding_crosses')
    .update({ status: 'active', updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

/**
 * Update cross status (e.g., archive)
 */
export async function updateCrossStatus(id, status) {
  const { data, error } = await supabase
    .from('breeding_crosses')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}
