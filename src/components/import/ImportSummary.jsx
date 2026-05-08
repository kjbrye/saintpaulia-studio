/**
 * ImportSummary
 *
 * Confirmation panel: used as the pre-commit "Are you sure?" view and
 * (with `result`) as the post-commit success view.
 */

import { CheckCircle2, AlertCircle, Sprout } from 'lucide-react';

export default function ImportSummary({
  filename,
  selectedCount,
  unselectedCount,
  result,
}) {
  if (!result) {
    return (
      <div className="card p-6">
        <h3 className="heading heading-sm mb-4">Import {selectedCount} plants?</h3>
        <ul className="space-y-2 text-small mb-4" style={{ color: 'var(--text-secondary)' }}>
          <li className="flex items-center gap-2">
            <Sprout size={16} style={{ color: 'var(--sage-600)' }} />
            <strong>{selectedCount}</strong>&nbsp;plants from <em>{filename}</em>
          </li>
          {unselectedCount > 0 && (
            <li className="flex items-start gap-2" style={{ color: 'var(--text-muted)' }}>
              <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
              <span>
                The {unselectedCount}&nbsp;{unselectedCount === 1 ? 'row' : 'rows'} you didn&rsquo;t select
                won&rsquo;t be imported. To add them later, import another file or add them manually.
              </span>
            </li>
          )}
        </ul>
        <p className="text-small" style={{ color: 'var(--text-muted)' }}>
          Imports are reversible — you&rsquo;ll be able to undo this on the next screen.
        </p>
      </div>
    );
  }

  const { successCount, errorCount, errors } = result;
  return (
    <div className="card p-6">
      <div className="flex items-center gap-3 mb-3">
        <CheckCircle2 size={28} style={{ color: 'var(--color-success)' }} />
        <h3 className="heading heading-sm">
          Imported {successCount} {successCount === 1 ? 'plant' : 'plants'}
        </h3>
      </div>
      <p className="text-small mb-4" style={{ color: 'var(--text-muted)' }}>
        From <em>{filename}</em>. {errorCount > 0 ? `${errorCount} couldn't be imported.` : 'No errors.'}
      </p>

      {errorCount > 0 && (
        <div
          className="rounded p-3 text-small mb-4"
          style={{
            background: 'rgba(216,100,100,0.10)',
            border: '1px solid var(--color-error)',
            color: 'var(--color-error)',
          }}
        >
          <p className="font-semibold mb-1">
            {errorCount} {errorCount === 1 ? 'plant' : 'plants'} couldn&rsquo;t be imported.
          </p>
          <p style={{ color: 'var(--text-secondary)' }}>
            {errors[0]?.message?.includes('limit')
              ? "You've reached your plan's plant limit. Upgrade to import more, or undo this import and select fewer plants."
              : (errors[0]?.message ?? 'Unexpected error.')}
          </p>
        </div>
      )}

      <p className="text-small" style={{ color: 'var(--text-muted)' }}>
        Total in this batch: {selectedCount}. {unselectedCount > 0
          ? `${unselectedCount} unselected rows were discarded.`
          : ''}
      </p>
    </div>
  );
}
