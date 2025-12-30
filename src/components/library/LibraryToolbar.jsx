/**
 * LibraryToolbar - Search, view toggle, and sort controls
 */

import { Search, Grid3X3, List } from 'lucide-react';

export default function LibraryToolbar({
  searchQuery,
  onSearchChange,
  viewMode,
  onViewModeChange,
  sortBy,
  onSortChange,
}) {
  return (
    <div className="card p-4 mb-6">
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
    </div>
  );
}
