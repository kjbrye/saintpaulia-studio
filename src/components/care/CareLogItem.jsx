/**
 * CareLogItem - Single care log entry for the Care Log page
 * Shows care type, optional plant name, date/time, and notes
 */

import { Droplets, Scissors, Sparkles } from 'lucide-react';

const CARE_ICONS = {
  watering: Droplets,
  fertilizing: Sparkles,
  grooming: Scissors,
};

const CARE_COLORS = {
  watering: { icon: 'var(--sage-600)', bg: 'var(--sage-100)' },
  fertilizing: { icon: 'var(--purple-400)', bg: 'var(--purple-100)' },
  grooming: { icon: 'var(--copper-500)', bg: 'rgba(200, 141, 109, 0.15)' },
};

const CARE_LABELS = {
  watering: 'Watering',
  fertilizing: 'Fertilizing',
  grooming: 'Grooming',
};

export default function CareLogItem({ log, showPlantName = false, plantName }) {
  const Icon = CARE_ICONS[log.care_type] || Droplets;
  const colors = CARE_COLORS[log.care_type] || CARE_COLORS.watering;
  const label = CARE_LABELS[log.care_type] || 'Care';

  const date = new Date(log.care_date);
  const formattedDate = date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
  const formattedTime = date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });

  return (
    <div className="flex items-center gap-4 py-3">
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: colors.bg }}
      >
        <Icon size={20} style={{ color: colors.icon }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-body font-medium">
          {label}
          {showPlantName && plantName && (
            <span className="text-muted font-normal"> — {plantName}</span>
          )}
        </p>
        {log.notes && (
          <p className="text-small text-muted truncate">{log.notes}</p>
        )}
      </div>
      <div className="text-right flex-shrink-0">
        <p className="text-small" style={{ color: 'var(--sage-700)' }}>
          {formattedDate}
        </p>
        <p className="text-xs text-muted">{formattedTime}</p>
      </div>
    </div>
  );
}
