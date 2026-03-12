/**
 * PropagationStatsPanel - Success rates by method and parent plant
 */

import { Leaf, TrendingUp } from 'lucide-react';
import { METHOD_LABELS } from './PropagationCard';

export default function PropagationStatsPanel({ stats }) {
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
        <StatBox label="Complete" value={stats.complete} color="var(--color-success)" />
        <StatBox label="Success Rate" value={stats.successRate !== null ? `${stats.successRate}%` : '—'} color="var(--color-success)" />
      </div>

      {stats.totalPlantlets > 0 && (
        <div className="flex items-center gap-2 mb-5 p-3 rounded-lg" style={{ background: 'var(--sage-50)' }}>
          <Leaf size={16} style={{ color: 'var(--color-success)' }} />
          <span className="text-small font-semibold" style={{ color: 'var(--sage-700)' }}>
            {stats.totalPlantlets} total plantlets produced
          </span>
        </div>
      )}

      {/* By Method */}
      {stats.methodStats.length > 1 && (
        <div className="mb-4">
          <h3 className="text-label font-semibold mb-2" style={{ color: 'var(--sage-700)' }}>
            By Method
          </h3>
          <div className="space-y-2">
            {stats.methodStats.map(m => (
              <div key={m.method} className="flex items-center justify-between text-small">
                <span style={{ color: 'var(--sage-700)' }}>
                  {METHOD_LABELS[m.method] || m.method}
                </span>
                <span className="text-muted">
                  {m.complete}/{m.total} complete
                  {m.successRate !== null && ` · ${m.successRate}%`}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* By Parent */}
      {stats.parentStats.length > 1 && (
        <div>
          <h3 className="text-label font-semibold mb-2" style={{ color: 'var(--sage-700)' }}>
            By Parent Plant
          </h3>
          <div className="space-y-2">
            {stats.parentStats.slice(0, 5).map(p => (
              <div key={p.name} className="flex items-center justify-between text-small">
                <span className="truncate mr-2" style={{ color: 'var(--sage-700)' }}>
                  {p.name}
                </span>
                <span className="text-muted flex-shrink-0">
                  {p.complete}/{p.total} complete
                  {p.successRate !== null && ` · ${p.successRate}%`}
                </span>
              </div>
            ))}
          </div>
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
