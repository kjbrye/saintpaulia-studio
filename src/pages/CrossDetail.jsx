/**
 * CrossDetail Page - Individual breeding cross view with LineageView
 */

import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2, Heart, Sprout, Leaf, Flower2, Package, Sun, Plus, Minus } from 'lucide-react';
import { format } from 'date-fns';
import { useCross, useUpdateCross, useDeleteCross, useRemoveOffspring } from '../hooks/useBreeding';
import HeaderBar from '../components/ui/HeaderBar';
import { StageIndicator } from '../components/propagation';
import { LineageView } from '../components/breeding';
import { BREEDING_STAGES } from '../components/breeding/CrossCard';

export default function CrossDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editingNotes, setEditingNotes] = useState(false);
  const [notesValue, setNotesValue] = useState('');

  const { data: cross, isLoading, error } = useCross(id);
  const updateCross = useUpdateCross();
  const deleteCross = useDeleteCross();
  const removeOffspring = useRemoveOffspring();

  const isPending = updateCross.isPending || deleteCross.isPending || removeOffspring.isPending;

  const handleUpdate = (updates) => {
    updateCross.mutate({ id, updates });
  };

  const handleDelete = async () => {
    await deleteCross.mutateAsync(id);
    navigate('/breeding');
  };

  const handleCountChange = (field, delta) => {
    const newCount = Math.max(0, (cross[field] || 0) + delta);
    handleUpdate({ [field]: newCount });
  };

  const handleRemoveOffspring = (offspringId) => {
    removeOffspring.mutate({ id: offspringId, cross_id: id });
  };

  const handleSaveNotes = () => {
    handleUpdate({ notes: notesValue.trim() || null });
    setEditingNotes(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <HeaderBar />
        <div className="flex items-center justify-center p-8" style={{ minHeight: 'calc(100vh - 60px)' }}>
          <p className="text-muted">Loading cross details...</p>
        </div>
      </div>
    );
  }

  if (error || !cross) {
    return (
      <div className="min-h-screen">
        <HeaderBar />
        <div className="flex items-center justify-center p-8" style={{ minHeight: 'calc(100vh - 60px)' }}>
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

  const isFailed = cross.stage === 'failed';
  const isComplete = cross.stage === 'blooming';
  const podName = cross.pod_parent?.cultivar_name || cross.pod_parent?.nickname || cross.pod_parent_name || 'Unknown';
  const pollenName = cross.pollen_parent?.cultivar_name || cross.pollen_parent?.nickname || cross.pollen_parent_name || 'Unknown';

  const stageIndex = BREEDING_STAGES.findIndex(s => s.key === cross.stage);

  return (
    <div className="min-h-screen">
      <HeaderBar />
      <main className="p-4 md:p-6 lg:p-8">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <header className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <button onClick={() => navigate('/breeding')} className="icon-container">
                <ArrowLeft size={20} style={{ color: 'var(--sage-600)' }} />
              </button>
              <div>
                <h1 className="heading heading-xl">
                  {podName} <span className="text-[var(--purple-400)]">×</span> {pollenName}
                </h1>
                <p className="text-body text-muted">
                  Crossed {format(new Date(cross.cross_date), 'MMMM d, yyyy')}
                </p>
              </div>
            </div>
            <button
              className="icon-container"
              onClick={() => setShowDeleteConfirm(true)}
              title="Delete cross"
            >
              <Trash2 size={18} style={{ color: 'var(--color-error)' }} />
            </button>
          </header>

          {/* Stage Progress */}
          <div className="card p-6 mb-6">
            <h2 className="heading heading-md mb-4">Progress</h2>
            <StageIndicator
              currentStage={cross.stage}
              stages={BREEDING_STAGES}
              failed={isFailed}
            />
            <div className="mt-3">
              <span
                className="text-small font-semibold"
                style={{ color: isFailed ? 'var(--color-error)' : isComplete ? 'var(--color-success)' : 'var(--purple-400)' }}
              >
                {isFailed ? 'Failed' : BREEDING_STAGES.find(s => s.key === cross.stage)?.label}
              </span>
            </div>

            {!isComplete && !isFailed && (
              <div className="flex flex-wrap items-center gap-2 mt-4 pt-4" style={{ borderTop: '1px solid var(--sage-200)' }}>
                {BREEDING_STAGES.map((stage, i) => {
                  const currentIdx = BREEDING_STAGES.findIndex(s => s.key === cross.stage);
                  if (i <= currentIdx) return null;
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

          {/* Goals */}
          {cross.goals && (
            <div className="card p-6 mb-6">
              <h2 className="heading heading-md mb-2">Goals</h2>
              <p className="text-body" style={{ color: 'var(--purple-400)' }}>{cross.goals}</p>
            </div>
          )}

          {/* Counts */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div className="card p-5">
              <p className="text-label text-muted mb-2">Seed Count</p>
              <div className="flex items-center gap-2">
                <button
                  className="icon-container"
                  style={{ width: 32, height: 32 }}
                  onClick={() => handleCountChange('seed_count', -1)}
                  disabled={isPending || (cross.seed_count || 0) <= 0}
                >
                  <Minus size={14} style={{ color: 'var(--sage-600)' }} />
                </button>
                <span className="heading heading-lg w-10 text-center">
                  {cross.seed_count || 0}
                </span>
                <button
                  className="icon-container"
                  style={{ width: 32, height: 32 }}
                  onClick={() => handleCountChange('seed_count', 1)}
                  disabled={isPending}
                >
                  <Plus size={14} style={{ color: 'var(--sage-600)' }} />
                </button>
              </div>
            </div>

            <div className="card p-5">
              <p className="text-label text-muted mb-2">Germination Count</p>
              <div className="flex items-center gap-2">
                <button
                  className="icon-container"
                  style={{ width: 32, height: 32 }}
                  onClick={() => handleCountChange('germination_count', -1)}
                  disabled={isPending || (cross.germination_count || 0) <= 0}
                >
                  <Minus size={14} style={{ color: 'var(--sage-600)' }} />
                </button>
                <span className="heading heading-lg w-10 text-center">
                  {cross.germination_count || 0}
                </span>
                <button
                  className="icon-container"
                  style={{ width: 32, height: 32 }}
                  onClick={() => handleCountChange('germination_count', 1)}
                  disabled={isPending}
                >
                  <Plus size={14} style={{ color: 'var(--sage-600)' }} />
                </button>
              </div>
              {cross.seed_count > 0 && cross.germination_count > 0 && (
                <p className="text-small text-muted mt-2">
                  {Math.round((cross.germination_count / cross.seed_count) * 100)}% germination rate
                </p>
              )}
            </div>
          </div>

          {/* Lineage View */}
          <div className="card p-6 mb-6">
            <h2 className="heading heading-md mb-4">Lineage</h2>
            <LineageView
              cross={cross}
              onRemoveOffspring={handleRemoveOffspring}
              isPending={isPending}
            />
          </div>

          {/* Notes */}
          <div className="card p-6 mb-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="heading heading-md">Notes</h2>
              {!editingNotes && (
                <button
                  className="btn btn-secondary btn-small"
                  onClick={() => {
                    setNotesValue(cross.notes || '');
                    setEditingNotes(true);
                  }}
                >
                  Edit
                </button>
              )}
            </div>
            {editingNotes ? (
              <div className="space-y-3">
                <textarea
                  className="input w-full"
                  style={{ minHeight: 100, resize: 'vertical' }}
                  value={notesValue}
                  onChange={(e) => setNotesValue(e.target.value)}
                  autoFocus
                />
                <div className="flex gap-2">
                  <button className="btn btn-primary btn-small" onClick={handleSaveNotes} disabled={isPending}>
                    Save
                  </button>
                  <button className="btn btn-secondary btn-small" onClick={() => setEditingNotes(false)}>
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-body text-muted">
                {cross.notes || 'No notes yet.'}
              </p>
            )}
          </div>
        </div>

        {/* Delete Confirmation */}
        {showDeleteConfirm && (
          <div
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
            style={{ background: 'rgba(0, 0, 0, 0.5)' }}
          >
            <div className="card p-8 max-w-md w-full">
              <h2 className="heading heading-lg mb-2">Delete Cross?</h2>
              <p className="text-muted mb-6">
                Are you sure you want to delete this cross? All offspring records will also be removed. This cannot be undone.
              </p>
              <div className="flex justify-end gap-3">
                <button className="btn btn-secondary" onClick={() => setShowDeleteConfirm(false)}>
                  Cancel
                </button>
                <button className="btn btn-danger" onClick={handleDelete} disabled={deleteCross.isPending}>
                  {deleteCross.isPending ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
