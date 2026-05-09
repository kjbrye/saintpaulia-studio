/**
 * Breeding stage metadata.
 *
 * Mirrors propagationStages.js but with 6 stages and shorter educational copy
 * (breeders are experienced — they need timing reminders, not pedagogy).
 *
 * Transitions are stored in the cross_stage_logs table (one row per stage entry),
 * not as a JSONB column. The helpers here normalize those logs into a stage
 * history shape similar to propagation's getStageHistory().
 */

import { Heart, Package, Leaf, Sprout, Sun, Flower2 } from 'lucide-react';

export const BREEDING_STAGES = [
  {
    key: 'pollinated',
    label: 'Pollinated',
    icon: Heart,
    typicalDuration: '7–14 days',
    watchFor: 'ovary swelling',
  },
  {
    key: 'pod_forming',
    label: 'Pod forming',
    icon: Package,
    typicalDuration: '6–9 months until ripe',
    watchFor: 'pod browning and drying',
  },
  {
    key: 'harvested',
    label: 'Harvested',
    icon: Leaf,
    typicalDuration: 'sow within 1–2 weeks',
    watchFor: 'fully dry, dust-fine seeds',
  },
  {
    key: 'sown',
    label: 'Sown',
    icon: Sprout,
    typicalDuration: '3–8 weeks to germinate',
    watchFor: 'tiny green specks on the medium',
  },
  {
    key: 'sprouted',
    label: 'Sprouted',
    icon: Sun,
    typicalDuration: '8–14 months to first bloom',
    watchFor: 'first true leaves and crown formation',
  },
  {
    key: 'blooming',
    label: 'Blooming',
    icon: Flower2,
    typicalDuration: null,
    watchFor: null,
  },
];

export const ACTIVE_STAGE_KEYS = [
  'pollinated',
  'pod_forming',
  'harvested',
  'sown',
  'sprouted',
];

export const STAGE_BY_KEY = BREEDING_STAGES.reduce((acc, s) => {
  acc[s.key] = s;
  return acc;
}, {});

export function getStageIndex(key) {
  return BREEDING_STAGES.findIndex((s) => s.key === key);
}

export function getNextStage(key) {
  const i = getStageIndex(key);
  if (i < 0 || i >= BREEDING_STAGES.length - 1) return null;
  return BREEDING_STAGES[i + 1];
}

export function isComplete(cross) {
  return cross?.status === 'complete' || cross?.stage === 'blooming';
}

export function isFailed(cross) {
  return cross?.status === 'failed' || cross?.stage === 'failed';
}

export function isActive(cross) {
  return !isComplete(cross) && !isFailed(cross) && cross?.status !== 'archived';
}

/**
 * Normalize stage logs into a stage-history shape, ordered chronologically.
 * Falls back to a single synthesized entry from cross_date / created_at so
 * crosses with no logs still render the timeline.
 *
 * Returns: [{ stage, entered_at, note }, ...]
 */
export function getStageHistory(cross, stageLogs = []) {
  if (!cross) return [];
  const history = (Array.isArray(stageLogs) ? stageLogs : [])
    .map((l) => ({ stage: l.stage, entered_at: l.entered_at, note: l.notes || null }))
    .sort((a, b) => new Date(a.entered_at) - new Date(b.entered_at));

  if (history.length === 0) {
    history.push({
      stage: cross.stage || 'pollinated',
      entered_at: cross.cross_date || cross.created_at || new Date().toISOString(),
      note: null,
    });
  }
  return history;
}

export function getStageEntry(cross, stageLogs, stageKey) {
  return getStageHistory(cross, stageLogs).find((h) => h.stage === stageKey) || null;
}

export function daysBetween(fromIso, toIso = new Date().toISOString()) {
  if (!fromIso) return 0;
  const from = new Date(fromIso).getTime();
  const to = new Date(toIso).getTime();
  return Math.max(0, Math.floor((to - from) / (1000 * 60 * 60 * 24)));
}

export function daysAtCurrentStage(cross, stageLogs = []) {
  if (!cross) return 0;
  const history = getStageHistory(cross, stageLogs);
  const current = [...history].reverse().find((h) => h.stage === cross.stage);
  return daysBetween(current?.entered_at);
}

export function getPodParentName(cross) {
  return (
    cross?.pod_parent?.cultivar_name ||
    cross?.pod_parent?.nickname ||
    cross?.pod_parent_name ||
    'Unknown'
  );
}

export function getPollenParentName(cross) {
  return (
    cross?.pollen_parent?.cultivar_name ||
    cross?.pollen_parent?.nickname ||
    cross?.pollen_parent_name ||
    'Unknown'
  );
}
