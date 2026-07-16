/**
 * CareOverviewCard
 *
 * Calm "ambient" view of collection care state. 110px ring chart shows
 * collection health percentage; three slim progress bars show watering,
 * fertilizing, and grooming up-to-date counts.
 *
 * Per the v0.2 spec, the old "Focus on..." nudges are intentionally
 * removed — the Today section above already surfaces those actions.
 */

import { Droplets, Scissors, Sparkles, Shovel } from 'lucide-react';

const CARE_META = {
  watering: { icon: Droplets, label: 'Watering' },
  fertilizing: { icon: Sparkles, label: 'Fertilizing' },
  grooming: { icon: Scissors, label: 'Grooming' },
  repotting: { icon: Shovel, label: 'Repotting' },
};

function HealthRing({ percentage }) {
  const size = 110;
  const stroke = 8;
  const radius = (size - stroke) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size}>
        <circle
          stroke="var(--sage-200)"
          fill="transparent"
          strokeWidth={stroke}
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <circle
          stroke="var(--copper-500)"
          fill="transparent"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={offset}
          r={radius}
          cx={size / 2}
          cy={size / 2}
          style={{
            transform: 'rotate(-90deg)',
            transformOrigin: '50% 50%',
            transition: 'stroke-dashoffset 0.5s ease',
          }}
        />
      </svg>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 28,
            fontWeight: 700,
            color: 'var(--sage-700)',
            lineHeight: 1,
          }}
        >
          {percentage}%
        </span>
        <span
          style={{
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: 0.6,
            textTransform: 'uppercase',
            color: 'var(--sage-600)',
            marginTop: 4,
          }}
        >
          On track
        </span>
      </div>
    </div>
  );
}

function CareBar({ careType, upToDate, total }) {
  const meta = CARE_META[careType];
  const Icon = meta.icon;
  const percentage = total > 0 ? Math.round((upToDate / total) * 100) : 100;

  return (
    <div>
      <div
        className="flex items-center justify-between"
        style={{ marginBottom: 6 }}
      >
        <div className="flex items-center gap-2">
          <Icon size={14} style={{ color: 'var(--copper-500)' }} />
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
            {meta.label}
          </span>
        </div>
        <span className="text-small text-muted">
          {upToDate} of {total}
        </span>
      </div>
      <div
        style={{
          height: 6,
          background: 'var(--sage-200)',
          borderRadius: 999,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${percentage}%`,
            height: '100%',
            background: 'var(--gradient-sage-primary)',
            borderRadius: 999,
            transition: 'width 0.5s ease',
          }}
        />
      </div>
    </div>
  );
}

export default function CareOverviewCard({ stats }) {
  if (!stats || stats.totalPlants === 0) return null;

  const { totalPlants, healthyCount, healthPercentage, careBreakdown } = stats;
  const upToDate = (b) => b.good + b.soon;

  return (
    <section
      style={{
        background: 'var(--gradient-sage-card)',
        border: 'var(--border-sage)',
        boxShadow: 'var(--shadow-sage-raised)',
        borderRadius: 'var(--radius-lg)',
        padding: 20,
        marginBottom: 24,
      }}
    >
      <div
        className="flex items-start justify-between"
        style={{ marginBottom: 16, gap: 12, flexWrap: 'wrap' }}
      >
        <h2 className="heading heading-md" style={{ margin: 0 }}>
          Care overview
        </h2>
        <p
          style={{
            fontFamily: 'var(--font-heading)',
            fontStyle: 'italic',
            fontSize: 14,
            color: 'var(--purple-500)',
            margin: 0,
          }}
        >
          {healthPercentage}% of your collection is up to date
        </p>
      </div>

      <div
        className="flex items-center gap-5"
        style={{ flexWrap: 'wrap' }}
      >
        <HealthRing percentage={healthPercentage} />
        <div style={{ flex: 1, minWidth: 220 }} className="space-y-3">
          <CareBar
            careType="watering"
            upToDate={upToDate(careBreakdown.watering)}
            total={totalPlants}
          />
          <CareBar
            careType="fertilizing"
            upToDate={upToDate(careBreakdown.fertilizing)}
            total={totalPlants}
          />
          <CareBar
            careType="grooming"
            upToDate={upToDate(careBreakdown.grooming)}
            total={totalPlants}
          />
          <CareBar
            careType="repotting"
            upToDate={upToDate(careBreakdown.repotting)}
            total={totalPlants}
          />
        </div>
      </div>

      <p className="text-small text-muted" style={{ marginTop: 16 }}>
        {healthyCount} of {totalPlants} plants are fully on track.
      </p>
    </section>
  );
}
