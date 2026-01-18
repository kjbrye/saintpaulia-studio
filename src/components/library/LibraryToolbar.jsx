/**
 * LibraryToolbar - Search, view toggle, sort, and filter controls
 */

import { Search, Grid3X3, List, Filter, X } from 'lucide-react';

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Plants' },
  { value: 'needs-care', label: 'Needs Care' },
  { value: 'healthy', label: 'Healthy' },
];

const BLOOMING_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'blooming', label: 'Blooming' },
  { value: 'not-blooming', label: 'Not Blooming' },
];

const CARE_TYPE_OPTIONS = [
  { value: 'all', label: 'All Care Types' },
  { value: 'watering', label: 'Needs Watering' },
  { value: 'fertilizing', label: 'Needs Fertilizing' },
  { value: 'grooming', label: 'Needs Grooming' },
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
  statusFilter,
  onStatusFilterChange,
  bloomingFilter,
  onBloomingFilterChange,
  careTypeFilter,
  onCareTypeFilterChange,
}) {
  const hasActiveFilters = statusFilter !== 'all' || bloomingFilter !== 'all' || careTypeFilter !== 'all';

  const clearAllFilters = () => {
    onStatusFilterChange('all');
    onBloomingFilterChange('all');
    onCareTypeFilterChange('all');
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
          <span className="text-small font-medium" style={{ color: 'var(--sage-600)' }}>Filter:</span>
        </div>

        {/* Status Filter */}
        <div className="flex gap-1.5">
          {STATUS_OPTIONS.map((option) => (
            <FilterChip
              key={option.value}
              label={option.label}
              active={statusFilter === option.value}
              onClick={() => onStatusFilterChange(option.value)}
            />
          ))}
        </div>

        <span className="text-sage-300">|</span>

        {/* Blooming Filter */}
        <div className="flex gap-1.5">
          {BLOOMING_OPTIONS.map((option) => (
            <FilterChip
              key={option.value}
              label={option.label}
              active={bloomingFilter === option.value}
              onClick={() => onBloomingFilterChange(option.value)}
            />
          ))}
        </div>

        <span className="text-sage-300">|</span>

        {/* Care Type Filter */}
        <div className="flex gap-1.5 flex-wrap">
          {CARE_TYPE_OPTIONS.map((option) => (
            <FilterChip
              key={option.value}
              label={option.label}
              active={careTypeFilter === option.value}
              onClick={() => onCareTypeFilterChange(option.value)}
            />
          ))}
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
