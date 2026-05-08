/**
 * Shared plant attribute option lists (bloom type, size class, bloom color).
 * Used by AddPlant, PlantDetail, and library filters.
 */

export const BLOOM_TYPE_OPTIONS = [
  { value: '', label: 'Select bloom type...' },
  { value: 'single', label: 'Single' },
  { value: 'single-star', label: 'Single Star' },
  { value: 'single-ruffled', label: 'Single Ruffled' },
  { value: 'single-frilled', label: 'Single Frilled' },
  { value: 'semidouble', label: 'Semidouble' },
  { value: 'semidouble-star', label: 'Semidouble Star' },
  { value: 'semidouble-ruffled', label: 'Semidouble Ruffled' },
  { value: 'semidouble-frilled', label: 'Semidouble Frilled' },
  { value: 'double', label: 'Double' },
  { value: 'double-star', label: 'Double Star' },
  { value: 'double-ruffled', label: 'Double Ruffled' },
  { value: 'double-frilled', label: 'Double Frilled' },
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

/**
 * Compact variety class buckets used by the Library filter drawer and the
 * eyebrow/column display on cards & list rows. The full size_class list has
 * mini-trailer / semi-trailer variants we collapse into a single "Trailer"
 * bucket so the filter chips stay scannable.
 */
export const VARIETY_CLASS_BUCKETS = [
  { value: 'standard', label: 'Standard', includes: ['standard', 'large'] },
  { value: 'semiminiature', label: 'Semi-mini', includes: ['semiminiature'] },
  { value: 'miniature', label: 'Mini', includes: ['miniature'] },
  { value: 'trailer', label: 'Trailer', includes: ['trailer', 'mini-trailer', 'semi-trailer'] },
];

export const VARIETY_CLASS_BUCKET_BY_SIZE = VARIETY_CLASS_BUCKETS.reduce((acc, bucket) => {
  for (const value of bucket.includes) acc[value] = bucket;
  return acc;
}, {});

/**
 * Short uppercase eyebrow label for a plant's size_class (e.g. "STANDARD",
 * "SEMI-MINI"). Returns null when there's no size_class so callers can
 * conditionally render.
 */
export function getVarietyClassEyebrow(sizeClass) {
  if (!sizeClass) return null;
  const bucket = VARIETY_CLASS_BUCKET_BY_SIZE[sizeClass];
  if (bucket) return bucket.label.toUpperCase();
  const fallback = SIZE_CLASS_LABELS[sizeClass];
  return fallback ? fallback.toUpperCase() : null;
}

// Extra bloom colors added alongside this feature (Chimera, Fantasy patterns).
export const EXTRA_BLOOM_COLORS = [
  { value: 'chimera', label: 'Chimera' },
  { value: 'fantasy', label: 'Fantasy' },
];

// Solid bloom colors selectable when a plant is bi-color or multi-color.
// Used by the AddPlant form, the PlantDetail edit form, and the description builder.
export const BI_MULTI_COLOR_OPTIONS = [
  { value: 'pink', label: 'Pink' },
  { value: 'purple', label: 'Purple' },
  { value: 'blue', label: 'Blue' },
  { value: 'white', label: 'White' },
  { value: 'red', label: 'Red' },
  { value: 'lavender', label: 'Lavender' },
  { value: 'coral', label: 'Coral' },
  { value: 'yellow', label: 'Yellow' },
  { value: 'green', label: 'Green' },
];

// Bloom colors that need a follow-up multi-select for the actual colors.
export const COMPOUND_BLOOM_COLORS = new Set(['bi-color', 'multi']);

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
