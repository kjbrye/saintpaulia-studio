/**
 * Group Activity By Day
 *
 * Buckets dashboard activity rows into TODAY / YESTERDAY / EARLIER.
 * Expects rows pre-normalized by the dashboard service into the shape:
 *   { id, type, plantId, plantName, occurredAt, label }
 */

import { isToday, isYesterday, parseISO } from 'date-fns';

/**
 * @param {Array<{ occurredAt: string }>} activity
 * @returns {{ today: Array, yesterday: Array, earlier: Array }}
 */
export function groupActivityByDay(activity = []) {
  const buckets = { today: [], yesterday: [], earlier: [] };

  for (const entry of activity) {
    if (!entry?.occurredAt) continue;
    const when = typeof entry.occurredAt === 'string' ? parseISO(entry.occurredAt) : entry.occurredAt;
    if (isToday(when)) {
      buckets.today.push(entry);
    } else if (isYesterday(when)) {
      buckets.yesterday.push(entry);
    } else {
      buckets.earlier.push(entry);
    }
  }

  return buckets;
}
