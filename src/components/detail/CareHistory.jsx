/**
 * CareHistory - List of recent care logs for this plant
 */

import { Droplets, Sparkles, Scissors, Clock } from 'lucide-react';

const careConfig = {
  watering: {
    icon: Droplets,
    label: 'Watered',
    color: 'var(--sage-600)',
  },
  fertilizing: {
    icon: Sparkles,
    label: 'Fertilized',
    color: 'var(--purple-400)',
  },
  grooming: {
    icon: Scissors,
    label: 'Groomed',
    color: 'var(--copper-500)',
  },
};

const FERTILIZER_LABELS = {
  balanced: 'Balanced (20-20-20)',
  bloom: 'Bloom Booster',
  foliage: 'Foliage/Growth',
  organic: 'Organic',
  slow_release: 'Slow Release',
  other: 'Other',
};

function CareLogItem({ log }) {
  const config = careConfig[log.care_type] || careConfig.watering;
  const Icon = config.icon;
  const fertilizerLabel = log.fertilizer_type ? FERTILIZER_LABELS[log.fertilizer_type] : null;

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="flex items-center gap-4 py-3">
      <div className="icon-container icon-container-sm">
        <Icon size={14} style={{ color: config.color }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-body font-medium">
          {config.label}
          {fertilizerLabel && (
            <span style={{ color: 'var(--purple-400)' }} className="font-normal"> - {fertilizerLabel}</span>
          )}
        </p>
        {log.notes && (
          <p className="text-small text-muted truncate">{log.notes}</p>
        )}
      </div>
      <div className="flex items-center gap-1 text-small text-muted flex-shrink-0">
        <Clock size={12} />
        <span>{formatDate(log.care_date)}</span>
      </div>
    </div>
  );
}

export default function CareHistory({ logs = [], isLoading }) {
  if (isLoading) {
    return (
      <div className="card p-6">
        <h2 className="heading heading-md mb-4">Care History</h2>
        <p className="text-muted">Loading history...</p>
      </div>
    );
  }

  return (
    <div className="card p-6">
      <h2 className="heading heading-md mb-4">Care History</h2>

      {logs.length === 0 ? (
        <div className="card-inset p-6 text-center">
          <Clock size={24} style={{ color: 'var(--sage-400)' }} className="mx-auto mb-2" />
          <p className="text-muted">No care recorded yet</p>
        </div>
      ) : (
        <div className="card-inset p-4">
          <div className="divide-y divide-[var(--sage-200)]">
            {logs.map((log) => (
              <CareLogItem key={log.id} log={log} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
