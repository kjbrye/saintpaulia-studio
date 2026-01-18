/**
 * LibraryToolbar - Search, view toggle, sort, and filter controls
 */

import { Search, Grid3X3, List, Filter, X } from 'lucide-react';

const POT_SIZE_OPTIONS = [
  { value: 'all', label: 'All Sizes' },
  { value: '2"', label: '2"' },
  { value: '2.5"', label: '2.5"' },
  { value: '3"', label: '3"' },
  { value: '3.5"', label: '3.5"' },
  { value: '4"', label: '4"' },
  { value: '4.5"', label: '4.5"' },
  { value: '5"', label: '5"' },
  { value: '6"', label: '6"' },
  { value: '6"+', label: '6"+' },
];

const BLOOM_COLOR_OPTIONS = [
  { value: 'all', label: 'All Colors' },
  { value: 'pink', label: 'Pink' },
  { value: 'purple', label: 'Purple' },
  { value: 'blue', label: 'Blue' },
  { value: 'white', label: 'White' },
  { value: 'red', label: 'Red' },
  { value: 'lavender', label: 'Lavender' },
  { value: 'coral', label: 'Coral' },
  { value: 'bi-color', label: 'Bi-color' },
  { value: 'multi', label: 'Multi-color' },
];

function FilterChip({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className="px-3 py-1.5 rounded-lg text-small font-medium transition-all"
      style={{
        background: active ? 'var(--sage-600)' : 'var(--sage-100)',
        color: active ? 'white' : 'var(--sage-600)',
      }}
    >
      {label}
    </button>
  );
}

export default function LibraryToolbar({
  searchQuery,
  onSearchChange,
  viewMode,
  onViewModeChange,
  sortBy,
  onSortChange,
  potSizeFilter,
  onPotSizeFilterChange,
  bloomColorFilter,
  onBloomColorFilterChange,
  bloomingFilter,
  onBloomingFilterChange,
  careFilter,
  onCareFilterChange,
}) {
  const hasActiveFilters =
    potSizeFilter !== 'all' ||
    bloomColorFilter !== 'all' ||
    bloomingFilter !== 'all' ||
    careFilter !== 'all';

  const clearAllFilters = () => {
    onPotSizeFilterChange('all');
    onBloomColorFilterChange('all');
    onBloomingFilterChange('all');
    onCareFilterChange('all');
  };

  return (
    <div className="card p-4 mb-6 space-y-4">
      {/* Row 1: Search, View Toggle, Sort */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
        {/* Search Input */}
        <div className="flex-1 relative">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2"
            style={{ color: 'var(--sage-500)' }}
          />
          <input
            type="text"
            placeholder="Search plants..."
            className="input w-full pl-12"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-3">
          {/* View Toggle */}
          <div className="flex gap-1">
            <button
              className={`icon-container ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => onViewModeChange('grid')}
              aria-label="Grid view"
            >
              <Grid3X3 size={18} style={{ color: 'var(--sage-600)' }} />
            </button>
            <button
              className={`icon-container ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => onViewModeChange('list')}
              aria-label="List view"
            >
              <List size={18} style={{ color: 'var(--sage-600)' }} />
            </button>
          </div>

          {/* Sort Dropdown */}
          <select
            className="input"
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
          >
            <option value="updated">Recently Updated</option>
            <option value="name">Name A-Z</option>
            <option value="acquired">Date Acquired</option>
            <option value="care">Needs Care</option>
          </select>
        </div>
      </div>

      {/* Row 2: Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 mr-2">
          <Filter size={16} style={{ color: 'var(--sage-500)' }} />
          <span className="text-small font-medium" style={{ color: 'var(--sage-600)' }}>
            Filter:
          </span>
        </div>

        {/* Pot Size Dropdown */}
        <select
          className="input input-small"
          value={potSizeFilter}
          onChange={(e) => onPotSizeFilterChange(e.target.value)}
        >
          {POT_SIZE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {/* Bloom Color Dropdown */}
        <select
          className="input input-small"
          value={bloomColorFilter}
          onChange={(e) => onBloomColorFilterChange(e.target.value)}
        >
          {BLOOM_COLOR_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <span className="text-sage-300">|</span>

        {/* Blooming Filter Chips */}
        <div className="flex gap-1.5">
          <FilterChip
            label="All"
            active={bloomingFilter === 'all'}
            onClick={() => onBloomingFilterChange('all')}
          />
          <FilterChip
            label="Blooming"
            active={bloomingFilter === 'blooming'}
            onClick={() => onBloomingFilterChange('blooming')}
          />
          <FilterChip
            label="Not Blooming"
            active={bloomingFilter === 'not-blooming'}
            onClick={() => onBloomingFilterChange('not-blooming')}
          />
        </div>

        <span className="text-sage-300">|</span>

        {/* Care Filter Chips */}
        <div className="flex gap-1.5">
          <FilterChip
            label="All"
            active={careFilter === 'all'}
            onClick={() => onCareFilterChange('all')}
          />
          <FilterChip
            label="Needs Care"
            active={careFilter === 'needs-care'}
            onClick={() => onCareFilterChange('needs-care')}
          />
          <FilterChip
            label="Up to Date"
            active={careFilter === 'up-to-date'}
            onClick={() => onCareFilterChange('up-to-date')}
          />
        </div>

        {/* Clear All Filters */}
        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-small font-medium transition-all"
            style={{ background: 'var(--copper-100)', color: 'var(--copper-600)' }}
          >
            <X size={14} />
            Clear Filters
          </button>
        )}
      </div>
    </div>
  );
}
