/**
 * PlantCard - Grid view card for plant library
 */

import { Link } from 'react-router-dom';
import { Flower2, Sparkles, Droplets, Check, AlertTriangle, HeartPulse, Moon } from 'lucide-react';
import { useSettings } from '../../hooks/useSettings.jsx';
import { plantNeedsCare } from '../../utils/careStatus';
import { getVarietyClassEyebrow } from '../../constants/plantOptions';
import { getBloomHistoryLine } from '../../utils/bloomHistory';

export default function PlantCard({
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
  const showCultivar =
    plant.nickname &&
    plant.cultivar_name &&
    plant.cultivar_name.trim() &&
    plant.cultivar_name.trim() !== plant.nickname.trim() &&
    plant.cultivar_name.trim().toUpperCase() !== 'NOID';

  const bloomDurationDays = plant.is_blooming ? bloomHistory?.active?.daysSinceStart : null;
  const historyLine = !plant.is_blooming
    ? getBloomHistoryLine({ plant, bloomHistory })
    : null;

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
      className={`plant-card-grid p-4 cursor-pointer relative h-full ${
        isSelected ? 'ring-2 ring-[var(--purple-emphasis)]' : ''
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
            ${
              isSelected
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
          <img src={plant.photo_url} alt={displayName} className="w-full h-full object-cover" />
        ) : (
          <Flower2 size={48} style={{ color: 'var(--sage-400)' }} />
        )}
      </div>

      {/* Variety class eyebrow — always rendered so cards line up */}
      <p
        className="mb-1"
        style={{
          fontSize: '10px',
          fontWeight: 700,
          letterSpacing: '0.14em',
          color: 'var(--text-quiet)',
          minHeight: '14px',
          lineHeight: '14px',
        }}
      >
        {eyebrow || ' '}
      </p>

      {/* Plant Info — cultivar slot always reserved */}
      <h3 className="heading heading-md truncate" style={{ color: 'var(--text-strong)' }}>
        {displayName}
      </h3>
      <p
        className="text-small truncate"
        style={{ minHeight: '20px', lineHeight: '20px', color: 'var(--text-body)' }}
      >
        {showCultivar ? plant.cultivar_name : ' '}
      </p>

      {/* Status Badges — always present, blank space if none apply */}
      <div
        className="flex flex-wrap gap-2 mt-3"
        style={{ minHeight: '24px' }}
      >
        {plant.is_blooming && (
          <span className="badge badge-purple">
            <Sparkles size={12} />
            {bloomDurationDays != null
              ? `Blooming · ${bloomDurationDays}d`
              : 'Blooming'}
          </span>
        )}
        {needsCare && (
          <span className="badge badge-warning">
            <Droplets size={12} /> Needs care
          </span>
        )}
        {plant.status === 'struggling' && (
          <span className="badge badge-alert">
            <AlertTriangle size={12} /> Struggling
          </span>
        )}
        {plant.status === 'recovering' && (
          <span className="badge badge-recovering">
            <HeartPulse size={12} /> Recovering
          </span>
        )}
        {plant.status === 'dormant' && (
          <span className="badge badge-dormant">
            <Moon size={12} /> Dormant
          </span>
        )}
      </div>

      {/* Bloom history line — always rendered to keep card heights aligned */}
      <p
        className="mt-2 truncate"
        style={{
          fontFamily: 'var(--font-heading)',
          fontStyle: 'italic',
          fontSize: '11px',
          color: 'var(--text-quiet)',
          minHeight: '16px',
          lineHeight: '16px',
        }}
      >
        {historyLine || ' '}
      </p>
    </div>
  );

  // In selection mode, don't wrap with Link
  if (selectionMode) {
    return CardContent;
  }

  return <Link to={`/plants/${plant.id}`}>{CardContent}</Link>;
}
