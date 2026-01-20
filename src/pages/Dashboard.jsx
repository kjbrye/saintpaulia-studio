/**
 * Dashboard Page - Command Center Layout
 * Multi-panel view for at-a-glance collection management
 */

import { Link } from 'react-router-dom';
import { Flower2, Plus } from 'lucide-react';
import { usePlants } from '../hooks/usePlants';
import { useAuth } from '../hooks/useAuth';
import { useSettings } from '../hooks/useSettings.jsx';
import { useRecentCareLogs } from '../hooks/useCare';
import { plantNeedsCare, getOverdueCareTypes, getCollectionCareStats } from '../utils/careStatus';
import HeaderBar from '../components/ui/HeaderBar';
import {
  NeedsAttentionPanel,
  QuickActionsPanel,
  RecentActivityPanel,
  StatsPanel,
  BloomingPanel,
  CareOverviewPanel,
} from '../components/dashboard';

export default function Dashboard() {
  const { user } = useAuth();
  const { careThresholds } = useSettings();
  const { data: plants = [], isLoading, error } = usePlants();
  const { data: recentLogs = [], isLoading: logsLoading } = useRecentCareLogs(10);

  // Derived data
  const plantsNeedingCare = plants.filter(p => plantNeedsCare(p, careThresholds)).map(p => ({
    ...p,
    overdueCareTypes: getOverdueCareTypes(p, careThresholds),
  }));
  const bloomingPlants = plants.filter(p => p.is_blooming);
  const stats = getCollectionCareStats(plants, careThresholds);
  const displayName = user?.email?.split('@')[0] || 'Gardener';

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <HeaderBar />
        <div className="flex items-center justify-center p-8" style={{ minHeight: 'calc(100vh - 60px)' }}>
          <p className="text-muted">Loading your collection...</p>
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

  // Empty state
  if (plants.length === 0) {
    return (
      <div className="min-h-screen">
        <HeaderBar />
        <div className="flex items-center justify-center p-8" style={{ minHeight: 'calc(100vh - 60px)' }}>
          <div className="panel p-10 text-center max-w-md">
            <div
              className="w-16 h-16 rounded-xl mx-auto mb-4 flex items-center justify-center"
              style={{ background: 'var(--purple-100)' }}
            >
              <Flower2 size={32} style={{ color: 'var(--purple-400)' }} />
            </div>
            <h2 className="heading heading-lg mb-2">Start Your Collection</h2>
            <p className="text-muted mb-6">
              Add your first African violet to begin tracking care, growth, and blooming cycles.
            </p>
            <Link to="/plants/new" className="btn btn-primary">
              <Plus size={18} /> Add Your First Plant
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <HeaderBar />

      <main className="p-4 md:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Welcome message */}
          <div className="mb-6">
            <h1 className="heading heading-lg">Welcome back, {displayName}</h1>
            <p className="text-body text-muted">Here's your collection at a glance</p>
          </div>

          {/* Command Center Grid */}
          <div className="dashboard-grid">
            {/* Care Overview - spans 2 columns */}
            <CareOverviewPanel stats={stats} />

            {/* Quick Actions */}
            <QuickActionsPanel />

            {/* Collection Stats */}
            <NeedsAttentionPanel totalPlants={plants.length} bloomingCount={bloomingPlants.length} />

            {/* Recent Activity */}
            <RecentActivityPanel careLogs={recentLogs} isLoading={logsLoading} />

            {/* Blooming Panel (conditional) */}
            <BloomingPanel bloomingPlants={bloomingPlants} />
          </div>
        </div>
      </main>
    </div>
  );
}
