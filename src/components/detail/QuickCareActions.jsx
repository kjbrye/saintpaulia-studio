/**
 * QuickCareActions - Buttons to quickly log care actions
 */

import { Droplets, Sparkles, Scissors, Check, Loader2, ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

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
    hasOptions: true,
  },
  grooming: {
    icon: Scissors,
    label: 'Groom',
    activeLabel: 'Groomed',
  },
};

const FERTILIZER_OPTIONS = [
  { value: 'balanced', label: 'Balanced (20-20-20)' },
  { value: 'bloom', label: 'Bloom Booster' },
  { value: 'foliage', label: 'Foliage/Growth' },
  { value: 'organic', label: 'Organic' },
  { value: 'slow_release', label: 'Slow Release' },
  { value: 'other', label: 'Other' },
];

function CareButton({ careType, onLog, isLoading, recentlyLogged }) {
  const [showOptions, setShowOptions] = useState(false);
  const optionsRef = useRef(null);
  const config = careConfig[careType];
  const Icon = config.icon;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (optionsRef.current && !optionsRef.current.contains(e.target)) {
        setShowOptions(false);
      }
    };

    if (showOptions) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showOptions]);

  const handleButtonClick = () => {
    if (config.hasOptions) {
      setShowOptions(!showOptions);
    } else {
      onLog(careType);
    }
  };

  const handleOptionSelect = (fertilizerType) => {
    setShowOptions(false);
    onLog(careType, fertilizerType);
  };

  if (recentlyLogged) {
    return (
      <button className="btn btn-secondary flex-1" disabled>
        <Check size={18} style={{ color: 'var(--color-success)' }} />
        {config.activeLabel}
      </button>
    );
  }

  return (
    <div className="relative flex-1" ref={optionsRef}>
      <button
        className="btn btn-secondary w-full"
        onClick={handleButtonClick}
        disabled={isLoading}
      >
        {isLoading ? (
          <Loader2 size={18} className="animate-spin" />
        ) : (
          <Icon size={18} />
        )}
        {config.label}
        {config.hasOptions && <ChevronDown size={14} />}
      </button>

      {/* Fertilizer Options Dropdown */}
      {showOptions && (
        <div className="absolute top-full left-0 right-0 mt-2 z-10">
          <div className="card p-2 shadow-lg">
            <p className="text-xs text-muted px-3 py-1 mb-1">Select fertilizer type</p>
            {FERTILIZER_OPTIONS.map(option => (
              <button
                key={option.value}
                onClick={() => handleOptionSelect(option.value)}
                className="w-full text-left px-3 py-2 text-small rounded-lg transition-colors"
                style={{ ':hover': { background: 'var(--sage-100)' } }}
                onMouseEnter={(e) => e.target.style.background = 'var(--sage-100)'}
                onMouseLeave={(e) => e.target.style.background = 'transparent'}
              >
                {option.label}
              </button>
            ))}
            <div style={{ borderTop: '1px solid var(--sage-200)', marginTop: '4px', paddingTop: '4px' }}>
              <button
                onClick={() => handleOptionSelect(null)}
                className="w-full text-left px-3 py-2 text-small text-muted rounded-lg transition-colors"
                onMouseEnter={(e) => e.target.style.background = 'var(--sage-100)'}
                onMouseLeave={(e) => e.target.style.background = 'transparent'}
              >
                Skip / Not sure
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function QuickCareActions({ plantId, onLogCare, isPending }) {
  const [recentlyLogged, setRecentlyLogged] = useState({});
  const [loadingType, setLoadingType] = useState(null);

  const handleLog = async (careType, fertilizerType = null) => {
    setLoadingType(careType);
    try {
      await onLogCare({ plantId, careType, notes: '', fertilizerType });
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
