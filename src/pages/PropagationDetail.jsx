/**
 * PropagationDetail Page - Individual propagation view with editing
 */

import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2, Scissors, Sprout, Leaf, Flower2, Check, Plus, Minus } from 'lucide-react';
import { format } from 'date-fns';
import { usePropagation, useUpdatePropagation, useDeletePropagation } from '../hooks/usePropagation';
import { usePropagationJournal, useCreateJournalEntry, useDeleteJournalEntry, journalKeys } from '../hooks/useJournal';
import HeaderBar from '../components/ui/HeaderBar';
import { StageIndicator } from '../components/propagation';
import { PROPAGATION_STAGES, METHOD_LABELS } from '../components/propagation/PropagationCard';
import NotesLog from '../components/ui/NotesLog';

export default function PropagationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const { data: propagation, isLoading, error } = usePropagation(id);
  const updatePropagation = useUpdatePropagation();
  const deletePropagation = useDeletePropagation();

  // Journal entries
  const { data: journalEntries = [], isLoading: journalLoading } = usePropagationJournal(id);
  const createJournalEntry = useCreateJournalEntry();
  const deleteJournalEntry = useDeleteJournalEntry();

  const isPending = updatePropagation.isPending || deletePropagation.isPending;

  const handleUpdate = (updates) => {
    updatePropagation.mutate({ id, updates });
  };

  const handleDelete = async () => {
    await deletePropagation.mutateAsync(id);
    navigate('/propagation');
  };

  const handlePlantletCount = (delta) => {
    const newCount = Math.max(0, (propagation.plantlet_count || 0) + delta);
    handleUpdate({ plantlet_count: newCount });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <HeaderBar />
        <div className="flex items-center justify-center p-8" style={{ minHeight: 'calc(100vh - 60px)' }}>
          <p className="text-muted">Loading propagation...</p>
        </div>
      </div>
    );
  }

  if (error || !propagation) {
    return (
      <div className="min-h-screen">
        <HeaderBar />
        <div className="flex items-center justify-center p-8" style={{ minHeight: 'calc(100vh - 60px)' }}>
          <div className="card p-8 text-center max-w-md">
            <p className="heading heading-lg mb-2">Propagation not found</p>
            <p className="text-muted mb-4">{error?.message || 'This propagation does not exist.'}</p>
            <Link to="/propagation">
              <button className="btn btn-primary">Back to Propagation</button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isFailed = propagation.stage === 'failed';
  const isComplete = propagation.stage === 'complete';
  const parentName = propagation.parent_plant?.cultivar_name
    || propagation.parent_plant?.nickname
    || propagation.parent_plant_name
    || 'Unknown parent';

  return (
    <div className="min-h-screen">
      <HeaderBar />
      <main className="p-4 md:p-6 lg:p-8">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <header className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <button onClick={() => navigate('/propagation')} className="icon-container">
                <ArrowLeft size={20} style={{ color: 'var(--sage-600)' }} />
              </button>
              <div>
                <h1 className="heading heading-xl">{parentName} leaf</h1>
                <p className="text-body text-muted">
                  Started {format(new Date(propagation.cutting_date), 'MMMM d, yyyy')}
                </p>
              </div>
            </div>
            <button
              className="icon-container"
              onClick={() => setShowDeleteConfirm(true)}
              title="Delete propagation"
            >
              <Trash2 size={18} style={{ color: 'var(--color-error)' }} />
            </button>
          </header>

          {/* Stage Progress */}
          <div className="card p-6 mb-6">
            <h2 className="heading heading-md mb-4">Progress</h2>
            <StageIndicator
              currentStage={propagation.stage}
              stages={PROPAGATION_STAGES}
              failed={isFailed}
            />
            <div className="mt-3 flex items-center gap-2">
              <span
                className="text-small font-semibold"
                style={{ color: isFailed ? 'var(--color-error)' : isComplete ? 'var(--color-success)' : 'var(--purple-400)' }}
              >
                {isFailed ? 'Failed' : isComplete ? 'Complete' : PROPAGATION_STAGES.find(s => s.key === propagation.stage)?.label}
              </span>
            </div>

            {/* Stage advance buttons */}
            {!isComplete && !isFailed && (
              <div className="flex flex-wrap items-center gap-2 mt-4 pt-4" style={{ borderTop: '1px solid var(--sage-200)' }}>
                {PROPAGATION_STAGES.map((stage, i) => {
                  const currentIdx = PROPAGATION_STAGES.findIndex(s => s.key === propagation.stage);
                  if (i <= currentIdx || stage.key === 'complete') return null;
                  const Icon = stage.icon;
                  return (
                    <button
                      key={stage.key}
                      className="btn btn-secondary btn-small flex items-center gap-1.5"
                      onClick={() => handleUpdate({ stage: stage.key })}
                      disabled={isPending}
                    >
                      <Icon size={14} />
                      {stage.label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            {/* Parent Plant */}
            <div className="card p-5">
              <p className="text-label text-muted mb-1">Parent Plant</p>
              {propagation.parent_plant_id ? (
                <Link
                  to={`/plants/${propagation.parent_plant_id}`}
                  className="heading heading-sm hover:underline"
                  style={{ color: 'var(--purple-400)' }}
                >
                  {parentName}
                </Link>
              ) : (
                <p className="heading heading-sm">{parentName}</p>
              )}
            </div>

            {/* Method */}
            <div className="card p-5">
              <p className="text-label text-muted mb-1">Rooting Method</p>
              <p className="heading heading-sm">
                {propagation.method ? METHOD_LABELS[propagation.method] : 'Not specified'}
              </p>
            </div>

            {/* Plantlet Count */}
            <div className="card p-5">
              <p className="text-label text-muted mb-2">Plantlet Count</p>
              <div className="flex items-center gap-2">
                <button
                  className="icon-container"
                  style={{ width: 32, height: 32 }}
                  onClick={() => handlePlantletCount(-1)}
                  disabled={isPending || (propagation.plantlet_count || 0) <= 0}
                >
                  <Minus size={14} style={{ color: 'var(--sage-600)' }} />
                </button>
                <span className="heading heading-lg w-10 text-center">
                  {propagation.plantlet_count || 0}
                </span>
                <button
                  className="icon-container"
                  style={{ width: 32, height: 32 }}
                  onClick={() => handlePlantletCount(1)}
                  disabled={isPending}
                >
                  <Plus size={14} style={{ color: 'var(--sage-600)' }} />
                </button>
              </div>
            </div>

            {/* Stage */}
            <div className="card p-5">
              <p className="text-label text-muted mb-1">Current Stage</p>
              <p className="heading heading-sm">
                {isFailed ? 'Failed' : isComplete ? 'Complete' : PROPAGATION_STAGES.find(s => s.key === propagation.stage)?.label}
              </p>
            </div>
          </div>

          {/* Journal Notes */}
          <NotesLog
            entries={journalEntries}
            onAdd={async (content) => {
              await createJournalEntry.mutateAsync({ propagation_id: id, content });
            }}
            onDelete={(entryId) => {
              deleteJournalEntry.mutate({ id: entryId, parentKey: journalKeys.forPropagation(id) });
            }}
            isLoading={journalLoading}
            isPending={createJournalEntry.isPending || deleteJournalEntry.isPending}
          />
        </div>

        {/* Delete Confirmation */}
        {showDeleteConfirm && (
          <div
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
            style={{ background: 'rgba(0, 0, 0, 0.5)' }}
          >
            <div className="card p-8 max-w-md w-full">
              <h2 className="heading heading-lg mb-2">Delete Propagation?</h2>
              <p className="text-muted mb-6">
                Are you sure you want to delete this propagation project? This cannot be undone.
              </p>
              <div className="flex justify-end gap-3">
                <button className="btn btn-secondary" onClick={() => setShowDeleteConfirm(false)}>
                  Cancel
                </button>
                <button className="btn btn-danger" onClick={handleDelete} disabled={deletePropagation.isPending}>
                  {deletePropagation.isPending ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
