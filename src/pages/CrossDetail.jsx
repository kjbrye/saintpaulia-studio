/**
 * CrossDetail Page - Individual breeding cross view with stage timeline and offspring
 */

import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2, Archive, RotateCcw, X } from 'lucide-react';
import { format } from 'date-fns';
import {
  useCross,
  useUpdateCross,
  useDeleteCross,
  useRemoveOffspring,
  useAddOffspring,
  useStageLogs,
  useAdvanceStage,
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
  StageTimeline,
  StageAdvanceModal,
  OffspringList,
  LineageView,
} from '../components/breeding';
import { BREEDING_STAGES } from '../components/breeding/CrossCard';
import NotesLog from '../components/ui/NotesLog';
import PremiumGate from '../components/ui/PremiumGate';
import { usePageTitle } from '../hooks/usePageTitle';

export default function CrossDetail() {
  usePageTitle('Cross Detail');
  const { id } = useParams();
  const navigate = useNavigate();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [advanceTarget, setAdvanceTarget] = useState(null);

  const { data: cross, isLoading, error } = useCross(id);
  const { data: stageLogs = [] } = useStageLogs(id);
  const { data: plants = [] } = usePlants();
  const updateCross = useUpdateCross();
  const deleteCross = useDeleteCross();
  const removeOffspring = useRemoveOffspring();
  const addOffspring = useAddOffspring();
  const createPlant = useCreatePlant();
  const advanceStage = useAdvanceStage();
  const updateStatus = useUpdateCrossStatus();

  // Journal entries
  const { data: journalEntries = [], isLoading: journalLoading } = useCrossJournal(id);
  const createJournalEntry = useCreateJournalEntry();
  const deleteJournalEntry = useDeleteJournalEntry();

  const isPending =
    updateCross.isPending ||
    deleteCross.isPending ||
    removeOffspring.isPending ||
    addOffspring.isPending ||
    createPlant.isPending ||
    advanceStage.isPending ||
    updateStatus.isPending;

  const handleDelete = async () => {
    await deleteCross.mutateAsync(id);
    navigate('/breeding');
  };

  const handleAdvanceConfirm = async ({ stage, notes, data }) => {
    // If stage data includes counts, also update them on the cross
    const stageData = { ...data };
    if (stageData.seed_count != null) {
      await updateCross.mutateAsync({ id, updates: { seed_count: stageData.seed_count } });
    }
    if (stageData.germination_count != null) {
      await updateCross.mutateAsync({
        id,
        updates: { germination_count: stageData.germination_count },
      });
    }

    await advanceStage.mutateAsync({ crossId: id, stage, notes, data: stageData });
    setAdvanceTarget(null);
  };

  const handleMarkFailed = () => {
    setAdvanceTarget({ key: 'failed', label: 'Failed', icon: X });
  };

  const handleArchive = () => {
    updateStatus.mutate({ id, status: 'archived' });
  };

  const handleReactivate = () => {
    updateStatus.mutate({ id, status: 'active' });
  };

  const handleCreateAndLink = async (crossId, plantName) => {
    const podName = cross.pod_parent_name || 'Unknown';
    const pollenName = cross.pollen_parent_name || 'Unknown';
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

  const isFailed = cross.status === 'failed' || cross.stage === 'failed';
  const isComplete = cross.status === 'complete' || cross.stage === 'blooming';
  const isArchived = cross.status === 'archived';
  const podName =
    cross.pod_parent?.cultivar_name ||
    cross.pod_parent?.nickname ||
    cross.pod_parent_name ||
    'Unknown';
  const pollenName =
    cross.pollen_parent?.cultivar_name ||
    cross.pollen_parent?.nickname ||
    cross.pollen_parent_name ||
    'Unknown';

  const statusBadge = isArchived
    ? { label: 'Archived', style: { background: 'var(--sage-200)', color: 'var(--sage-700)' } }
    : isFailed
      ? { label: 'Failed', style: { background: 'var(--color-error)', color: 'white' } }
      : isComplete
        ? { label: 'Complete', style: { background: 'var(--color-success)', color: 'white' } }
        : null;

  return (
    <div className="min-h-screen">
      <HeaderBar />
      <PremiumGate feature="breeding">
      <main className="p-4 md:p-6 lg:p-8">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <header className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <button onClick={() => navigate('/breeding')} className="icon-container">
                <ArrowLeft size={20} style={{ color: 'var(--sage-600)' }} />
              </button>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="heading heading-xl">
                    {podName} <span className="text-[var(--purple-400)]">×</span> {pollenName}
                  </h1>
                  {statusBadge && (
                    <span className="badge" style={statusBadge.style}>
                      {statusBadge.label}
                    </span>
                  )}
                </div>
                <p className="text-body text-muted">
                  Crossed {format(new Date(cross.cross_date), 'MMMM d, yyyy')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {(isComplete || isFailed) && !isArchived && (
                <button
                  className="icon-container"
                  onClick={handleArchive}
                  title="Archive cross"
                  disabled={isPending}
                >
                  <Archive size={18} style={{ color: 'var(--sage-500)' }} />
                </button>
              )}
              {isArchived && (
                <button
                  className="icon-container"
                  onClick={handleReactivate}
                  title="Unarchive cross"
                  disabled={isPending}
                >
                  <RotateCcw size={18} style={{ color: 'var(--sage-500)' }} />
                </button>
              )}
              <button
                className="icon-container"
                onClick={() => setShowDeleteConfirm(true)}
                title="Delete cross"
              >
                <Trash2 size={18} style={{ color: 'var(--color-error)' }} />
              </button>
            </div>
          </header>

          {/* Goals */}
          {cross.goals && (
            <div className="card p-6 mb-6">
              <h2 className="heading heading-md mb-2">Goals</h2>
              <p className="text-body" style={{ color: 'var(--purple-400)' }}>
                {cross.goals}
              </p>
            </div>
          )}

          {/* Stage Timeline */}
          <div className="card p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="heading heading-md">Stage Progress</h2>
              {!isComplete && !isFailed && !isArchived && (
                <button
                  className="btn btn-secondary btn-small"
                  onClick={handleMarkFailed}
                  disabled={isPending}
                >
                  <X size={14} /> Mark Failed
                </button>
              )}
            </div>
            <StageTimeline
              cross={cross}
              stageLogs={stageLogs}
              onAdvance={(stage) => setAdvanceTarget(stage)}
              isPending={isPending}
            />
          </div>

          {/* Counts summary */}
          {(cross.seed_count > 0 || cross.germination_count > 0) && (
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="card p-4 text-center">
                <p className="text-label text-muted mb-1">Seeds</p>
                <p className="heading heading-lg">{cross.seed_count || 0}</p>
              </div>
              <div className="card p-4 text-center">
                <p className="text-label text-muted mb-1">Germinated</p>
                <p className="heading heading-lg">{cross.germination_count || 0}</p>
                {cross.seed_count > 0 && cross.germination_count > 0 && (
                  <p className="text-small text-muted">
                    {Math.round((cross.germination_count / cross.seed_count) * 100)}% rate
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Offspring */}
          <div className="mb-6">
            <OffspringList
              offspring={cross.offspring || []}
              plants={plants}
              crossId={id}
              onAddOffspring={(data) => addOffspring.mutateAsync(data)}
              onRemoveOffspring={(offspringId) =>
                removeOffspring.mutate({ id: offspringId, cross_id: id })
              }
              onCreateAndLink={handleCreateAndLink}
              isPending={isPending}
            />
          </div>

          {/* Lineage View */}
          <div className="card p-6 mb-6">
            <h2 className="heading heading-md mb-4">Lineage</h2>
            <LineageView
              cross={cross}
              onRemoveOffspring={(offspringId) =>
                removeOffspring.mutate({ id: offspringId, cross_id: id })
              }
              isPending={isPending}
            />
          </div>

          {/* Journal Notes */}
          <NotesLog
            entries={journalEntries}
            onAdd={async (content) => {
              await createJournalEntry.mutateAsync({ cross_id: id, content });
            }}
            onDelete={(entryId) => {
              deleteJournalEntry.mutate({ id: entryId, parentKey: journalKeys.forCross(id) });
            }}
            isLoading={journalLoading}
            isPending={createJournalEntry.isPending || deleteJournalEntry.isPending}
          />
        </div>

        {/* Stage Advance Modal */}
        {advanceTarget && (
          <StageAdvanceModal
            cross={cross}
            targetStage={advanceTarget}
            onConfirm={handleAdvanceConfirm}
            onCancel={() => setAdvanceTarget(null)}
            isPending={advanceStage.isPending}
          />
        )}

        {/* Delete Confirmation */}
        {showDeleteConfirm && (
          <div
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
            style={{ background: 'rgba(0, 0, 0, 0.5)' }}
          >
            <div className="card p-8 max-w-md w-full">
              <h2 className="heading heading-lg mb-2">Delete Cross?</h2>
              <p className="text-muted mb-6">
                Are you sure you want to delete this cross? All stage logs and offspring records
                will also be removed. This cannot be undone.
              </p>
              <div className="flex justify-end gap-3">
                <button className="btn btn-secondary" onClick={() => setShowDeleteConfirm(false)}>
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
    </div>
  );
}
