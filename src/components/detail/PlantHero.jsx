/**
 * PlantHero - Photo + identity + status pills for the plant detail page.
 */

import { useState } from 'react';
import { Flower2, Heart, ChevronRight, Camera, Sparkles } from 'lucide-react';
import { PlantPhotoGallery } from '../plants';
import PremiumFeatureModal from '../ui/PremiumFeatureModal';
import {
  BLOOM_TYPE_LABELS,
  SIZE_CLASS_LABELS,
  COMPOUND_BLOOM_COLORS,
  BI_MULTI_COLOR_OPTIONS,
} from '../../constants/plantOptions';
const LOCATION_LABELS = {
  windowsill: 'Windowsill',
  shelf: 'Plant Shelf',
  light_stand: 'Light Stand',
  greenhouse: 'Greenhouse',
  other: 'Other',
};

const BLOOM_COLOR_LABELS = {
  pink: 'Pink',
  purple: 'Purple',
  blue: 'Blue',
  white: 'White',
  red: 'Red',
  lavender: 'Lavender',
  coral: 'Coral',
  'bi-color': 'Bi-color',
  multi: 'Multi-color',
  chimera: 'Chimera',
  fantasy: 'Fantasy',
};

const BI_MULTI_LABELS = BI_MULTI_COLOR_OPTIONS.reduce((acc, o) => {
  acc[o.value] = o.label;
  return acc;
}, {});

function formatBloomColor(plant) {
  const base = BLOOM_COLOR_LABELS[plant.bloom_color];
  if (!base) return '';
  if (!COMPOUND_BLOOM_COLORS.has(plant.bloom_color)) return base;
  const detail = (plant.bloom_colors || []).map((c) => BI_MULTI_LABELS[c] || c).join(' & ');
  return detail || base;
}

function formatLocation(loc) {
  if (!loc) return '';
  if (loc.startsWith('custom:')) return loc.slice(7);
  return LOCATION_LABELS[loc] || loc;
}

function daysBetween(dateStr) {
  if (!dateStr) return 0;
  return Math.max(0, Math.floor((new Date() - new Date(dateStr)) / (1000 * 60 * 60 * 24)));
}

export default function PlantHero({ plant, displayName, careStatuses, activeBloom, canAddMultiPhotos, onPhotoUrlsChange, photoUrls }) {
  const [activePhoto, setActivePhoto] = useState(null);
  const [showPremium, setShowPremium] = useState(false);

  const eyebrowParts = [
    SIZE_CLASS_LABELS[plant.size_class],
    BLOOM_TYPE_LABELS[plant.bloom_type],
    formatBloomColor(plant),
  ].filter(Boolean);

  const description = plant.cultivar_name && plant.nickname && plant.cultivar_name !== plant.nickname
    ? plant.cultivar_name
    : null;

  const overdueCount = Object.values(careStatuses).filter((s) => s.status === 'overdue').length;
  const isBlooming = !!activeBloom;
  const isRecovering = plant.status === 'recovering';

  const heroPhoto = activePhoto || plant.photo_url;
  const allPhotos = [plant.photo_url, ...(photoUrls || [])].filter(Boolean);

  return (
    <div className="card p-6 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: photo column */}
        <div>
          <div
            className="rounded-xl overflow-hidden flex items-center justify-center w-full"
            style={{ background: 'var(--cream-200)', aspectRatio: '1.1 / 1' }}
          >
            {heroPhoto ? (
              <img src={heroPhoto} alt={displayName} className="w-full h-full object-cover" />
            ) : (
              <Flower2 size={72} style={{ color: 'var(--sage-400)' }} />
            )}
          </div>

          {canAddMultiPhotos ? (
            <div className="mt-3">
              <PlantPhotoGallery value={photoUrls || []} onChange={onPhotoUrlsChange} />
              {allPhotos.length > 1 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {allPhotos.map((url) => {
                    const current = heroPhoto === url;
                    return (
                      <button
                        key={url}
                        type="button"
                        onClick={() => setActivePhoto(url)}
                        className="w-10 h-10 rounded-md overflow-hidden"
                        style={{
                          outline: current ? '2px solid var(--sage-500)' : '1px solid var(--sage-200)',
                          outlineOffset: current ? 1 : 0,
                        }}
                      >
                        <img src={url} alt="" className="w-full h-full object-cover" />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowPremium(true)}
              className="mt-3 w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-left"
              style={{
                background: 'var(--cream-100)',
                border: '1px dashed var(--copper-500)',
              }}
            >
              <Camera size={18} style={{ color: 'var(--copper-500)' }} />
              <span className="flex-1 text-small" style={{ color: 'var(--copper-600)' }}>
                Add up to 4 more photos with Premium
              </span>
              <ChevronRight size={16} style={{ color: 'var(--copper-500)' }} />
            </button>
          )}
        </div>

        {/* Right: identity */}
        <div className="flex flex-col gap-3 min-w-0">
          {eyebrowParts.length > 0 && (
            <p
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: 1.4,
                textTransform: 'uppercase',
                color: 'var(--sage-600)',
              }}
            >
              {eyebrowParts.join(' · ')}
            </p>
          )}

          <h1
            className="heading"
            style={{ fontSize: 32, lineHeight: 1.1, color: 'var(--text-primary)' }}
          >
            {displayName}
          </h1>

          {(description || plant.notes) && (
            <p
              className="heading heading-sm"
              style={{
                fontStyle: 'italic',
                color: 'var(--purple-500)',
                lineHeight: 1.4,
              }}
            >
              {[description, plant.notes].filter(Boolean).join(' · ')}
            </p>
          )}

          {/* Status pills */}
          <div className="flex flex-wrap gap-2">
            {isBlooming && (
              <span
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-small font-medium"
                style={{ background: 'var(--purple-100)', color: 'var(--purple-600)' }}
              >
                <Flower2 size={12} />
                Currently blooming · {daysBetween(activeBloom.bloom_start_date)} days
              </span>
            )}
            {isRecovering && (
              <span
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-small font-medium"
                style={{ background: 'var(--sage-100)', color: 'var(--sage-700)' }}
              >
                <Heart size={12} />
                Recovering
              </span>
            )}
            {overdueCount > 0 && (
              <span
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-small font-medium"
                style={{ background: 'rgba(184,119,80,0.12)', color: 'var(--copper-600)' }}
              >
                <Sparkles size={12} />
                Needs care
              </span>
            )}
          </div>

          {/* Quick stats */}
          {(plant.location || plant.pot_size || plant.source) && (
            <div
              className="grid grid-cols-2 gap-4 mt-2 pt-3"
              style={{ borderTop: '1px solid var(--sage-200)' }}
            >
              <div className="min-w-0">
                {plant.location && (
                  <div>
                    <p className="text-label text-muted">Location</p>
                    <p className="text-body font-medium truncate">{formatLocation(plant.location)}</p>
                  </div>
                )}
                {plant.pot_size && (
                  <div className={plant.location ? 'mt-2' : ''}>
                    <p className="text-label text-muted">Pot size</p>
                    <p className="text-body font-medium">{plant.pot_size}</p>
                  </div>
                )}
              </div>
              {plant.source && (
                <div className="min-w-0">
                  <p className="text-label text-muted">Source</p>
                  <p className="text-body font-medium truncate">{plant.source}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <PremiumFeatureModal
        feature="multi_photos"
        open={showPremium}
        onClose={() => setShowPremium(false)}
      />
    </div>
  );
}
