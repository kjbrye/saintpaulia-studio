/**
 * CrossDetail Page — parents card + vertical stage timeline + offspring + notes.
 *
 * Mirrors the propagation detail page structurally; both are parallel concepts.
 */

import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2, X, RotateCcw, Archive } from 'lucide-react';
import { format } from 'date-fns';
import {
  useCross,
  useStageLogs,
  useUpdateCross,
  useDeleteCross,
  useAddOffspring,
  useRemoveOffspring,
  useAdvanceStage,
  useMarkFailed,
  useUnmarkFailed,
  useUpdateCrossStatus,
} from '../hooks/useBreeding';
import { usePlants, useCreatePlant } from '../hooks/usePlants';
import {
  useCrossJournal,
  useCreateJournalEntry,
  useDeleteJournalEntry,
  journalKeys,
} from '../hooks/useJournal';
import HeaderBar from '../components/ui/HeaderBar';
import {
  ParentsCard,
  CrossStageTimeline,
  AdvanceCrossStageModal,
  OffspringSection,
} from '../components/breeding';
import NotesLog from '../components/ui/NotesLog';
import PremiumGate from '../components/ui/PremiumGate';
import { usePageTitle } from '../hooks/usePageTitle';
import {
  getNextStage,
  daysBetween,
  isFailed,
  isComplete,
  getPodParentName,
  getPollenParentName,
} from '../utils/breedingStages';

