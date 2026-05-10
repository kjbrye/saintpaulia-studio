/**
 * Lineage Resolution Utilities
 *
 * Helpers that "resolve" a plant to its underlying genome by walking up
 * any chain of clone_source_plant_id pointers. Clones are genetically
 * identical to their source, so most lineage math (relationship, COI)
 * should operate on the resolved source plant, not the clone itself.
 */

/**
 * Walk clone_source_plant_id pointers until reaching a plant with no source
 * (or a cycle, which we guard against). Returns the resolved plant's id.
 */
export function resolveGenomeId(plantId, plantMap) {
  if (!plantId) return null;
  const seen = new Set();
  let current = plantId;
  while (current && !seen.has(current)) {
    seen.add(current);
    const plant = plantMap.get(current);
    if (!plant || !plant.clone_source_plant_id) return current;
    current = plant.clone_source_plant_id;
  }
  return current;
}

export function resolveGenomePlant(plantId, plantMap) {
  const id = resolveGenomeId(plantId, plantMap);
  return id ? plantMap.get(id) : null;
}

/**
 * Are two plants the same genome? True if either is a clone (via any chain)
 * of the other, or both clone the same source.
 */
export function isSameGenome(plantAId, plantBId, plantMap) {
  if (!plantAId || !plantBId) return false;
  return resolveGenomeId(plantAId, plantMap) === resolveGenomeId(plantBId, plantMap);
}

/**
 * Find all clones of a given plant — any plant whose clone_source_plant_id
 * resolves (transitively) to this plant's genome id.
 */
export function findClonesOf(plantId, allPlants) {
  if (!plantId || !allPlants) return [];
  const map = new Map(allPlants.map((p) => [p.id, p]));
  const targetGenome = resolveGenomeId(plantId, map);
  if (!targetGenome) return [];
  return allPlants.filter((p) => {
    if (p.id === plantId) return false;
    if (!p.clone_source_plant_id) return false;
    return resolveGenomeId(p.id, map) === targetGenome;
  });
}

/**
 * Find descendants whose lineage routes through any clone of the focal plant.
 * E.g., if Plant X is cloned to X', and X' is the pod parent of Y, then Y is
 * a descendant of X (genome-wise) routed through X'.
 *
 * Returns the same shape as direct descendants but with `viaClone` set to the
 * intermediate clone plant.
 */
export function findCloneRoutedDescendants(plantId, allPlants) {
  if (!plantId || !allPlants) return [];
  const clones = findClonesOf(plantId, allPlants);
  if (clones.length === 0) return [];

  const cloneIds = new Set(clones.map((c) => c.id));
  const results = [];
  for (const child of allPlants) {
    if (child.id === plantId) continue;
    const cloneId =
      child.pod_parent_id && cloneIds.has(child.pod_parent_id)
        ? child.pod_parent_id
        : child.pollen_parent_id && cloneIds.has(child.pollen_parent_id)
        ? child.pollen_parent_id
        : null;
    if (cloneId) {
      results.push({
        plant: child,
        viaClone: clones.find((c) => c.id === cloneId),
        parentRole: child.pod_parent_id === cloneId ? 'pod_parent' : 'pollen_parent',
      });
    }
  }
  return results;
}
