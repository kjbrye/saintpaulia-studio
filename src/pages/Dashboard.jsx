/**
 * Dashboard Page - Thin orchestrator (under 150 lines)
 */

import { Link } from 'react-router-dom';
import { Flower2, Sparkles, Droplets, BookOpen, Calendar, Plus, ChevronRight } from 'lucide-react';
import { usePlants } from '../hooks/usePlants';
import { useAuth } from '../hooks/useAuth';
import { plantNeedsCare, getOverdueCareTypes } from '../utils/careStatus';
import { StatCard, ActionButton, PlantCareItem, BloomNotification } from '../components/dashboard';

export default function Dashboard() {
  const { user } = useAuth();
  const { data: plants = [], isLoading, error } = usePlants();

  // Derived data
  const plantsNeedingCare = plants.filter(plantNeedsCare).map(p => ({
    ...p,
    overdueCareTypes: getOverdueCareTypes(p),
  }));
  const bloomingCount = plants.filter(p => p.is_blooming).length;
  const displayName = user?.email?.split('@')[0] || 'Gardener';

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted">Loading your collection...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="card p-8 text-center max-w-md">
          <p className="heading heading-lg mb-2">Failed to load</p>
          <p className="text-muted mb-4">{error.message}</p>
          <button className="btn btn-primary" onClick={() => window.location.reload()}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 md:p-10">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <header className="flex items-center gap-5">
          <img
            src="/seal.png"
            alt="Saintpaulia Studio"
            className="h-16 w-auto"
            style={{ filter: 'drop-shadow(3px 3px 6px rgba(0,0,0,0.2))' }}
          />
          <div>
            <h1 className="heading heading-xl">Saintpaulia Studio</h1>
            <p className="text-body">Welcome back, {displayName}</p>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <StatCard
            label="Total Plants"
            value={plants.length}
            color="sage-700"
            icon={Flower2}
          />
          <StatCard
            label="Blooming"
            value={bloomingCount}
            color="purple-400"
            icon={Sparkles}
          />
          <StatCard
            label="Need Care"
            value={plantsNeedingCare.length}
            color="copper-500"
            icon={Droplets}
            accent="warning"
          />
        </div>

        {/* Quick Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          <ActionButton icon={BookOpen} label="Library" to="/library" />
          <ActionButton icon={Calendar} label="Calendar" to="/calendar" />
          <ActionButton icon={Plus} label="Add Plant" to="/plants/new" primary />
        </div>

        {/* Needs Attention Section */}
        {plantsNeedingCare.length > 0 && (
          <section className="card p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="status-indicator" />
                <h2 className="heading heading-lg">Needs Attention</h2>
              </div>
              <Link to="/library?filter=needs-care" className="btn btn-secondary btn-small">
                View all <ChevronRight size={16} />
              </Link>
            </div>

            <div className="card-inset p-4 space-y-3">
              {plantsNeedingCare.slice(0, 5).map(plant => (
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

        {/* All Caught Up */}
        {plants.length > 0 && plantsNeedingCare.length === 0 && (
          <section className="card p-8 text-center">
            <div className="status-indicator-success mx-auto mb-4" />
            <h2 className="heading heading-md">All Caught Up!</h2>
            <p className="text-muted">Your collection is thriving.</p>
          </section>
        )}

        {/* Bloom Notification */}
        <BloomNotification
          count={bloomingCount}
          latestPlant={plants.find(p => p.is_blooming)?.nickname}
        />
      </div>
    </div>
  );
}
