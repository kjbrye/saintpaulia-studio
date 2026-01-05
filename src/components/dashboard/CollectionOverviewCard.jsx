/**
 * CollectionOverviewCard - Calming garden view overview with large count, stacked avatars, inline states
 */

import { Link } from 'react-router-dom';
import { Flower2, Sparkles, Heart } from 'lucide-react';

function PlantAvatar({ plant, index, total }) {
  const displayName = plant.nickname || plant.cultivar_name || 'Plant';
  // Stack avatars with negative margin, increasing z-index for later items
  const zIndex = total - index;

  return (
    <div
      className="w-14 h-14 rounded-full border-3 border-[var(--cream-100)] overflow-hidden flex-shrink-0 bg-[var(--cream-200)] shadow-sm"
      style={{
        marginLeft: index > 0 ? '-14px' : '0',
        zIndex,
        position: 'relative',
        borderWidth: '3px'
      }}
      title={displayName}
    >
      {plant.photo_url ? (
        <img
          src={plant.photo_url}
          alt={displayName}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <Flower2 size={22} style={{ color: 'var(--sage-400)' }} />
        </div>
      )}
    </div>
  );
}

function StackedAvatars({ plants }) {
  const displayPlants = plants.slice(0, 5);
  const overflow = plants.length - 5;

  if (plants.length === 0) return null;

  return (
    <div className="flex items-center">
      {displayPlants.map((plant, index) => (
        <PlantAvatar
          key={plant.id}
          plant={plant}
          index={index}
          total={displayPlants.length}
        />
      ))}
      {overflow > 0 && (
        <div
          className="w-14 h-14 rounded-full bg-[var(--sage-200)] flex items-center justify-center flex-shrink-0 shadow-sm"
          style={{ marginLeft: '-14px', zIndex: 0, position: 'relative', borderWidth: '3px', borderColor: 'var(--cream-100)', borderStyle: 'solid' }}
        >
          <span className="text-body font-semibold text-[var(--sage-600)]">+{overflow}</span>
        </div>
      )}
    </div>
  );
}

export default function CollectionOverviewCard({ plants = [], bloomingCount = 0, needsCareCount = 0 }) {
  return (
    <section className="card p-10">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
        {/* Left side: Count and label */}
        <div className="flex items-center gap-6">
          <p className="text-7xl font-bold text-[var(--sage-700)]" style={{ fontFamily: 'var(--font-heading)' }}>{plants.length}</p>
          <div>
            <p className="heading heading-lg text-[var(--text-primary)]">
              {plants.length === 1 ? 'Plant' : 'Plants'}
            </p>
            <p className="text-body text-muted">in your collection</p>
          </div>
        </div>

        {/* Right side: Avatars and status */}
        <div className="flex flex-col items-start md:items-end gap-4">
          {/* Stacked avatars */}
          {plants.length > 0 && (
            <Link to="/library" className="hover:opacity-80 transition-opacity">
              <StackedAvatars plants={plants} />
            </Link>
          )}

          {/* Inline states */}
          {plants.length > 0 && (bloomingCount > 0 || needsCareCount > 0) && (
            <div className="flex flex-wrap items-center gap-5 text-body">
              {bloomingCount > 0 && (
                <span className="inline-flex items-center gap-2 text-[var(--purple-500)]">
                  <Sparkles size={18} />
                  {bloomingCount} blooming
                </span>
              )}
              {needsCareCount > 0 && (
                <span className="inline-flex items-center gap-2 text-[var(--copper-500)]">
                  <Heart size={18} />
                  {needsCareCount} need care
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
