/**
 * PlantPreview Component
 *
 * Compact plant card for dashboard lists.
 */

import { forwardRef } from 'react';
import { Link } from 'react-router-dom';
import { Droplets, Scissors, Sparkles } from 'lucide-react';
import clsx from 'clsx';
import { getOverdueCareTypes } from '../../utils/careStatus';

const careIcons = {
  watering: { icon: Droplets, label: 'Needs water' },
  fertilizing: { icon: Sparkles, label: 'Needs fertilizer' },
  grooming: { icon: Scissors, label: 'Needs grooming' },
};

const PlantPreview = forwardRef(function PlantPreview({
  plant,
  needsCare = false,
  className,
  ...props
}, ref) {
  const displayName = plant.nickname || plant.cultivar_name || 'Unnamed Plant';
  const overdueCareTypes = needsCare ? getOverdueCareTypes(plant) : [];

  return (
    <Link to={`/plants/${plant.id}`} className="block">
      <div
        ref={ref}
        className={clsx(
          'card-interactive p-4 flex items-center gap-4',
          className
        )}
        {...props}
      >
        {/* Plant avatar */}
        <div className="w-12 h-12 rounded-xl bg-[var(--bg-inset)] flex items-center justify-center flex-shrink-0 overflow-hidden">
          {plant.photo_url ? (
            <img
              src={plant.photo_url}
              alt={displayName}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-2xl">🪻</span>
          )}
        </div>

        {/* Plant info */}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-[var(--text-primary)] truncate">
            {displayName}
          </p>
          {plant.cultivar_name && plant.nickname && (
            <p className="text-sm text-[var(--text-muted)] truncate">
              {plant.cultivar_name}
            </p>
          )}
        </div>

        {/* Care indicators */}
        {overdueCareTypes.length > 0 && (
          <div className="flex items-center gap-2 flex-shrink-0">
            {overdueCareTypes.map((type) => {
              const care = careIcons[type];
              if (!care) return null;
              const Icon = care.icon;
              return (
                <div
                  key={type}
                  className="w-8 h-8 rounded-lg bg-[var(--color-warning)] bg-opacity-20 flex items-center justify-center"
                  title={care.label}
                >
                  <Icon className="w-4 h-4 text-[var(--copper-600)]" />
                </div>
              );
            })}
          </div>
        )}

        {/* Healthy indicator */}
        {!needsCare && (
          <div
            className="status-dot status-dot-success flex-shrink-0"
            title="All care up to date"
          />
        )}
      </div>
    </Link>
  );
});

export default PlantPreview;
