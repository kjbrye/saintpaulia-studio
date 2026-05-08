/**
 * Dashboard Subtitle
 *
 * Picks the rotating italic subtitle on the dashboard header based on the
 * most pressing thing the user could act on right now.
 *
 * Priority order: thirsty water > ready-to-feed fertilize > blooms-to-update
 * > calm fallback. The first non-zero category wins.
 */

/**
 * @param {Object} args
 * @param {{ watering?: { count: number }, fertilizing?: { count: number }, grooming?: { count: number } }} args.overdueCounts
 * @param {{ count: number }} [args.bloomsToUpdate]
 * @returns {string}
 */
export function getDashboardSubtitle({ overdueCounts = {}, bloomsToUpdate } = {}) {
  const water = overdueCounts.watering?.count ?? 0;
  const fertilize = overdueCounts.fertilizing?.count ?? 0;
  const blooms = bloomsToUpdate?.count ?? 0;

  if (water > 0) {
    return `${water} ${water === 1 ? 'plant is' : 'plants are'} thirsty this morning`;
  }
  if (fertilize > 0) {
    return `${fertilize} ${fertilize === 1 ? 'plant is' : 'plants are'} ready for a feed`;
  }
  if (blooms > 0) {
    return `${blooms} ${blooms === 1 ? 'bloom is' : 'blooms'} waiting for an update`;
  }
  return 'Your collection is happy today';
}
