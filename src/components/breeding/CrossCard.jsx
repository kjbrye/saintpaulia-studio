/**
 * CrossCard - Displays a single breeding cross attempt with status badges and stage controls
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Sprout, Leaf, Flower2, X, Trash2, ChevronRight, Package, Sun, Loader2, Plus, Archive } from 'lucide-react';
import { format } from 'date-fns';
import StageIndicator from '../propagation/StageIndicator';
import StageAdvanceModal from './StageAdvanceModal';

const BREEDING_STAGES = [
  { key: 'pollinated', label: 'Pollinated', icon: Heart },
  { key: 'pod_forming', label: 'Pod Forming', icon: Package },
  { key: 'harvested', label: 'Harvested', icon: Leaf },
  { key: 'sown', label: 'Sown', icon: Sprout },
  { key: 'sprouted', label: 'Sprouted', icon: Sun },
  { key: 'blooming', label: 'Blooming', icon: Flower2 },
];

export default function CrossCard({ cross, onUpdate, onDelete, onComplete, onAdvance, onArchive, isPending }) {
  const [showCompleteForm, setShowCompleteForm] = useState(false);
  const [advanceTarget, setAdvanceTarget] = useState(null);
  const [plantName, setPlantName] = useState('');
  const [plantCount, setPlantCount] = useState(1);
  const [completeError, setCompleteError] = useState(null);

  // Use status column with fallback to stage-based logic
  const status = cross.status || (cross.stage === 'blooming' ? 'complete' : cross.stage === 'failed' ? 'failed' : 'active');
  const isFailed = status === 'failed';
  const isComplete = status === 'complete';
  const isArchived = status === 'archived';

  const podName = cross.pod_parent?.cultivar_name
    || cross.pod_parent?.nickname
    || cross.pod_parent_name
    || 'Unknown';
  const pollenName = cross.pollen_parent?.cultivar_name
    || cross.pollen_parent?.nickname
    || cross.pollen_parent_name
    || 'Unknown';

  const currentIndex = BREEDING_STAGES.findIndex(s => s.key === cross.stage);
  const nextStage = !isComplete && !isFailed && !isArchived && currentIndex < BREEDING_STAGES.length - 1
    ? BREEDING_STAGES[currentIndex + 1]
    : null;

  const isReadyToComplete = nextStage?.key === 'blooming';

  const handleAdvanceClick = () => {
    if (isReadyToComplete) {
      setPlantName(`${podName} × ${pollenName}`);
      setPlantCount(Math.max(1, cross.germination_count || 1));
      setShowCompleteForm(true);
    } else if (nextStage) {
      setAdvanceTarget(nextStage);
    }
  };

  const handleAdvanceConfirm = async ({ stage, notes, data }) => {
    if (onAdvance) {
      await onAdvance(cross.id, stage, { notes, data });
    } else {
      onUpdate(cross.id, { stage });
    }
    setAdvanceTarget(null);
  };

  const handleMarkFailed = () => {
    setAdvanceTarget({ key: 'failed', label: 'Failed', icon: X });
  };

  const handleFailConfirm = async ({ stage, notes, data }) => {
    if (onAdvance) {
      await onAdvance(cross.id, stage, { notes, data });
    } else {
      onUpdate(cross.id, { stage: 'failed' });
    }
    setAdvanceTarget(null);
  };

  const handleComplete = async (e) => {
    e.preventDefault();
    if (!plantName.trim()) {
      setCompleteError('Please enter a name for the new plant');
      return;
    }
    try {
      await onComplete(cross.id, plantName.trim(), plantCount, cross);
      setShowCompleteForm(false);
    } catch {
      setCompleteError('Failed to complete cross. Please try again.');
    }
  };

  // Show seed count after harvested, germination after sown
  const stageIndex = BREEDING_STAGES.findIndex(s => s.key === cross.stage);
  const showSeedCount = stageIndex >= 2;
  const showGerminationCount = stageIndex >= 3;

  const statusBadge = isArchived
    ? { label: 'Archived', style: { background: 'var(--sage-200)', color: 'var(--sage-700)' } }
    : isFailed
    ? { label: 'Failed', style: { background: 'var(--color-error)', color: 'white' } }
    : isComplete
    ? { label: 'Complete', style: { background: 'var(--color-success)', color: 'white' } }
    : null;

  return (
    <div className="card p-5" style={isArchived ? { opacity: 0.7 } : undefined}>
      <div className="flex flex-col gap-3">
        {/* Header - Cross notation */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <Link
                to={`/breeding/${cross.id}`}
                className="heading heading-sm hover:underline"
                style={{ color: 'var(--sage-800)' }}
              >
                {podName}
                <span className="mx-2 text-[var(--purple-400)]">×</span>
                {pollenName}
              </Link>
              {statusBadge && (
                <span className="badge" style={statusBadge.style}>{statusBadge.label}</span>
              )}
            </div>
            <span className="text-small text-muted">
              {format(new Date(cross.cross_date), 'MMM d, yyyy')}
            </span>
          </div>

          <div className="flex items-center gap-1 flex-shrink-0">
            {(isComplete || isFailed) && !isArchived && onArchive && (
              <button
                className="icon-container"
                onClick={() => onArchive(cross.id)}
                disabled={isPending}
                title="Archive cross"
              >
                <Archive size={16} style={{ color: 'var(--sage-500)' }} />
              </button>
            )}
            <button
              className="icon-container"
              onClick={() => onDelete(cross.id)}
              disabled={isPending}
              title="Delete cross"
            >
              <Trash2 size={16} style={{ color: 'var(--sage-500)' }} />
            </button>
          </div>
        </div>

        {/* Stage indicator */}
        <StageIndicator
          currentStage={cross.stage}
          stages={BREEDING_STAGES}
          failed={isFailed}
        />

        {/* Inline count display */}
        {!isFailed && !isArchived && (showSeedCount || showGerminationCount) && (
          <div className="flex flex-wrap items-center gap-4">
            {showSeedCount && cross.seed_count > 0 && (
              <span className="text-small">
                <span className="text-muted">Seeds: </span>
                <span className="font-semibold" style={{ color: 'var(--sage-800)' }}>{cross.seed_count}</span>
              </span>
            )}
            {showGerminationCount && cross.germination_count > 0 && (
              <span className="text-small">
                <span className="text-muted">Germinated: </span>
                <span className="font-semibold" style={{ color: 'var(--sage-800)' }}>{cross.germination_count}</span>
              </span>
            )}
            {cross.seed_count > 0 && cross.germination_count > 0 && (
              <span className="text-small text-muted">
                ({Math.round((cross.germination_count / cross.seed_count) * 100)}%)
              </span>
            )}
          </div>
        )}

        {/* Goals */}
        {cross.goals && (
          <p className="text-small" style={{ color: 'var(--purple-400)' }}>
            Goal: {cross.goals}
          </p>
        )}

        {/* Complete form */}
        {showCompleteForm && (
          <form onSubmit={handleComplete} className="card-inset p-4 space-y-3">
            <p className="text-small font-semibold" style={{ color: 'var(--sage-700)' }}>
              Add {plantCount > 1 ? `${plantCount} hybrids` : 'this hybrid'} to your library
            </p>
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <input
                  type="text"
                  className={`input w-full ${completeError ? 'input-error' : ''}`}
                  placeholder={plantCount > 1 ? 'Base name (e.g., Star Cross)' : 'Name for the new hybrid'}
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
              <p className="text-small" style={{ color: 'var(--color-error)' }}>{completeError}</p>
            )}
            <div className="flex items-center gap-2">
              <button type="submit" className="btn btn-primary btn-small" disabled={isPending}>
                {isPending ? (
                  <><Loader2 size={14} className="animate-spin" /> Adding...</>
                ) : (
                  <><Plus size={14} /> Blooming &amp; Add {plantCount > 1 ? `${plantCount} Plants` : 'to Library'}</>
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
        {!isComplete && !isFailed && !isArchived && !showCompleteForm && (
          <div className="flex items-center gap-2 mt-1">
            {nextStage && (
              <button
                className="btn btn-primary btn-small flex items-center gap-1.5"
                onClick={handleAdvanceClick}
                disabled={isPending}
              >
                <ChevronRight size={14} />
                {isReadyToComplete ? 'Mark Blooming' : `Advance to ${nextStage.label}`}
              </button>
            )}
            <button
              className="btn btn-secondary btn-small flex items-center gap-1.5"
              onClick={handleMarkFailed}
              disabled={isPending}
            >
              <X size={14} />
              Mark Failed
            </button>
          </div>
        )}
      </div>

      {/* Stage Advance Modal */}
      {advanceTarget && (
        <StageAdvanceModal
          cross={cross}
          targetStage={advanceTarget}
          onConfirm={advanceTarget.key === 'failed' ? handleFailConfirm : handleAdvanceConfirm}
          onCancel={() => setAdvanceTarget(null)}
          isPending={isPending}
        />
      )}
    </div>
  );
}

export { BREEDING_STAGES };
