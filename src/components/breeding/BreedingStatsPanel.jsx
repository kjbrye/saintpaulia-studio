/**
 * BreedingStatsPanel - Success rates and germination statistics
 */

import { TrendingUp, Sprout } from 'lucide-react';

export default function BreedingStatsPanel({ stats }) {
  if (!stats) return null;

  return (
    <div className="card p-6">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp size={18} style={{ color: 'var(--purple-400)' }} />
        <h2 className="heading heading-md">Stats</h2>
      </div>

      {/* Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        <StatBox label="Total" value={stats.total} />
        <StatBox label="Active" value={stats.active} color="var(--purple-400)" />
        <StatBox label="Blooming" value={stats.blooming} color="var(--color-success)" />
        <StatBox label="Success Rate" value={stats.successRate !== null ? `${stats.successRate}%` : '—'} color="var(--color-success)" />
      </div>

      {/* Germination stats */}
      {(stats.totalSeeds > 0 || stats.totalGerminated > 0) && (
        <div className="p-3 rounded-lg space-y-2" style={{ background: 'var(--sage-50)' }}>
          <div className="flex items-center gap-2">
            <Sprout size={16} style={{ color: 'var(--color-success)' }} />
            <span className="text-label font-semibold" style={{ color: 'var(--sage-700)' }}>
              Germination
            </span>
          </div>
          <div className="flex items-center justify-between text-small">
            <span style={{ color: 'var(--sage-700)' }}>Total seeds</span>
            <span className="font-bold" style={{ color: 'var(--sage-800)' }}>{stats.totalSeeds}</span>
          </div>
          <div className="flex items-center justify-between text-small">
            <span style={{ color: 'var(--sage-700)' }}>Germinated</span>
            <span className="font-bold" style={{ color: 'var(--sage-800)' }}>{stats.totalGerminated}</span>
          </div>
          {stats.germinationRate !== null && (
            <div className="flex items-center justify-between text-small">
              <span style={{ color: 'var(--sage-700)' }}>Germination rate</span>
              <span className="font-bold" style={{ color: 'var(--color-success)' }}>{stats.germinationRate}%</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function StatBox({ label, value, color }) {
  return (
    <div className="text-center p-3 rounded-lg" style={{ background: 'var(--sage-50)' }}>
      <p className="heading heading-lg" style={color ? { color } : undefined}>{value}</p>
      <p className="text-small text-muted">{label}</p>
    </div>
  );
}
