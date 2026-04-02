/**
 * Analytics Page - Insights into collection, care patterns, breeding, and propagation
 */

import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Flower2,
  Droplets,
  Sparkles,
  Scissors,
  Activity,
  TrendingUp,
  Sprout,
  Heart,
  Leaf,
} from 'lucide-react';
import { usePlants } from '../hooks/usePlants';
import { useCareLogs } from '../hooks/useCare';
import { usePropagations } from '../hooks/usePropagation';
import { useCrosses } from '../hooks/useBreeding';
import { useBloomLogs } from '../hooks/useBlooms';
import { useSettings } from '../hooks/useSettings.jsx';
import { getCollectionCareStats } from '../utils/careStatus';
import { getPropagationStats, getBreedingStats } from '../utils/propagationStats';

function StatCard({ icon: Icon, iconColor, label, value, sub }) {
  return (
    <div className="card p-5 flex items-center gap-4">
      <div className="icon-container" style={{ width: 44, height: 44, flexShrink: 0 }}>
        <Icon size={22} style={{ color: iconColor }} />
      </div>
      <div>
        <p className="heading heading-lg" style={{ lineHeight: 1 }}>
          {value}
        </p>
        <p className="text-small text-muted">{label}</p>
        {sub && (
          <p className="text-small" style={{ color: iconColor }}>
            {sub}
          </p>
        )}
      </div>
    </div>
  );
}

