/**
 * Sport Vocabulary
 *
 * Controlled vocabularies for the sport description builder.
 * Each list is an array of { value, label } objects so dropdowns can render labels
 * directly while storing canonical values.
 *
 * Values follow the AVSA sport-registry conventions:
 * https://africanvioletsocietyofamerica.org/participate/plant-registration/african-violet-sports/
 */

export const BLOOM_TYPES = [
  { value: 'single', label: 'Single' },
  { value: 'semidouble', label: 'Semidouble' },
  { value: 'double', label: 'Double' },
  { value: 'single-semidouble', label: 'Single–Semidouble' },
  { value: 'semidouble-double', label: 'Semidouble–Double' },
];

export const BLOOM_SHAPES = [
  { value: 'star', label: 'Star' },
  { value: 'pansy', label: 'Pansy' },
  { value: 'bell', label: 'Bell' },
  { value: 'wasp', label: 'Wasp' },
  { value: 'cupped', label: 'Cupped' },
];

export const EDGE_STYLES = [
  { value: 'plain', label: 'Plain' },
  { value: 'frilled', label: 'Frilled' },
  { value: 'ruffled', label: 'Ruffled' },
  { value: 'wavy', label: 'Wavy' },
  { value: 'scalloped', label: 'Scalloped' },
  { value: 'serrated', label: 'Serrated' },
];

export const FOLIAGE_COLORS = [
  { value: 'light green', label: 'Light green' },
  { value: 'medium green', label: 'Medium green' },
  { value: 'dark green', label: 'Dark green' },
  { value: 'variegated', label: 'Variegated' },
];

export const FOLIAGE_SHAPES = [
  { value: 'plain', label: 'Plain' },
  { value: 'pointed', label: 'Pointed' },
  { value: 'heart-shaped', label: 'Heart-shaped' },
  { value: 'ovate', label: 'Ovate' },
  { value: 'longifolia', label: 'Longifolia' },
  { value: 'quilted', label: 'Quilted' },
];

export const SIZE_CLASSES = [
  { value: 'miniature', label: 'Miniature' },
  { value: 'semiminiature', label: 'Semiminiature' },
  { value: 'standard', label: 'Standard' },
  { value: 'small standard', label: 'Small standard' },
  { value: 'large', label: 'Large' },
  { value: 'standard trailer', label: 'Standard trailer' },
  { value: 'miniature trailer', label: 'Miniature trailer' },
  { value: 'semiminiature trailer', label: 'Semiminiature trailer' },
];

export const STABILITY_STATUSES = [
  { value: 'unconfirmed', label: 'Unconfirmed' },
  { value: 'unstable', label: 'Unstable' },
  { value: 'partially_stable', label: 'Partially stable' },
  { value: 'stable', label: 'Stable' },
];
