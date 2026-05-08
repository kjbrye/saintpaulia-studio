/**
 * ReviewStep
 *
 * Full per-row review with selection, reorder, and the over-capacity
 * banner if the file exceeds the user's plan limit.
 */

import { ArrowLeft, ArrowRight } from 'lucide-react';
import RowReviewTable from './RowReviewTable';
import OverCapacityBanner from './OverCapacityBanner';

export default function ReviewStep({
  processed,
  selectedKeys,
  onSelectionChange,
  onReorder,
  capacity,
  overCapacity,
  totalRows,
  onBack,
  onContinue,
}) {
  const canContinue = selectedKeys.size > 0;

  return (
    <div className="space-y-5">
      {overCapacity && (
        <OverCapacityBanner
          availableCapacity={capacity.availableCapacity}
          totalRows={totalRows}
          maxPlants={capacity.maxPlants}
        />
      )}

      <RowReviewTable
        rows={processed}
        selectedKeys={selectedKeys}
        onSelectionChange={onSelectionChange}
        onReorder={onReorder}
        availableCapacity={capacity?.availableCapacity}
      />

      <div className="flex justify-between flex-wrap gap-3">
        <button type="button" className="btn btn-secondary" onClick={onBack}>
          <ArrowLeft size={18} /> Back
        </button>
        <button
          type="button"
          className="btn btn-primary"
          disabled={!canContinue}
          onClick={onContinue}
        >
          Review {selectedKeys.size} {selectedKeys.size === 1 ? 'plant' : 'plants'}{' '}
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}
