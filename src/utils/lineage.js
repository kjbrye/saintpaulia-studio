/**
 * Lineage Utilities
 *
 * Tree building, generation calculation, inbreeding coefficient,
 * common ancestor detection, and pedigree formatting.
 */

/**
 * Build an ancestor tree from a flat map of plants.
 * Returns a nested object: { plant, podParent: { plant, ... }, pollenParent: { plant, ... } }
 *
 * @param {string} plantId - Root plant ID
 * @param {Map<string, Object>} plantMap - Map of id → plant
 * @param {number} maxDepth - Max generations to recurse
 * @param {number} depth - Current depth (internal)
 * @returns {Object|null} Nested ancestor tree node
 */
export function buildAncestorTree(plantId, plantMap, maxDepth = 4, depth = 0) {
  if (!plantId || depth > maxDepth) return null;
  const plant = plantMap.get(plantId);
  if (!plant) return null;

  return {
    plant,
    generation: depth,
    podParent: buildAncestorTree(plant.pod_parent_id, plantMap, maxDepth, depth + 1),
    pollenParent: buildAncestorTree(plant.pollen_parent_id, plantMap, maxDepth, depth + 1),
    // Fallback names for parents not in the library
    podParentName: plant.pod_parent_name,
    pollenParentName: plant.pollen_parent_name,
  };
}

/**
 * Collect all ancestor IDs from a plant (breadth-first).
 * Used to batch-fetch ancestors from the database.
 *
 * @param {string} plantId - Starting plant ID
 * @param {Map<string, Object>} plantMap - Map of id → plant
 * @param {number} maxDepth - Max generations
 * @returns {Set<string>} Set of ancestor plant IDs
 */
export function collectAncestorIds(plantId, plantMap, maxDepth = 4) {
  const ids = new Set();
  const queue = [{ id: plantId, depth: 0 }];

  while (queue.length > 0) {
    const { id, depth } = queue.shift();
    if (!id || depth > maxDepth || ids.has(id)) continue;
    ids.add(id);

    const plant = plantMap.get(id);
    if (plant && depth < maxDepth) {
      if (plant.pod_parent_id) queue.push({ id: plant.pod_parent_id, depth: depth + 1 });
      if (plant.pollen_parent_id) queue.push({ id: plant.pollen_parent_id, depth: depth + 1 });
    }
  }

  return ids;
}

/**
 * Calculate generation number based on parents.
 * F1 = 1 (both parents are foundation stock with no parents).
 * Each generation = max(parent generations) + 1.
 *
 * @param {string} plantId
 * @param {Map<string, Object>} plantMap
 * @param {Map<string, number>} cache - Memoization cache
 * @returns {number|null} Generation number, or null if no parent info
 */
export function calculateGeneration(plantId, plantMap, cache = new Map()) {
  if (cache.has(plantId)) return cache.get(plantId);

  const plant = plantMap.get(plantId);
  if (!plant) {
    cache.set(plantId, null);
    return null;
  }

  // If the plant already has a generation set, use it
  if (plant.generation != null) {
    cache.set(plantId, plant.generation);
    return plant.generation;
  }

  // No parents known → foundation stock
  if (!plant.pod_parent_id && !plant.pollen_parent_id) {
    cache.set(plantId, null);
    return null;
  }

  const podGen = plant.pod_parent_id
    ? calculateGeneration(plant.pod_parent_id, plantMap, cache)
    : null;
  const pollenGen = plant.pollen_parent_id
    ? calculateGeneration(plant.pollen_parent_id, plantMap, cache)
    : null;

  let gen;
  if (podGen != null && pollenGen != null) {
    gen = Math.max(podGen, pollenGen) + 1;
  } else if (podGen != null) {
    gen = podGen + 1;
  } else if (pollenGen != null) {
    gen = pollenGen + 1;
  } else {
    // Parents exist but their generations are unknown → F1
    gen = 1;
  }

  cache.set(plantId, gen);
  return gen;
}

/**
 * Find common ancestors between two plants.
 *
 * @param {string} plantAId
 * @param {string} plantBId
 * @param {Map<string, Object>} plantMap
 * @param {number} maxDepth
 * @returns {Array<{ plant: Object, distanceA: number, distanceB: number }>}
 */
export function findCommonAncestors(plantAId, plantBId, plantMap, maxDepth = 6) {
  const ancestorsA = getAncestorDistances(plantAId, plantMap, maxDepth);
  const ancestorsB = getAncestorDistances(plantBId, plantMap, maxDepth);

  const common = [];
  for (const [id, distA] of ancestorsA) {
    if (ancestorsB.has(id)) {
      const plant = plantMap.get(id);
      if (plant) {
        common.push({ plant, distanceA: distA, distanceB: ancestorsB.get(id) });
      }
    }
  }

  // Sort by total distance (closest common ancestors first)
  common.sort((a, b) => a.distanceA + a.distanceB - (b.distanceA + b.distanceB));
  return common;
}

/**
 * Get all ancestors with their generation distance from a plant.
 * @returns {Map<string, number>} Map of ancestorId → distance
 */
function getAncestorDistances(plantId, plantMap, maxDepth) {
  const distances = new Map();
  const queue = [{ id: plantId, depth: 0 }];

  while (queue.length > 0) {
    const { id, depth } = queue.shift();
    if (!id || depth > maxDepth) continue;
    // Keep the shortest distance if we've seen this ancestor before
    if (distances.has(id) && distances.get(id) <= depth) continue;
    distances.set(id, depth);

    const plant = plantMap.get(id);
    if (plant && depth < maxDepth) {
      if (plant.pod_parent_id) queue.push({ id: plant.pod_parent_id, depth: depth + 1 });
      if (plant.pollen_parent_id) queue.push({ id: plant.pollen_parent_id, depth: depth + 1 });
    }
  }

  return distances;
}

