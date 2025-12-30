/**
 * Library Page - Plant collection browser
 */

import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Plus } from 'lucide-react';
import { usePlants } from '../hooks/usePlants';
import { plantNeedsCare } from '../utils/careStatus';
import PlantCard from '../components/library/PlantCard';
import PlantListItem from '../components/library/PlantListItem';
import LibraryToolbar from '../components/library/LibraryToolbar';
import { EmptyLibrary, NoResults } from '../components/library/EmptyState';

export default function Library() {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('updated');

  const { data: plants = [], isLoading, error } = usePlants();

  // Filter and sort
  const filteredPlants = useMemo(() => {
    let result = plants;

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.nickname?.toLowerCase().includes(query) ||
          p.cultivar_name?.toLowerCase().includes(query)
      );
    }

    // Sort
    result = [...result].sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return (a.nickname || a.cultivar_name || '').localeCompare(
            b.nickname || b.cultivar_name || ''
          );
        case 'acquired':
          return new Date(b.acquired_date || 0) - new Date(a.acquired_date || 0);
        case 'care':
          return plantNeedsCare(b) - plantNeedsCare(a);
        default: // 'updated'
          return new Date(b.updated_at || 0) - new Date(a.updated_at || 0);
      }
    });

    return result;
  }, [plants, searchQuery, sortBy]);

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
          <button
            className="btn btn-primary"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 md:p-10">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link to="/">
              <button className="icon-container">
                <ArrowLeft size={20} style={{ color: 'var(--sage-600)' }} />
              </button>
            </Link>
            <h1 className="heading heading-xl">Plant Library</h1>
          </div>

          <Link to="/plants/new">
            <button className="btn btn-primary">
              <Plus size={20} />
              Add Plant
            </button>
          </Link>
        </header>

        {/* Empty state - no plants at all */}
        {plants.length === 0 && <EmptyLibrary />}

        {/* Has plants */}
        {plants.length > 0 && (
          <>
            {/* Toolbar */}
            <LibraryToolbar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              sortBy={sortBy}
              onSortChange={setSortBy}
            />

            {/* No search results */}
            {filteredPlants.length === 0 && searchQuery && (
              <NoResults searchQuery={searchQuery} />
            )}

            {/* Grid View */}
            {filteredPlants.length > 0 && viewMode === 'grid' && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                {filteredPlants.map((plant) => (
                  <PlantCard key={plant.id} plant={plant} />
                ))}
              </div>
            )}

            {/* List View */}
            {filteredPlants.length > 0 && viewMode === 'list' && (
              <div className="space-y-3">
                {filteredPlants.map((plant) => (
                  <PlantListItem key={plant.id} plant={plant} />
                ))}
              </div>
            )}

            {/* Footer Count */}
            {filteredPlants.length > 0 && (
              <p className="text-center text-muted mt-8">
                Showing {filteredPlants.length} of {plants.length} plants
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
