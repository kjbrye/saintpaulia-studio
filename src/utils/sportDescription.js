/**
 * Sport Description Utilities
 *
 * Pure helpers for assembling AVSA-style sport descriptions from structured
 * fields, and for deriving stability status from observation history.
 *
 * Reference grammar (AVSA sport registry):
 *   [bloom type] [chimera?] [primary color] [sticktite?] [edge style] [bloom shape]/[edge detail].
 *   [foliage color or variegation], [foliage shape].
 *   [size class]
 *
 * Example: "Single chimera fuchsia sticktite wavy bell/white stripe.
 *           Medium green, plain. Semiminiature"
 */

function capitalizeFirst(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Assemble the canonical AVSA-style description string from a sport's
 * structured description fields. Returns '' if no descriptive fields are set.
 */
export function buildSportDescription(sport) {
  if (!sport) return '';

  // Bloom sentence: bloom type, chimera, color(s), sticktite, edge style, shape, /edge detail
  const bloomTokens = [];
  if (sport.bloom_type) bloomTokens.push(sport.bloom_type);
  if (sport.is_chimera) bloomTokens.push('chimera');
  if (sport.primary_color) bloomTokens.push(sport.primary_color);
  if (sport.secondary_color) bloomTokens.push(`& ${sport.secondary_color}`);
  if (sport.is_sticktite) bloomTokens.push('sticktite');
  if (sport.edge_style && sport.edge_style !== 'plain') bloomTokens.push(sport.edge_style);
  if (sport.bloom_shape) bloomTokens.push(sport.bloom_shape);

  let bloomPart = bloomTokens.join(' ');
  if (sport.edge_detail) {
    bloomPart = bloomPart ? `${bloomPart}/${sport.edge_detail}` : sport.edge_detail;
  }

  // Foliage sentence: variegation (if present) or color, then shape
  const foliageTokens = [];
  if (sport.foliage_variegation) {
    foliageTokens.push(sport.foliage_variegation);
  } else if (sport.foliage_color) {
    foliageTokens.push(sport.foliage_color);
  }
  if (sport.foliage_shape) foliageTokens.push(sport.foliage_shape);

  const sizePart = sport.size_class || '';

  const sentences = [];
  if (bloomPart) sentences.push(capitalizeFirst(bloomPart));
  if (foliageTokens.length) sentences.push(capitalizeFirst(foliageTokens.join(', ')));
  if (sizePart) sentences.push(capitalizeFirst(sizePart));

  if (!sentences.length) return '';
  return sentences.join('. ') + '.';
}

/**
 * Derive stability metrics from a sport's observation history.
 *
 * Rules:
 *   0 observations              → 'unconfirmed'
 *   <50% trait_held             → 'unstable'
 *   50–79% trait_held           → 'partially_stable'
 *   80%+ AND ≥3 observations    → 'stable'
 *
 * Returns: { stableCount, totalCount, percentage, suggestedStatus }
 *   percentage is 0–100 (integer) or null when no observations.
 */
export function calculateStability(observations) {
  const list = Array.isArray(observations) ? observations : [];
  const totalCount = list.length;
  const stableCount = list.filter((o) => o && o.trait_held === true).length;

  if (totalCount === 0) {
    return { stableCount: 0, totalCount: 0, percentage: null, suggestedStatus: 'unconfirmed' };
  }

  const percentage = Math.round((stableCount / totalCount) * 100);

  let suggestedStatus;
  if (percentage >= 80 && totalCount >= 3) {
    suggestedStatus = 'stable';
  } else if (percentage >= 50) {
    suggestedStatus = 'partially_stable';
  } else {
    suggestedStatus = 'unstable';
  }

  return { stableCount, totalCount, percentage, suggestedStatus };
}
