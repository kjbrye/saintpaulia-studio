/**
 * MappingPreview
 *
 * Sample rows shown after column mapping so the user can sanity-check
 * before moving to the full review step.
 */

import { PLANT_FIELDS, normalizeRow } from '../../utils/importMapping';

const PREVIEW_COUNT = 3;

export default function MappingPreview({ rows, mapping }) {
  const sample = rows.slice(0, PREVIEW_COUNT);
  if (!sample.length) return null;

  // Order columns by the PLANT_FIELDS list so the preview reads top-to-bottom
  // the same way the AddPlant form does.
  const usedFields = PLANT_FIELDS.filter((f) =>
    Object.values(mapping).includes(f.value),
  );

  if (!usedFields.length) {
    return (
      <div className="card-subtle p-4 text-small" style={{ color: 'var(--text-muted)' }}>
        Map at least one column to see a preview.
      </div>
    );
  }

  return (
    <div className="card p-6">
      <h3 className="heading heading-sm mb-2">Preview</h3>
      <p className="text-small mb-4" style={{ color: 'var(--text-muted)' }}>
        First {sample.length} {sample.length === 1 ? 'row' : 'rows'} as
        they&rsquo;ll be imported.
      </p>

      <div className="overflow-x-auto">
        <table className="w-full text-small">
          <thead>
            <tr>
              {usedFields.map((f) => (
                <th
                  key={f.value}
                  className="text-left px-3 py-2 font-semibold"
                  style={{
                    color: 'var(--sage-700)',
                    borderBottom: '1px solid var(--sage-200)',
                  }}
                >
                  {f.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sample.map((row, idx) => {
              const normalized = normalizeRow(row, mapping);
              return (
                <tr key={idx}>
                  {usedFields.map((f) => (
                    <td
                      key={f.value}
                      className="px-3 py-2"
                      style={{
                        color:
                          normalized[f.value] != null
                            ? 'var(--text-primary)'
                            : 'var(--text-muted)',
                        borderBottom: '1px solid var(--sage-200)',
                      }}
                    >
                      {normalized[f.value] ?? '—'}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