/**
 * Calculate Wright's coefficient of inbreeding (COI).
 * Simplified path-based calculation for pedigree trees.
 *
 * COI = Σ [(1/2)^(n1+n2+1) × (1 + FA)]
 * where n1 = path length from pod parent to common ancestor,
 *       n2 = path length from pollen parent to common ancestor,
 *       FA = COI of the common ancestor.
 *
 * @param {string} podParentId
 * @param {string} pollenParentId
 * @param {Map<string, Object>} plantMap
 * @param {number} maxDepth
 * @returns {number} COI as decimal (0-1)
 */
export function calculateInbreedingCoefficient(
  podParentId,
  pollenParentId,
  plantMap,
  maxDepth = 6,
) {
  if (!podParentId || !pollenParentId) return 0;

  const commonAncestors = findCommonAncestors(podParentId, pollenParentId, plantMap, maxDepth);
  if (commonAncestors.length === 0) return 0;

  let coi = 0;
  for (const { distanceA, distanceB } of commonAncestors) {
    // Simplified: assume FA = 0 for common ancestors (good enough for most cases)
    coi += Math.pow(0.5, distanceA + distanceB + 1);
  }

  return Math.min(coi, 1); // Cap at 1
}

/**
 * Get all descendants of a plant.
 *
 * @param {string} plantId
 * @param {Array<Object>} allPlants
 * @returns {Array<{ plant: Object, generation: number, parentRole: string }>}
 */
export function getDescendants(plantId, allPlants) {
  const descendants = [];
  const queue = [{ id: plantId, generation: 0 }];
  const visited = new Set();

  while (queue.length > 0) {
    const { id, generation } = queue.shift();
    if (visited.has(id)) continue;
    visited.add(id);

    const children = allPlants.filter((p) => p.pod_parent_id === id || p.pollen_parent_id === id);

    for (const child of children) {
      const parentRole =
        child.pod_parent_id === id
          ? child.pollen_parent_id === id
            ? 'both'
            : 'pod_parent'
          : 'pollen_parent';

      descendants.push({ plant: child, generation: generation + 1, parentRole });
      queue.push({ id: child.id, generation: generation + 1 });
    }
  }

  return descendants;
}

/**
 * Format pedigree notation for a plant.
 * @param {Object} plant
 * @returns {string} e.g., "'Rob's Vanilla Trail' × 'Buckeye Seductress'"
 */
export function formatPedigreeNotation(plant) {
  const pod =
    plant.pod_parent_name || plant.pod_parent?.cultivar_name || plant.pod_parent?.nickname || null;
  const pollen =
    plant.pollen_parent_name ||
    plant.pollen_parent?.cultivar_name ||
    plant.pollen_parent?.nickname ||
    null;

  if (!pod && !pollen) return null;
  return `${pod || 'Unknown'} × ${pollen || 'Unknown'}`;
}

/**
 * Describe the relationship between two plants.
 * @param {string} plantAId
 * @param {string} plantBId
 * @param {Map<string, Object>} plantMap
 * @returns {string} Human-readable relationship description
 */
export function describeRelationship(plantAId, plantBId, plantMap) {
  if (plantAId === plantBId) return 'Same plant';

  const a = plantMap.get(plantAId);
  const b = plantMap.get(plantBId);
  if (!a || !b) return 'Unknown relationship';

  // Direct parent-child
  if (a.pod_parent_id === plantBId || a.pollen_parent_id === plantBId) return 'Parent → Child';
  if (b.pod_parent_id === plantAId || b.pollen_parent_id === plantAId) return 'Parent → Child';

  // Siblings (share at least one parent)
  const shareParent =
    (a.pod_parent_id &&
      (a.pod_parent_id === b.pod_parent_id || a.pod_parent_id === b.pollen_parent_id)) ||
    (a.pollen_parent_id &&
      (a.pollen_parent_id === b.pod_parent_id || a.pollen_parent_id === b.pollen_parent_id));
  if (shareParent) {
    const shareBoth =
      a.pod_parent_id &&
      a.pollen_parent_id &&
      ((a.pod_parent_id === b.pod_parent_id && a.pollen_parent_id === b.pollen_parent_id) ||
        (a.pod_parent_id === b.pollen_parent_id && a.pollen_parent_id === b.pod_parent_id));
    return shareBoth ? 'Full siblings' : 'Half siblings';
  }

  // Common ancestors
  const common = findCommonAncestors(plantAId, plantBId, plantMap, 6);
  if (common.length > 0) {
    const closest = common[0];
    const totalDist = closest.distanceA + closest.distanceB;
    if (totalDist <= 4)
      return `Related (${common.length} common ancestor${common.length > 1 ? 's' : ''})`;
    return 'Distantly related';
  }

  return 'No known relationship';
}

/**
 * Get COI risk level and label.
 * @param {number} coi
 * @returns {{ level: string, label: string, color: string }}
 */
export function getCoiRisk(coi) {
  if (coi === 0) return { level: 'none', label: 'Unrelated', color: 'var(--color-success)' };
  if (coi < 0.0625) return { level: 'low', label: 'Low', color: 'var(--color-success)' };
  if (coi < 0.125) return { level: 'moderate', label: 'Moderate', color: 'var(--copper-500)' };
  if (coi < 0.25) return { level: 'high', label: 'High', color: 'var(--color-warning)' };
  return { level: 'very_high', label: 'Very High', color: 'var(--color-error)' };
}
