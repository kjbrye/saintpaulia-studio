/**
 * Breeding Page — pipeline summary, filters, and cross rows.
 *
 * Mirrors the propagation list page structurally; both are parallel concepts.
 */

import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Plus, Heart } from 'lucide-react';
import { usePlants } from '../hooks/usePlants';
import { isArchived } from '../constants/plantStatus';
import {
  useCrosses,
  useCreateCross,
  useAdvanceStage,
  useUnmarkFailed,
} from '../hooks/useBreeding';
import HeaderBar from '../components/ui/HeaderBar';
import {
  CrossForm,
  CrossPipelineSummary,
  CrossFilterBar,
  CrossRow,
  AdvanceCrossStageModal,
} from '../components/breeding';
import {
  ACTIVE_STAGE_KEYS,
  getNextStage,
  getStageIndex,
  isActive,
  isComplete,
  isFailed,
  getPodParentName,
  getPollenParentName,
} from '../utils/breedingStages';
import PremiumGate from '../components/ui/PremiumGate';
import { usePageTitle } from '../hooks/usePageTitle';

const TABS = [
  { key: 'active', label: 'Active' },
  { key: 'complete', label: 'Complete' },
  { key: 'failed', label: 'Failed' },
];

export default function Breeding() {
  usePageTitle('Breeding');
  const [showForm, setShowForm] = useState(false);
  const [tab, setTab] = useState('active');
  const [stageFilter, setStageFilter] = useState('all');
  const [parentFilter, setParentFilter] = useState('all');
  const [sortBy, setSortBy] = useState('oldest');
  const [advanceTarget, setAdvanceTarget] = useState(null);

  const { data: allPlants = [] } = usePlants();
  const plants = useMemo(() => allPlants.filter((p) => !isArchived(p.status)), [allPlants]);
  const { data: crosses = [], isLoading, error } = useCrosses();
  const createCross = useCreateCross();
  const advanceStage = useAdvanceStage();
  const unmarkFailed = useUnmarkFailed();

  const active = useMemo(() => crosses.filter(isActive), [crosses]);
  const complete = useMemo(() => crosses.filter(isComplete), [crosses]);
  const failed = useMemo(() => crosses.filter(isFailed), [crosses]);

  const tabSource = tab === 'active' ? active : tab === 'complete' ? complete : failed;

  const parentOptions = useMemo(() => {
    const map = new Map();
    crosses.forEach((c) => {
      [
        [c.pod_parent_id, getPodParentName(c)],
        [c.pollen_parent_id, getPollenParentName(c)],
      ].forEach(([id, name]) => {
        if (id && !map.has(id)) map.set(id, { id, name });
      });
    });
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [crosses]);

  const filtered = useMemo(() => {
    let list = tabSource;
    if (stageFilter !== 'all') list = list.filter((c) => c.stage === stageFilter);
    if (parentFilter !== 'all')
      list = list.filter(
        (c) => c.pod_parent_id === parentFilter || c.pollen_parent_id === parentFilter,
      );
    list = [...list].sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.cross_date || 0) - new Date(a.cross_date || 0);
        case 'stage':
          return getStageIndex(a.stage) - getStageIndex(b.stage);
        case 'parent': {
          const an = getPodParentName(a);
          const bn = getPodParentName(b);
          return an.localeCompare(bn);
        }
        case 'oldest':
        default:
          return new Date(a.cross_date || 0) - new Date(b.cross_date || 0);
      }
    });
    return list;
  }, [tabSource, stageFilter, parentFilter, sortBy]);

  const handleCreate = async (data) => {
    await createCross.mutateAsync(data);
    setShowForm(false);
  };

  const handleAdvanceClick = (cross) => {
    const next = getNextStage(cross.stage);
    if (!next) return;
    setAdvanceTarget(cross);
  };

  const handleAdvanceConfirm = async ({ note }) => {
    if (!advanceTarget) return;
    const next = getNextStage(advanceTarget.stage);
    await advanceStage.mutateAsync({
      crossId: advanceTarget.id,
      stage: next.key,
      notes: note || undefined,
    });
    setAdvanceTarget(null);
  };

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

  const stageCount = new Set(active.map((c) => c.stage)).size;
  const subtitle =
    active.length === 0
      ? 'No active crosses yet'
      : `${active.length} active ${active.length === 1 ? 'cross' : 'crosses'} across ${stageCount} ${stageCount === 1 ? 'stage' : 'stages'}`;

  return (
    <div className="min-h-screen">
      <HeaderBar />

      <PremiumGate feature="breeding">
        <main className="p-4 md:p-6 lg:p-8">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <header className="flex items-start justify-between gap-4 mb-6">
              <div className="flex items-start gap-4">
                <Link to="/">
                  <button type="button" className="icon-container">
                    <ArrowLeft size={20} style={{ color: 'var(--sage-600)' }} />
                  </button>
                </Link>
                <div>
                  <h1 className="heading heading-xl">Breeding</h1>
                  <p
                    className="mt-1"
                    style={{
                      fontFamily: 'var(--font-heading)',
                      fontStyle: 'italic',
                      fontSize: 18,
                      color: 'var(--purple-500)',
                    }}
                  >
                    {subtitle}
                  </p>
                </div>
              </div>
              <button className="btn btn-primary" onClick={() => setShowForm(true)}>
                <Plus size={18} />
                New Cross
              </button>
            </header>

            {/* Tabs */}
            <div
              className="flex items-center gap-6 mb-5"
              style={{ borderBottom: '1px solid var(--sage-200)' }}
            >
              {TABS.map((t) => {
                const count =
                  t.key === 'active'
                    ? active.length
                    : t.key === 'complete'
                      ? complete.length
                      : failed.length;
                return (
                  <TabButton
                    key={t.key}
                    active={tab === t.key}
                    onClick={() => setTab(t.key)}
                    label={t.label}
                    count={count}
                  />
                );
              })}
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

            {/* Pipeline summary */}
            {tab === 'active' && crosses.length > 0 && (
              <CrossPipelineSummary crosses={crosses} />
            )}

            {/* Filters */}
            {tabSource.length > 0 && (
              <CrossFilterBar
                stage={stageFilter}
                onStageChange={setStageFilter}
                parentId={parentFilter}
                onParentChange={setParentFilter}
                parentOptions={parentOptions}
                sortBy={sortBy}
                onSortChange={setSortBy}
              />
            )}

            {/* List */}
            {filtered.length > 0 ? (
              <div className="space-y-4">
                {filtered.map((cross) => (
                  <CrossRow
                    key={cross.id}
                    cross={cross}
                    onAdvance={handleAdvanceClick}
                    onRestore={(c) => unmarkFailed.mutate({ id: c.id })}
                  />
                ))}
              </div>
            ) : (
              <EmptyState tab={tab} onStart={() => setShowForm(true)} showCta={!showForm} />
            )}
          </div>
        </main>
      </PremiumGate>

      <AdvanceCrossStageModal
        open={!!advanceTarget}
        cross={advanceTarget}
        nextStageKey={advanceTarget ? getNextStage(advanceTarget.stage)?.key : null}
        onConfirm={handleAdvanceConfirm}
        onCancel={() => setAdvanceTarget(null)}
        isPending={advanceStage.isPending}
      />
    </div>
  );
}

