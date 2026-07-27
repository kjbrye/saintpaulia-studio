/**
 * Dashboard — v2 layout.
 *
 * A content pane: welcome hero, care snapshot, blooming now, collection at a
 * glance, and a bottom row of upcoming tasks + recent note. The surrounding
 * chrome — persistent left sidebar (desktop) / hamburger drawer (mobile) and
 * the top bar — now comes from the shared AppLayout shell, so the dashboard
 * renders *inside* it rather than owning it. This is a re-housing of the
 * existing dashboard's data (subtitle, Today task logic, care/overdue counts,
 * sanctuary moment) into the new palette — not new data.
 *
 * Thin orchestrator: data comes from the existing hooks; layout and copy
 * decisions live in components/dashboard/ and constants/.
 */

import { Link } from 'react-router-dom';
import { Flower2, Plus, Upload } from 'lucide-react';
import {
  DashboardHero,
  CareSnapshot,
  BloomingNow,
  CollectionGlance,
  UpcomingTasks,
  RecentNote,
} from '../components/dashboard';
import { usePlants } from '../hooks/usePlants';
import {
  useOverdueCounts,
  useBloomsToUpdate,
  useCollectionCounts,
} from '../hooks/useDashboard';
import { useSettings } from '../hooks/useSettings.jsx';
import { useAuth } from '../hooks/useAuth';
import { usePageTitle } from '../hooks/usePageTitle';
import { getCollectionCareStats } from '../utils/careStatus';
import { isArchived } from '../constants/plantStatus';

/** Most recent by created_at, descending. */
function byNewest(a, b) {
  return (a.created_at ?? '') < (b.created_at ?? '') ? 1 : -1;
}

export default function Dashboard() {
  usePageTitle('Dashboard');
  const { user } = useAuth();
  const { settings, updateSetting, careThresholds } = useSettings();

  const { data: plants = [], isLoading: plantsLoading, error: plantsError } = usePlants();
  const { data: overdueCounts } = useOverdueCounts();
  const { data: bloomsToUpdate } = useBloomsToUpdate();
  const { data: collectionCounts } = useCollectionCounts();

  const displayName =
    settings?.displayName?.trim() || user?.email?.split('@')[0] || 'Gardener';

  const activePlants = plants.filter((p) => !isArchived(p.status));
  const careStats = getCollectionCareStats(activePlants, careThresholds);

  const bloomingPlants = activePlants.filter((p) => p.is_blooming).sort(byNewest);

  // Plants that can be featured (have a photo), and the resolved hero photo:
  // the user's explicit pick when it still qualifies, else automatic
  // (most recent bloom / newest photographed plant).
  const photoCandidates = activePlants.filter((p) => p.photo_url);
  const chosenFeatured = settings.featuredPlantId
    ? photoCandidates.find((p) => p.id === settings.featuredPlantId)
    : null;
  const featuredPlant =
    chosenFeatured ??
    bloomingPlants.find((p) => p.photo_url) ??
    [...activePlants].sort(byNewest).find((p) => p.photo_url) ??
    null;

  if (plantsLoading) {
    return (
      <div className="flex items-center justify-center" style={{ minHeight: '50vh' }}>
        <p style={{ color: 'var(--text-quiet)' }}>Loading your collection…</p>
      </div>
    );
  }

  if (plantsError) {
    return (
      <div className="ds-card p-8 text-center max-w-md mx-auto" style={{ marginTop: 40 }}>
        <p className="ds-section-title" style={{ marginBottom: 8 }}>
          Failed to load
        </p>
        <p style={{ color: 'var(--text-body)', marginBottom: 16 }}>{plantsError.message}</p>
        <button className="ds-btn-primary" onClick={() => window.location.reload()}>
          Try again
        </button>
      </div>
    );
  }

  if (activePlants.length === 0) {
    return (
      <div className="ds-card p-10 text-center max-w-md mx-auto" style={{ marginTop: 40 }}>
        <div
          className="w-16 h-16 rounded-xl mx-auto mb-4 flex items-center justify-center"
          style={{ background: 'var(--purple-100)' }}
        >
          <Flower2 size={32} style={{ color: 'var(--purple-emphasis)' }} />
        </div>
        <h2 className="ds-section-title" style={{ marginBottom: 8 }}>
          Start your collection
        </h2>
        <p style={{ color: 'var(--text-body)', marginBottom: 24 }}>
          Add your first African violet to begin tracking care, growth, and blooming cycles.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/plants/new" className="ds-btn-primary">
            <Plus size={18} /> Add your first plant
          </Link>
          <Link to="/import" className="btn btn-secondary">
            <Upload size={18} /> Import a spreadsheet
          </Link>
        </div>
      </div>
    );
  }

  const bloomingCount = collectionCounts?.blooming ?? bloomingPlants.length;

  return (
    <>
      <DashboardHero
        displayName={displayName}
        featuredPlant={featuredPlant}
        candidates={photoCandidates}
        onSelectFeatured={(id) => updateSetting('featuredPlantId', id)}
        onResetFeatured={() => updateSetting('featuredPlantId', null)}
        overdueCounts={overdueCounts}
        bloomsToUpdate={bloomsToUpdate}
      />

      <CareSnapshot
        needWater={overdueCounts?.watering?.count ?? 0}
        needFertilizer={overdueCounts?.fertilizing?.count ?? 0}
        blooming={bloomingCount}
        upToDatePct={careStats.healthPercentage}
      />

      <BloomingNow plants={bloomingPlants.slice(0, 4)} />

      <CollectionGlance counts={collectionCounts} />

      <div className="dash-bottom-grid">
        <UpcomingTasks overdueCounts={overdueCounts} bloomsToUpdate={bloomsToUpdate} />
        <RecentNote />
      </div>
    </>
  );
}
