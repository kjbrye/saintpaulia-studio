/**
 * CollectionPreview - Grid of recently updated plants
 */

import { Link } from 'react-router-dom';
import { Flower2, ChevronRight } from 'lucide-react';

function PlantThumbnail({ plant }) {
  const displayName = plant.nickname || plant.cultivar_name || 'Unnamed Plant';

  return (
    <Link to={`/plants/${plant.id}`}>
      <div className="card-subtle p-4 flex flex-col items-center gap-3 text-center hover:shadow-lg transition-shadow">
        {/* Photo or placeholder */}
        <div className="w-16 h-16 rounded-xl bg-[var(--cream-200)] flex items-center justify-center overflow-hidden border border-[var(--sage-200)]">
          {plant.photo_url ? (
            <img
              src={plant.photo_url}
              alt={displayName}
              className="w-full h-full object-cover"
            />
          ) : (
            <Flower2 size={28} style={{ color: 'var(--sage-400)' }} />
          )}
        </div>

        {/* Name */}
        <p className="text-small font-semibold text-[var(--text-primary)] truncate w-full">
          {displayName}
        </p>
      </div>
    </Link>
  );
}

export default function CollectionPreview({ plants = [], isLoading = false }) {
  // Don't show if no plants
  if (!isLoading && plants.length === 0) {
    return null;
  }

  // Loading state
  if (isLoading) {
    return (
      <section className="card p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="heading heading-md">Your Collection</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="card-subtle p-4 flex flex-col items-center gap-3 animate-pulse">
              <div className="w-16 h-16 rounded-xl bg-[var(--sage-200)]" />
              <div className="h-3 bg-[var(--sage-200)] rounded w-3/4" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  // Show first 6 plants
  const displayPlants = plants.slice(0, 6);

  return (
    <section className="card p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="heading heading-md">Your Collection</h2>
        {plants.length > 6 && (
          <Link to="/library" className="btn btn-secondary btn-small">
            View all <ChevronRight size={16} />
          </Link>
        )}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {displayPlants.map(plant => (
          <PlantThumbnail key={plant.id} plant={plant} />
        ))}
      </div>
    </section>
  );
}
