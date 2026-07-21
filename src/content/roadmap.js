/**
 * Roadmap data — the single source of truth for the in-app Roadmap page.
 *
 * WORKFLOW: When a feature ships, remove its item from this file and add its
 * story to the changelog (src/content/help/changelog.md) in the SAME commit.
 * Roadmap and changelog are two views of one release process — the roadmap is
 * what's ahead, the changelog is what landed — so a shipped item lives in
 * exactly one of them, never both. Shipped items do not belong here.
 *
 * Buckets are deliberately coarse. The granular internal statuses collapse to
 * two user-facing buckets, and we store NO dates and NO status pills — those
 * set expectations that slip:
 *
 *   'coming-soon'  ← In Development + Beta Testing
 *   'exploring'    ← Planning + Not Started
 *
 * Items render in the order they appear below (curated, not alphabetical), so
 * the page reads top-to-bottom as a narrative: what's nearly here, then what's
 * being considered.
 */

export const ROADMAP = [
  // ---- Coming soon (actively being built or with beta testers) ----
  {
    title: 'Cross success rate analytics',
    description:
      'See which parent combinations tend to succeed or fail, with patterns by parent, season, or technique.',
    bucket: 'coming-soon',
  },
  {
    title: 'Trait tagging on offspring',
    description:
      'Tag seedlings with observed traits — leaf shape, bloom color, variegation — to evaluate what a cross is producing.',
    bucket: 'coming-soon',
  },
  {
    title: 'Label printing or export',
    description: 'Printable pot labels with cultivar name, parentage, and date acquired.',
    bucket: 'coming-soon',
  },

  // ---- Exploring (being scoped or under consideration — not scheduled) ----
  {
    title: 'Custom care thresholds per plant',
    description:
      'Per-plant overdue thresholds instead of global defaults, for varieties that are thirstier or need more grooming.',
    bucket: 'exploring',
  },
  {
    title: 'Care reminders & notifications',
    description:
      'Optional, configurable alerts when a plant is approaching or past its care threshold — helpful, not nagging.',
    bucket: 'exploring',
  },
  {
    title: 'Custom tags & categories',
    description:
      'Organize by shelf, light setup, or groupings like show plants vs. windowsill — user-defined and filterable.',
    bucket: 'exploring',
  },
  {
    title: 'Shareable plant profiles',
    description:
      'A public link for one plant or your whole collection — useful for trades, sales, or showing off.',
    bucket: 'exploring',
  },
  {
    title: 'Supplies tracking',
    description:
      'Track pots, soil, fertilizer, and rings, with usage logging, low-stock alerts, and reorder budgeting.',
    bucket: 'exploring',
  },
  {
    title: 'Photo tagging',
    description:
      'Categorize photos by type (full plant, bloom, leaf, roots, label) for filtered gallery views.',
    bucket: 'exploring',
  },
  {
    title: 'New user onboarding tour',
    description: 'A guided walkthrough for first-time users highlighting key features.',
    bucket: 'exploring',
  },
  {
    title: 'Repeat or clone a cross',
    description:
      'Recreate a cross using the same parents as a previous one, starting fresh at pollination.',
    bucket: 'exploring',
  },
  {
    title: 'Seasonal care suggestions',
    description: 'Context-aware tips based on time of year and location.',
    bucket: 'exploring',
  },
  {
    title: 'Duplicate a plant',
    description: 'Duplicate a plant record to record multiples of the same variety quickly.',
    bucket: 'exploring',
  },
  {
    title: 'Advanced health logs',
    description:
      'Track health over time: pests, fungus, disease, dormancy, and unusual situations.',
    bucket: 'exploring',
  },
];

/** Items in a bucket, in curated file order. */
export function getRoadmapItems(bucket) {
  return ROADMAP.filter((item) => item.bucket === bucket);
}
