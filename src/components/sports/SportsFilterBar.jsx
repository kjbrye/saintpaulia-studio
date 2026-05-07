/**
 * SportsFilterBar - Filters for the Sports list page (stability + parent).
 */

import { STABILITY_STATUSES } from '../../utils/sportVocabulary';

export default function SportsFilterBar({
  stabilityFilter,
  parentFilter,
  parentOptions,
  onChange,
  onClear,
}) {
  const hasActiveFilter = stabilityFilter !== 'all' || parentFilter;

  return (
    <div className="card-subtle p-4 mb-6 flex flex-wrap items-center gap-3">
      <label className="text-small font-semibold" style={{ color: 'var(--sage-700)' }}>
        Stability
      </label>
      <select
        className="input"
        style={{ minWidth: 180 }}
        value={stabilityFilter}
        onChange={(e) => onChange('stability', e.target.value)}
      >
        <option value="all">All</option>
        {STABILITY_STATUSES.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>

      {parentOptions.length > 1 && (
        <>
          <label className="text-small font-semibold" style={{ color: 'var(--sage-700)' }}>
            Parent
          </label>
          <select
            className="input"
            style={{ minWidth: 200 }}
            value={parentFilter}
            onChange={(e) => onChange('parent', e.target.value)}
          >
            <option value="">All parents</option>
            {parentOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </>
      )}

      {hasActiveFilter && (
        <button type="button" className="btn btn-secondary btn-small" onClick={onClear}>
          Clear
        </button>
      )}
    </div>
  );
}
