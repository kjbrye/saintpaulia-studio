/**
 * Dashboard Page - Calming "garden view" landing page
 * Thin orchestrator (under 150 lines)
 */

import { Link } from 'react-router-dom';
import { Flower2, BookOpen, Droplets, Plus, ChevronRight, Settings, Heart } from 'lucide-react';
import { usePlants } from '../hooks/usePlants';
import { useAuth } from '../hooks/useAuth';
import { useSettings } from '../hooks/useSettings.jsx';
import { plantNeedsCare, getOverdueCareTypes } from '../utils/careStatus';
import { ActionButton, PlantCareItem, CollectionOverviewCard, BloomingHighlight, CareStatsSummary } from '../components/dashboard';

export default function Dashboard() {
  const { user } = useAuth();
  const { careThresholds } = useSettings();
  const { data: plants = [], isLoading, error } = usePlants();

  // Derived data
  const plantsNeedingCare = plants.filter(p => plantNeedsCare(p, careThresholds)).map(p => ({
    ...p,
    overdueCareTypes: getOverdueCareTypes(p, careThresholds),
  }));
  const bloomingPlants = plants.filter(p => p.is_blooming);
  const displayName = user?.email?.split('@')[0] || 'Gardener';

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-muted">Loading your collection...</p>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="card p-8 text-center max-w-md">
        <p className="heading heading-lg mb-2">Failed to load</p>
        <p className="text-muted mb-4">{error.message}</p>
        <button className="btn btn-primary" onClick={() => window.location.reload()}>Try Again</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen p-6 md:p-10">
      <div className="max-w-4xl mx-auto space-y-10">
        {/* Header */}
        <header className="flex items-center gap-5">
          <img
            src="/seal.png"
            alt="Saintpaulia Studio"
            className="h-16 w-auto"
            style={{ filter: 'drop-shadow(3px 3px 6px rgba(0,0,0,0.2))' }}
          />
          <div className="flex-1">
            <h1 className="heading heading-xl">Saintpaulia Studio</h1>
            <p className="text-body">Welcome back, {displayName}</p>
          </div>
          <Link to="/settings">
            <button className="icon-container">
              <Settings size={20} color="var(--sage-600)" />
            </button>
          </Link>
        </header>

        {/* Quick Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          <ActionButton icon={BookOpen} label="Library" to="/library" />
          <ActionButton icon={Droplets} label="Care Log" to="/care" />
          <ActionButton icon={Plus} label="Add Plant" to="/plants/new" primary />
        </div>

        {/* Collection Overview Card */}
        {plants.length > 0 && (
          <CollectionOverviewCard
            plants={plants}
            bloomingCount={bloomingPlants.length}
            needsCareCount={plantsNeedingCare.length}
          />
        )}

        {/* Care Statistics Summary */}
        <CareStatsSummary plants={plants} careThresholds={careThresholds} />

        {/* Blooming Highlight (conditional) */}
        <BloomingHighlight bloomingPlants={bloomingPlants} />

        {/* Needs a little love Section (conditional) */}
        {plantsNeedingCare.length > 0 && (
          <section className="card p-10">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="icon-container-cream" style={{ width: 48, height: 48 }}>
                  <Heart size={24} style={{ color: 'var(--copper-500)' }} />
                </div>
                <h2 className="heading heading-lg">Needs a little love</h2>
              </div>
              {plantsNeedingCare.length > 3 && (
                <Link to="/library?filter=needs-care" className="btn btn-secondary btn-small">
                  View all <ChevronRight size={16} />
                </Link>
              )}
            </div>

            <div className="space-y-4">
              {plantsNeedingCare.slice(0, 3).map(plant => (
                <PlantCareItem key={plant.id} {...plant} />
              ))}
            </div>
          </section>
        )}

        {/* Empty State */}
        {plants.length === 0 && (
          <section className="card p-10 text-center">
            <div className="icon-container-purple mx-auto mb-4" style={{ width: 72, height: 72 }}>
              <Flower2 size={36} style={{ color: 'var(--purple-400)' }} />
            </div>
            <h2 className="heading heading-lg mb-2">Start Your Collection</h2>
            <p className="text-muted mb-6 max-w-md mx-auto">
              Add your first African violet to begin tracking care, growth, and blooming cycles.
            </p>
            <Link to="/plants/new" className="btn btn-primary">
              <Plus size={20} /> Add Your First Plant
            </Link>
          </section>
        )}
      </div>
    </div>
  );
}
