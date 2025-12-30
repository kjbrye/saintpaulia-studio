/**
 * CareStatusCard - Shows care status for a single care type
 */

import { Droplets, Sparkles, Scissors } from 'lucide-react';

const careConfig = {
  watering: {
    icon: Droplets,
    label: 'Watering',
    field: 'last_watered',
  },
  fertilizing: {
    icon: Sparkles,
    label: 'Fertilizing',
    field: 'last_fertilized',
  },
  grooming: {
    icon: Scissors,
    label: 'Grooming',
    field: 'last_groomed',
  },
};

export default function CareStatusCard({ careType, status, lastDate }) {
  const config = careConfig[careType];
  const Icon = config.icon;

  const formatDaysAgo = (days) => {
    if (days === null) return 'Never';
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    return `${days} days ago`;
  };

  const getStatusColor = () => {
    switch (status.status) {
      case 'overdue':
        return 'var(--copper-500)';
      case 'soon':
        return 'var(--color-warning)';
      default:
        return 'var(--color-success)';
    }
  };

  const getStatusBg = () => {
    switch (status.status) {
      case 'overdue':
        return 'rgba(184, 119, 80, 0.1)';
      case 'soon':
        return 'rgba(255, 203, 125, 0.15)';
      default:
        return 'rgba(124, 184, 124, 0.1)';
    }
  };

  return (
    <div className="card-subtle p-5">
      <div className="flex items-center gap-3 mb-3">
        <div
          className="icon-container"
          style={{
            background: getStatusBg(),
            border: `1px solid ${getStatusColor()}`,
          }}
        >
          <Icon size={18} style={{ color: getStatusColor() }} />
        </div>
        <span className="text-label">{config.label}</span>
      </div>

      <p className="heading heading-md" style={{ color: getStatusColor() }}>
        {formatDaysAgo(status.days)}
      </p>

      {status.status === 'overdue' && (
        <p className="text-small mt-1" style={{ color: 'var(--copper-600)' }}>
          Overdue
        </p>
      )}
      {status.status === 'soon' && (
        <p className="text-small mt-1" style={{ color: 'var(--copper-500)' }}>
          Due soon
        </p>
      )}
      {status.status === 'good' && (
        <p className="text-small mt-1 text-muted">On track</p>
      )}
    </div>
  );
}
