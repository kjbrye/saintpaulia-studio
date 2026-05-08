/**
 * Plan & Tier Constants
 *
 * Defines free vs premium features, limits, and Stripe price IDs.
 */

export const PLANS = {
  free: {
    name: 'Free',
    plantLimit: 25,
  },
  premium: {
    name: 'Premium',
    plantLimit: Infinity,
    monthlyPrice: 4.99,
    annualPrice: 39.99,
  },
};

export const PREMIUM_FEATURES = ['breeding', 'propagation', 'lineage', 'analytics', 'note_attachments', 'sports', 'multi_photos'];

export const MAX_ADDITIONAL_PLANT_PHOTOS = 4;

export const FEATURE_LABELS = {
  breeding: {
    name: 'Breeding & Hybridizing',
    description: 'Track cross-pollination, seed harvests, and offspring across generations.',
  },
  propagation: {
    name: 'Propagation Tracking',
    description: 'Monitor leaf cuttings from cutting to potted plantlets.',
  },
  lineage: {
    name: 'Lineage & Pedigree',
    description: 'Visualize family trees, trace ancestry, and track trait inheritance.',
  },
  analytics: {
    name: 'Collection Analytics',
    description: 'Insights and stats about your growing collection.',
  },
  note_attachments: {
    name: 'Photo Attachments on Notes',
    description: 'Attach photos to notes — perfect for soil recipes, shop links, and visual references.',
  },
  sports: {
    name: 'Sports Tracking',
    description:
      'Document bloom and foliage variations, track stability across cycles, and prepare entries for AVSA registration.',
  },
  multi_photos: {
    name: 'Multiple Plant Photos',
    description:
      'Capture each plant from every angle — add up to 5 photos per plant to document growth, blooms, and foliage detail over time.',
  },
};

export const STRIPE_PRICES = {
  get monthly() { return import.meta.env.VITE_STRIPE_PRICE_MONTHLY; },
  get annual() { return import.meta.env.VITE_STRIPE_PRICE_ANNUAL; },
};
