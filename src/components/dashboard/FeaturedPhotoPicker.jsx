/**
 * FeaturedPhotoPicker
 *
 * Modal grid of the user's library plants that have a photo. Selecting one
 * sets it as the dashboard hero's featured photo; "Use most recent
 * automatically" clears the choice and returns to the default logic.
 */

import { useEffect } from 'react';
import { Check, RotateCcw, X } from 'lucide-react';
import { DASHBOARD_COPY } from '../../constants/dashboardCopy';

const P = DASHBOARD_COPY.hero.picker;

export default function FeaturedPhotoPicker({ open, onClose, plants, currentId, onSelect, onReset }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && onClose?.();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <>
      <div
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 300 }}
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={P.title}
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 'min(560px, calc(100vw - 32px))',
          maxHeight: 'calc(100vh - 64px)',
          background: 'var(--surface-card)',
          border: '0.5px solid var(--card-border)',
          borderRadius: 'var(--radius-card)',
          boxShadow: '0 12px 40px rgba(45, 58, 40, 0.25)',
          zIndex: 301,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        <header
          className="flex items-center justify-between"
          style={{ padding: '16px 20px', borderBottom: '0.5px solid var(--card-border)' }}
        >
          <div>
            <h2 className="ds-section-title" style={{ fontSize: 18 }}>
              {P.title}
            </h2>
            <p style={{ fontSize: 13, color: 'var(--text-quiet)', marginTop: 2 }}>{P.subtitle}</p>
          </div>
          <button className="dash-iconbtn" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </header>

        <div style={{ padding: 16, overflowY: 'auto' }}>
          {plants.length === 0 ? (
            <p style={{ fontSize: 14, color: 'var(--text-quiet)', padding: '12px 4px' }}>{P.empty}</p>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
                gap: 10,
              }}
            >
              {plants.map((plant) => {
                const name = plant.nickname || plant.cultivar_name || 'Unnamed plant';
                const selected = plant.id === currentId;
                return (
                  <button
                    key={plant.id}
                    type="button"
                    onClick={() => {
                      onSelect(plant.id);
                      onClose?.();
                    }}
                    aria-pressed={selected}
                    style={{
                      position: 'relative',
                      padding: 0,
                      border: selected
                        ? '2px solid var(--purple-emphasis)'
                        : '0.5px solid var(--card-border)',
                      borderRadius: 10,
                      overflow: 'hidden',
                      background: 'var(--cream-200)',
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    <span
                      style={{
                        display: 'block',
                        width: '100%',
                        aspectRatio: '1',
                        overflow: 'hidden',
                      }}
                    >
                      <img
                        src={plant.photo_url}
                        alt={name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                      />
                    </span>
                    {selected && (
                      <span
                        style={{
                          position: 'absolute',
                          top: 6,
                          right: 6,
                          width: 22,
                          height: 22,
                          borderRadius: '50%',
                          background: 'var(--purple-emphasis)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Check size={13} color="#fff" strokeWidth={3} />
                      </span>
                    )}
                    <span
                      className="truncate"
                      style={{
                        display: 'block',
                        padding: '6px 8px',
                        fontSize: 12,
                        fontWeight: 600,
                        color: 'var(--text-body)',
                        background: 'var(--surface-card)',
                      }}
                    >
                      {name}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {currentId && (
          <footer style={{ padding: '12px 20px', borderTop: '0.5px solid var(--card-border)' }}>
            <button
              type="button"
              onClick={() => {
                onReset();
                onClose?.();
              }}
              className="flex items-center gap-2"
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: 'var(--purple-emphasis)',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              <RotateCcw size={15} /> {P.auto}
            </button>
          </footer>
        )}
      </div>
    </>
  );
}
