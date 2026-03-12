/**
 * CrossCard - Displays a single breeding cross attempt
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Sprout, Leaf, Flower2, X, Trash2, ChevronRight, Package, Sun, Loader2, Plus, Minus } from 'lucide-react';
import { format } from 'date-fns';
import StageIndicator from '../propagation/StageIndicator';

const BREEDING_STAGES = [
  { key: 'pollinated', label: 'Pollinated', icon: Heart },
  { key: 'pod_forming', label: 'Pod Forming', icon: Package },
  { key: 'harvested', label: 'Harvested', icon: Leaf },
  { key: 'sown', label: 'Sown', icon: Sprout },
  { key: 'sprouted', label: 'Sprouted', icon: Sun },
  { key: 'blooming', label: 'Blooming', icon: Flower2 },
];

export default function CrossCard({ cross, onUpdate, onDelete, onComplete, isPending }) {
  const [showCompleteForm, setShowCompleteForm] = useState(false);
  const [plantName, setPlantName] = useState('');
  const [completeError, setCompleteError] = useState(null);

  const isFailed = cross.stage === 'failed';
  const isComplete = cross.stage === 'blooming';

  const podName = cross.pod_parent?.cultivar_name
    || cross.pod_parent?.nickname
    || cross.pod_parent_name
    || 'Unknown';
  const pollenName = cross.pollen_parent?.cultivar_name
    || cross.pollen_parent?.nickname
    || cross.pollen_parent_name
    || 'Unknown';

  const currentIndex = BREEDING_STAGES.findIndex(s => s.key === cross.stage);
  const nextStage = !isComplete && !isFailed && currentIndex < BREEDING_STAGES.length - 1
    ? BREEDING_STAGES[currentIndex + 1]
    : null;

  const isReadyToComplete = nextStage?.key === 'blooming';

  const handleAdvance = () => {
    if (isReadyToComplete) {
      setPlantName(`${podName} × ${pollenName}`);
      setShowCompleteForm(true);
    } else {
      onUpdate(cross.id, { stage: nextStage.key });
    }
  };

  const handleComplete = async (e) => {
    e.preventDefault();
    if (!plantName.trim()) {
      setCompleteError('Please enter a name for the new plant');
      return;
    }
    try {
      await onComplete(cross.id, plantName.trim(), cross);
      setShowCompleteForm(false);
    } catch {
      setCompleteError('Failed to complete cross. Please try again.');
    }
  };

  const handleCountChange = (field, delta) => {
    const newCount = Math.max(0, (cross[field] || 0) + delta);
    onUpdate(cross.id, { [field]: newCount });
  };

  // Show seed count editor after harvested, germination after sown
  const stageIndex = BREEDING_STAGES.findIndex(s => s.key === cross.stage);
  const showSeedCount = stageIndex >= 2; // harvested or later
  const showGerminationCount = stageIndex >= 3; // sown or later

  return (
    <div className="card p-5">
      <div className="flex flex-col gap-3">
        {/* Header - Cross notation */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Link
              to={`/breeding/${cross.id}`}
              className="heading heading-sm hover:underline"
              style={{ color: 'var(--sage-800)' }}
            >
              {podName}
              <span className="mx-2 text-[var(--purple-400)]">×</span>
              {pollenName}
            </Link>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <span className="text-small text-muted">
                {format(new Date(cross.cross_date), 'MMM d, yyyy')}
              </span>
              {isFailed && <span className="badge" style={{ background: 'var(--color-error)', color: 'white' }}>Failed</span>}
              {isComplete && <span className="badge badge-success">Blooming</span>}
            </div>
          </div>

          <button
            className="icon-container flex-shrink-0"
            onClick={() => onDelete(cross.id)}
            disabled={isPending}
            title="Delete cross"
          >
            <Trash2 size={16} style={{ color: 'var(--sage-500)' }} />
          </button>
        </div>

        {/* Stage indicator */}
        <StageIndicator
          currentStage={cross.stage}
          stages={BREEDING_STAGES}
          failed={isFailed}
        />

        {/* Inline count editors */}
        {!isFailed && (showSeedCount || showGerminationCount) && (
          <div className="flex flex-wrap items-center gap-4">
            {showSeedCount && (
              <CountEditor
                label="Seeds"
                value={cross.seed_count || 0}
                onIncrement={() => handleCountChange('seed_count', 1)}
                onDecrement={() => handleCountChange('seed_count', -1)}
                isPending={isPending}
              />
            )}
            {showGerminationCount && (
              <CountEditor
                label="Germinated"
                value={cross.germination_count || 0}
                onIncrement={() => handleCountChange('germination_count', 1)}
                onDecrement={() => handleCountChange('germination_count', -1)}
                isPending={isPending}
              />
            )}
          </div>
        )}

        {/* Goals */}
        {cross.goals && (
          <p className="text-small" style={{ color: 'var(--purple-400)' }}>
            Goal: {cross.goals}
          </p>
        )}

        {/* Notes */}
        {cross.notes && (
          <p className="text-small text-muted line-clamp-2">{cross.notes}</p>
        )}

        {/* Complete form */}
        {showCompleteForm && (
          <form onSubmit={handleComplete} className="card-inset p-4 space-y-3">
            <p className="text-small font-semibold" style={{ color: 'var(--sage-700)' }}>
              Add this hybrid to your library
            </p>
            <input
              type="text"
              className={`input w-full ${completeError ? 'input-error' : ''}`}
              placeholder="Name for the new hybrid"
              value={plantName}
              onChange={(e) => {
                setPlantName(e.target.value);
                if (completeError) setCompleteError(null);
              }}
              autoFocus
            />
            {completeError && (
              <p className="text-small" style={{ color: 'var(--color-error)' }}>{completeError}</p>
            )}
            <div className="flex items-center gap-2">
              <button type="submit" className="btn btn-primary btn-small" disabled={isPending}>
                {isPending ? (
                  <><Loader2 size={14} className="animate-spin" /> Adding...</>
                ) : (
                  <><Plus size={14} /> Blooming &amp; Add to Library</>
                )}
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-small"
                onClick={() => setShowCompleteForm(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Actions */}
        {!isComplete && !isFailed && !showCompleteForm && (
          <div className="flex items-center gap-2 mt-1">
            {nextStage && (
              <button
                className="btn btn-primary btn-small flex items-center gap-1.5"
                onClick={handleAdvance}
                disabled={isPending}
              >
                <ChevronRight size={14} />
                {isReadyToComplete ? 'Mark Blooming' : `Advance to ${nextStage.label}`}
              </button>
            )}
            <button
              className="btn btn-secondary btn-small flex items-center gap-1.5"
              onClick={() => onUpdate(cross.id, { stage: 'failed' })}
              disabled={isPending}
            >
              <X size={14} />
              Mark Failed
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function CountEditor({ label, value, onIncrement, onDecrement, isPending }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-small font-semibold" style={{ color: 'var(--sage-700)' }}>
        {label}:
      </span>
      <div className="flex items-center gap-1">
        <button
          className="icon-container"
          style={{ width: 28, height: 28 }}
          onClick={onDecrement}
          disabled={isPending || value <= 0}
          title="Decrease"
        >
          <Minus size={12} style={{ color: 'var(--sage-600)' }} />
        </button>
        <span
          className="text-small font-bold w-6 text-center"
          style={{ color: 'var(--sage-800)' }}
        >
          {value}
        </span>
        <button
          className="icon-container"
          style={{ width: 28, height: 28 }}
          onClick={onIncrement}
          disabled={isPending}
          title="Increase"
        >
          <Plus size={12} style={{ color: 'var(--sage-600)' }} />
        </button>
      </div>
    </div>
  );
}

export { BREEDING_STAGES };
