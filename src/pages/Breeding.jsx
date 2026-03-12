/**
 * Breeding Page - Track cross-pollination attempts and offspring
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, FlaskConical, Heart, Plus } from 'lucide-react';
import { usePlants, useCreatePlant } from '../hooks/usePlants';
import { useCrosses, useCreateCross, useUpdateCross, useDeleteCross, useAddOffspring } from '../hooks/useBreeding';
import HeaderBar from '../components/ui/HeaderBar';
import { CrossCard, CrossForm, BreedingStatsPanel } from '../components/breeding';
import { getBreedingStats } from '../utils/propagationStats';

export default function Breeding() {
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState('active'); // 'active' | 'completed' | 'all'

  const { data: plants = [] } = usePlants();
  const { data: crosses = [], isLoading, error } = useCrosses();
  const createCross = useCreateCross();
  const updateCross = useUpdateCross();
  const deleteCross = useDeleteCross();
  const createPlant = useCreatePlant();
  const addOffspring = useAddOffspring();

  const stats = getBreedingStats(crosses);
  const active = crosses.filter(c => !['blooming', 'failed'].includes(c.stage));
  const completed = crosses.filter(c => ['blooming', 'failed'].includes(c.stage));

  const displayed = filter === 'active' ? active
    : filter === 'completed' ? completed
    : crosses;

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

  const handleComplete = async (crossId, plantName, cross) => {
    const podName = cross.pod_parent_name || 'unknown';
    const pollenName = cross.pollen_parent_name || 'unknown';

    // Create the new plant in the library
    const plant = await createPlant.mutateAsync({
      cultivar_name: plantName,
      source: `Hybrid: ${podName} × ${pollenName}`,
      notes: `Cross from ${cross.cross_date}${cross.goals ? `. Goal: ${cross.goals}` : ''}`,
    });

    // Link as offspring
    await addOffspring.mutateAsync({ cross_id: crossId, plant_id: plant.id });

    // Mark the cross as blooming
    await updateCross.mutateAsync({ id: crossId, updates: { stage: 'blooming' } });
  };

  const isPending = createCross.isPending || updateCross.isPending
    || deleteCross.isPending || createPlant.isPending || addOffspring.isPending;

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <HeaderBar />
        <div className="flex items-center justify-center p-8" style={{ minHeight: 'calc(100vh - 60px)' }}>
          <p className="text-muted">Loading breeding crosses...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen">
        <HeaderBar />
        <div className="flex items-center justify-center p-8" style={{ minHeight: 'calc(100vh - 60px)' }}>
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
            <button
              className="btn btn-primary"
              onClick={() => setShowForm(true)}
            >
              <Plus size={18} />
              New Cross
            </button>

            <div className="flex gap-1">
              {[
                { key: 'active', label: `Active (${active.length})` },
                { key: 'completed', label: `Past (${completed.length})` },
                { key: 'all', label: 'All' },
              ].map(f => (
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
              {displayed.map(cross => (
                <CrossCard
                  key={cross.id}
                  cross={cross}
                  onUpdate={handleUpdate}
                  onDelete={handleDelete}
                  onComplete={handleComplete}
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
    </div>
  );
}
