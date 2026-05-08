/**
 * ConfirmStep
 *
 * Final "Are you sure?" before commit. Shows what's about to happen and
 * what won't be imported.
 */

import { ArrowLeft, Loader2 } from 'lucide-react';
import ImportSummary from './ImportSummary';

export default function ConfirmStep({
  filename,
  selectedCount,
  totalRows,
  isImporting,
  onBack,
  onConfirm,
}) {
  const unselectedCount = totalRows - selectedCount;
  return (
    <div className="space-y-5">
      <ImportSummary
        filename={filename}
        selectedCount={selectedCount}
        totalRows={totalRows}
        unselectedCount={unselectedCount}
      />
      <div className="flex justify-between">
        <button type="button" className="btn btn-secondary" disabled={isImporting} onClick={onBack}>
          <ArrowLeft size={18} /> Back
        </button>
        <button
          type="button"
          className="btn btn-primary flex items-center gap-2"
          onClick={onConfirm}
          disabled={isImporting || selectedCount === 0}
        >
          {isImporting ? (
            <>
              <Loader2 size={18} className="animate-spin" /> Importing…
            </>
          ) : (
            <>
              Import {selectedCount} {selectedCount === 1 ? 'plant' : 'plants'}
            </>
          )}
        </button>
      </div>
    </div>
  );
}
