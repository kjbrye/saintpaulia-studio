/**
 * Dashboard Page
 * 
 * This is what a "thin page" looks like:
 * - Uses hooks for data
 * - Uses utility functions for business logic
 * - Composes small, focused components
 * - Under 150 lines total
 */

import { Link } from 'react-router-dom';
import { Library, Plus, Calendar } from 'lucide-react';
import { usePlants } from '../hooks/usePlants';
import { useAuth } from '../hooks/useAuth';
import { plantNeedsCare } from '../utils/careStatus';
import { Card, Button } from '../components/ui';

export default function Dashboard() {
  const { user } = useAuth();
  const { data: plants = [], isLoading, error } = usePlants();

  // Derived data - computed from the fetched data
  const plantsNeedingCare = plants.filter(plantNeedsCare);
  const displayName = user?.email?.split('@')[0] || 'Gardener';

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-[var(--text-muted)]">Loading your collection...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="max-w-md text-center">
          <h2 className="heading text-xl mb-2">Failed to load collection</h2>
          <p className="text-[var(--text-muted)] mb-4">{error.message}</p>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-12">
          <h1 className="heading text-4xl font-bold text-[var(--text-primary)]">
            Saintpaulia Studio
          </h1>
          <p className="text-[var(--text-secondary)] mt-1">
            Welcome back, {displayName}
          </p>
        </header>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-10">
          <Link to="/library">
            <Button className="w-full" size="lg">
              <Library className="w-5 h-5" />
              Library
            </Button>
          </Link>
          <Link to="/calendar">
            <Button className="w-full" size="lg">
              <Calendar className="w-5 h-5" />
              Calendar
            </Button>
          </Link>
          <Link to="/plants/new">
            <Button variant="primary" className="w-full" size="lg">
              <Plus className="w-5 h-5" />
              Add Plant
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <Card>
            <p className="text-[var(--text-muted)] text-sm">Total Plants</p>
            <p className="heading text-3xl font-bold text-[var(--accent-secondary)]">
              {plants.length}
            </p>
          </Card>
          <Card>
            <p className="text-[var(--text-muted)] text-sm">Need Attention</p>
            <p className="heading text-3xl font-bold text-[var(--color-warning)]">
              {plantsNeedingCare.length}
            </p>
          </Card>
          <Card>
            <p className="text-[var(--text-muted)] text-sm">Healthy</p>
            <p className="heading text-3xl font-bold text-[var(--color-success)]">
              {plants.length - plantsNeedingCare.length}
            </p>
          </Card>
        </div>

        {/* Empty State */}
        {plants.length === 0 && (
          <Card className="text-center py-12">
            <div className="w-16 h-16 rounded-2xl bg-[var(--bg-elevated)] flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🌸</span>
            </div>
            <h2 className="heading text-xl font-bold mb-2">
              Start Your Collection
            </h2>
            <p className="text-[var(--text-muted)] mb-6 max-w-md mx-auto">
              Add your first African violet to begin tracking care, growth, and blooming cycles.
            </p>
            <Link to="/plants/new">
              <Button variant="primary">
                <Plus className="w-5 h-5" />
                Add Your First Plant
              </Button>
            </Link>
          </Card>
        )}

        {/* Plants Needing Care */}
        {plantsNeedingCare.length > 0 && (
          <Card>
            <h2 className="heading text-xl font-bold mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[var(--color-warning)]" />
              Need Attention
            </h2>
            <div className="space-y-3">
              {plantsNeedingCare.slice(0, 5).map((plant) => (
                <Link key={plant.id} to={`/plants/${plant.id}`}>
                  <div className="neuro-button rounded-2xl p-4">
                    <p className="font-semibold text-[var(--text-primary)]">
                      {plant.nickname || plant.cultivar_name}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
