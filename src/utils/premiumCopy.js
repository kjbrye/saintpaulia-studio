/**
 * Premium Feature Copy
 *
 * Body copy for the PremiumFeatureModal. The feature name and short tagline
 * already live in `constants/plans.js#FEATURE_LABELS` — this file extends
 * those with the longer 3-4 bullet body shown in the modal.
 *
 * Keys here must match keys in `PREMIUM_FEATURES` (constants/plans.js) and
 * the `feature` prop passed into the modal.
 */

export const PREMIUM_BULLETS = {
  propagation: [
    'Track every leaf cutting from first root to potted plantlet.',
    'Compare success rates by method (water, soil, sphagnum, perlite).',
    'Get reminders when a propagation is ready to advance to the next stage.',
    'Link plantlets back to their parent plant for a complete lineage record.',
  ],
  breeding: [
    'Log every cross-pollination with pod and pollen parent in a single tap.',
    'Watch the seed pod through forming, harvest, sowing, and first bloom.',
    'Save your goals and notes so you remember why you made the cross years later.',
    'Connect offspring back to the cross to build a real breeding program.',
  ],
  lineage: [
    'See parent, sibling, and offspring relationships as a visual family tree.',
    'Trace cultivar ancestry through breeding crosses, propagations, and sports.',
    'Spot patterns in trait inheritance across generations.',
    'Export a clean pedigree when sharing leaves or registering a release.',
  ],
  analytics: [
    'See bloom frequency, care consistency, and collection growth over time.',
    'Spot which cultivars perform best in your conditions.',
    'Surface the plants that need the most attention this week.',
    'Compare seasons, years, and care routines side by side.',
  ],
  sports: [
    'Document bloom and foliage variations the moment you spot them.',
    'Track stability across multiple cycles before naming a sport.',
    'Capture the discovery date, parent plant, and trait notes in one place.',
    'Prepare clean entries for AVSA registration when a sport stabilizes.',
  ],
  multi_photos: [
    'Add up to 5 photos per plant — bloom, foliage, full plant, suckers, and more.',
    'Document growth, blooms, and recovery side by side over time.',
    'Keep a visual record of every angle, not just the cover shot.',
  ],
  note_attachments: [
    'Pin photos to your notes for soil recipes, shop receipts, and visual references.',
    'Stop hunting through your camera roll for the right reference shot.',
    'Keep all the context for a note in one place.',
  ],
};

/**
 * Get the bullet body for a feature. Returns an empty array if the feature
 * key is unknown so the modal still renders cleanly.
 */
export function getPremiumBullets(feature) {
  return PREMIUM_BULLETS[feature] ?? [];
}
