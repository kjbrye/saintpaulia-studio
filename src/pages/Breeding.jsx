/**
 * Breeding Page - Track cross-pollination attempts and offspring
 */

import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, FlaskConical, Heart, Plus } from 'lucide-react';
import { usePlants, useCreatePlant } from '../hooks/usePlants';
import { isArchived } from '../constants/plantStatus';
import {
  useCrosses,
  useCreateCross,
  useUpdateCross,
  useDeleteCross,
  useAddOffspring,
  useAdvanceStage,
  useUpdateCrossStatus,
} from '../hooks/useBreeding';
import HeaderBar from '../components/ui/HeaderBar';
import { CrossCard, CrossForm, BreedingStatsPanel } from '../components/breeding';
import { getBreedingStats } from '../utils/propagationStats';
import PremiumGate from '../components/ui/PremiumGate';
import { usePageTitle } from '../hooks/usePageTitle';

export default function Breeding() {
  usePageTitle('Breeding');
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState('active'); // 'active' | 'complete' | 'archived' | 'all'

  const { data: allPlants = [] } = usePlants();
  const plants = useMemo(() => allPlants.filter((p) => !isArchived(p.status)), [allPlants]);
  const { data: crosses = [], isLoading, error } = useCrosses();
  const createCross = useCreateCross();
  const updateCross = useUpdateCross();
  const deleteCross = useDeleteCross();
  const createPlant = useCreatePlant();
  const addOffspring = useAddOffspring();
  const advanceStage = useAdvanceStage();
  const updateStatus = useUpdateCrossStatus();

  const stats = getBreedingStats(crosses);

  // Use status column with fallback to stage-based logic for un-migrated data
  const getStatus = (c) => {
    if (c.status) return c.status;
    if (c.stage === 'blooming') return 'complete';
    if (c.stage === 'failed') return 'failed';
    return 'active';
  };

  const active = crosses.filter((c) => getStatus(c) === 'active');
  const complete = crosses.filter((c) => ['complete', 'failed'].includes(getStatus(c)));
  const archived = crosses.filter((c) => getStatus(c) === 'archived');

  const displayed =
    filter === 'active'
      ? active
      : filter === 'complete'
        ? complete
        : filter === 'archived'
          ? archived
          : crosses.filter((c) => getStatus(c) !== 'archived');

  const handleCreate = async (data) => {
    await createCross.mutateAsync(data);
    setShowForm(false);
  };

  const handleUpdate = (id, updates) => {
    updateCross.mutate({ id, updates });
  };

  const handleDelete = (id) => {
    deleteCross.mutate(id);
  };

  const handleAdvance = async (crossId, stage, advanceData) => {
    await advanceStage.mutateAsync({ crossId, stage, ...advanceData });
  };

  const handleComplete = async (crossId, plantName, count, cross) => {
    const podName = cross.pod_parent_name || 'unknown';
    const pollenName = cross.pollen_parent_name || 'unknown';
    const source = `Hybrid: ${podName} × ${pollenName}`;
    const notes = `Cross from ${cross.cross_date}${cross.goals ? `. Goal: ${cross.goals}` : ''}`;

    // Create plants and link each as offspring, auto-filling parentage
    for (let i = 0; i < count; i++) {
      const name = count > 1 ? `${plantName} #${i + 1}` : plantName;
      const plant = await createPlant.mutateAsync({
        cultivar_name: name,
        source,
        notes,
        pod_parent_id: cross.pod_parent_id || null,
        pollen_parent_id: cross.pollen_parent_id || null,
        pod_parent_name: podName,
        pollen_parent_name: pollenName,
        generation: 1,
      });
      await addOffspring.mutateAsync({ cross_id: crossId, plant_id: plant.id });
    }

    // Mark the cross as blooming/complete
    await advanceStage.mutateAsync({ crossId, stage: 'blooming' });
  };

  const handleArchive = (id) => {
    updateStatus.mutate({ id, status: 'archived' });
  };

  const isPending =
    createCross.isPending ||
    updateCross.isPending ||
    deleteCross.isPending ||
    createPlant.isPending ||
    addOffspring.isPending ||
    advanceStage.isPending ||
    updateStatus.isPending;

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <HeaderBar />
        <div
          className="flex items-center justify-center p-8"
          style={{ minHeight: 'calc(100vh - 60px)' }}
        >
          <p className="text-muted">Loading breeding crosses...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen">
        <HeaderBar />
        <div
          className="flex items-center justify-center p-8"
          style={{ minHeight: 'calc(100vh - 60px)' }}
        >
          <div className="panel p-8 text-center max-w-md">
            <p className="heading heading-lg mb-2">Failed to load</p>
            <p className="text-muted mb-4">{error.message}</p>
            <button className="btn btn-primary" onClick={() => window.location.reload()}>
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <HeaderBar />

      <PremiumGate feature="breeding">
      <main className="p-4 md:p-6 lg:p-8">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <header className="flex items-center gap-4 mb-6">
            <Link to="/">
              <button type="button" className="icon-container">
                <ArrowLeft size={20} style={{ color: 'var(--sage-600)' }} />
              </button>
            </Link>
            <div className="flex-1">
              <h1 className="heading heading-xl">Breeding Tracker</h1>
              <p className="text-body text-muted">Track cross-pollination attempts and offspring</p>
            </div>
          </header>

          {/* Actions bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <button className="btn btn-primary" onClick={() => setShowForm(true)}>
              <Plus size={18} />
              New Cross
            </button>

            <div className="flex gap-1">
              {[
                { key: 'active', label: `Active (${active.length})` },
                { key: 'complete', label: `Complete (${complete.length})` },
                ...(archived.length > 0
                  ? [{ key: 'archived', label: `Archived (${archived.length})` }]
                  : []),
                { key: 'all', label: 'All' },
              ].map((f) => (
                <button
                  key={f.key}
                  className={`btn btn-small ${filter === f.key ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setFilter(f.key)}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* New cross form */}
          {showForm && (
            <div className="card p-6 mb-6">
              <h2 className="heading heading-md mb-4">Record New Cross</h2>
              <CrossForm
                plants={plants}
                onSubmit={handleCreate}
                onCancel={() => setShowForm(false)}
                isPending={createCross.isPending}
              />
            </div>
          )}

          {/* Stats */}
          {stats && crosses.length >= 2 && (
            <div className="mb-6">
              <BreedingStatsPanel stats={stats} />
            </div>
          )}

          {/* Cross list */}
          {displayed.length > 0 ? (
            <div className="space-y-4">
              {displayed.map((cross) => (
                <CrossCard
                  key={cross.id}
                  cross={cross}
                  onUpdate={handleUpdate}
                  onDelete={handleDelete}
                  onComplete={handleComplete}
                  onAdvance={handleAdvance}
                  onArchive={handleArchive}
                  isPending={isPending}
                />
              ))}
            </div>
          ) : (
            <div className="panel p-10 text-center">
              <div
                className="w-16 h-16 rounded-xl mx-auto mb-4 flex items-center justify-center"
                style={{ background: 'var(--purple-100)' }}
              >
                {filter === 'active' ? (
                  <Heart size={32} style={{ color: 'var(--purple-400)' }} />
                ) : (
                  <FlaskConical size={32} style={{ color: 'var(--purple-400)' }} />
                )}
              </div>
              <h2 className="heading heading-lg mb-2">
                {filter === 'active' ? 'No active crosses' : 'No crosses yet'}
              </h2>
              <p className="text-muted mb-6">
                {filter === 'active'
                  ? 'Record a new cross-pollination to start tracking!'
                  : 'Cross-pollinate two violets and track the journey from seed to bloom.'}
              </p>
              {!showForm && (
                <button className="btn btn-primary" onClick={() => setShowForm(true)}>
                  <Plus size={18} /> Record Your First Cross
                </button>
              )}
            </div>
          )}
        </div>
      </main>
      </PremiumGate>
    </div>
  );
}
