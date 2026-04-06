/**
 * Plant status constants
 *
 * Single source of truth for all plant status values, labels, and helpers.
 */

// Active statuses (plant is in the collection)
export const ACTIVE_STATUSES = ['healthy', 'recovering', 'struggling', 'dormant'];

// Archived statuses (plant left the collection, data preserved)
export const ARCHIVED_STATUSES = ['deceased', 'gifted', 'sold'];

export const STATUS_LABELS = {
  healthy: 'Healthy',
  recovering: 'Recovering',
  struggling: 'Struggling',
  dormant: 'Dormant',
  deceased: 'Deceased',
  gifted: 'Gifted Away',
  sold: 'Sold',
};

export const STATUS_OPTIONS = [
  { value: 'healthy', label: 'Healthy' },
  { value: 'recovering', label: 'Recovering' },
  { value: 'struggling', label: 'Struggling' },
  { value: 'dormant', label: 'Dormant' },
];

export const ARCHIVE_OPTIONS = [
  { value: 'deceased', label: 'Deceased', description: 'Plant has died' },
  { value: 'gifted', label: 'Gifted Away', description: 'Given to someone' },
  { value: 'sold', label: 'Sold', description: 'Sold to a buyer' },
];

export function isArchived(status) {
  return ARCHIVED_STATUSES.includes(status);
}