function HorizontalBar({ label, value, max, color }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="flex items-center gap-3 py-1.5">
      <span
        className="text-small w-24 text-right flex-shrink-0"
        style={{ color: 'var(--text-secondary)' }}
      >
        {label}
      </span>
      <div
        className="flex-1 h-5 rounded-full overflow-hidden"
        style={{ background: 'var(--sage-100)' }}
      >
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${Math.max(pct, pct > 0 ? 4 : 0)}%`, background: color }}
        />
      </div>
      <span className="text-small font-medium w-8 flex-shrink-0">{value}</span>
    </div>
  );
}

function CareBreakdownPanel({ careBreakdown, totalPlants }) {
  const types = [
    { key: 'watering', label: 'Watering', icon: Droplets, color: 'var(--sage-500)' },
    { key: 'fertilizing', label: 'Fertilizing', icon: Sparkles, color: 'var(--purple-400)' },
    { key: 'grooming', label: 'Grooming', icon: Scissors, color: 'var(--copper-500)' },
  ];

  return (
    <div className="card p-6">
      <h2 className="heading heading-md mb-4">Care Breakdown</h2>
      <div className="space-y-5">
        {types.map(({ key, label, icon: Icon, color }) => {
          const data = careBreakdown[key];
          return (
            <div key={key}>
              <div className="flex items-center gap-2 mb-2">
                <Icon size={16} style={{ color }} />
                <span className="text-body font-medium">{label}</span>
              </div>
              <HorizontalBar
                label="Good"
                value={data.good}
                max={totalPlants}
                color="var(--sage-500)"
              />
              <HorizontalBar
                label="Due soon"
                value={data.soon}
                max={totalPlants}
                color="var(--copper-400)"
              />
              <HorizontalBar
                label="Overdue"
                value={data.overdue}
                max={totalPlants}
                color="var(--color-error)"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StatusDistributionPanel({ plants }) {
  const statusCounts = useMemo(() => {
    const counts = { healthy: 0, recovering: 0, struggling: 0, dormant: 0 };
    plants.forEach((p) => {
      counts[p.status] = (counts[p.status] || 0) + 1;
    });
    return counts;
  }, [plants]);

  const statuses = [
    { key: 'healthy', label: 'Healthy', color: 'var(--sage-600)' },
    { key: 'recovering', label: 'Recovering', color: 'var(--purple-400)' },
    { key: 'struggling', label: 'Struggling', color: 'var(--copper-500)' },
    { key: 'dormant', label: 'Dormant', color: 'var(--sage-400)' },
  ];

  return (
    <div className="card p-6">
      <h2 className="heading heading-md mb-4">Plant Health</h2>
      {statuses.map(({ key, label, color }) => (
        <HorizontalBar
          key={key}
          label={label}
          value={statusCounts[key]}
          max={plants.length}
          color={color}
        />
      ))}
    </div>
  );
}

function PropagationPanel({ stats }) {
  if (!stats) {
    return (
      <div className="card p-6">
        <h2 className="heading heading-md mb-3">Propagation</h2>
        <p className="text-muted text-small">No propagations yet</p>
      </div>
    );
  }

  return (
    <div className="card p-6">
      <h2 className="heading heading-md mb-4">Propagation</h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
        <div className="card-inset p-3 text-center">
          <p className="heading heading-md">{stats.total}</p>
          <p className="text-small text-muted">Total</p>
        </div>
        <div className="card-inset p-3 text-center">
          <p className="heading heading-md">{stats.active}</p>
          <p className="text-small text-muted">Active</p>
        </div>
        <div className="card-inset p-3 text-center">
          <p className="heading heading-md" style={{ color: 'var(--sage-600)' }}>
            {stats.complete}
          </p>
          <p className="text-small text-muted">Complete</p>
        </div>
        <div className="card-inset p-3 text-center">
          <p className="heading heading-md">
            {stats.successRate != null ? `${stats.successRate}%` : '—'}
          </p>
          <p className="text-small text-muted">Success Rate</p>
        </div>
      </div>
      {stats.methodStats.length > 0 && (
        <>
          <h3 className="text-label mb-2">By Method</h3>
          {stats.methodStats.map((m) => (
            <HorizontalBar
              key={m.method}
              label={m.method}
              value={m.total}
              max={stats.total}
              color="var(--sage-500)"
            />
          ))}
        </>
      )}
      {stats.totalPlantlets > 0 && (
        <p className="text-small text-muted mt-3">
          {stats.totalPlantlets} total plantlet{stats.totalPlantlets !== 1 ? 's' : ''} produced
        </p>
      )}
    </div>
  );
}

function BreedingPanel({ stats }) {
  if (!stats) {
    return (
      <div className="card p-6">
        <h2 className="heading heading-md mb-3">Breeding</h2>
        <p className="text-muted text-small">No crosses yet</p>
      </div>
    );
  }

  return (
    <div className="card p-6">
      <h2 className="heading heading-md mb-4">Breeding</h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
        <div className="card-inset p-3 text-center">
          <p className="heading heading-md">{stats.total}</p>
          <p className="text-small text-muted">Crosses</p>
        </div>
        <div className="card-inset p-3 text-center">
          <p className="heading heading-md">{stats.active}</p>
          <p className="text-small text-muted">Active</p>
        </div>
        <div className="card-inset p-3 text-center">
          <p className="heading heading-md" style={{ color: 'var(--sage-600)' }}>
            {stats.blooming}
          </p>
          <p className="text-small text-muted">Blooming</p>
        </div>
        <div className="card-inset p-3 text-center">
          <p className="heading heading-md">
            {stats.successRate != null ? `${stats.successRate}%` : '—'}
          </p>
          <p className="text-small text-muted">Success Rate</p>
        </div>
      </div>
      {(stats.totalSeeds > 0 || stats.totalGerminated > 0) && (
        <div className="card-inset p-4">
          <div className="flex justify-between text-small">
            <span className="text-muted">Seeds harvested</span>
            <span className="font-medium">{stats.totalSeeds}</span>
          </div>
          <div className="flex justify-between text-small mt-1">
            <span className="text-muted">Germinated</span>
            <span className="font-medium">{stats.totalGerminated}</span>
          </div>
          {stats.germinationRate != null && (
            <div className="flex justify-between text-small mt-1">
              <span className="text-muted">Germination rate</span>
              <span className="font-medium" style={{ color: 'var(--sage-600)' }}>
                {stats.germinationRate}%
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function BloomPanel({ bloomLogs, plants }) {
  const stats = useMemo(() => {
    if (!bloomLogs.length) return null;

    const active = bloomLogs.filter((b) => !b.bloom_end_date).length;
    const total = bloomLogs.length;

    // Plants that have bloomed
    const plantIds = new Set(bloomLogs.map((b) => b.plant_id));
    const neverBloomed = plants.length - plantIds.size;

    // Average bloom duration (completed only)
    const completed = bloomLogs.filter((b) => b.bloom_end_date && b.bloom_start_date);
    let avgDuration = null;
    if (completed.length > 0) {
      const totalDays = completed.reduce((sum, b) => {
        const start = new Date(b.bloom_start_date);
        const end = new Date(b.bloom_end_date);
        return sum + Math.max(1, Math.round((end - start) / (1000 * 60 * 60 * 24)));
      }, 0);
      avgDuration = Math.round(totalDays / completed.length);
    }

    // Quality distribution
    const qualityCounts = {};
    bloomLogs.forEach((b) => {
      if (b.bloom_quality) {
        qualityCounts[b.bloom_quality] = (qualityCounts[b.bloom_quality] || 0) + 1;
      }
    });

    return {
      total,
      active,
      neverBloomed,
      avgDuration,
      qualityCounts,
      plantsBloomed: plantIds.size,
    };
  }, [bloomLogs, plants]);

  if (!stats) {
    return (
      <div className="card p-6">
        <h2 className="heading heading-md mb-3">Blooms</h2>
        <p className="text-muted text-small">No blooms recorded yet</p>
      </div>
    );
  }

  const qualityColors = {
    excellent: 'var(--sage-600)',
    good: 'var(--sage-500)',
    fair: 'var(--copper-400)',
    poor: 'var(--color-error)',
  };

  return (
    <div className="card p-6">
      <h2 className="heading heading-md mb-4">Blooms</h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
        <div className="card-inset p-3 text-center">
          <p className="heading heading-md">{stats.total}</p>
          <p className="text-small text-muted">Total Blooms</p>
        </div>
        <div className="card-inset p-3 text-center">
          <p className="heading heading-md" style={{ color: 'var(--purple-400)' }}>
            {stats.active}
          </p>
          <p className="text-small text-muted">Active Now</p>
        </div>
        <div className="card-inset p-3 text-center">
          <p className="heading heading-md">{stats.plantsBloomed}</p>
          <p className="text-small text-muted">Plants Bloomed</p>
        </div>
        <div className="card-inset p-3 text-center">
          <p className="heading heading-md">
            {stats.avgDuration != null ? `${stats.avgDuration}d` : '—'}
          </p>
          <p className="text-small text-muted">Avg Duration</p>
        </div>
      </div>
      {Object.keys(stats.qualityCounts).length > 0 && (
        <>
          <h3 className="text-label mb-2">Bloom Quality</h3>
          {['excellent', 'good', 'fair', 'poor'].map((q) =>
            stats.qualityCounts[q] ? (
              <HorizontalBar
                key={q}
                label={q.charAt(0).toUpperCase() + q.slice(1)}
                value={stats.qualityCounts[q]}
                max={stats.total}
                color={qualityColors[q]}
              />
            ) : null,
          )}
        </>
      )}
      {stats.neverBloomed > 0 && (
        <p className="text-small text-muted mt-3">
          {stats.neverBloomed} plant{stats.neverBloomed !== 1 ? 's' : ''} haven't bloomed yet
        </p>
      )}
    </div>
  );
}

export default function Analytics() {
  const { careThresholds } = useSettings();
  const { data: plants = [], isLoading: plantsLoading } = usePlants();
  const { data: careLogs = [] } = useCareLogs({ limit: 500 });
  const { data: propagations = [] } = usePropagations();
  const { data: crosses = [] } = useCrosses();
  const { data: bloomLogs = [] } = useBloomLogs({ limit: 500 });

  const careStats = useMemo(
    () => getCollectionCareStats(plants, careThresholds),
    [plants, careThresholds],
  );
  const propStats = useMemo(() => getPropagationStats(propagations), [propagations]);
  const breedingStats = useMemo(() => getBreedingStats(crosses), [crosses]);

  // Care activity by month (last 6 months)
  const monthlyActivity = useMemo(() => {
    const months = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
        label: d.toLocaleDateString('en-US', { month: 'short' }),
        count: 0,
      });
    }
    careLogs.forEach((log) => {
      const d = new Date(log.care_date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const month = months.find((m) => m.key === key);
      if (month) month.count++;
    });
    return months;
  }, [careLogs]);

  const maxMonthly = Math.max(...monthlyActivity.map((m) => m.count), 1);

  if (plantsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted">Loading analytics...</p>
      </div>
    );
  }

  const bloomingCount = plants.filter((p) => p.is_blooming).length;

  return (
    <div className="min-h-screen p-6 md:p-10">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <header className="flex items-center gap-4 mb-8">
          <Link to="/">
            <button className="icon-container">
              <ArrowLeft size={20} style={{ color: 'var(--sage-600)' }} />
            </button>
          </Link>
          <div>
            <h1 className="heading heading-xl">Analytics</h1>
            <p style={{ color: 'var(--text-secondary)' }}>Insights into your collection</p>
          </div>
        </header>

        {/* Top stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatCard
            icon={Leaf}
            iconColor="var(--sage-600)"
            label="Total Plants"
            value={plants.length}
          />
          <StatCard
            icon={Flower2}
            iconColor="var(--purple-400)"
            label="Blooming"
            value={bloomingCount}
          />
          <StatCard
            icon={Sprout}
            iconColor="var(--sage-500)"
            label="Propagations"
            value={propagations.length}
          />
          <StatCard
            icon={Heart}
            iconColor="var(--copper-500)"
            label="Crosses"
            value={crosses.length}
          />
        </div>

        {/* Care activity chart */}
        <div className="card p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={18} style={{ color: 'var(--sage-600)' }} />
            <h2 className="heading heading-md">Care Activity</h2>
            <span className="text-small text-muted ml-auto">Last 6 months</span>
          </div>
          <div className="flex items-end gap-2 h-32">
            {monthlyActivity.map((month) => (
              <div key={month.key} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-small font-medium" style={{ color: 'var(--text-secondary)' }}>
                  {month.count || ''}
                </span>
                <div
                  className="w-full rounded-t-md transition-all"
                  style={{
                    height: `${Math.max((month.count / maxMonthly) * 100, month.count > 0 ? 8 : 2)}%`,
                    background: month.count > 0 ? 'var(--sage-400)' : 'var(--sage-200)',
                    minHeight: 4,
                  }}
                />
                <span className="text-small text-muted">{month.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Two-column layout for detailed panels */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <CareBreakdownPanel
            careBreakdown={careStats.careBreakdown}
            totalPlants={careStats.totalPlants}
          />
          <StatusDistributionPanel plants={plants} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <BloomPanel bloomLogs={bloomLogs} plants={plants} />
          <PropagationPanel stats={propStats} />
        </div>

        <BreedingPanel stats={breedingStats} />
      </div>
    </div>
  );
}
