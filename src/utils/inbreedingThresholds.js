/**
 * Inbreeding coefficient thresholds and color coding for the Relationship
 * Finder. Tuned to feel meaningful for hobbyist breeders rather than match
 * formal animal-husbandry cutoffs — adjust here when calibration changes.
 */

export const COI_THRESHOLDS = [
  { max: 0,      level: 'unrelated',  label: 'Unrelated',         color: 'var(--sage-600)' },
  { max: 0.06,   level: 'distant',    label: 'Distantly related', color: 'var(--sage-700)' },
  { max: 0.12,   level: 'moderate',   label: 'Moderate',          color: 'var(--copper-500)' },
  { max: Infinity, level: 'high',     label: 'High',              color: 'var(--copper-700)' },
];

export function classifyCoi(coi) {
  for (const tier of COI_THRESHOLDS) {
    if (coi <= tier.max) return tier;
  }
  return COI_THRESHOLDS[COI_THRESHOLDS.length - 1];
}

export function formatCoi(coi) {
  return `${(coi * 100).toFixed(1)}%`;
}
