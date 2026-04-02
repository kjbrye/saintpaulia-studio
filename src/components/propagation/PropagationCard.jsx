/**
 * PropagationCard - Displays a single propagation project
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Scissors,
  Sprout,
  Leaf,
  Flower2,
  Check,
  X,
  Trash2,
  ChevronRight,
  Loader2,
  Plus,
  Minus,
} from 'lucide-react';
import { format } from 'date-fns';
import StageIndicator from './StageIndicator';

const PROPAGATION_STAGES = [
  { key: 'cutting', label: 'Cutting', icon: Scissors },
  { key: 'rooting', label: 'Rooting', icon: Sprout },
  { key: 'plantlets', label: 'Plantlets', icon: Leaf },
  { key: 'potted', label: 'Potted', icon: Flower2 },
  { key: 'complete', label: 'Complete', icon: Check },
];

const METHOD_LABELS = {
  water: 'Water',
  soil: 'Soil',
  sphagnum: 'Sphagnum',
  perlite: 'Perlite',
  other: 'Other',
};

export default function PropagationCard({
  propagation,
  onUpdate,
  onDelete,
  onComplete,
  isPending,
}) {
  const [showCompleteForm, setShowCompleteForm] = useState(false);
  const [plantName, setPlantName] = useState('');
  const [plantCount, setPlantCount] = useState(1);
  const [completeError, setCompleteError] = useState(null);

  const isFailed = propagation.stage === 'failed';
  const isComplete = propagation.stage === 'complete';
  const parentName =
    propagation.parent_plant?.cultivar_name ||
    propagation.parent_plant?.nickname ||
    propagation.parent_plant_name ||
    'Unknown parent';

  const currentIndex = PROPAGATION_STAGES.findIndex((s) => s.key === propagation.stage);
  const nextStage =
    !isComplete && !isFailed && currentIndex < PROPAGATION_STAGES.length - 1
      ? PROPAGATION_STAGES[currentIndex + 1]
      : null;

  const isReadyToComplete = nextStage?.key === 'complete';

  const handleAdvance = () => {
    if (isReadyToComplete) {
      setPlantName(`${parentName} propagation`);
      setPlantCount(Math.max(1, propagation.plantlet_count || 1));
      setShowCompleteForm(true);
    } else {
      onUpdate(propagation.id, { stage: nextStage.key });
    }
  };

  const handleComplete = async (e) => {
    e.preventDefault();
    if (!plantName.trim()) {
      setCompleteError('Please enter a name for the new plant');
      return;
    }
    try {
      await onComplete(propagation.id, plantName.trim(), plantCount, propagation);
      setShowCompleteForm(false);
    } catch {
      setCompleteError('Failed to complete propagation. Please try again.');
    }
  };

  const handlePlantletCount = (delta) => {
    const newCount = Math.max(0, (propagation.plantlet_count || 0) + delta);
    onUpdate(propagation.id, { plantlet_count: newCount });
  };

  return (
    <div className="card p-5">
      <div className="flex flex-col gap-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Link
              to={`/propagation/${propagation.id}`}
              className="heading heading-sm truncate hover:underline"
              style={{ color: 'var(--sage-800)' }}
            >
              {parentName} leaf
            </Link>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <span className="text-small text-muted">
                {format(new Date(propagation.cutting_date), 'MMM d, yyyy')}
              </span>
              {propagation.method && (
                <span className="badge">{METHOD_LABELS[propagation.method]} method</span>
              )}
              {isFailed && (
                <span
                  className="badge"
                  style={{ background: 'var(--color-error)', color: 'white' }}
                >
                  Failed
                </span>
              )}
              {isComplete && <span className="badge badge-success">Complete</span>}
            </div>
          </div>

          <button
            className="icon-container flex-shrink-0"
            onClick={() => onDelete(propagation.id)}
            disabled={isPending}
            title="Delete propagation"
          >
            <Trash2 size={16} style={{ color: 'var(--sage-500)' }} />
          </button>
        </div>

        {/* Stage indicator */}
        <StageIndicator
          currentStage={propagation.stage}
          stages={PROPAGATION_STAGES}
          failed={isFailed}
        />

        {/* Plantlet count editor */}
        {!isFailed && (
          <div className="flex items-center gap-3">
            <span className="text-small font-semibold" style={{ color: 'var(--sage-700)' }}>
              Plantlets:
            </span>
            <div className="flex items-center gap-1">
              <button
                className="icon-container"
                style={{ width: 28, height: 28 }}
                onClick={() => handlePlantletCount(-1)}
                disabled={isPending || (propagation.plantlet_count || 0) <= 0}
                title="Decrease"
              >
                <Minus size={12} style={{ color: 'var(--sage-600)' }} />
              </button>
              <span
                className="text-small font-bold w-6 text-center"
                style={{ color: 'var(--sage-800)' }}
              >
                {propagation.plantlet_count || 0}
              </span>
              <button
                className="icon-container"
                style={{ width: 28, height: 28 }}
                onClick={() => handlePlantletCount(1)}
                disabled={isPending}
                title="Increase"
              >
                <Plus size={12} style={{ color: 'var(--sage-600)' }} />
              </button>
            </div>
          </div>
        )}

        {/* Notes */}
        {propagation.notes && (
          <p className="text-small text-muted line-clamp-2">{propagation.notes}</p>
        )}

        {/* Complete form */}
        {showCompleteForm && (
          <form onSubmit={handleComplete} className="card-inset p-4 space-y-3">
            <p className="text-small font-semibold" style={{ color: 'var(--sage-700)' }}>
              Add {plantCount > 1 ? `${plantCount} plants` : 'this plant'} to your library
            </p>
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <input
                  type="text"
                  className={`input w-full ${completeError ? 'input-error' : ''}`}
                  placeholder={
                    plantCount > 1 ? 'Base name (e.g., Grace)' : 'Name for the new plant'
                  }
                  value={plantName}
                  onChange={(e) => {
                    setPlantName(e.target.value);
                    if (completeError) setCompleteError(null);
                  }}
                  autoFocus
                />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-small text-muted">×</span>
                <input
                  type="number"
                  className="input text-center"
                  style={{ width: 56 }}
                  min={1}
                  value={plantCount}
                  onChange={(e) => setPlantCount(Math.max(1, parseInt(e.target.value) || 1))}
                />
              </div>
            </div>
            {plantCount > 1 && (
              <p className="text-small text-muted">
                Plants will be named {plantName || 'Name'} #1, {plantName || 'Name'} #2, etc.
              </p>
            )}
            {completeError && (
              <p className="text-small" style={{ color: 'var(--color-error)' }}>
                {completeError}
              </p>
            )}
            <div className="flex items-center gap-2">
              <button type="submit" className="btn btn-primary btn-small" disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 size={14} className="animate-spin" /> Adding...
                  </>
                ) : (
                  <>
                    <Plus size={14} /> Complete &amp; Add{' '}
                    {plantCount > 1 ? `${plantCount} Plants` : 'to Library'}
                  </>
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
                {isReadyToComplete ? 'Complete Propagation' : `Advance to ${nextStage.label}`}
              </button>
            )}
            <button
              className="btn btn-secondary btn-small flex items-center gap-1.5"
              onClick={() => onUpdate(propagation.id, { stage: 'failed' })}
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

export { PROPAGATION_STAGES, METHOD_LABELS };
