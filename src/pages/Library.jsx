/**
 * Library Page - Plant collection browser with batch selection
 */

import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Plus, ChevronLeft, ChevronRight, CheckSquare, Square } from 'lucide-react';
import { usePlants } from '../hooks/usePlants';
import { useBloomLogs } from '../hooks/useBlooms';
import { useSettings } from '../hooks/useSettings.jsx';
import { plantNeedsCare, getOverdueCareTypes } from '../utils/careStatus';
import { isArchived } from '../constants/plantStatus';
import {
  VARIETY_CLASS_BUCKETS,
  VARIETY_CLASS_BUCKET_BY_SIZE,
  BLOOM_TYPE_LABELS,
} from '../constants/plantOptions';
import { buildBloomHistoryMap } from '../utils/bloomHistory';
import PlantCard from '../components/library/PlantCard';
import PlantListItem from '../components/library/PlantListItem';
import LibraryFilterBar, { SORT_LABELS } from '../components/library/LibraryFilterBar';
import LibraryFilterDrawer from '../components/library/LibraryFilterDrawer';
import BatchActionsToolbar from '../components/library/BatchActionsToolbar';
import { EmptyLibrary, NoResults } from '../components/library/EmptyState';
import { usePageTitle } from '../hooks/usePageTitle';

const POT_SIZE_ORDER = ['2"', '2.5"', '3"', '3.5"', '4"', '4.5"', '5"', '6"', '6"+'];
const POT_SIZE_INDEX = POT_SIZE_ORDER.reduce((acc, v, i) => {
  acc[v] = i;
  return acc;
}, {});

const EMPTY_FILTERS = {
  potSize: 'all',
  bloomColor: 'all',
  bloomType: 'all',
  bloomingFilter: 'all',
  varietyClasses: [],
  hybridizer: 'all',
};

const titleCase = (str) =>
  str
    ? str
        .split(/[\s-]/)
        .filter(Boolean)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ')
    : str;

