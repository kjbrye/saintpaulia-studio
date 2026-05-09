/**
 * PropagationDetail Page — vertical stage timeline + quick info + notes.
 */

import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2, X, RotateCcw } from 'lucide-react';
import { format } from 'date-fns';
import {
  usePropagation,
  usePropagations,
  useUpdatePropagation,
  useDeletePropagation,
  useAdvanceStage,
  useMarkFailed,
  useUnmarkFailed,
} from '../hooks/usePropagation';
import {
  usePropagationJournal,
  useCreateJournalEntry,
  useDeleteJournalEntry,
  journalKeys,
} from '../hooks/useJournal';
import HeaderBar from '../components/ui/HeaderBar';
import { StageTimeline, AdvanceStageModal } from '../components/propagation';
import NotesLog from '../components/ui/NotesLog';
import PremiumGate from '../components/ui/PremiumGate';
import { usePageTitle } from '../hooks/usePageTitle';
import {
  METHOD_LABELS,
  getNextStage,
  daysBetween,
  isFailed,
  isEstablished,
  getParentName,
  getPropagationDisplayName,
} from '../utils/propagationStages';

export default function PropagationDetail() {
  usePageTitle('Propagation Detail');
  const { id } = useParams();
  const navigate = useNavigate();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [advanceOpen, setAdvanceOpen] = useState(false);
  const [editingLabel, setEditingLabel] = useState(false);
  const [labelDraft, setLabelDraft] = useState('');

  const { data: propagation, isLoading, error } = usePropagation(id);
  const { data: allPropagations = [] } = usePropagations();
  const updatePropagation = useUpdatePropagation();
  const deletePropagation = useDeletePropagation();
  const advanceStage = useAdvanceStage();
  const markFailedMutation = useMarkFailed();
  const unmarkFailedMutation = useUnmarkFailed();

  const { data: journalEntries = [], isLoading: journalLoading } = usePropagationJournal(id);
  const createJournalEntry = useCreateJournalEntry();
  const deleteJournalEntry = useDeleteJournalEntry();

  const isPending =
    updatePropagation.isPending ||
    deletePropagation.isPending ||
    advanceStage.isPending ||
    markFailedMutation.isPending ||
    unmarkFailedMutation.isPending;

  const handleDelete = async () => {
    await deletePropagation.mutateAsync(id);
    navigate('/propagation');
  };

  const handlePlantletCount = (delta) => {
    const newCount = Math.max(0, (propagation.plantlet_count || 0) + delta);
    updatePropagation.mutate({ id, updates: { plantlet_count: newCount } });
  };

  const triggerAdvance = () => {
    if (!propagation) return;
    const next = getNextStage(propagation.stage);
    if (!next) return;
    if (next.key === 'complete') {
      const params = new URLSearchParams({
        propagation_id: propagation.id,
        cultivar_name:
          propagation.parent_plant?.cultivar_name ||
          propagation.parent_plant_name ||
          '',
      });
      if (propagation.parent_plant_id) {
        params.set('parent_plant_id', propagation.parent_plant_id);
      }
      navigate(`/plants/new?${params.toString()}`);
      return;
    }
    setAdvanceOpen(true);
  };

  const handleAdvanceConfirm = async ({ note }) => {
    const next = getNextStage(propagation.stage);
    await advanceStage.mutateAsync({ id, nextStage: next.key, note });
    setAdvanceOpen(false);
  };

  const handleSkipTo = async (stageKey) => {
    await advanceStage.mutateAsync({ id, nextStage: stageKey, note: 'Skipped ahead' });
  };

  const handleMarkFailed = async () => {
    await markFailedMutation.mutateAsync({ id });
  };

  const handleUnmarkFailed = async () => {
    await unmarkFailedMutation.mutateAsync({ id });
  };

  const startLabelEdit = () => {
    setLabelDraft(propagation?.label || '');
    setEditingLabel(true);
  };

  const commitLabelEdit = () => {
    const next = labelDraft.trim() || null;
    if (next !== (propagation?.label || null)) {
      updatePropagation.mutate({ id, updates: { label: next } });
    }
    setEditingLabel(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <HeaderBar />
        <div
          className="flex items-center justify-center p-8"
          style={{ minHeight: 'calc(100vh - 60px)' }}
        >
          <p className="text-muted">Loading propagation...</p>
        </div>
      </div>
    );
  }

  if (error || !propagation) {
    return (
      <div className="min-h-screen">
        <HeaderBar />
        <div
          className="flex items-center justify-center p-8"
          style={{ minHeight: 'calc(100vh - 60px)' }}
        >
          <div className="card p-8 text-center max-w-md">
            <p className="heading heading-lg mb-2">Propagation not found</p>
            <p className="text-muted mb-4">
              {error?.message || 'This propagation does not exist.'}
            </p>
            <Link to="/propagation">
              <button className="btn btn-primary">Back to Propagation</button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const failed = isFailed(propagation);
  const established = isEstablished(propagation);
  const parentName = getParentName(propagation);
  const startDate = propagation.cutting_date || propagation.created_at;
  const daysSinceStart = daysBetween(startDate);
  const propName = getPropagationDisplayName(propagation, allPropagations);

  return (
    <div className="min-h-screen">
      <HeaderBar />
      <PremiumGate feature="propagation">
        <main className="p-4 md:p-6 lg:p-8">
          <div className="max-w-3xl mx-auto">
            {/* Header */}
            <header className="flex items-start justify-between gap-4 mb-6">
              <div className="flex items-start gap-4 min-w-0">
                <button onClick={() => navigate('/propagation')} className="icon-container flex-shrink-0">
                  <ArrowLeft size={20} style={{ color: 'var(--sage-600)' }} />
                </button>
                <div className="min-w-0">
                  <p
                    className="text-label text-muted truncate"
                    style={{ textTransform: 'uppercase', letterSpacing: '0.08em' }}
                  >
                    From{' '}
                    {propagation.parent_plant_id ? (
                      <Link
                        to={`/plants/${propagation.parent_plant_id}`}
                        className="hover:underline"
                        style={{ color: 'var(--purple-500)' }}
                      >
                        {parentName}
                      </Link>
                    ) : (
                      parentName
                    )}
                    {propagation.method && (
                      <> · {METHOD_LABELS[propagation.method]?.toLowerCase()} rooting</>
                    )}
                  </p>
                  {editingLabel ? (
                    <div className="flex items-baseline gap-2">
                      <span
                        style={{ fontSize: 28, fontFamily: 'var(--font-heading)', color: 'var(--sage-800)' }}
                      >
                        {parentName} leaf ·
                      </span>
                      <input
                        type="text"
                        autoFocus
                        className="input"
                        style={{ fontSize: 22, fontFamily: 'var(--font-heading)', minWidth: 180 }}
                        placeholder="label"
                        value={labelDraft}
                        onChange={(e) => setLabelDraft(e.target.value)}
                        onBlur={commitLabelEdit}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            commitLabelEdit();
                          } else if (e.key === 'Escape') {
                            setEditingLabel(false);
                          }
                        }}
                      />
                    </div>
                  ) : (
                    <h1
                      className="heading"
                      style={{ fontSize: 28, fontFamily: 'var(--font-heading)', cursor: 'text' }}
                      onClick={startLabelEdit}
                      title="Click to edit label"
                    >
                      {propName}
                    </h1>
                  )}
                  <p className="text-body text-muted">
                    started {startDate ? format(new Date(startDate), 'MMM d, yyyy') : '—'}
                    {' · '}
                    {daysSinceStart} {daysSinceStart === 1 ? 'day' : 'days'} ago
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {failed && (
                  <button
                    type="button"
                    className="btn btn-secondary btn-small flex items-center gap-1.5"
                    onClick={handleUnmarkFailed}
                    title="Restore propagation"
                    disabled={isPending}
                  >
                    <RotateCcw size={14} />
                    Restore
                  </button>
                )}
                {!failed && !established && (
                  <button
                    type="button"
                    className="icon-container"
                    onClick={handleMarkFailed}
                    title="Mark failed"
                    disabled={isPending}
                  >
                    <X size={18} style={{ color: 'var(--copper-500)' }} />
                  </button>
                )}
                <button
                  type="button"
                  className="icon-container"
                  onClick={() => setShowDeleteConfirm(true)}
                  title="Delete propagation"
                >
                  <Trash2 size={18} style={{ color: 'var(--copper-500)' }} />
                </button>
              </div>
            </header>

            {/* Stage timeline */}
            <StageTimeline
              propagation={propagation}
              onAdvance={triggerAdvance}
              onMarkFailed={handleMarkFailed}
              onSkipTo={handleSkipTo}
              onPlantletCount={handlePlantletCount}
              isPending={isPending}
            />

            {/* Quick info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div className="card p-5" style={{ background: 'var(--cream-100)' }}>
                <p
                  className="text-label text-muted mb-1"
                  style={{ textTransform: 'uppercase', letterSpacing: '0.08em' }}
                >
                  Parent plant
                </p>
                {propagation.parent_plant_id ? (
                  <Link
                    to={`/plants/${propagation.parent_plant_id}`}
                    className="heading heading-sm hover:underline"
                    style={{ color: 'var(--purple-500)' }}
                  >
                    {parentName}
                  </Link>
                ) : (
                  <p className="heading heading-sm">{parentName}</p>
                )}
              </div>

              <div className="card p-5" style={{ background: 'var(--cream-100)' }}>
                <p
                  className="text-label text-muted mb-1"
                  style={{ textTransform: 'uppercase', letterSpacing: '0.08em' }}
                >
                  Method
                </p>
                <p className="heading heading-sm">
                  {propagation.method ? METHOD_LABELS[propagation.method] : 'Not specified'}
                </p>
              </div>
            </div>

            {/* Established link */}
            {established && propagation.established_plant_id && (
              <div className="card p-5 mb-6 flex items-center justify-between gap-3">
                <div>
                  <p className="text-label text-muted" style={{ textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    Now in your collection
                  </p>
                  <p className="heading heading-sm mt-1">
                    {propagation.established_plant?.cultivar_name ||
                      propagation.established_plant?.nickname ||
                      'View plant'}
                  </p>
                </div>
                <Link to={`/plants/${propagation.established_plant_id}`}>
                  <button className="btn btn-secondary btn-small">View plant</button>
                </Link>
              </div>
            )}

            {/* Notes */}
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

          {/* Delete confirmation */}
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
                  <button
                    className="btn btn-danger"
                    onClick={handleDelete}
                    disabled={deletePropagation.isPending}
                  >
                    {deletePropagation.isPending ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </PremiumGate>

      <AdvanceStageModal
        open={advanceOpen}
        propagation={propagation}
        nextStageKey={getNextStage(propagation.stage)?.key}
        onConfirm={handleAdvanceConfirm}
        onCancel={() => setAdvanceOpen(false)}
        isPending={advanceStage.isPending}
      />
    </div>
  );
}
