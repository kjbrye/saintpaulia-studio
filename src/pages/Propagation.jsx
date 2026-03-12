/**
 * Propagation Page - Track leaf cuttings and plantlet growth
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Scissors, Sprout, Plus } from 'lucide-react';
import { usePlants, useCreatePlant } from '../hooks/usePlants';
import { usePropagations, useCreatePropagation, useUpdatePropagation, useDeletePropagation } from '../hooks/usePropagation';
import HeaderBar from '../components/ui/HeaderBar';
import { PropagationCard, PropagationForm, PropagationStatsPanel } from '../components/propagation';
import { getPropagationStats } from '../utils/propagationStats';

export default function Propagation() {
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState('active'); // 'active' | 'completed' | 'all'

  const { data: plants = [] } = usePlants();
  const { data: propagations = [], isLoading, error } = usePropagations();
  const createPropagation = useCreatePropagation();
  const updatePropagation = useUpdatePropagation();
  const deletePropagation = useDeletePropagation();
  const createPlant = useCreatePlant();

  const stats = getPropagationStats(propagations);
  const active = propagations.filter(p => !['complete', 'failed'].includes(p.stage));
  const completed = propagations.filter(p => ['complete', 'failed'].includes(p.stage));

  const displayed = filter === 'active' ? active
    : filter === 'completed' ? completed
    : propagations;

  const handleCreate = async (data) => {
    await createPropagation.mutateAsync(data);
    setShowForm(false);
  };

  const handleUpdate = (id, updates) => {
    updatePropagation.mutate({ id, updates });
  };

  const handleDelete = (id) => {
    deletePropagation.mutate(id);
  };

  const handleComplete = async (propagationId, plantName, propagation) => {
    // Create the new plant in the library
    await createPlant.mutateAsync({
      cultivar_name: plantName,
      source: `Propagation from ${propagation.parent_plant_name || 'unknown parent'}`,
      notes: `Propagated via ${propagation.method || 'unknown'} method, started ${propagation.cutting_date}`,
    });

    // Mark the propagation as complete
    await updatePropagation.mutateAsync({ id: propagationId, updates: { stage: 'complete' } });
  };

  const isPending = createPropagation.isPending || updatePropagation.isPending
    || deletePropagation.isPending || createPlant.isPending;

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <HeaderBar />
        <div className="flex items-center justify-center p-8" style={{ minHeight: 'calc(100vh - 60px)' }}>
          <p className="text-muted">Loading propagations...</p>
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
              <h1 className="heading heading-xl">Propagation Tracker</h1>
              <p className="text-body text-muted">Track leaf cuttings and plantlet growth</p>
            </div>
          </header>

          {/* Actions bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <button
              className="btn btn-primary"
              onClick={() => setShowForm(true)}
            >
              <Plus size={18} />
              New Cutting
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

          {/* New propagation form */}
          {showForm && (
            <div className="card p-6 mb-6">
              <h2 className="heading heading-md mb-4">Start New Propagation</h2>
              <PropagationForm
                plants={plants}
                onSubmit={handleCreate}
                onCancel={() => setShowForm(false)}
                isPending={createPropagation.isPending}
              />
            </div>
          )}

          {/* Stats */}
          {stats && propagations.length >= 2 && (
            <div className="mb-6">
              <PropagationStatsPanel stats={stats} />
            </div>
          )}

          {/* Propagation list */}
          {displayed.length > 0 ? (
            <div className="space-y-4">
              {displayed.map(prop => (
                <PropagationCard
                  key={prop.id}
                  propagation={prop}
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
                  <Scissors size={32} style={{ color: 'var(--purple-400)' }} />
                ) : (
                  <Sprout size={32} style={{ color: 'var(--purple-400)' }} />
                )}
              </div>
              <h2 className="heading heading-lg mb-2">
                {filter === 'active' ? 'No active propagations' : 'No propagations yet'}
              </h2>
              <p className="text-muted mb-6">
                {filter === 'active'
                  ? 'Start a new leaf cutting to begin tracking!'
                  : 'Take a leaf cutting and track its journey to becoming a new plant.'}
              </p>
              {!showForm && (
                <button className="btn btn-primary" onClick={() => setShowForm(true)}>
                  <Plus size={18} /> Start Your First Propagation
                </button>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
