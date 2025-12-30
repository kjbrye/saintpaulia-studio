/**
 * PlantCareItem - Plant needing care in attention list
 */

import { Link } from 'react-router-dom';
import { Droplets, Scissors, Sparkles, ChevronRight } from 'lucide-react';

const careIcons = {
  watering: Droplets,
  fertilizing: Sparkles,
  grooming: Scissors,
};

export default function PlantCareItem({ id, nickname, cultivar_name, overdueCareTypes = [] }) {
  const displayName = nickname || cultivar_name || 'Unnamed Plant';
  const primaryCareType = overdueCareTypes[0];
  const CareIcon = primaryCareType ? careIcons[primaryCareType] : Droplets;

  const careLabels = {
    watering: 'Needs water',
    fertilizing: 'Needs fertilizer',
    grooming: 'Needs grooming',
  };

  return (
    <Link to={`/plants/${id}`}>
      <div className="card-subtle p-4 flex items-center gap-4">
        {/* Care icon in cream container */}
        <div className="icon-container-cream">
          <CareIcon size={22} style={{ color: 'var(--copper-500)' }} />
        </div>

        {/* Plant info */}
        <div className="flex-1 min-w-0">
          <p className="heading heading-md truncate">{displayName}</p>
          <p className="text-small text-muted">
            {overdueCareTypes.map(t => careLabels[t] || t).join(', ')}
          </p>
        </div>

        {/* Chevron */}
        <div className="icon-container icon-container-sm">
          <ChevronRight size={16} style={{ color: 'var(--sage-500)' }} />
        </div>
      </div>
    </Link>
  );
}