export default function CrossDetail() {
  usePageTitle('Cross Detail');
  const { id } = useParams();
  const navigate = useNavigate();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [advanceOpen, setAdvanceOpen] = useState(false);

  const { data: cross, isLoading, error } = useCross(id);
  const { data: stageLogs = [] } = useStageLogs(id);
  const { data: plants = [] } = usePlants();
  const updateCross = useUpdateCross();
  const deleteCross = useDeleteCross();
  const addOffspring = useAddOffspring();
  const removeOffspring = useRemoveOffspring();
  const createPlant = useCreatePlant();
  const advanceStage = useAdvanceStage();
  const markFailedMutation = useMarkFailed();
  const unmarkFailedMutation = useUnmarkFailed();
  const updateStatus = useUpdateCrossStatus();

  const { data: journalEntries = [], isLoading: journalLoading } = useCrossJournal(id);
  const createJournalEntry = useCreateJournalEntry();
  const deleteJournalEntry = useDeleteJournalEntry();

  const isPending =
    updateCross.isPending ||
    deleteCross.isPending ||
    addOffspring.isPending ||
    removeOffspring.isPending ||
    createPlant.isPending ||
    advanceStage.isPending ||
    markFailedMutation.isPending ||
    unmarkFailedMutation.isPending ||
    updateStatus.isPending;

  const handleDelete = async () => {
    await deleteCross.mutateAsync(id);
    navigate('/breeding');
  };

  const triggerAdvance = () => {
    if (!cross) return;
    const next = getNextStage(cross.stage);
    if (!next) return;
    setAdvanceOpen(true);
  };

  const handleAdvanceConfirm = async ({ note }) => {
    const next = getNextStage(cross.stage);
    await advanceStage.mutateAsync({
      crossId: id,
      stage: next.key,
      notes: note || undefined,
    });
    setAdvanceOpen(false);
  };

  const handleSkipTo = async (stageKey) => {
    await advanceStage.mutateAsync({
      crossId: id,
      stage: stageKey,
      notes: 'Skipped ahead',
    });
  };

  const handleMarkFailed = async () => {
    await markFailedMutation.mutateAsync({ id });
  };

  const handleUnmarkFailed = async () => {
    await unmarkFailedMutation.mutateAsync({ id });
  };

  const handleArchive = () => {
    updateStatus.mutate({ id, status: 'archived' });
  };

  const handleReactivate = () => {
    updateStatus.mutate({ id, status: 'active' });
  };

  const handleCreateAndLink = async (crossId, plantName) => {
    const podName = getPodParentName(cross);
    const pollenName = getPollenParentName(cross);
    const plant = await createPlant.mutateAsync({
      cultivar_name: plantName,
      source: `Hybrid: ${podName} × ${pollenName}`,
      notes: `Cross from ${cross.cross_date}${cross.goals ? `. Goal: ${cross.goals}` : ''}`,
      pod_parent_id: cross.pod_parent_id || null,
      pollen_parent_id: cross.pollen_parent_id || null,
      pod_parent_name: podName,
      pollen_parent_name: pollenName,
      generation: 1,
    });
    await addOffspring.mutateAsync({ cross_id: crossId, plant_id: plant.id });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <HeaderBar />
        <div
          className="flex items-center justify-center p-8"
          style={{ minHeight: 'calc(100vh - 60px)' }}
        >
          <p className="text-muted">Loading cross details...</p>
        </div>
      </div>
    );
  }

  if (error || !cross) {
    return (
      <div className="min-h-screen">
        <HeaderBar />
        <div
          className="flex items-center justify-center p-8"
          style={{ minHeight: 'calc(100vh - 60px)' }}
        >
          <div className="card p-8 text-center max-w-md">
            <p className="heading heading-lg mb-2">Cross not found</p>
            <p className="text-muted mb-4">{error?.message || 'This cross does not exist.'}</p>
            <Link to="/breeding">
              <button className="btn btn-primary">Back to Breeding</button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const failed = isFailed(cross);
  const complete = isComplete(cross);
  const archived = cross.status === 'archived';
  const podName = getPodParentName(cross);
  const pollenName = getPollenParentName(cross);
  const startDate = cross.cross_date || cross.created_at;
  const daysSinceStart = daysBetween(startDate);

  return (
    <div className="min-h-screen">
      <HeaderBar />
      <PremiumGate feature="breeding">
        <main className="p-4 md:p-6 lg:p-8">
          <div className="max-w-3xl mx-auto">
            {/* Header */}
            <header className="flex items-start justify-between gap-4 mb-6">
              <div className="flex items-start gap-4 min-w-0">
                <button
                  onClick={() => navigate('/breeding')}
                  className="icon-container flex-shrink-0"
                >
                  <ArrowLeft size={20} style={{ color: 'var(--sage-600)' }} />
                </button>
                <div className="min-w-0">
                  {cross.goals && (
                    <p
                      className="truncate"
                      style={{
                        fontSize: 11,
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        color: 'var(--sage-500)',
                        fontWeight: 600,
                      }}
                    >
                      GOAL · {cross.goals}
                    </p>
                  )}
                  <h1
                    className="heading"
                    style={{ fontSize: 28, fontFamily: 'var(--font-heading)' }}
                  >
                    {cross.pod_parent_id ? (
                      <Link
                        to={`/plants/${cross.pod_parent_id}`}
                        className="hover:underline"
                        style={{ color: 'var(--sage-800)' }}
                      >
                        {podName}
                      </Link>
                    ) : (
                      <span style={{ color: 'var(--sage-800)' }}>{podName}</span>
                    )}
                    <span className="mx-2" style={{ color: 'var(--purple-400)' }}>
                      ×
                    </span>
                    {cross.pollen_parent_id ? (
                      <Link
                        to={`/plants/${cross.pollen_parent_id}`}
                        className="hover:underline"
                        style={{ color: 'var(--sage-800)' }}
                      >
                        {pollenName}
                      </Link>
                    ) : (
                      <span style={{ color: 'var(--sage-800)' }}>{pollenName}</span>
                    )}
                  </h1>
                  <p className="text-body text-muted">
                    crossed {startDate ? format(new Date(startDate), 'MMM d, yyyy') : '—'}
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
                    title="Restore cross"
                    disabled={isPending}
                  >
                    <RotateCcw size={14} />
                    Restore
                  </button>
                )}
                {!failed && !complete && !archived && (
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
                {(complete || failed) && !archived && (
                  <button
                    type="button"
                    className="icon-container"
                    onClick={handleArchive}
                    title="Archive cross"
                    disabled={isPending}
                  >
                    <Archive size={18} style={{ color: 'var(--sage-500)' }} />
                  </button>
                )}
                {archived && (
                  <button
                    type="button"
                    className="icon-container"
                    onClick={handleReactivate}
                    title="Unarchive cross"
                    disabled={isPending}
                  >
                    <RotateCcw size={18} style={{ color: 'var(--sage-500)' }} />
                  </button>
                )}
                <button
                  type="button"
                  className="icon-container"
                  onClick={() => setShowDeleteConfirm(true)}
                  title="Delete cross"
                >
                  <Trash2 size={18} style={{ color: 'var(--copper-500)' }} />
                </button>
              </div>
            </header>

            {/* Parents */}
            <ParentsCard cross={cross} plants={plants} />

            {/* Stage timeline */}
            <CrossStageTimeline
              cross={cross}
              stageLogs={stageLogs}
              onAdvance={triggerAdvance}
              onMarkFailed={handleMarkFailed}
              onSkipTo={handleSkipTo}
              isPending={isPending}
            />

            {/* Offspring */}
            <OffspringSection
              cross={cross}
              plants={plants}
              onAddOffspring={(data) => addOffspring.mutateAsync(data)}
              onCreateAndLink={handleCreateAndLink}
              onRemoveOffspring={(offspringId) =>
                removeOffspring.mutate({ id: offspringId, cross_id: id })
              }
              isPending={isPending}
            />

            {/* Notes */}
            <NotesLog
              entries={journalEntries}
              onAdd={async (content) => {
                await createJournalEntry.mutateAsync({ cross_id: id, content });
              }}
              onDelete={(entryId) => {
                deleteJournalEntry.mutate({
                  id: entryId,
                  parentKey: journalKeys.forCross(id),
                });
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
                <h2 className="heading heading-lg mb-2">Delete Cross?</h2>
                <p className="text-muted mb-6">
                  Are you sure you want to delete this cross? All stage logs and offspring
                  records will also be removed. This cannot be undone.
                </p>
                <div className="flex justify-end gap-3">
                  <button
                    className="btn btn-secondary"
                    onClick={() => setShowDeleteConfirm(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn btn-danger"
                    onClick={handleDelete}
                    disabled={deleteCross.isPending}
                  >
                    {deleteCross.isPending ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </PremiumGate>

      <AdvanceCrossStageModal
        open={advanceOpen}
        cross={cross}
        nextStageKey={getNextStage(cross.stage)?.key}
        onConfirm={handleAdvanceConfirm}
        onCancel={() => setAdvanceOpen(false)}
        isPending={advanceStage.isPending}
      />
    </div>
  );
}
