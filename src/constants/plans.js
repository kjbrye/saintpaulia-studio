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

export const PREMIUM_FEATURES = ['breeding', 'propagation', 'lineage', 'analytics'];

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
};

export const STRIPE_PRICES = {
  get monthly() { return import.meta.env.VITE_STRIPE_PRICE_MONTHLY; },
  get annual() { return import.meta.env.VITE_STRIPE_PRICE_ANNUAL; },
};
