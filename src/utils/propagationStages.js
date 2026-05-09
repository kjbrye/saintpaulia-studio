/**
 * Propagation stage metadata.
 *
 * The DB stage value 'complete' represents the terminal "established" state —
 * we keep the existing enum in the schema and present it as "Established" here.
 */

import { Scissors, Sprout, Leaf, Flower2, Check } from 'lucide-react';

export const PROPAGATION_STAGES = [
  {
    key: 'cutting',
    label: 'Cutting',
    icon: Scissors,
    typicalDuration: '2–4 weeks',
    watchFor: 'callus formation',
    description:
      'Keep humidity high and the cut surface protected. A healthy callus should form before any roots emerge — if using water, change it weekly to prevent rot.',
  },
  {
    key: 'rooting',
    label: 'Rooting',
    icon: Sprout,
    typicalDuration: '3–8 weeks',
    watchFor: 'roots reaching 1–2cm',
    description:
      'Roots emerge from the callus and lengthen. Resist disturbing the cutting — once roots reach about an inch, the leaf can support plantlets.',
  },
  {
    key: 'plantlets',
    label: 'Plantlets',
    icon: Leaf,
    typicalDuration: '4–10 weeks',
    watchFor: 'baby leaves emerging at the soil line',
    description:
      'Tiny crowns appear at the base of the parent leaf. Keep them in bright, indirect light and stable humidity until each plantlet has 2–3 sets of true leaves.',
  },
  {
    key: 'potted',
    label: 'Potted',
    icon: Flower2,
    typicalDuration: '6–12 weeks',
    watchFor: 'steady new growth in individual pots',
    description:
      'Separated plantlets grow on in their own pots. Watch for the first signs of mature leaf form before promoting any to the main collection.',
  },
  {
    key: 'complete',
    label: 'Established',
    icon: Check,
    typicalDuration: null,
    watchFor: null,
    description: null,
  },
];

export const ACTIVE_STAGE_KEYS = ['cutting', 'rooting', 'plantlets', 'potted'];

export const STAGE_BY_KEY = PROPAGATION_STAGES.reduce((acc, s) => {
  acc[s.key] = s;
  return acc;
}, {});

export function getStageIndex(key) {
  return PROPAGATION_STAGES.findIndex((s) => s.key === key);
}

export function getNextStage(key) {
  const i = getStageIndex(key);
  if (i < 0 || i >= PROPAGATION_STAGES.length - 1) return null;
  return PROPAGATION_STAGES[i + 1];
}

export function isEstablished(prop) {
  return prop?.stage === 'complete';
}

export function isFailed(prop) {
  return prop?.stage === 'failed';
}

export function isActive(prop) {
  return !isEstablished(prop) && !isFailed(prop);
}

/**
 * Returns a normalized stage history array. Falls back to a single synthesized
 * entry from cutting_date / created_at so older rows (or rows missing a stage
 * advance log) still render the timeline.
 */
export function getStageHistory(prop) {
  if (!prop) return [];
  const history = Array.isArray(prop.stage_history) ? [...prop.stage_history] : [];
  if (history.length === 0) {
    history.push({
      stage: prop.stage,
      entered_at: prop.cutting_date || prop.created_at || new Date().toISOString(),
    });
  }
  return history.sort((a, b) => new Date(a.entered_at) - new Date(b.entered_at));
}

export function getStageEntry(prop, stageKey) {
  return getStageHistory(prop).find((h) => h.stage === stageKey) || null;
}

export function daysBetween(fromIso, toIso = new Date().toISOString()) {
  if (!fromIso) return 0;
  const from = new Date(fromIso).getTime();
  const to = new Date(toIso).getTime();
  return Math.max(0, Math.floor((to - from) / (1000 * 60 * 60 * 24)));
}

export function daysAtCurrentStage(prop) {
  if (!prop) return 0;
  const history = getStageHistory(prop);
  const last = history[history.length - 1];
  return daysBetween(last?.entered_at);
}

export function getParentName(prop) {
  return (
    prop?.parent_plant?.cultivar_name ||
    prop?.parent_plant?.nickname ||
    prop?.parent_plant_name ||
    'Unknown parent'
  );
}

/**
 * Display name for a propagation. Resolves disambiguation among siblings
 * (same parent + same cutting date):
 *   - explicit label    → "{parent} leaf · {label}"
 *   - 2+ unlabeled siblings → "{parent} leaf #N" (N = 1-based creation order)
 *   - otherwise         → "{parent} leaf"
 *
 * `allPropagations` is the full list available in the surrounding view; if
 * omitted we fall back to a non-suffixed name (used in lightweight contexts
 * like dashboard widgets).
 */
export function getPropagationDisplayName(prop, allPropagations = null) {
  if (!prop) return '';
  const parent = getParentName(prop);
  const base = `${parent} leaf`;
  if (prop.label && prop.label.trim()) {
    return `${base} · ${prop.label.trim()}`;
  }
  if (!Array.isArray(allPropagations) || !prop.parent_plant_id || !prop.cutting_date) {
    return base;
  }
  const unlabeledSiblings = allPropagations
    .filter(
      (p) =>
        p.parent_plant_id === prop.parent_plant_id &&
        p.cutting_date === prop.cutting_date &&
        !(p.label && p.label.trim()),
    )
    .sort((a, b) => new Date(a.created_at || 0) - new Date(b.created_at || 0));
  if (unlabeledSiblings.length < 2) return base;
  const idx = unlabeledSiblings.findIndex((p) => p.id === prop.id);
  return idx >= 0 ? `${base} #${idx + 1}` : base;
}

export const METHOD_LABELS = {
  water: 'Water',
  soil: 'Soil',
  sphagnum: 'Sphagnum',
  perlite: 'Perlite',
  other: 'Other',
};
