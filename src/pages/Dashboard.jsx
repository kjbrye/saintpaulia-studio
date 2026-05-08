/**
 * Dashboard Page - Command Center Layout
 * Multi-panel view for at-a-glance collection management
 */

import { Link } from 'react-router-dom';
import { Flower2, Plus, Upload } from 'lucide-react';
import { usePlants } from '../hooks/usePlants';
import { useAuth } from '../hooks/useAuth';
import { useSettings } from '../hooks/useSettings.jsx';
import { useRecentCareLogs } from '../hooks/useCare';
import { usePropagations } from '../hooks/usePropagation';
import { useCrosses } from '../hooks/useBreeding';
import { useSports } from '../hooks/useSports';
import { getCollectionCareStats } from '../utils/careStatus';
import { isArchived } from '../constants/plantStatus';
import { usePageTitle } from '../hooks/usePageTitle';
import HeaderBar from '../components/ui/HeaderBar';
import {
  CollectionStatsPanel,
  QuickActionsPanel,
  RecentActivityPanel,
  CareOverviewPanel,
} from '../components/dashboard';

export default function Dashboard() {
  usePageTitle('Dashboard');
  const { user } = useAuth();
  const { settings, careThresholds } = useSettings();
  const { data: plants = [], isLoading, error } = usePlants();
  const { data: recentLogs = [], isLoading: logsLoading } = useRecentCareLogs(10);
  const { data: propagations = [] } = usePropagations();
  const { data: crosses = [] } = useCrosses();
  const { data: sports = [] } = useSports();

  // Derived data — exclude archived plants from active views
  const activePlants = plants.filter((p) => !isArchived(p.status));
  const bloomingPlants = activePlants.filter((p) => p.is_blooming);
  const activePropagations = propagations.filter(
    (p) => p.stage !== 'complete' && p.stage !== 'failed',
  );
  const activeCrosses = crosses.filter((c) => c.stage !== 'blooming' && c.stage !== 'failed');
  const stats = getCollectionCareStats(activePlants, careThresholds);
  const displayName =
    settings.displayName?.trim() || user?.email?.split('@')[0] || 'Gardener';

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <HeaderBar />
        <div
          className="flex items-center justify-center p-8"
          style={{ minHeight: 'calc(100vh - 60px)' }}
        >
          <p className="text-muted">Loading your collection...</p>
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

  // Empty state
  if (activePlants.length === 0) {
    return (
      <div className="min-h-screen">
        <HeaderBar />
        <div
          className="flex items-center justify-center p-8"
          style={{ minHeight: 'calc(100vh - 60px)' }}
        >
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
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/plants/new" className="btn btn-primary">
                <Plus size={18} /> Add Your First Plant
              </Link>
              <Link to="/import" className="btn btn-secondary">
                <Upload size={18} /> Import a spreadsheet
              </Link>
            </div>
            <p className="text-small mt-4" style={{ color: 'var(--text-muted)' }}>
              Already have your collection in Excel or Google Sheets? Bring it over in one go.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const showImportPrompt = activePlants.length > 0 && activePlants.length < 5;

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

          {showImportPrompt && (
            <Link
              to="/import"
              className="card-subtle p-4 mb-6 flex items-center gap-3 no-underline"
              style={{ color: 'var(--text-secondary)' }}
            >
              <div className="icon-container icon-container-sm">
                <Upload size={16} style={{ color: 'var(--sage-600)' }} />
              </div>
              <div className="flex-1">
                <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                  Got more plants on a spreadsheet?
                </p>
                <p className="text-small" style={{ color: 'var(--text-muted)' }}>
                  Import the rest of your collection from CSV or XLSX in one go.
                </p>
              </div>
              <span className="text-small font-semibold" style={{ color: 'var(--sage-600)' }}>
                Import →
              </span>
            </Link>
          )}

          {/* Command Center Grid */}
          <div className="dashboard-grid">
            {/* Care Overview - spans 2 columns */}
            <CareOverviewPanel stats={stats} />

            {/* Quick Actions */}
            <QuickActionsPanel />

            {/* Collection Stats */}
            <CollectionStatsPanel
              plants={activePlants}
              bloomingPlants={bloomingPlants}
              propagationCount={activePropagations.length}
              breedingCount={activeCrosses.length}
              sportCount={sports.length}
            />

            {/* Recent Activity */}
            <RecentActivityPanel careLogs={recentLogs} isLoading={logsLoading} />
          </div>
        </div>
      </main>
    </div>
  );
}
