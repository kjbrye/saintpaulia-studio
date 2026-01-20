/**
 * PlantListItem - List view row for plant library
 */

import { Link } from 'react-router-dom';
import { Flower2, Sparkles, Droplets, ChevronRight, Check } from 'lucide-react';
import { useSettings } from '../../hooks/useSettings.jsx';
import { plantNeedsCare } from '../../utils/careStatus';

export default function PlantListItem({
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

  const ItemContent = (
    <div
      className={`card-subtle p-4 flex items-center gap-4 cursor-pointer ${
        isSelected ? 'ring-2 ring-[var(--sage-500)]' : ''
      }`}
      onClick={selectionMode ? handleClick : undefined}
    >
      {/* Checkbox */}
      {selectionMode && (
        <button
          onClick={handleCheckboxClick}
          className={`
            w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0
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

      {/* Thumbnail */}
      <div
        className="w-14 h-14 rounded-lg flex-shrink-0 overflow-hidden flex items-center justify-center"
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

      {/* Chevron (only in non-selection mode) */}
      {!selectionMode && (
        <div className="icon-container icon-container-sm flex-shrink-0">
          <ChevronRight size={16} style={{ color: 'var(--sage-500)' }} />
        </div>
      )}
    </div>
  );

  // In selection mode, don't wrap with Link
  if (selectionMode) {
    return ItemContent;
  }

  return <Link to={`/plants/${plant.id}`}>{ItemContent}</Link>;
}
