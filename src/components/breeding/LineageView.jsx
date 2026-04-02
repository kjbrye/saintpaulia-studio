/**
 * LineageView - Simple list view of parent-child relationships for a cross
 *
 * Shows the parents and any offspring linked to the cross.
 * Future iteration: tree visualization.
 */

import { Link } from 'react-router-dom';
import { GitBranch, ArrowRight, X } from 'lucide-react';

export default function LineageView({ cross, onRemoveOffspring, isPending }) {
  const podName =
    cross.pod_parent?.cultivar_name ||
    cross.pod_parent?.nickname ||
    cross.pod_parent_name ||
    'Unknown';
  const pollenName =
    cross.pollen_parent?.cultivar_name ||
    cross.pollen_parent?.nickname ||
    cross.pollen_parent_name ||
    'Unknown';

  const offspring = cross.offspring || [];

  return (
    <div className="space-y-4">
      {/* Parents */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="card-subtle p-3 flex-1 min-w-0">
          <p className="text-label text-muted mb-1">Pod Parent (♀)</p>
          {cross.pod_parent_id ? (
            <Link
              to={`/plants/${cross.pod_parent_id}`}
              className="heading heading-sm hover:underline"
              style={{ color: 'var(--purple-400)' }}
            >
              {podName}
            </Link>
          ) : (
            <p className="heading heading-sm">{podName}</p>
          )}
        </div>

        <span className="text-[var(--purple-400)] text-lg font-bold">×</span>

        <div className="card-subtle p-3 flex-1 min-w-0">
          <p className="text-label text-muted mb-1">Pollen Parent (♂)</p>
          {cross.pollen_parent_id ? (
            <Link
              to={`/plants/${cross.pollen_parent_id}`}
              className="heading heading-sm hover:underline"
              style={{ color: 'var(--purple-400)' }}
            >
              {pollenName}
            </Link>
          ) : (
            <p className="heading heading-sm">{pollenName}</p>
          )}
        </div>
      </div>

      {/* Arrow */}
      {offspring.length > 0 && (
        <div className="flex justify-center">
          <ArrowRight size={20} className="text-[var(--text-muted)] rotate-90" />
        </div>
      )}

      {/* Offspring */}
      {offspring.length > 0 ? (
        <div className="space-y-2">
          <div className="flex items-center gap-2 mb-2">
            <GitBranch size={16} style={{ color: 'var(--purple-400)' }} />
            <span className="text-label font-semibold" style={{ color: 'var(--sage-700)' }}>
              Offspring ({offspring.length})
            </span>
          </div>
          {offspring.map((o) => (
            <div key={o.id} className="card-subtle p-3 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <Link
                  to={`/plants/${o.plant?.id || o.plant_id}`}
                  className="heading heading-sm hover:underline truncate"
                  style={{ color: 'var(--purple-400)' }}
                >
                  {o.plant?.cultivar_name || o.plant?.nickname || 'Unknown plant'}
                </Link>
                {o.notes && <p className="text-small text-muted mt-0.5">{o.notes}</p>}
              </div>
              {onRemoveOffspring && (
                <button
                  className="icon-container flex-shrink-0"
                  onClick={() => onRemoveOffspring(o.id)}
                  disabled={isPending}
                  title="Remove offspring"
                >
                  <X size={14} style={{ color: 'var(--sage-500)' }} />
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-small text-muted text-center py-4">No offspring recorded yet</p>
      )}
    </div>
  );
}
