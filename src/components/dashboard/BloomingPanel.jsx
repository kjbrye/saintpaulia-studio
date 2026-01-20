/**
 * BloomingPanel - Command center panel showing currently blooming plants
 */

import { Link } from 'react-router-dom';
import { Sparkles, ChevronRight, Flower2 } from 'lucide-react';

function PlantThumb({ plant }) {
  const displayName = plant.nickname || plant.cultivar_name || 'Plant';

  return (
    <Link
      to={`/plants/${plant.id}`}
      className="flex flex-col items-center gap-2 p-2 rounded-lg hover:bg-white/30 transition-colors"
      title={displayName}
    >
      <div className="w-12 h-12 rounded-lg overflow-hidden bg-[var(--purple-100)] flex items-center justify-center">
        {plant.photo_url ? (
          <img
            src={plant.photo_url}
            alt={displayName}
            className="w-full h-full object-cover"
          />
        ) : (
          <Flower2 size={20} style={{ color: 'var(--purple-400)' }} />
        )}
      </div>
      <span className="text-small font-medium text-center truncate max-w-[60px]" style={{ color: 'var(--purple-600)' }}>
        {displayName.split(' ')[0]}
      </span>
    </Link>
  );
}

export default function BloomingPanel({ bloomingPlants = [] }) {
  if (bloomingPlants.length === 0) {
    return null;
  }

  return (
    <div className="panel panel-blooming">
      <div className="panel-header" style={{ borderColor: 'var(--purple-200)' }}>
        <span className="panel-title" style={{ color: 'var(--purple-500)' }}>
          Currently Blooming
        </span>
        <span className="badge badge-purple">{bloomingPlants.length}</span>
      </div>
      <div className="panel-content">
        <div className="flex flex-wrap gap-2">
          {bloomingPlants.slice(0, 6).map(plant => (
            <PlantThumb key={plant.id} plant={plant} />
          ))}
          {bloomingPlants.length > 6 && (
            <Link
              to="/library?filter=blooming"
              className="flex flex-col items-center justify-center gap-1 p-2 w-12 h-12 rounded-lg bg-white/30 hover:bg-white/50 transition-colors"
            >
              <span className="text-small font-bold" style={{ color: 'var(--purple-500)' }}>
                +{bloomingPlants.length - 6}
              </span>
            </Link>
          )}
        </div>
      </div>
      <div className="panel-footer" style={{ borderColor: 'var(--purple-200)' }}>
        <Link
          to="/library?filter=blooming"
          className="text-small font-semibold flex items-center gap-1"
          style={{ color: 'var(--purple-500)' }}
        >
          View all blooming plants
          <ChevronRight size={14} />
        </Link>
      </div>
    </div>
  );
}
