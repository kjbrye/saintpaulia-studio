/**
 * BatchActionsToolbar - Toolbar for batch operations on selected plants
 */

import { useState } from 'react';
import { Droplets, Sparkles, Scissors, X, Check, Loader2 } from 'lucide-react';
import { useLogCare } from '../../hooks/useCare';

export default function BatchActionsToolbar({
  selectedIds = [],
  onClearSelection,
  onSelectAll,
  totalCount,
}) {
  const [isLogging, setIsLogging] = useState(false);
  const [loggedCareType, setLoggedCareType] = useState(null);
  const logCare = useLogCare();

  const handleBatchCare = async (careType) => {
    if (selectedIds.length === 0 || isLogging) return;

    setIsLogging(true);
    setLoggedCareType(careType);

    try {
      // Log care for each selected plant
      await Promise.all(
        selectedIds.map(plantId =>
          logCare.mutateAsync({ plantId, careType })
        )
      );

      // Clear selection after successful batch operation
      setTimeout(() => {
        onClearSelection();
        setIsLogging(false);
        setLoggedCareType(null);
      }, 1000);
    } catch (error) {
      console.error('Failed to log batch care:', error);
      setIsLogging(false);
      setLoggedCareType(null);
    }
  };

  if (selectedIds.length === 0) {
    return null;
  }

  return (
    <div className="batch-toolbar">
      <div className="flex items-center gap-3">
        {/* Selection info */}
        <div className="flex items-center gap-2">
          <button
            onClick={onClearSelection}
            className="p-1.5 rounded hover:bg-[var(--sage-200)] transition-colors"
            title="Clear selection"
          >
            <X size={16} style={{ color: 'var(--sage-600)' }} />
          </button>
          <span className="text-small font-semibold" style={{ color: 'var(--sage-700)' }}>
            {selectedIds.length} selected
          </span>
          {selectedIds.length < totalCount && (
            <button
              onClick={onSelectAll}
              className="text-small font-medium hover:underline"
              style={{ color: 'var(--sage-600)' }}
            >
              Select all {totalCount}
            </button>
          )}
        </div>

        {/* Divider */}
        <div className="w-px h-6 bg-[var(--sage-300)]" />

        {/* Batch actions */}
        <div className="flex items-center gap-2">
          <span className="text-small text-muted mr-1">Log care:</span>

          <button
            onClick={() => handleBatchCare('watering')}
            disabled={isLogging}
            className="batch-action-btn"
            title="Log watering for selected"
          >
            {isLogging && loggedCareType === 'watering' ? (
              <Check size={16} style={{ color: 'var(--color-success)' }} />
            ) : (
              <Droplets size={16} style={{ color: 'var(--sage-600)' }} />
            )}
            <span>Water</span>
          </button>

          <button
            onClick={() => handleBatchCare('fertilizing')}
            disabled={isLogging}
            className="batch-action-btn"
            title="Log fertilizing for selected"
          >
            {isLogging && loggedCareType === 'fertilizing' ? (
              <Check size={16} style={{ color: 'var(--color-success)' }} />
            ) : (
              <Sparkles size={16} style={{ color: 'var(--purple-400)' }} />
            )}
            <span>Fertilize</span>
          </button>

          <button
            onClick={() => handleBatchCare('grooming')}
            disabled={isLogging}
            className="batch-action-btn"
            title="Log grooming for selected"
          >
            {isLogging && loggedCareType === 'grooming' ? (
              <Check size={16} style={{ color: 'var(--color-success)' }} />
            ) : (
              <Scissors size={16} style={{ color: 'var(--copper-500)' }} />
            )}
            <span>Groom</span>
          </button>
        </div>
      </div>
    </div>
  );
}
