/**
 * Shared plant attribute option lists (bloom type, size class, bloom color).
 * Used by AddPlant, PlantDetail, and library filters.
 */

export const BLOOM_TYPE_OPTIONS = [
  { value: '', label: 'Select bloom type...' },
  { value: 'single', label: 'Single' },
  { value: 'semidouble', label: 'Semidouble' },
  { value: 'double', label: 'Double' },
  { value: 'star', label: 'Star' },
  { value: 'wasp', label: 'Wasp' },
  { value: 'bell', label: 'Bell' },
  { value: 'cupped', label: 'Cupped' },
];

export const BLOOM_TYPE_LABELS = BLOOM_TYPE_OPTIONS.reduce((acc, o) => {
  if (o.value) acc[o.value] = o.label;
  return acc;
}, {});

export const BLOOM_TYPE_FILTER_OPTIONS = [
  { value: 'all', label: 'All Bloom Types' },
  ...BLOOM_TYPE_OPTIONS.filter((o) => o.value),
];

export const SIZE_CLASS_OPTIONS = [
  { value: '', label: 'Select size class...' },
  { value: 'miniature', label: 'Miniature' },
  { value: 'semiminiature', label: 'Semiminiature' },
  { value: 'standard', label: 'Standard' },
  { value: 'large', label: 'Large / Giant' },
  { value: 'trailer', label: 'Trailer' },
  { value: 'mini-trailer', label: 'Mini Trailer' },
  { value: 'semi-trailer', label: 'Semi-Trailer' },
];

export const SIZE_CLASS_LABELS = SIZE_CLASS_OPTIONS.reduce((acc, o) => {
  if (o.value) acc[o.value] = o.label;
  return acc;
}, {});

// Extra bloom colors added alongside this feature (Chimera, Fantasy patterns).
export const EXTRA_BLOOM_COLORS = [
  { value: 'chimera', label: 'Chimera' },
  { value: 'fantasy', label: 'Fantasy' },
];

export const LEAF_TYPE_OPTIONS = [
  { value: '', label: 'Select leaf type...' },
  { value: 'plain', label: 'Plain (Boy)' },
  { value: 'girl', label: 'Girl' },
  { value: 'quilted', label: 'Quilted' },
  { value: 'spooned', label: 'Spooned' },
  { value: 'wavy', label: 'Wavy' },
  { value: 'ruffled', label: 'Ruffled' },
  { value: 'serrated', label: 'Serrated' },
  { value: 'pointed', label: 'Pointed' },
  { value: 'longifolia', label: 'Longifolia' },
  { value: 'strawberry', label: 'Strawberry / Holly' },
];

export const LEAF_TYPE_LABELS = LEAF_TYPE_OPTIONS.reduce((acc, o) => {
  if (o.value) acc[o.value] = o.label;
  return acc;
}, {});

export const LEAF_COLOR_OPTIONS = [
  { value: '', label: 'Select leaf color...' },
  { value: 'plain-green', label: 'Plain Green' },
  { value: 'dark-green', label: 'Dark Green' },
  { value: 'light-green', label: 'Light Green' },
  { value: 'red-back', label: 'Red-back' },
  { value: 'variegated-tommie-lou', label: 'Variegated — Tommie Lou' },
  { value: 'variegated-crown', label: 'Variegated — Crown' },
  { value: 'variegated-mosaic', label: 'Variegated — Mosaic' },
  { value: 'variegated-champion', label: 'Variegated — Champion' },
];

export const LEAF_COLOR_LABELS = LEAF_COLOR_OPTIONS.reduce((acc, o) => {
  if (o.value) acc[o.value] = o.label;
  return acc;
}, {});
