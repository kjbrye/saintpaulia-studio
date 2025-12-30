/**
 * QuickCareActions - Buttons to quickly log care actions
 */

import { Droplets, Sparkles, Scissors, Check, Loader2 } from 'lucide-react';
import { useState } from 'react';

const careConfig = {
  watering: {
    icon: Droplets,
    label: 'Water',
    activeLabel: 'Watered',
  },
  fertilizing: {
    icon: Sparkles,
    label: 'Fertilize',
    activeLabel: 'Fertilized',
  },
  grooming: {
    icon: Scissors,
    label: 'Groom',
    activeLabel: 'Groomed',
  },
};

function CareButton({ careType, onLog, isLoading, recentlyLogged }) {
  const config = careConfig[careType];
  const Icon = config.icon;

  if (recentlyLogged) {
    return (
      <button className="btn btn-secondary flex-1" disabled>
        <Check size={18} style={{ color: 'var(--color-success)' }} />
        {config.activeLabel}
      </button>
    );
  }

  return (
    <button
      className="btn btn-secondary flex-1"
      onClick={() => onLog(careType)}
      disabled={isLoading}
    >
      {isLoading ? (
        <Loader2 size={18} className="animate-spin" />
      ) : (
        <Icon size={18} />
      )}
      {config.label}
    </button>
  );
}

export default function QuickCareActions({ plantId, onLogCare, isPending }) {
  const [recentlyLogged, setRecentlyLogged] = useState({});
  const [loadingType, setLoadingType] = useState(null);

  const handleLog = async (careType) => {
    setLoadingType(careType);
    try {
      await onLogCare({ plantId, careType, notes: '' });
      setRecentlyLogged((prev) => ({ ...prev, [careType]: true }));
      // Reset after 3 seconds
      setTimeout(() => {
        setRecentlyLogged((prev) => ({ ...prev, [careType]: false }));
      }, 3000);
    } finally {
      setLoadingType(null);
    }
  };

  return (
    <div className="card p-6 mb-6">
      <h2 className="heading heading-md mb-4">Quick Care</h2>
      <div className="flex flex-col sm:flex-row gap-3">
        <CareButton
          careType="watering"
          onLog={handleLog}
          isLoading={loadingType === 'watering' || isPending}
          recentlyLogged={recentlyLogged.watering}
        />
        <CareButton
          careType="fertilizing"
          onLog={handleLog}
          isLoading={loadingType === 'fertilizing' || isPending}
          recentlyLogged={recentlyLogged.fertilizing}
        />
        <CareButton
          careType="grooming"
          onLog={handleLog}
          isLoading={loadingType === 'grooming' || isPending}
          recentlyLogged={recentlyLogged.grooming}
        />
      </div>
    </div>
  );
}
