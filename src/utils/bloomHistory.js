/**
 * Bloom History Utilities
 *
 * Pure helpers for computing per-plant bloom status from a list of
 * bloom_log rows. The Library grid/list uses these to render the
 * "Blooming · 12d" duration pill and the "Last bloomed 3 weeks ago"
 * italic history line.
 */

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const SIX_MONTHS_DAYS = 182;

/**
 * Group bloom logs by plant_id and pick the most relevant one per plant.
 * For each plant returns:
 *   { active: { startDate, daysSinceStart } | null,
 *     latest: { startDate, endDate, daysSinceEnd } | null }
 *
 * `active` is the longest-running ongoing bloom (no end date).
 * `latest` is the most recent ended bloom — used for "last bloomed".
 */
export function buildBloomHistoryMap(bloomLogs = [], now = new Date()) {
  const byPlant = new Map();

  for (const log of bloomLogs) {
    if (!log?.plant_id || !log.bloom_start_date) continue;
    const entry = byPlant.get(log.plant_id) || { active: null, latest: null };

    const startDate = new Date(log.bloom_start_date);
    if (Number.isNaN(startDate.getTime())) continue;

    if (!log.bloom_end_date) {
      // Ongoing bloom — keep the earliest start (longest duration).
      if (!entry.active || startDate < new Date(entry.active.startDate)) {
        entry.active = {
          startDate: log.bloom_start_date,
          daysSinceStart: Math.max(0, Math.floor((now - startDate) / MS_PER_DAY)),
        };
      }
    } else {
      const endDate = new Date(log.bloom_end_date);
      if (Number.isNaN(endDate.getTime())) continue;
      if (!entry.latest || endDate > new Date(entry.latest.endDate)) {
        entry.latest = {
          startDate: log.bloom_start_date,
          endDate: log.bloom_end_date,
          daysSinceEnd: Math.max(0, Math.floor((now - endDate) / MS_PER_DAY)),
        };
      }
    }

    byPlant.set(log.plant_id, entry);
  }

  return byPlant;
}

/**
 * Format a "Last bloomed X ago" phrase from a day count.
 * Returns "today", "yesterday", "N days ago", "N weeks ago",
 * "N months ago", or "N years ago" depending on the magnitude.
 */
export function formatRelativeAgo(days) {
  if (days <= 0) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 14) return `${days} days ago`;
  if (days < 60) return `${Math.round(days / 7)} weeks ago`;
  if (days < 365) return `${Math.round(days / 30)} months ago`;
  const years = Math.round(days / 365);
  return `${years} ${years === 1 ? 'year' : 'years'} ago`;
}

/**
 * Pick the bloom history line to render below the pills on a plant card.
 * Returns one of:
 *   - "Last bloomed 3 weeks ago" — has a most recent ended bloom
 *   - "Hasn't bloomed yet" — plant is younger than ~6 months and has no bloom history
 *   - null — older plant with no bloom history (don't render anything)
 *
 * Skipped entirely when the plant is currently blooming (caller checks).
 */
export function getBloomHistoryLine({ plant, bloomHistory, now = new Date() }) {
  if (bloomHistory?.latest) {
    return `Last bloomed ${formatRelativeAgo(bloomHistory.latest.daysSinceEnd)}`;
  }
  if (bloomHistory?.active) return null;

  const ageAnchor = plant.acquisition_date || plant.created_at;
  if (!ageAnchor) return null;
  const anchorDate = new Date(ageAnchor);
  if (Number.isNaN(anchorDate.getTime())) return null;
  const ageDays = Math.floor((now - anchorDate) / MS_PER_DAY);
  if (ageDays >= 0 && ageDays < SIX_MONTHS_DAYS) {
    return "Hasn't bloomed yet";
  }
  return null;
}
