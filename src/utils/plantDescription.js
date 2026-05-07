/**
 * Plant Description Utility
 *
 * Assembles an AVSA-style canonical description string from a plant's
 * structured fields (bloom_type, bloom_color, leaf_color, leaf_type,
 * size_class). Pure — no React dependencies.
 *
 * Plant fields encode AVSA concepts more densely than sports do:
 *   - bloom_type values like "double-frilled" already combine bloom type + edge
 *   - leaf_color values like "variegated-tommie-lou" combine color + variegation
 * So this builder does its own assembly rather than reusing buildSportDescription.
 *
 * Example output:
 *   "Double Frilled lavender. Dark Green, quilted. Standard"
 */

import {
  BLOOM_TYPE_LABELS,
  SIZE_CLASS_LABELS,
  LEAF_TYPE_LABELS,
  LEAF_COLOR_LABELS,
  COMPOUND_BLOOM_COLORS,
} from '../constants/plantOptions';

// Patterns that describe the bloom rather than naming a color — we render them
// after the bloom type with a comma instead of as a color.
const PATTERN_VALUES = new Set(['chimera', 'fantasy']);

// Render an array of color values as a natural-language phrase:
// ['pink', 'white']            → 'pink & white'
// ['pink', 'white', 'lavender'] → 'pink, white & lavender'
function joinColors(colors) {
  if (!colors || !colors.length) return '';
  if (colors.length === 1) return colors[0];
  if (colors.length === 2) return `${colors[0]} & ${colors[1]}`;
  return `${colors.slice(0, -1).join(', ')} & ${colors[colors.length - 1]}`;
}

// Resolve the bloom_color → display string, expanding bi-color/multi-color into
// the specific colors when available.
function resolveBloomColor(plant) {
  if (COMPOUND_BLOOM_COLORS.has(plant.bloom_color) && plant.bloom_colors?.length) {
    return joinColors(plant.bloom_colors);
  }
  return plant.bloom_color || '';
}

function capitalizeFirst(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// "Plain (Boy)" → "plain"; "Quilted" → "quilted"
function toInline(label) {
  if (!label) return '';
  return label.replace(/\s*\(.*?\)\s*/g, '').trim().toLowerCase();
}

function buildBloomSentence(plant) {
  const typeLabel = BLOOM_TYPE_LABELS[plant.bloom_type] || '';
  const color = resolveBloomColor(plant);
  // Patterns only apply to the raw single-value colors; once expanded into a
  // multi-color phrase, treat as a normal color list.
  const isPattern = PATTERN_VALUES.has(plant.bloom_color);

  if (!typeLabel && !color) return '';
  if (!typeLabel) return capitalizeFirst(color);
  if (!color) return typeLabel;
  if (isPattern) return `${typeLabel}, ${color}`;
  return `${typeLabel} ${color}`;
}

function buildFoliageSentence(plant) {
  const colorLabel = LEAF_COLOR_LABELS[plant.leaf_color] || '';
  const typeLabel = LEAF_TYPE_LABELS[plant.leaf_type] || '';

  if (!colorLabel && !typeLabel) return '';
  if (!colorLabel) return capitalizeFirst(toInline(typeLabel));
  if (!typeLabel) return colorLabel;
  return `${colorLabel}, ${toInline(typeLabel)}`;
}

/**
 * Assemble the canonical plant description. Returns '' when no descriptive
 * fields are populated.
 */
export function buildPlantDescription(plant) {
  if (!plant) return '';

  const sentences = [
    buildBloomSentence(plant),
    buildFoliageSentence(plant),
    SIZE_CLASS_LABELS[plant.size_class] || '',
  ].filter(Boolean);

  if (!sentences.length) return '';
  return sentences.join('. ') + '.';
}
