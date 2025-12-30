/**
 * PlantHeader - Hero section with plant image and basic info
 */

import { Flower2, Sparkles, Calendar } from 'lucide-react';

export default function PlantHeader({ plant }) {
  const displayName = plant.nickname || plant.cultivar_name || 'Unnamed Plant';

  const formatDate = (dateStr) => {
    if (!dateStr) return null;
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="card p-6 mb-6">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Plant Image */}
        <div
          className="w-full md:w-48 h-48 rounded-xl flex-shrink-0 overflow-hidden flex items-center justify-center"
          style={{ background: 'var(--cream-200)' }}
        >
          {plant.photo_url ? (
            <img
              src={plant.photo_url}
              alt={displayName}
              className="w-full h-full object-cover"
            />
          ) : (
            <Flower2 size={64} style={{ color: 'var(--sage-400)' }} />
          )}
        </div>

        {/* Plant Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4 mb-2">
            <div>
              <h1 className="heading heading-xl truncate">{displayName}</h1>
              {plant.nickname && (
                <p className="text-body text-muted">{plant.cultivar_name}</p>
              )}
            </div>

            {/* Blooming Badge */}
            {plant.is_blooming && (
              <span className="badge badge-purple flex-shrink-0">
                <Sparkles size={12} /> Blooming
              </span>
            )}
          </div>

          {/* Acquired Date */}
          {plant.acquired_date && (
            <div className="flex items-center gap-2 mt-4 text-small text-muted">
              <Calendar size={14} />
              <span>Acquired {formatDate(plant.acquired_date)}</span>
            </div>
          )}

          {/* Notes */}
          {plant.notes && (
            <p className="text-body mt-4" style={{ color: 'var(--text-secondary)' }}>
              {plant.notes}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
