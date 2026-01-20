/**
 * CareOverviewPanel - Visual summary of collection care status
 * Shows circular health indicator and per-care-type progress bars
 */

import { Droplets, Sparkles, Scissors } from 'lucide-react';

const CARE_ICONS = {
  watering: Droplets,
  fertilizing: Sparkles,
  grooming: Scissors,
};

const CARE_LABELS = {
  watering: 'Watering',
  fertilizing: 'Fertilizing',
  grooming: 'Grooming',
};

function CircularProgress({ percentage, healthyCount, totalPlants }) {
  const radius = 70;
  const strokeWidth = 8;
  const normalizedRadius = radius - strokeWidth / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const getColor = (pct) => {
    if (pct >= 80) return 'var(--sage-500)';
    if (pct >= 50) return 'var(--copper-400)';
    return 'var(--copper-600)';
  };

  return (
    <div className="care-overview-circle">
      <svg width={radius * 2} height={radius * 2}>
        {/* Background circle */}
        <circle
          stroke="var(--sage-200)"
          fill="transparent"
          strokeWidth={strokeWidth}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        {/* Progress circle */}
        <circle
          stroke={getColor(percentage)}
          fill="transparent"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
          style={{
            transform: 'rotate(-90deg)',
            transformOrigin: '50% 50%',
            transition: 'stroke-dashoffset 0.5s ease',
          }}
        />
      </svg>
      <div className="care-overview-circle-content">
        <span className="care-overview-percentage" style={{ color: getColor(percentage) }}>
          {percentage}%
        </span>
      </div>
      <div className="care-overview-circle-label">
        <span className="care-overview-health-label">Collection Health</span>
        <span className="care-overview-count">{healthyCount} of {totalPlants} plants</span>
      </div>
    </div>
  );
}

function CareProgressBar({ careType, upToDate, total }) {
  const Icon = CARE_ICONS[careType];
  const label = CARE_LABELS[careType];
  const percentage = total > 0 ? (upToDate / total) * 100 : 100;

  return (
    <div className="care-progress-row">
      <div className="care-progress-header">
        <div className="care-progress-label">
          <Icon size={18} style={{ color: 'var(--copper-500)' }} />
          <span>{label}</span>
        </div>
        <span className="care-progress-count">{upToDate} of {total} up to date</span>
      </div>
      <div className="care-progress-bar-track">
        <div
          className="care-progress-bar-fill"
          style={{ width: `${percentage}%` }}
        />
        <div
          className="care-progress-bar-remaining"
          style={{ width: `${100 - percentage}%` }}
        />
      </div>
    </div>
  );
}

function CareTip({ mostNeglectedCareType }) {
  if (!mostNeglectedCareType) {
    return (
      <div className="care-overview-tip care-overview-tip-success">
        <Sparkles size={18} style={{ color: 'var(--sage-600)', flexShrink: 0 }} />
        <span>Great job! Your collection is well cared for.</span>
      </div>
    );
  }

  const careLabel = CARE_LABELS[mostNeglectedCareType].toLowerCase();
  const Icon = CARE_ICONS[mostNeglectedCareType];

  return (
    <div className="care-overview-tip">
      <Icon size={18} style={{ color: 'var(--copper-500)', flexShrink: 0 }} />
      <span>Focus on {careLabel} to get back on track.</span>
    </div>
  );
}

export default function CareOverviewPanel({ stats }) {
  const { totalPlants, healthyCount, healthPercentage, careBreakdown, mostNeglectedCareType } = stats;

  // Calculate "up to date" counts (good + soon, not overdue)
  const getUpToDateCount = (breakdown) => breakdown.good + breakdown.soon;

  return (
    <div className="panel panel-wide care-overview-panel">
      <h2 className="care-overview-title">Care Overview</h2>

      <div className="care-overview-content">
        <CircularProgress
          percentage={healthPercentage}
          healthyCount={healthyCount}
          totalPlants={totalPlants}
        />

        <div className="care-progress-list">
          <CareProgressBar
            careType="watering"
            upToDate={getUpToDateCount(careBreakdown.watering)}
            total={totalPlants}
          />
          <CareProgressBar
            careType="fertilizing"
            upToDate={getUpToDateCount(careBreakdown.fertilizing)}
            total={totalPlants}
          />
          <CareProgressBar
            careType="grooming"
            upToDate={getUpToDateCount(careBreakdown.grooming)}
            total={totalPlants}
          />
        </div>
      </div>

      <CareTip mostNeglectedCareType={mostNeglectedCareType} />
    </div>
  );
}
