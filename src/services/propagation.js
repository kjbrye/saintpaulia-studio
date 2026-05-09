/**
 * Propagation Service
 *
 * All database operations for propagation tracking.
 * Components never call Supabase directly - they use hooks that call these functions.
 */

import { supabase, requireUserId } from '../api/supabase';

const SELECT = '*, parent_plant:plants!parent_plant_id(id, cultivar_name, nickname), established_plant:plants!established_plant_id(id, cultivar_name, nickname)';

export async function getPropagations() {
  const { data, error } = await supabase
    .from('propagations')
    .select(SELECT)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function getPropagationById(id) {
  const { data, error } = await supabase
    .from('propagations')
    .select(SELECT)
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
}

export async function createPropagation(propagation) {
  const user_id = await requireUserId();
  const now = new Date().toISOString();
  const initialHistory = [
    {
      stage: propagation.stage || 'cutting',
      entered_at: propagation.cutting_date
        ? new Date(propagation.cutting_date).toISOString()
        : now,
    },
  ];
  const { data, error } = await supabase
    .from('propagations')
    .insert({ ...propagation, user_id, stage_history: initialHistory })
    .select(SELECT)
    .single();
  if (error) throw error;
  return data;
}

export async function updatePropagation(id, updates) {
  const { data, error } = await supabase
    .from('propagations')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select(SELECT)
    .single();
  if (error) throw error;
  return data;
}

export async function deletePropagation(id) {
  const { error } = await supabase.from('propagations').delete().eq('id', id);
  if (error) throw error;
}

/**
 * Advance a propagation to a new stage, appending to stage_history.
 * Caller is responsible for ensuring `nextStage` is valid (not 'failed').
 */
export async function advanceStage(id, nextStage, note = null) {
  const current = await getPropagationById(id);
  const history = Array.isArray(current.stage_history) ? [...current.stage_history] : [];
  history.push({
    stage: nextStage,
    entered_at: new Date().toISOString(),
    ...(note ? { note } : {}),
  });
  return updatePropagation(id, { stage: nextStage, stage_history: history });
}

export async function markFailed(id, note = null) {
  const current = await getPropagationById(id);
  const history = Array.isArray(current.stage_history) ? [...current.stage_history] : [];
  history.push({
    stage: 'failed',
    entered_at: new Date().toISOString(),
    ...(note ? { note } : {}),
  });
  return updatePropagation(id, {
    stage: 'failed',
    stage_history: history,
    failed_at: new Date().toISOString(),
  });
}

/**
 * Restore a failed propagation to its previous active stage. Pops the trailing
 * 'failed' entry from stage_history and falls back to 'cutting' if no prior
 * stage is recorded.
 */
export async function unmarkFailed(id) {
  const current = await getPropagationById(id);
  const history = Array.isArray(current.stage_history) ? [...current.stage_history] : [];
  while (history.length && history[history.length - 1].stage === 'failed') {
    history.pop();
  }
  const priorStage = history.length ? history[history.length - 1].stage : 'cutting';
  if (history.length === 0) {
    history.push({ stage: priorStage, entered_at: new Date().toISOString() });
  }
  return updatePropagation(id, {
    stage: priorStage,
    stage_history: history,
    failed_at: null,
  });
}

/**
 * Mark a propagation as established and link it to the newly created plant.
 */
export async function establishPropagation(id, plantId) {
  return advanceStageWithLink(id, 'complete', { established_plant_id: plantId });
}

async function advanceStageWithLink(id, nextStage, extra) {
  const current = await getPropagationById(id);
  const history = Array.isArray(current.stage_history) ? [...current.stage_history] : [];
  history.push({ stage: nextStage, entered_at: new Date().toISOString() });
  return updatePropagation(id, { stage: nextStage, stage_history: history, ...extra });
}
