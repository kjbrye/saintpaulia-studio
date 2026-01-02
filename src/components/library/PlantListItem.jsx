/**
 * PlantListItem - List view row for plant library
 */

import { Link } from 'react-router-dom';
import { Flower2, Sparkles, Droplets, ChevronRight } from 'lucide-react';
import { useSettings } from '../../hooks/useSettings.jsx';
import { plantNeedsCare } from '../../utils/careStatus';

export default function PlantListItem({ plant }) {
  const { careThresholds } = useSettings();
  const displayName = plant.nickname || plant.cultivar_name || 'Unnamed Plant';
  const needsCare = plantNeedsCare(plant, careThresholds);

  return (
    <Link to={`/plants/${plant.id}`}>
      <div className="card-subtle p-4 flex items-center gap-4">
        {/* Thumbnail */}
        <div
          className="w-16 h-16 rounded-xl flex-shrink-0 overflow-hidden flex items-center justify-center"
          style={{ background: 'var(--cream-200)' }}
        >
          {plant.photo_url ? (
            <img
              src={plant.photo_url}
              alt=""
              className="w-full h-full object-cover"
            />
          ) : (
            <Flower2 size={24} style={{ color: 'var(--sage-400)' }} />
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="heading heading-md truncate">{displayName}</h3>
          <p className="text-small text-muted truncate">{plant.cultivar_name}</p>
        </div>

        {/* Badges */}
        <div className="flex gap-2 flex-shrink-0">
          {plant.is_blooming && (
            <span className="badge badge-purple">
              <Sparkles size={12} /> Blooming
            </span>
          )}
          {needsCare && (
            <span className="badge badge-warning">
              <Droplets size={12} /> Care
            </span>
          )}
        </div>

        {/* Chevron */}
        <div className="icon-container icon-container-sm flex-shrink-0">
          <ChevronRight size={16} style={{ color: 'var(--sage-500)' }} />
        </div>
      </div>
    </Link>
  );
}
