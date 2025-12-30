/**
 * PlantCard - Grid view card for plant library
 */

import { Link } from 'react-router-dom';
import { Flower2, Sparkles, Droplets } from 'lucide-react';
import { plantNeedsCare } from '../../utils/careStatus';

export default function PlantCard({ plant }) {
  const displayName = plant.nickname || plant.cultivar_name || 'Unnamed Plant';
  const needsCare = plantNeedsCare(plant);

  return (
    <Link to={`/plants/${plant.id}`}>
      <div className="card-subtle plant-card-grid p-4 cursor-pointer">
        {/* Plant Image or Placeholder */}
        <div
          className="aspect-square rounded-xl mb-4 overflow-hidden flex items-center justify-center"
          style={{ background: 'var(--cream-200)' }}
        >
          {plant.photo_url ? (
            <img
              src={plant.photo_url}
              alt={displayName}
              className="w-full h-full object-cover"
            />
          ) : (
            <Flower2 size={48} style={{ color: 'var(--sage-400)' }} />
          )}
        </div>

        {/* Plant Info */}
        <h3 className="heading heading-md truncate">{displayName}</h3>
        {plant.nickname && (
          <p className="text-small text-muted truncate">{plant.cultivar_name}</p>
        )}

        {/* Status Badges */}
        <div className="flex flex-wrap gap-2 mt-3">
          {plant.is_blooming && (
            <span className="badge badge-purple">
              <Sparkles size={12} /> Blooming
            </span>
          )}
          {needsCare && (
            <span className="badge badge-warning">
              <Droplets size={12} /> Needs care
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
