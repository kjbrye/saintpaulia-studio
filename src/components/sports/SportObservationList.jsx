/**
 * SportObservationList - Chronological observation timeline for a sport.
 *
 * Each entry shows: observed date, trait_held badge, and notes.
 * Empty state encourages logging the first observation.
 */

import { format } from 'date-fns';
import { Check, X, Trash2 } from 'lucide-react';

export default function SportObservationList({ observations = [], onDelete, isPending }) {
  if (!observations.length) {
    return (
      <div className="card-inset p-5 text-center">
        <p className="text-small text-muted">
          No observations yet. Each bloom cycle you log helps determine whether the trait is
          stable.
        </p>
      </div>
    );
  }

  // Newest first for the timeline display
  const sorted = [...observations].sort(
    (a, b) => new Date(b.observed_date) - new Date(a.observed_date),
  );

  return (
    <ul className="space-y-2">
      {sorted.map((obs) => {
        const Icon = obs.trait_held ? Check : X;
        const tone = obs.trait_held
          ? { color: 'var(--sage-700)', bg: 'rgba(179, 208, 155, 0.2)' }
          : { color: 'var(--copper-600)', bg: 'rgba(255, 203, 125, 0.2)' };

        return (
          <li
            key={obs.id}
            className="list-item-compact"
            style={{ alignItems: 'flex-start' }}
          >
            <span
              className="flex items-center justify-center"
              style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                background: tone.bg,
                color: tone.color,
                flexShrink: 0,
              }}
            >
              <Icon size={14} />
            </span>

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-baseline gap-2">
                <span
                  className="text-small font-semibold"
                  style={{ color: 'var(--sage-800)' }}
                >
                  {format(new Date(obs.observed_date), 'MMM d, yyyy')}
                </span>
                <span className="text-small" style={{ color: tone.color }}>
                  {obs.trait_held ? 'Trait held' : 'Reverted'}
                </span>
              </div>
              {obs.notes && (
                <p className="text-small text-muted" style={{ marginTop: 2 }}>
                  {obs.notes}
                </p>
              )}
            </div>

            {onDelete && (
              <button
                type="button"
                className="icon-container"
                style={{ width: 30, height: 30 }}
                onClick={() => onDelete(obs.id)}
                disabled={isPending}
                title="Delete observation"
              >
                <Trash2 size={14} style={{ color: 'var(--sage-500)' }} />
              </button>
            )}
          </li>
        );
      })}
    </ul>
  );
}
