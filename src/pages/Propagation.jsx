/**
 * Propagation Page — pipeline summary, filters, and propagation rows.
 */

import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Scissors } from 'lucide-react';
import { usePlants } from '../hooks/usePlants';
import { isArchived } from '../constants/plantStatus';
import {
  usePropagations,
  useCreatePropagation,
  useAdvanceStage,
  useUnmarkFailed,
} from '../hooks/usePropagation';
import HeaderBar from '../components/ui/HeaderBar';
import {
  PropagationForm,
  PipelineSummary,
  PropagationFilterBar,
  PropagationRow,
  AdvanceStageModal,
} from '../components/propagation';
import {
  ACTIVE_STAGE_KEYS,
  getNextStage,
  getStageIndex,
} from '../utils/propagationStages';
import PremiumGate from '../components/ui/PremiumGate';
import { usePageTitle } from '../hooks/usePageTitle';

const TABS = [
  { key: 'active', label: 'Active' },
  { key: 'established', label: 'Established' },
  { key: 'failed', label: 'Failed' },
];

export default function Propagation() {
  usePageTitle('Propagation');
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [tab, setTab] = useState('active');
  const [stageFilter, setStageFilter] = useState('all');
  const [parentFilter, setParentFilter] = useState('all');
  const [sortBy, setSortBy] = useState('oldest');
  const [advanceTarget, setAdvanceTarget] = useState(null); // propagation object

  const { data: allPlants = [] } = usePlants();
  const plants = useMemo(() => allPlants.filter((p) => !isArchived(p.status)), [allPlants]);
  const { data: propagations = [], isLoading, error } = usePropagations();
  const createPropagation = useCreatePropagation();
  const advanceStage = useAdvanceStage();
  const unmarkFailed = useUnmarkFailed();

  const active = useMemo(
    () => propagations.filter((p) => ACTIVE_STAGE_KEYS.includes(p.stage)),
    [propagations],
  );
  const established = useMemo(
    () => propagations.filter((p) => p.stage === 'complete'),
    [propagations],
  );
  const failed = useMemo(
    () => propagations.filter((p) => p.stage === 'failed'),
    [propagations],
  );

  const tabSource = tab === 'active' ? active : tab === 'established' ? established : failed;

  const parentOptions = useMemo(() => {
    const map = new Map();
    propagations.forEach((p) => {
      const id = p.parent_plant_id;
      if (!id) return;
      if (!map.has(id)) {
        map.set(id, {
          id,
          name:
            p.parent_plant?.cultivar_name ||
            p.parent_plant?.nickname ||
            p.parent_plant_name ||
            'Unknown',
        });
      }
    });
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [propagations]);

  const filtered = useMemo(() => {
    let list = tabSource;
    if (stageFilter !== 'all') list = list.filter((p) => p.stage === stageFilter);
    if (parentFilter !== 'all') list = list.filter((p) => p.parent_plant_id === parentFilter);
    list = [...list].sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.cutting_date || 0) - new Date(a.cutting_date || 0);
        case 'stage':
          return getStageIndex(a.stage) - getStageIndex(b.stage);
        case 'parent': {
          const an = a.parent_plant?.cultivar_name || a.parent_plant_name || '';
          const bn = b.parent_plant?.cultivar_name || b.parent_plant_name || '';
          return an.localeCompare(bn);
        }
        case 'oldest':
        default:
          return new Date(a.cutting_date || 0) - new Date(b.cutting_date || 0);
      }
    });
    return list;
  }, [tabSource, stageFilter, parentFilter, sortBy]);

  const handleCreate = async (data) => {
    await createPropagation.mutateAsync(data);
    setShowForm(false);
  };

  const handleAdvanceClick = (propagation) => {
    const next = getNextStage(propagation.stage);
    if (!next) return;
    if (next.key === 'complete') {
      // Route to AddPlant with prefill — establishing creates a plant entry
      const params = new URLSearchParams({
        propagation_id: propagation.id,
        cultivar_name:
          propagation.parent_plant?.cultivar_name ||
          propagation.parent_plant_name ||
          '',
      });
      if (propagation.parent_plant_id) {
        params.set('parent_plant_id', propagation.parent_plant_id);
      }
      navigate(`/plants/new?${params.toString()}`);
      return;
    }
    setAdvanceTarget(propagation);
  };

  const handleAdvanceConfirm = async ({ note }) => {
    if (!advanceTarget) return;
    const next = getNextStage(advanceTarget.stage);
    await advanceStage.mutateAsync({ id: advanceTarget.id, nextStage: next.key, note });
    setAdvanceTarget(null);
  };

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

  const stageCount = new Set(active.map((p) => p.stage)).size;
  const subtitle =
    active.length === 0
      ? 'No active cuttings yet'
      : `${active.length} active ${active.length === 1 ? 'cutting' : 'cuttings'} across ${stageCount} ${stageCount === 1 ? 'stage' : 'stages'}`;

  return (
    <div className="min-h-screen">
      <HeaderBar />

      <PremiumGate feature="propagation">
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
                  <h1 className="heading heading-xl">Propagation</h1>
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
                New Cutting
              </button>
            </header>

            {/* Tabs */}
            <div
              className="flex items-center gap-6 mb-5"
              style={{ borderBottom: '1px solid var(--sage-200)' }}
            >
              {TABS.map((t) => {
                const count =
                  t.key === 'active' ? active.length : t.key === 'established' ? established.length : failed.length;
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

            {/* New form */}
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

            {/* Pipeline summary */}
            {tab === 'active' && propagations.length > 0 && (
              <PipelineSummary propagations={propagations} />
            )}

            {/* Filters */}
            {tabSource.length > 0 && (
              <PropagationFilterBar
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
                {filtered.map((prop) => (
                  <PropagationRow
                    key={prop.id}
                    propagation={prop}
                    onAdvance={handleAdvanceClick}
                    onRestore={(p) => unmarkFailed.mutate({ id: p.id })}
                  />
                ))}
              </div>
            ) : (
              <EmptyState tab={tab} onStart={() => setShowForm(true)} showCta={!showForm} />
            )}
          </div>
        </main>
      </PremiumGate>

      <AdvanceStageModal
        open={!!advanceTarget}
        propagation={advanceTarget}
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
          title: 'Start your first propagation',
          body: 'Take a leaf cutting from a plant in your collection and track its journey.',
        }
      : tab === 'established'
        ? {
            title: 'No established propagations yet',
            body: 'Successful cuttings will appear here once they’re added to your collection.',
          }
        : {
            title: 'No failed propagations',
            body: 'Cuttings that don’t make it will be tracked here for reference.',
          };
  return (
    <div className="panel p-10 text-center">
      <div
        className="w-16 h-16 rounded-xl mx-auto mb-4 flex items-center justify-center"
        style={{ background: 'var(--purple-100)' }}
      >
        <Scissors size={32} style={{ color: 'var(--purple-400)' }} />
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
          New Cutting
        </button>
      )}
    </div>
  );
}
