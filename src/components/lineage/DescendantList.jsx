/**
 * DescendantList - Shows offspring of a plant organized by generation.
 */

import { Link } from 'react-router-dom';
import { Flower2, ChevronRight } from 'lucide-react';

export default function DescendantList({ descendants = [], isLoading }) {
  if (isLoading) {
    return <p className="text-small text-muted py-4 text-center">Loading descendants...</p>;
  }

  if (descendants.length === 0) {
    return (
      <p className="text-small text-muted text-center py-4">
        No known descendants.
      </p>
    );
  }

  // Group by generation
  const byGeneration = new Map();
  for (const d of descendants) {
    const gen = d.generation || 1;
    if (!byGeneration.has(gen)) byGeneration.set(gen, []);
    byGeneration.get(gen).push(d);
  }

  const sortedGens = [...byGeneration.keys()].sort((a, b) => a - b);

  return (
    <div className="space-y-4">
      {sortedGens.map(gen => (
        <div key={gen}>
          <p className="text-label text-muted mb-2">
            {gen === 1 ? 'Children' : gen === 2 ? 'Grandchildren' : `Generation ${gen}`}
            <span className="ml-1">({byGeneration.get(gen).length})</span>
          </p>
          <div className="space-y-1.5">
            {byGeneration.get(gen).map(({ plant, parentRole }) => (
              <Link
                key={plant.id}
                to={`/plants/${plant.id}`}
                className="flex items-center gap-3 p-2.5 rounded-lg transition-colors hover:bg-[var(--sage-100)]"
              >
                <Flower2 size={16} style={{ color: 'var(--purple-400)', flexShrink: 0 }} />
                <div className="flex-1 min-w-0">
                  <p className="text-body font-medium truncate" style={{ color: 'var(--sage-800)' }}>
                    {plant.nickname || plant.cultivar_name || 'Unnamed'}
                  </p>
                  {plant.cultivar_name && plant.nickname && (
                    <p className="text-small text-muted truncate">{plant.cultivar_name}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {parentRole && parentRole !== 'both' && (
                    <span className="badge" style={{ fontSize: 10 }}>
                      {parentRole === 'pod_parent' ? 'as pod' : 'as pollen'}
                    </span>
                  )}
                  {plant.generation != null && (
                    <span className="badge badge-purple" style={{ fontSize: 10 }}>
                      F{plant.generation}
                    </span>
                  )}
                  <ChevronRight size={14} style={{ color: 'var(--sage-400)' }} />
                </div>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
