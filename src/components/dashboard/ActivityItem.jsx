/**
 * ActivityItem - Single activity entry in the feed
 */

import { Link } from 'react-router-dom';
import { Droplets, Scissors, Sparkles, Clock } from 'lucide-react';

const careIcons = {
  watering: Droplets,
  fertilizing: Sparkles,
  grooming: Scissors,
};

const careLabels = {
  watering: 'Watered',
  fertilizing: 'Fertilized',
  grooming: 'Groomed',
};

/**
 * Format a date as relative time (e.g., "2 hours ago", "Yesterday")
 */
function formatRelativeTime(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function ActivityItem({ care_type, care_date, plants }) {
  const CareIcon = careIcons[care_type] || Droplets;
  const plantName = plants?.nickname || plants?.cultivar_name || 'Unknown Plant';
  const plantId = plants?.id;

  return (
    <div className="flex items-center gap-3 py-3 border-b border-[var(--sage-200)] last:border-0">
      {/* Icon */}
      <div className="icon-container icon-container-sm">
        <CareIcon size={14} style={{ color: 'var(--sage-600)' }} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-body truncate">
          <span className="font-semibold">{careLabels[care_type] || care_type}</span>
          {' '}
          {plantId ? (
            <Link to={`/plants/${plantId}`} className="hover:underline">
              {plantName}
            </Link>
          ) : (
            plantName
          )}
        </p>
      </div>

      {/* Timestamp */}
      <div className="flex items-center gap-1 text-small text-muted shrink-0">
        <Clock size={12} />
        <span>{formatRelativeTime(care_date)}</span>
      </div>
    </div>
  );
}
