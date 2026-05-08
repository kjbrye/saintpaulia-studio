/**
 * Dashboard — actionable top, ambient bottom.
 *
 * Thin orchestrator. Data comes from useDashboard hooks; layout and copy
 * decisions live in components/dashboard/. See the v0.2 spec for shape.
 */

import { Link } from 'react-router-dom';
import { Flower2, Plus, Upload } from 'lucide-react';
import HeaderBar from '../components/ui/HeaderBar';
import {
  DashboardHeader,
  TodaySection,
  CareOverviewCard,
  CollectionAtAGlance,
  RecentActivity,
  SanctuaryMoment,
} from '../components/dashboard';
import { usePlants } from '../hooks/usePlants';
import {
  useOverdueCounts,
  useBloomsToUpdate,
  useCollectionCounts,
} from '../hooks/useDashboard';
import { useSubscription } from '../hooks/useSubscription';
import { useSettings } from '../hooks/useSettings.jsx';
import { usePageTitle } from '../hooks/usePageTitle';
import { getCollectionCareStats } from '../utils/careStatus';
import { isArchived } from '../constants/plantStatus';

export default function Dashboard() {
  usePageTitle('Dashboard');
  const { careThresholds } = useSettings();
  const { isPremium } = useSubscription();

  const { data: plants = [], isLoading: plantsLoading, error: plantsError } = usePlants();
  const { data: overdueCounts } = useOverdueCounts();
  const { data: bloomsToUpdate } = useBloomsToUpdate();
  const { data: collectionCounts } = useCollectionCounts();

  const activePlants = plants.filter((p) => !isArchived(p.status));
  const careStats = getCollectionCareStats(activePlants, careThresholds);

  if (plantsLoading) {
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

  if (plantsError) {
    return (
      <div className="min-h-screen">
        <HeaderBar />
        <div
          className="flex items-center justify-center p-8"
          style={{ minHeight: 'calc(100vh - 60px)' }}
        >
          <div className="panel p-8 text-center max-w-md">
            <p className="heading heading-lg mb-2">Failed to load</p>
            <p className="text-muted mb-4">{plantsError.message}</p>
            <button className="btn btn-primary" onClick={() => window.location.reload()}>
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

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
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <HeaderBar />
      <main className="p-4 md:p-6 lg:p-8">
        <div className="max-w-5xl mx-auto">
          <DashboardHeader
            overdueCounts={overdueCounts}
            bloomsToUpdate={bloomsToUpdate}
          />
          <TodaySection
            overdueCounts={overdueCounts ?? {}}
            bloomsToUpdate={bloomsToUpdate}
            isPremium={isPremium}
          />
          <CareOverviewCard stats={careStats} />
          <CollectionAtAGlance counts={collectionCounts} isPremium={isPremium} />
          <RecentActivity />
          <SanctuaryMoment />
        </div>
      </main>
    </div>
  );
}
