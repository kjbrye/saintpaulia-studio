/**
 * Propagation & Breeding Statistics
 *
 * Business logic for computing success rates, method breakdowns, etc.
 */

/**
 * Compute propagation stats from a list of propagations
 */
export function getPropagationStats(propagations) {
  if (!propagations.length) return null;

  const total = propagations.length;
  const complete = propagations.filter((p) => p.stage === 'complete').length;
  const failed = propagations.filter((p) => p.stage === 'failed').length;
  const active = total - complete - failed;
  const successRate =
    complete + failed > 0 ? Math.round((complete / (complete + failed)) * 100) : null;

  // By method
  const byMethod = {};
  for (const p of propagations) {
    const method = p.method || 'unknown';
    if (!byMethod[method]) {
      byMethod[method] = { total: 0, complete: 0, failed: 0 };
    }
    byMethod[method].total++;
    if (p.stage === 'complete') byMethod[method].complete++;
    if (p.stage === 'failed') byMethod[method].failed++;
  }

  const methodStats = Object.entries(byMethod).map(([method, stats]) => ({
    method,
    ...stats,
    successRate:
      stats.complete + stats.failed > 0
        ? Math.round((stats.complete / (stats.complete + stats.failed)) * 100)
        : null,
  }));

  // By parent plant
  const byParent = {};
  for (const p of propagations) {
    const name =
      p.parent_plant?.cultivar_name || p.parent_plant?.nickname || p.parent_plant_name || 'Unknown';
    if (!byParent[name]) {
      byParent[name] = { total: 0, complete: 0, failed: 0 };
    }
    byParent[name].total++;
    if (p.stage === 'complete') byParent[name].complete++;
    if (p.stage === 'failed') byParent[name].failed++;
  }

  const parentStats = Object.entries(byParent)
    .map(([name, stats]) => ({
      name,
      ...stats,
      successRate:
        stats.complete + stats.failed > 0
          ? Math.round((stats.complete / (stats.complete + stats.failed)) * 100)
          : null,
    }))
    .sort((a, b) => b.total - a.total);

  const totalPlantlets = propagations.reduce((sum, p) => sum + (p.plantlet_count || 0), 0);

  return { total, active, complete, failed, successRate, methodStats, parentStats, totalPlantlets };
}

/**
 * Compute breeding stats from a list of crosses
 */
export function getBreedingStats(crosses) {
  if (!crosses.length) return null;

  const total = crosses.length;
  const blooming = crosses.filter((c) => c.stage === 'blooming').length;
  const failed = crosses.filter((c) => c.stage === 'failed').length;
  const active = total - blooming - failed;
  const successRate =
    blooming + failed > 0 ? Math.round((blooming / (blooming + failed)) * 100) : null;

  const totalSeeds = crosses.reduce((sum, c) => sum + (c.seed_count || 0), 0);
  const totalGerminated = crosses.reduce((sum, c) => sum + (c.germination_count || 0), 0);
  const germinationRate = totalSeeds > 0 ? Math.round((totalGerminated / totalSeeds) * 100) : null;

  return {
    total,
    active,
    blooming,
    failed,
    successRate,
    totalSeeds,
    totalGerminated,
    germinationRate,
  };
}
