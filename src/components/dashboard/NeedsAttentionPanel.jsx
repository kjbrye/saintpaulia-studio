/**
 * NeedsAttentionPanel - Command center panel showing plants needing care
 */

import { Link } from 'react-router-dom';
import { Droplets, Sparkles, Scissors, ChevronRight, AlertCircle } from 'lucide-react';

const CARE_ICONS = {
  watering: Droplets,
  fertilizing: Sparkles,
  grooming: Scissors,
};

function CareTypeCount({ careType, count }) {
  const Icon = CARE_ICONS[careType];
  const labels = {
    watering: 'water',
    fertilizing: 'fertilize',
    grooming: 'groom',
  };

  if (count === 0) return null;

  return (
    <div className="list-item-compact">
      <div className="care-indicator-dot care-indicator-dot-overdue" />
      <Icon size={16} style={{ color: 'var(--copper-500)' }} />
      <span className="flex-1 text-small font-medium" style={{ color: 'var(--sage-700)' }}>
        {count} need {labels[careType]}
      </span>
      <ChevronRight size={14} style={{ color: 'var(--sage-400)' }} />
    </div>
  );
}

export default function NeedsAttentionPanel({ plantsNeedingCare = [] }) {
  // Count by care type
  const counts = {
    watering: 0,
    fertilizing: 0,
    grooming: 0,
  };

  plantsNeedingCare.forEach(plant => {
    (plant.overdueCareTypes || []).forEach(type => {
      if (counts[type] !== undefined) {
        counts[type]++;
      }
    });
  });

  const totalNeedsCare = plantsNeedingCare.length;

  if (totalNeedsCare === 0) {
    return (
      <div className="panel panel-stats">
        <div className="panel-header">
          <span className="panel-title">Needs Attention</span>
        </div>
        <div className="panel-content flex items-center justify-center py-6">
          <div className="text-center">
            <div className="care-indicator-dot care-indicator-dot-good mx-auto mb-3" style={{ width: 12, height: 12 }} />
            <p className="text-small font-medium" style={{ color: 'var(--sage-600)' }}>
              All caught up!
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="panel panel-attention">
      <div className="panel-header">
        <span className="panel-title">Needs Attention</span>
        <span className="badge badge-warning">{totalNeedsCare}</span>
      </div>
      <div className="panel-content">
        <Link to="/library?filter=needs-care">
          <CareTypeCount careType="watering" count={counts.watering} />
        </Link>
        <Link to="/library?filter=needs-care">
          <CareTypeCount careType="fertilizing" count={counts.fertilizing} />
        </Link>
        <Link to="/library?filter=needs-care">
          <CareTypeCount careType="grooming" count={counts.grooming} />
        </Link>
      </div>
      <div className="panel-footer">
        <Link
          to="/library?filter=needs-care"
          className="text-small font-semibold flex items-center gap-1"
          style={{ color: 'var(--copper-600)' }}
        >
          View all plants needing care
          <ChevronRight size={14} />
        </Link>
      </div>
    </div>
  );
}
