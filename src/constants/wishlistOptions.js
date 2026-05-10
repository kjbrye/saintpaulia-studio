/**
 * Wishlist constants — priorities, sort options, and copy strings.
 */

import { Flame, Bookmark, Clock } from 'lucide-react';

export const PRIORITY_VALUES = ['high', 'medium', 'low'];

export const PRIORITY_OPTIONS = [
  {
    value: 'high',
    label: 'High priority',
    shortLabel: 'High',
    pillLabel: 'High priority',
    tone: 'copper',
    icon: Flame,
  },
  {
    value: 'medium',
    label: 'Medium',
    shortLabel: 'Medium',
    pillLabel: 'Medium',
    tone: 'purple',
    icon: Bookmark,
  },
  {
    value: 'low',
    label: 'Low — someday',
    shortLabel: 'Low',
    pillLabel: 'Low — someday',
    tone: 'sage',
    icon: Clock,
  },
];

export const PRIORITY_BY_VALUE = PRIORITY_OPTIONS.reduce((acc, p) => {
  acc[p.value] = p;
  return acc;
}, {});

export const PRIORITY_RANK = { high: 0, medium: 1, low: 2 };

export const SORT_OPTIONS = [
  { value: 'priority', label: 'Priority' },
  { value: 'newest', label: 'Newest first' },
  { value: 'name', label: 'Name (A–Z)' },
  { value: 'hybridizer', label: 'Hybridizer' },
];

export const WISHLIST_COPY = {
  pageTitle: 'Wishlist',
  emptySubtitle: "Nothing on your wishlist yet",
  subtitle: (count, highCount) => {
    const noun = count === 1 ? 'plant' : 'plants';
    const base = `${count} ${noun} you're hoping to add`;
    return highCount > 0 ? `${base} · ${highCount} high priority` : base;
  },
  addButton: '+ Add to wishlist',
  modalAddTitle: 'Add to wishlist',
  modalEditTitle: 'Edit wishlist item',
  modalSubtitle: 'Capture quickly — you can add details later',
  emptyActiveTitle: 'Nothing on your wishlist yet',
  emptyActiveSubtext: "Capture cultivars you'd love to add to your collection",
  emptyActiveCleared: (acquiredCount) =>
    `Wishlist clear. ${acquiredCount} acquired so far.`,
  emptyAcquired:
    'Items you acquire will appear here as a record of your collection’s growth.',
  acquiredToast: (cultivar) => `${cultivar} acquired`,
  acquiredToastDetail: 'Opening Add Plant form with details pre-filled.',
  acquiringBanner: (cultivar) => `Acquiring ${cultivar} from your wishlist`,
};
