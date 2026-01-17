/**
 * CareStatsSummary - Collection-wide care statistics with encouraging insights
 */

import { useMemo } from 'react';
import { Droplets, Sparkles, Scissors, TrendingUp, Award } from 'lucide-react';
import { getCollectionCareStats } from '../../utils/careStatus';

const CARE_CONFIG = {
  watering: { icon: Droplets, label: 'Watering', color: 'var(--sage-600)' },
  fertilizing: { icon: Sparkles, label: 'Fertilizing', color: 'var(--purple-400)' },
  grooming: { icon: Scissors, label: 'Grooming', color: 'var(--copper-500)' },
};

function HealthScoreRing({ percentage }) {
  // SVG circular progress
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const getColor = (pct) => {
    if (pct >= 80) return 'var(--sage-500)';
    if (pct >= 50) return 'var(--copper-400)';
    return 'var(--copper-600)';
  };

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width="100" height="100" className="transform -rotate-90">
        {/* Background ring */}
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke="var(--sage-200)"
          strokeWidth="8"
        />
        {/* Progress ring */}
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke={getColor(percentage)}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          style={{ transition: 'stroke-dashoffset 0.5s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold" style={{ color: getColor(percentage), fontFamily: 'var(--font-heading)' }}>
          {percentage}%
        </span>
      </div>
    </div>
  );
}

function CareTypeBar({ careType, stats, total }) {
  const config = CARE_CONFIG[careType];
  const Icon = config.icon;
  const goodPct = total > 0 ? (stats.good / total) * 100 : 0;
  const soonPct = total > 0 ? (stats.soon / total) * 100 : 0;
  const overduePct = total > 0 ? (stats.overdue / total) * 100 : 0;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon size={16} style={{ color: config.color }} />
          <span className="text-small font-medium" style={{ color: 'var(--sage-700)' }}>
            {config.label}
          </span>
        </div>
        <span className="text-small text-muted">
          {stats.good} of {total} up to date
        </span>
      </div>
      <div className="h-2 rounded-full bg-[var(--sage-100)] overflow-hidden flex">
        {goodPct > 0 && (
          <div
            className="h-full bg-[var(--sage-500)] transition-all"
            style={{ width: `${goodPct}%` }}
          />
        )}
        {soonPct > 0 && (
          <div
            className="h-full bg-[var(--copper-300)] transition-all"
            style={{ width: `${soonPct}%` }}
          />
        )}
        {overduePct > 0 && (
          <div
            className="h-full bg-[var(--copper-500)] transition-all"
            style={{ width: `${overduePct}%` }}
          />
        )}
      </div>
    </div>
  );
}

function getEncouragingMessage(stats) {
  if (stats.healthPercentage === 100) {
    return { icon: Award, text: "Perfect! All your plants are thriving.", color: 'var(--sage-600)' };
  }
  if (stats.healthPercentage >= 80) {
    return { icon: TrendingUp, text: "Great job! Most of your collection is well-cared for.", color: 'var(--sage-600)' };
  }
  if (stats.healthPercentage >= 50) {
    return { icon: TrendingUp, text: "Good progress! A few plants could use some attention.", color: 'var(--copper-500)' };
  }
  if (stats.mostNeglectedCareType) {
    const careLabel = CARE_CONFIG[stats.mostNeglectedCareType]?.label.toLowerCase();
    return { icon: Droplets, text: `Focus on ${careLabel} to get back on track.`, color: 'var(--copper-500)' };
  }
  return { icon: TrendingUp, text: "Let's catch up on some plant care!", color: 'var(--copper-500)' };
}

export default function CareStatsSummary({ plants = [], careThresholds }) {
  const stats = useMemo(
    () => getCollectionCareStats(plants, careThresholds),
    [plants, careThresholds]
  );

  const encouragement = getEncouragingMessage(stats);
  const EncouragementIcon = encouragement.icon;

  if (plants.length === 0) {
    return null;
  }

  return (
    <section className="card p-8">
      <h2 className="heading heading-lg mb-6">Care Overview</h2>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Left: Health Score */}
        <div className="flex flex-col items-center text-center md:pr-8 md:border-r md:border-[var(--sage-200)]">
          <HealthScoreRing percentage={stats.healthPercentage} />
          <p className="text-small font-medium mt-3" style={{ color: 'var(--sage-700)' }}>
            Collection Health
          </p>
          <p className="text-small text-muted">
            {stats.healthyCount} of {stats.totalPlants} plants
          </p>
        </div>

        {/* Right: Care Breakdown */}
        <div className="flex-1 space-y-4">
          <CareTypeBar
            careType="watering"
            stats={stats.careBreakdown.watering}
            total={stats.totalPlants}
          />
          <CareTypeBar
            careType="fertilizing"
            stats={stats.careBreakdown.fertilizing}
            total={stats.totalPlants}
          />
          <CareTypeBar
            careType="grooming"
            stats={stats.careBreakdown.grooming}
            total={stats.totalPlants}
          />
        </div>
      </div>

      {/* Encouraging message */}
      <div
        className="mt-6 p-4 rounded-xl flex items-center gap-3"
        style={{ background: 'var(--sage-100)' }}
      >
        <EncouragementIcon size={20} style={{ color: encouragement.color }} />
        <p className="text-body" style={{ color: encouragement.color }}>
          {encouragement.text}
        </p>
      </div>
    </section>
  );
}
