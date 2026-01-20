/**
 * CollectionStatsPanel - Row stats with large counts and stacked plant avatars
 */

import { Link } from 'react-router-dom';
import { Flower2, Leaf } from 'lucide-react';

const MAX_AVATARS = 5;

function PlantAvatarStack({ plants, maxCount = MAX_AVATARS }) {
  const visible = plants.slice(0, maxCount);
  const overflow = plants.length - maxCount;

  return (
    <div className="avatar-stack">
      {visible.map((plant, index) => (
        <div
          key={plant.id}
          className="avatar-stack-item"
          style={{ zIndex: maxCount - index }}
        >
          {plant.primary_photo_url ? (
            <img src={plant.primary_photo_url} alt={plant.name} />
          ) : (
            <Leaf size={14} />
          )}
        </div>
      ))}
      {overflow > 0 && (
        <div className="avatar-stack-overflow" style={{ zIndex: 0 }}>
          +{overflow}
        </div>
      )}
    </div>
  );
}

export default function CollectionStatsPanel({ plants = [], bloomingPlants = [] }) {
  return (
    <div className="stats-rows-container">
      <Link to="/library" className="stat-row">
        <span className="stat-row-count">{plants.length}</span>
        <span className="stat-row-label">
          {plants.length === 1 ? 'Plant' : 'Plants'}
        </span>
        {plants.length > 0 && (
          <PlantAvatarStack plants={plants} />
        )}
      </Link>

      <Link to="/library?filter=blooming" className="stat-row stat-row-purple">
        <span className="stat-row-count">{bloomingPlants.length}</span>
        <span className="stat-row-label">Blooming</span>
        {bloomingPlants.length > 0 && (
          <PlantAvatarStack plants={bloomingPlants} />
        )}
        {bloomingPlants.length === 0 && (
          <div className="stat-row-empty-icon">
            <Flower2 size={20} />
          </div>
        )}
      </Link>
    </div>
  );
}
