/**
 * PlantListItem - Dense list row for the plant library
 */

import { Link } from 'react-router-dom';
import {
  Flower2,
  Sparkles,
  Droplets,
  ChevronRight,
  Check,
  AlertTriangle,
  HeartPulse,
  Moon,
} from 'lucide-react';
import { useSettings } from '../../hooks/useSettings.jsx';
import { plantNeedsCare } from '../../utils/careStatus';
import { getVarietyClassEyebrow } from '../../constants/plantOptions';

export default function PlantListItem({
  plant,
  bloomHistory,
  selectionMode = false,
  isSelected = false,
  onToggleSelect,
}) {
  const { careThresholds } = useSettings();
  const displayName = plant.nickname || plant.cultivar_name || 'Unnamed Plant';
  const needsCare = plantNeedsCare(plant, careThresholds);
  const eyebrow = getVarietyClassEyebrow(plant.size_class);
  const cultivarTrim = plant.cultivar_name?.trim();
  const showCultivar =
    plant.nickname &&
    cultivarTrim &&
    cultivarTrim !== plant.nickname.trim() &&
    cultivarTrim.toUpperCase() !== 'NOID';

  const bloomDurationDays = plant.is_blooming ? bloomHistory?.active?.daysSinceStart : null;
  const hasStateOfNote =
    plant.is_blooming ||
    needsCare ||
    plant.status === 'struggling' ||
    plant.status === 'recovering' ||
    plant.status === 'dormant';
  const upToDate = !hasStateOfNote;

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
      className={`plant-list-row ${isSelected ? 'plant-list-row-selected' : ''}`}
      data-mode={selectionMode ? 'select' : 'browse'}
      onClick={selectionMode ? handleClick : undefined}
    >
      {/* Checkbox */}
      {selectionMode && (
        <button
          onClick={handleCheckboxClick}
          className={`
            w-5 h-5 rounded flex items-center justify-center flex-shrink-0
            transition-colors border
            ${
              isSelected
                ? 'bg-[var(--sage-500)] border-[var(--sage-600)]'
                : 'bg-white/80 border-[var(--sage-300)] hover:border-[var(--sage-400)]'
            }
          `}
        >
          {isSelected && <Check size={12} color="white" strokeWidth={3} />}
        </button>
      )}

      {/* Thumbnail */}
      <div
        className="plant-list-thumb"
        style={{ background: 'var(--cream-200)' }}
      >
        {plant.photo_url ? (
          <img src={plant.photo_url} alt="" className="w-full h-full object-cover" />
        ) : (
          <Flower2 size={20} style={{ color: 'var(--sage-400)' }} />
        )}
      </div>

      {/* Name + cultivar */}
      <div className="plant-list-name min-w-0">
        <h3
          className="truncate"
          style={{
            fontFamily: 'var(--font-heading)',
            fontWeight: 600,
            fontSize: '17px',
            lineHeight: 1.15,
            color: 'var(--text-strong)',
          }}
        >
          {displayName}
        </h3>
        {showCultivar && (
          <p
            className="truncate"
            style={{ fontSize: '12px', color: 'var(--text-body)', marginTop: 2 }}
          >
            {plant.cultivar_name}
          </p>
        )}
        {/* Mobile-only inline eyebrow under the name */}
        {eyebrow && (
          <p
            className="plant-list-eyebrow-inline truncate"
            style={{
              fontSize: '10px',
              fontWeight: 700,
              letterSpacing: '0.14em',
              color: 'var(--text-quiet)',
              marginTop: 2,
            }}
          >
            {eyebrow}
          </p>
        )}
      </div>

      {/* Variety class column (hidden on mobile) */}
      <div
        className="plant-list-variety truncate"
        style={{
          fontSize: '10px',
          fontWeight: 700,
          letterSpacing: '0.14em',
          color: 'var(--text-quiet)',
        }}
      >
        {eyebrow || ''}
      </div>

      {/* Status pills */}
      <div className="plant-list-pills">
        {plant.is_blooming && (
          <span className="badge badge-purple">
            <Sparkles size={11} />
            {bloomDurationDays != null
              ? `Blooming · ${bloomDurationDays}d`
              : 'Blooming'}
          </span>
        )}
        {needsCare && (
          <span className="badge badge-warning">
            <Droplets size={11} />
            {plant.is_blooming ? 'Care' : 'Needs care'}
          </span>
        )}
        {plant.status === 'struggling' && (
          <span className="badge badge-alert">
            <AlertTriangle size={11} /> Struggling
          </span>
        )}
        {plant.status === 'recovering' && (
          <span className="badge badge-recovering">
            <HeartPulse size={11} /> Recovering
          </span>
        )}
        {plant.status === 'dormant' && (
          <span className="badge badge-dormant">
            <Moon size={11} /> Dormant
          </span>
        )}
        {upToDate && (
          <span className="badge badge-success">
            <Check size={11} /> Up to date
          </span>
        )}
      </div>

      {/* Chevron (only in non-selection mode) */}
      {!selectionMode && (
        <ChevronRight
          size={16}
          style={{ color: 'var(--text-quiet)', flexShrink: 0 }}
        />
      )}
    </div>
  );

  if (selectionMode) {
    return ItemContent;
  }

  return <Link to={`/plants/${plant.id}`}>{ItemContent}</Link>;
}
