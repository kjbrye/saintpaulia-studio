/**
 * ColumnMapper
 *
 * Lets the user adjust the auto-detected mapping between file columns and
 * plant fields. Each row: file column on the left, dropdown on the right.
 */

import { ArrowRight } from 'lucide-react';
import { PLANT_FIELDS } from '../../utils/importMapping';

const SKIP_VALUE = '__skip__';

export default function ColumnMapper({ columns, mapping, onChange }) {
  const claimed = new Set(Object.values(mapping).filter(Boolean));

  function setField(col, field) {
    const next = { ...mapping, [col]: field === SKIP_VALUE ? null : field };
    onChange(next);
  }

  return (
    <div className="card p-6">
      <h3 className="heading heading-sm mb-4">Map your columns</h3>
      <p className="text-small mb-6" style={{ color: 'var(--text-muted)' }}>
        We&rsquo;ve guessed where each column belongs. Adjust anything that
        looks off, or skip columns you don&rsquo;t want to import.
      </p>

      <div className="space-y-3">
        {columns.map((col) => {
          const current = mapping[col] ?? SKIP_VALUE;
          return (
            <div
              key={col}
              className="grid items-center gap-3"
              style={{ gridTemplateColumns: '1fr auto 1fr' }}
            >
              <div
                className="px-3 py-2 rounded font-semibold text-small truncate"
                style={{
                  background: 'rgba(255,255,255,0.4)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--sage-200)',
                }}
                title={col}
              >
                {col || <span style={{ color: 'var(--text-muted)' }}>(unnamed)</span>}
              </div>

              <ArrowRight size={16} style={{ color: 'var(--sage-500)' }} />

              <select
                className="input"
                value={current}
                onChange={(e) => setField(col, e.target.value)}
              >
                <option value={SKIP_VALUE}>— Don&rsquo;t import —</option>
                {PLANT_FIELDS.map((f) => {
                  const taken = claimed.has(f.value) && mapping[col] !== f.value;
                  return (
                    <option key={f.value} value={f.value} disabled={taken}>
                      {f.label}
                      {f.required ? ' *' : ''}
                      {taken ? ' (already mapped)' : ''}
                    </option>
                  );
                })}
              </select>
            </div>
          );
        })}
      </div>
    </div>
  );
}
