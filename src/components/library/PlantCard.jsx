/**
 * PlantCard - Grid view card for plant library
 */

import { Link } from 'react-router-dom';
import { Flower2, Sparkles, Droplets, Check } from 'lucide-react';
import { useSettings } from '../../hooks/useSettings.jsx';
import { plantNeedsCare } from '../../utils/careStatus';

export default function PlantCard({
  plant,
  selectionMode = false,
  isSelected = false,
  onToggleSelect,
}) {
  const { careThresholds } = useSettings();
  const displayName = plant.nickname || plant.cultivar_name || 'Unnamed Plant';
  const needsCare = plantNeedsCare(plant, careThresholds);

  const handleClick = (e) => {
    if (selectionMode && onToggleSelect) {
      e.preventDefault();
      onToggleSelect(plant.id);
    }
  };

  const handleCheckboxClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onToggleSelect?.(plant.id);
  };

  const CardContent = (
    <div
      className={`card-subtle plant-card-grid p-4 cursor-pointer relative ${
        isSelected ? 'ring-2 ring-[var(--sage-500)]' : ''
      }`}
      onClick={selectionMode ? handleClick : undefined}
    >
      {/* Checkbox */}
      {selectionMode && (
        <button
          onClick={handleCheckboxClick}
          className={`
            absolute top-2 left-2 z-10 w-6 h-6 rounded-md flex items-center justify-center
            transition-colors border
            ${isSelected
              ? 'bg-[var(--sage-500)] border-[var(--sage-600)]'
              : 'bg-white/80 border-[var(--sage-300)] hover:border-[var(--sage-400)]'
            }
          `}
        >
          {isSelected && <Check size={14} color="white" strokeWidth={3} />}
        </button>
      )}

      {/* Plant Image or Placeholder */}
      <div
        className="aspect-square rounded-lg mb-4 overflow-hidden flex items-center justify-center"
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
  );

  // In selection mode, don't wrap with Link
  if (selectionMode) {
    return CardContent;
  }

  return <Link to={`/plants/${plant.id}`}>{CardContent}</Link>;
}
