/**
 * LibraryFilterBar
 *
 * Single-row filter bar: search input, grid/list toggle, sort dropdown, and a
 * "Filters" button that opens the drawer. When any drawer-driven filter is
 * active, an active-chips row renders below.
 */

import { Search, LayoutGrid, List, SlidersHorizontal, X } from 'lucide-react';

const SORT_OPTIONS = [
  { value: 'watered', label: 'Recently watered' },
  { value: 'name', label: 'Name (A–Z)' },
  { value: 'acquired', label: 'Date acquired' },
  { value: 'lastBloomed', label: 'Last bloomed' },
  { value: 'potSize', label: 'Pot size' },
];

export const SORT_LABELS = SORT_OPTIONS.reduce((acc, opt) => {
  acc[opt.value] = opt.label;
  return acc;
}, {});

export default function LibraryFilterBar({
  searchQuery,
  onSearchChange,
  viewMode,
  onViewModeChange,
  sortBy,
  onSortChange,
  activeFilterCount,
  onOpenFilters,
  activeChips = [],
  onClearAllFilters,
}) {
  return (
    <div className="card p-3 mb-4">
      {/* Row 1: search | view toggle | sort | filters */}
      <div className="flex flex-col md:flex-row md:items-center gap-3">
        <div className="flex-1 relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2"
            style={{ color: 'var(--sage-500)' }}
          />
          <input
            type="text"
            placeholder="Search plants, cultivar, hybridizer, notes..."
            className="input w-full pl-9"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Grid/List toggle - sage gradient when active */}
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => onViewModeChange('grid')}
              className="library-view-toggle"
              data-active={viewMode === 'grid'}
              aria-label="Grid view"
            >
              <LayoutGrid size={16} />
            </button>
            <button
              type="button"
              onClick={() => onViewModeChange('list')}
              className="library-view-toggle"
              data-active={viewMode === 'list'}
              aria-label="List view"
            >
              <List size={16} />
            </button>
          </div>

          <span style={{ color: 'var(--sage-300)' }}>|</span>

          <select
            className="input input-small"
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            style={{ paddingTop: 8, paddingBottom: 8, fontSize: 14 }}
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={onOpenFilters}
            className="btn btn-secondary btn-small relative"
          >
            <SlidersHorizontal size={14} />
            Filters
            {activeFilterCount > 0 && (
              <span
                className="ml-1 inline-flex items-center justify-center rounded-full"
                style={{
                  minWidth: 20,
                  height: 20,
                  fontSize: 11,
                  fontWeight: 700,
                  padding: '0 6px',
                  background: 'var(--sage-500)',
                  color: 'white',
                }}
              >
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Row 2: active filter chips */}
      {activeChips.length > 0 && (
        <div className="flex items-center flex-wrap gap-2 mt-3 pt-3 border-t border-[var(--sage-200)]">
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: 'var(--sage-500)',
            }}
          >
            Filtering by
          </span>
          {activeChips.map((chip) => (
            <button
              key={chip.key}
              type="button"
              onClick={chip.onRemove}
              className="inline-flex items-center gap-1.5"
              style={{
                background: 'var(--cream-200)',
                border: 'var(--border-cream)',
                borderRadius: 9999,
                padding: '4px 10px',
                fontSize: 12,
                fontWeight: 600,
                color: 'var(--sage-700)',
              }}
              title={`Remove ${chip.label}`}
            >
              <span>{chip.label}</span>
              <X size={12} style={{ color: 'var(--copper-500)' }} />
            </button>
          ))}
          <button
            type="button"
            onClick={onClearAllFilters}
            className="ml-auto"
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: 'var(--copper-600)',
              textDecoration: 'underline',
            }}
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  );
}
