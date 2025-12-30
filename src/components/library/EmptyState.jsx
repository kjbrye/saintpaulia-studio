/**
 * EmptyState - Empty and no-results states for library
 */

import { Link } from 'react-router-dom';
import { Flower2, Search, Plus } from 'lucide-react';

export function EmptyLibrary() {
  return (
    <div className="card p-12 text-center">
      <div
        className="icon-container-purple mx-auto mb-6"
        style={{ width: 80, height: 80 }}
      >
        <Flower2 size={40} style={{ color: 'var(--purple-400)' }} />
      </div>
      <h2 className="heading heading-lg mb-2">No plants yet</h2>
      <p className="text-muted mb-6 max-w-md mx-auto">
        Start building your collection by adding your first African violet.
      </p>
      <Link to="/plants/new">
        <button className="btn btn-primary">
          <Plus size={20} />
          Add Your First Plant
        </button>
      </Link>
    </div>
  );
}

export function NoResults({ searchQuery }) {
  return (
    <div className="card p-12 text-center">
      <div
        className="icon-container mx-auto mb-4"
        style={{ width: 64, height: 64 }}
      >
        <Search size={32} style={{ color: 'var(--sage-500)' }} />
      </div>
      <h2 className="heading heading-lg mb-2">No plants found</h2>
      <p className="text-muted">
        No plants match "{searchQuery}". Try a different search term.
      </p>
    </div>
  );
}