function TabButton({ active, onClick, label, count }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="pb-2 -mb-px transition-colors"
      style={{
        fontFamily: 'var(--font-heading)',
        fontWeight: 600,
        fontSize: 18,
        color: active ? 'var(--sage-700)' : 'var(--text-muted)',
        borderBottom: active ? '2px solid var(--sage-500)' : '2px solid transparent',
      }}
    >
      {label}
      <span
        className="ml-1.5"
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: 13,
          fontWeight: 600,
          color: active ? 'var(--sage-500)' : 'var(--text-muted)',
        }}
      >
        {count}
      </span>
    </button>
  );
}

function EmptyState({ tab, onStart, showCta }) {
  const copy =
    tab === 'active'
      ? {
          title: 'Start your first cross',
          body: 'Pollinate a violet from your collection and track its journey from pod to bloom.',
        }
      : tab === 'complete'
        ? {
            title: 'No completed crosses yet',
            body: 'Crosses that reach blooming will appear here.',
          }
        : {
            title: 'No failed crosses',
            body: 'Crosses that don’t make it will be tracked here for reference.',
          };
  return (
    <div className="panel p-10 text-center">
      <div
        className="w-16 h-16 rounded-xl mx-auto mb-4 flex items-center justify-center"
        style={{ background: 'var(--purple-100)' }}
      >
        <Heart size={32} style={{ color: 'var(--purple-400)' }} />
      </div>
      <h2
        style={{
          fontFamily: 'var(--font-heading)',
          fontStyle: 'italic',
          fontSize: 22,
          color: 'var(--purple-500)',
        }}
      >
        {copy.title}
      </h2>
      <p className="text-muted mt-2 mb-6">{copy.body}</p>
      {tab === 'active' && showCta && (
        <button className="btn btn-primary" onClick={onStart}>
          <Plus size={18} />
          New Cross
        </button>
      )}
    </div>
  );
}
