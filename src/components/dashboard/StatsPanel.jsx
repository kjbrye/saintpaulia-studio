/**
 * StatsPanel - Command center panel showing key collection statistics
 */

import { Link } from 'react-router-dom';
import { Flower2, Sparkles, Heart, TrendingUp } from 'lucide-react';

function StatBox({ value, label, color = 'var(--sage-700)', icon: Icon }) {
  return (
    <div className="stat-box">
      {Icon && <Icon size={16} style={{ color, marginBottom: 4 }} />}
      <span className="stat-box-value" style={{ color }}>{value}</span>
      <span className="stat-box-label">{label}</span>
    </div>
  );
}

function HealthBar({ percentage }) {
  const getColor = (pct) => {
    if (pct >= 80) return 'var(--sage-500)';
    if (pct >= 50) return 'var(--copper-400)';
    return 'var(--copper-600)';
  };

  return (
    <div className="mt-4">
      <div className="flex justify-between items-center mb-2">
        <span className="text-small font-medium" style={{ color: 'var(--sage-700)' }}>
          Collection Health
        </span>
        <span className="text-small font-bold" style={{ color: getColor(percentage) }}>
          {percentage}%
        </span>
      </div>
      <div className="h-2 rounded-full bg-[var(--sage-200)] overflow-hidden">
        <div
          className="h-full transition-all duration-500"
          style={{
            width: `${percentage}%`,
            background: getColor(percentage),
          }}
        />
      </div>
    </div>
  );
}

export default function StatsPanel({ totalPlants, bloomingCount, needsCareCount, healthPercentage }) {
  return (
    <div className="panel panel-stats panel-wide">
      <div className="panel-header">
        <span className="panel-title">Collection Overview</span>
        <Link
          to="/library"
          className="text-small font-semibold"
          style={{ color: 'var(--sage-600)' }}
        >
          View all
        </Link>
      </div>
      <div className="panel-content">
        <div className="flex gap-4 flex-wrap">
          <StatBox value={totalPlants} label="Plants" icon={Flower2} />
          <StatBox
            value={bloomingCount}
            label="Blooming"
            color="var(--purple-500)"
            icon={Sparkles}
          />
          <StatBox
            value={needsCareCount}
            label="Need Care"
            color="var(--copper-500)"
            icon={Heart}
          />
        </div>
        <HealthBar percentage={healthPercentage} />
      </div>
    </div>
  );
}