export default function Library() {
  usePageTitle('Library');
  const { settings, careThresholds } = useSettings();
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const searchTimerRef = useRef(null);
  const handleSearch = useCallback((value) => {
    setSearchQuery(value);
    clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => setDebouncedSearch(value), 200);
  }, []);
  const [viewMode, setViewMode] = useState(settings.defaultView);
  const [sortBy, setSortBy] = useState('name');
  const [currentPage, setCurrentPage] = useState(1);

  // Care filter is URL-driven — the dashboard's overdue TaskCards link here
  // with one of needs-care | water-overdue | fertilize-overdue | groom-overdue
  // and this filter renders as a removable chip in the bar.
  const filterParam = searchParams.get('filter');
  const initialCareFilter = (() => {
    if (filterParam === 'needs-care') return 'needs-care';
    if (filterParam === 'water-overdue') return 'water-overdue';
    if (filterParam === 'fertilize-overdue') return 'fertilize-overdue';
    if (filterParam === 'groom-overdue') return 'groom-overdue';
    if (filterParam === 'repot-overdue') return 'repot-overdue';
    return 'all';
  })();
  // ?filter=needs-bloom-update is aliased to the blooming filter — a stricter
  // "active 30+ days" check would require bloom_log data we don't query for
  // every render here.
  const initialBloomingFilter =
    filterParam === 'blooming' || filterParam === 'needs-bloom-update' ? 'blooming' : 'all';

  const [careFilter, setCareFilter] = useState(initialCareFilter);
  const [tab, setTab] = useState('active'); // active | archive
  const [filters, setFilters] = useState({
    ...EMPTY_FILTERS,
    bloomingFilter: initialBloomingFilter,
  });
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Selection state
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());

  const { data: plants = [], isLoading, error } = usePlants();
  const { data: bloomLogs = [] } = useBloomLogs({ limit: 1000 });
  const plantsPerPage = settings.plantsPerPage;

  const bloomHistoryMap = useMemo(() => buildBloomHistoryMap(bloomLogs), [bloomLogs]);

  const activePlants = useMemo(() => plants.filter((p) => !isArchived(p.status)), [plants]);
  const archivedPlants = useMemo(() => plants.filter((p) => isArchived(p.status)), [plants]);

  // Header subtitle counts
  const bloomingCount = useMemo(
    () => activePlants.filter((p) => p.is_blooming).length,
    [activePlants],
  );
  const upToDateCount = useMemo(
    () => activePlants.filter((p) => !plantNeedsCare(p, careThresholds)).length,
    [activePlants, careThresholds],
  );

  const hybridizers = useMemo(() => {
    const set = new Set();
    plants.forEach((p) => {
      if (p.hybridizer && p.hybridizer.trim()) set.add(p.hybridizer.trim());
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [plants]);

  const filteredPlants = useMemo(() => {
    // Tab determines the source pool — these are views, not filters.
    let result = tab === 'archive' ? archivedPlants : activePlants;

    if (debouncedSearch) {
      const query = debouncedSearch.toLowerCase();
      result = result.filter(
        (p) =>
          p.nickname?.toLowerCase().includes(query) ||
          p.cultivar_name?.toLowerCase().includes(query) ||
          p.hybridizer?.toLowerCase().includes(query) ||
          p.notes?.toLowerCase().includes(query),
      );
    }

    if (filters.potSize !== 'all') {
      result = result.filter((p) => p.pot_size === filters.potSize);
    }
    if (filters.bloomColor !== 'all') {
      result = result.filter((p) => p.bloom_color === filters.bloomColor);
    }
    if (filters.bloomType !== 'all') {
      result = result.filter((p) => p.bloom_type === filters.bloomType);
    }
    if (filters.bloomingFilter === 'blooming') {
      result = result.filter((p) => p.is_blooming);
    } else if (filters.bloomingFilter === 'not-blooming') {
      result = result.filter((p) => !p.is_blooming);
    }
    if (filters.varietyClasses.length > 0) {
      const allowed = new Set(filters.varietyClasses);
      result = result.filter((p) => {
        const bucket = VARIETY_CLASS_BUCKET_BY_SIZE[p.size_class];
        return bucket && allowed.has(bucket.value);
      });
    }
    if (filters.hybridizer !== 'all') {
      result = result.filter((p) => p.hybridizer === filters.hybridizer);
    }

    if (careFilter === 'needs-care') {
      result = result.filter((p) => plantNeedsCare(p, careThresholds));
    } else if (careFilter === 'up-to-date') {
      result = result.filter((p) => !plantNeedsCare(p, careThresholds));
    } else if (
      careFilter === 'water-overdue' ||
      careFilter === 'fertilize-overdue' ||
      careFilter === 'groom-overdue' ||
      careFilter === 'repot-overdue'
    ) {
      const careTypeKey = {
        'water-overdue': 'watering',
        'fertilize-overdue': 'fertilizing',
        'groom-overdue': 'grooming',
        'repot-overdue': 'repotting',
      }[careFilter];
      result = result.filter((p) =>
        getOverdueCareTypes(p, careThresholds).includes(careTypeKey),
      );
    }

    // Sort
    result = [...result].sort((a, b) => {
      switch (sortBy) {
        case 'acquired':
          return new Date(b.acquisition_date || 0) - new Date(a.acquisition_date || 0);
        case 'lastBloomed': {
          const bloomDate = (p) => {
            const h = bloomHistoryMap.get(p.id);
            const active = h?.active?.startDate;
            const latest = h?.latest?.endDate;
            return new Date(active || latest || 0).getTime();
          };
          return bloomDate(b) - bloomDate(a);
        }
        case 'potSize': {
          const idx = (size) => POT_SIZE_INDEX[size] ?? -1;
          return idx(a.pot_size) - idx(b.pot_size);
        }
        case 'watered':
          return new Date(b.last_watered || 0) - new Date(a.last_watered || 0);
        case 'name':
        default:
          return (a.nickname || a.cultivar_name || '').localeCompare(
            b.nickname || b.cultivar_name || '',
          );
      }
    });

    return result;
  }, [
    tab,
    activePlants,
    archivedPlants,
    debouncedSearch,
    filters,
    careFilter,
    sortBy,
    careThresholds,
    bloomHistoryMap,
  ]);

  // Reset to page 1 when search, sort, filters, or tab changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, sortBy, plantsPerPage, filters, careFilter, tab]);

  useEffect(() => {
    if (!selectionMode) {
      setSelectedIds(new Set());
    }
  }, [selectionMode]);

  // Pagination
  const totalPages = Math.ceil(filteredPlants.length / plantsPerPage);
  const startIndex = (currentPage - 1) * plantsPerPage;
  const paginatedPlants = filteredPlants.slice(startIndex, startIndex + plantsPerPage);

  // Active drawer-driven filters
  const activeFilterCount =
    (filters.potSize !== 'all' ? 1 : 0) +
    (filters.bloomColor !== 'all' ? 1 : 0) +
    (filters.bloomType !== 'all' ? 1 : 0) +
    (filters.bloomingFilter !== 'all' ? 1 : 0) +
    filters.varietyClasses.length +
    (filters.hybridizer !== 'all' ? 1 : 0);

  // Build chips for the bar
  const activeChips = useMemo(() => {
    const chips = [];
    if (filters.potSize !== 'all') {
      chips.push({
        key: 'potSize',
        label: `Pot ${filters.potSize}`,
        onRemove: () => setFilters((f) => ({ ...f, potSize: 'all' })),
      });
    }
    if (filters.bloomColor !== 'all') {
      chips.push({
        key: 'bloomColor',
        label: titleCase(filters.bloomColor),
        onRemove: () => setFilters((f) => ({ ...f, bloomColor: 'all' })),
      });
    }
    if (filters.bloomType !== 'all') {
      chips.push({
        key: 'bloomType',
        label: BLOOM_TYPE_LABELS[filters.bloomType] || filters.bloomType,
        onRemove: () => setFilters((f) => ({ ...f, bloomType: 'all' })),
      });
    }
    if (filters.bloomingFilter !== 'all') {
      chips.push({
        key: 'bloomingFilter',
        label: filters.bloomingFilter === 'blooming' ? 'Blooming' : 'Not blooming',
        onRemove: () => setFilters((f) => ({ ...f, bloomingFilter: 'all' })),
      });
    }
    filters.varietyClasses.forEach((value) => {
      const bucket = VARIETY_CLASS_BUCKETS.find((b) => b.value === value);
      if (!bucket) return;
      chips.push({
        key: `variety-${value}`,
        label: bucket.label,
        onRemove: () =>
          setFilters((f) => ({
            ...f,
            varietyClasses: f.varietyClasses.filter((v) => v !== value),
          })),
      });
    });
    if (filters.hybridizer !== 'all') {
      chips.push({
        key: 'hybridizer',
        label: filters.hybridizer,
        onRemove: () => setFilters((f) => ({ ...f, hybridizer: 'all' })),
      });
    }
    if (careFilter !== 'all') {
      const careLabels = {
        'needs-care': 'Needs care',
        'up-to-date': 'Up to date',
        'water-overdue': 'Water overdue',
        'fertilize-overdue': 'Fertilize overdue',
        'groom-overdue': 'Groom overdue',
        'repot-overdue': 'Repot overdue',
      };
      chips.push({
        key: 'careFilter',
        label: careLabels[careFilter] || careFilter,
        onRemove: () => setCareFilter('all'),
      });
    }
    return chips;
  }, [filters, careFilter]);

  const hasActiveFilters = activeChips.length > 0;

  const clearAllFilters = useCallback(() => {
    setFilters(EMPTY_FILTERS);
    setCareFilter('all');
  }, []);

  // Selection handlers
  const handleToggleSelect = useCallback((plantId) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(plantId)) next.delete(plantId);
      else next.add(plantId);
      return next;
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    setSelectedIds(new Set(filteredPlants.map((p) => p.id)));
  }, [filteredPlants]);

  const handleClearSelection = useCallback(() => {
    setSelectedIds(new Set());
    setSelectionMode(false);
  }, []);

  const toggleSelectionMode = useCallback(() => {
    setSelectionMode((prev) => !prev);
  }, []);

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

  const subtitle =
    activePlants.length === 0
      ? 'Your collection is waiting'
      : `${activePlants.length} ${activePlants.length === 1 ? 'plant' : 'plants'} · ${bloomingCount} blooming · ${upToDateCount} up to date`;

  return (
    <div className="min-h-screen p-6 md:p-10">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="flex items-start justify-between mb-6 gap-4">
          <div className="flex items-start gap-4">
            <Link to="/">
              <button className="icon-container">
                <ArrowLeft size={20} style={{ color: 'var(--sage-600)' }} />
              </button>
            </Link>
            <div>
              <h1 className="heading heading-xl">Plant Library</h1>
              <p
                className="mt-1"
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontStyle: 'italic',
                  fontSize: 16,
                  color: 'var(--purple-500)',
                }}
              >
                {subtitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 mt-2">
            {plants.length > 0 && (
              <button
                onClick={toggleSelectionMode}
                className={`icon-container ${selectionMode ? 'active' : ''}`}
                title={selectionMode ? 'Exit selection mode' : 'Select multiple plants'}
              >
                {selectionMode ? (
                  <CheckSquare size={20} style={{ color: 'var(--sage-600)' }} />
                ) : (
                  <Square size={20} style={{ color: 'var(--sage-600)' }} />
                )}
              </button>
            )}

            <Link to="/plants/new">
              <button className="btn btn-primary">
                <Plus size={18} />
                Add Plant
              </button>
            </Link>
          </div>
        </header>

        {/* Empty state - no plants at all */}
        {activePlants.length === 0 && tab === 'active' && <EmptyLibrary />}

        {(activePlants.length > 0 || tab === 'archive') && (
          <>
            {/* Active / Archived tabs */}
            <div
              className="flex items-center gap-6 mb-5"
              style={{ borderBottom: '1px solid var(--sage-200)' }}
            >
              <TabButton
                active={tab === 'active'}
                onClick={() => setTab('active')}
                label="Active Collection"
                count={activePlants.length}
              />
              <TabButton
                active={tab === 'archive'}
                onClick={() => setTab('archive')}
                label="Archive"
                count={archivedPlants.length}
              />
            </div>

            {/* Batch Actions Toolbar */}
            {selectionMode && (
              <BatchActionsToolbar
                selectedIds={Array.from(selectedIds)}
                onClearSelection={handleClearSelection}
                onSelectAll={handleSelectAll}
                totalCount={filteredPlants.length}
              />
            )}

            {/* Filter bar */}
            <LibraryFilterBar
              searchQuery={searchQuery}
              onSearchChange={handleSearch}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              sortBy={sortBy}
              onSortChange={setSortBy}
              activeFilterCount={activeFilterCount}
              onOpenFilters={() => setDrawerOpen(true)}
              activeChips={activeChips}
              onClearAllFilters={clearAllFilters}
            />

            {/* Results meta */}
            {filteredPlants.length > 0 && (
              <div className="flex items-center justify-between mb-3 px-1">
                <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                  Showing {filteredPlants.length} of{' '}
                  {tab === 'archive' ? archivedPlants.length : activePlants.length}{' '}
                  plants
                </span>
                <span
                  style={{
                    fontFamily: 'var(--font-heading)',
                    fontStyle: 'italic',
                    fontSize: 14,
                    color: 'var(--sage-600)',
                  }}
                >
                  Sorted by {SORT_LABELS[sortBy]}
                </span>
              </div>
            )}

            {/* No search/filter results */}
            {filteredPlants.length === 0 && (searchQuery || hasActiveFilters) && (
              <NoResults searchQuery={searchQuery} hasFilters={hasActiveFilters} />
            )}

            {/* Grid View */}
            {filteredPlants.length > 0 && viewMode === 'grid' && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                {paginatedPlants.map((plant) => (
                  <PlantCard
                    key={plant.id}
                    plant={plant}
                    bloomHistory={bloomHistoryMap.get(plant.id)}
                    selectionMode={selectionMode}
                    isSelected={selectedIds.has(plant.id)}
                    onToggleSelect={handleToggleSelect}
                  />
                ))}
              </div>
            )}

            {/* List View */}
            {filteredPlants.length > 0 && viewMode === 'list' && (
              <div className="flex flex-col gap-3">
                {paginatedPlants.map((plant) => (
                  <PlantListItem
                    key={plant.id}
                    plant={plant}
                    bloomHistory={bloomHistoryMap.get(plant.id)}
                    selectionMode={selectionMode}
                    isSelected={selectedIds.has(plant.id)}
                    onToggleSelect={handleToggleSelect}
                  />
                ))}
              </div>
            )}

            {/* Pagination & Footer */}
            {filteredPlants.length > 0 && (
              <div className="mt-8 space-y-4">
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-4">
                    <button
                      className="btn btn-secondary btn-small"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft size={16} />
                      Previous
                    </button>
                    <span className="text-body">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      className="btn btn-secondary btn-small"
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                      <ChevronRight size={16} />
                    </button>
                  </div>
                )}

                <p className="text-center text-muted">
                  Showing {startIndex + 1}–
                  {Math.min(startIndex + plantsPerPage, filteredPlants.length)} of{' '}
                  {filteredPlants.length} plants
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Filter drawer */}
      <LibraryFilterDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        filters={filters}
        onApply={setFilters}
        hybridizers={hybridizers}
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
