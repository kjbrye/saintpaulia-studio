/**
 * ResultStep
 *
 * Post-commit success view, including the undo button while the user is
 * still here. Once they navigate away, the batch will only be undoable
 * if it appears in a recent-imports panel (future work).
 */

import ImportSummary from './ImportSummary';
import UndoImportButton from './UndoImportButton';

export default function ResultStep({
  result,
  filename,
  selectedCount,
  totalRows,
  isRollingBack,
  onRollback,
  onDone,
  onImportAnother,
}) {
  const unselectedCount = totalRows - selectedCount;
  return (
    <div className="space-y-5">
      <ImportSummary
        filename={filename}
        selectedCount={selectedCount}
        totalRows={totalRows}
        unselectedCount={unselectedCount}
        result={result}
      />

      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex gap-3 flex-wrap">
          <button type="button" className="btn btn-primary" onClick={onDone}>
            View collection
          </button>
          <button type="button" className="btn btn-secondary" onClick={onImportAnother}>
            Import another file
          </button>
        </div>
        {result.successCount > 0 && (
          <UndoImportButton
            batchId={result.batch.id}
            plantCount={result.successCount}
            onRollback={onRollback}
            isPending={isRollingBack}
          />
        )}
      </div>
    </div>
  );
}
