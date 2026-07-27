/**
 * EmptyState - Empty and no-results states for library
 */

import { Link } from 'react-router-dom';
import { Flower2, Search, Plus } from 'lucide-react';

export function EmptyLibrary() {
  return (
    <div className="ds-card p-12 text-center">
      <div className="icon-container-purple mx-auto mb-6" style={{ width: 80, height: 80 }}>
        <Flower2 size={40} style={{ color: 'var(--purple-400)' }} />
      </div>
      <h2 className="heading heading-lg mb-2" style={{ color: 'var(--text-strong)' }}>
        No plants yet
      </h2>
      <p className="mb-6 max-w-md mx-auto" style={{ color: 'var(--text-body)' }}>
        Start building your collection by adding your first African violet.
      </p>
      <Link to="/plants/new" className="ds-btn-primary">
        <Plus size={20} />
        Add Your First Plant
      </Link>
    </div>
  );
}

export function NoResults({ searchQuery, hasFilters }) {
  const getMessage = () => {
    if (searchQuery && hasFilters) {
      return `No plants match "${searchQuery}" with the current filters. Try adjusting your search or filters.`;
    }
    if (searchQuery) {
      return `No plants match "${searchQuery}". Try a different search term.`;
    }
    if (hasFilters) {
      return 'No plants match the current filters. Try adjusting your filter selection.';
    }
    return 'No plants found.';
  };

  return (
    <div className="ds-card p-12 text-center">
      <div className="icon-container mx-auto mb-4" style={{ width: 64, height: 64 }}>
        <Search size={32} style={{ color: 'var(--text-quiet)' }} />
      </div>
      <h2 className="heading heading-lg mb-2" style={{ color: 'var(--text-strong)' }}>
        No plants found
      </h2>
      <p style={{ color: 'var(--text-body)' }}>{getMessage()}</p>
    </div>
  );
}
