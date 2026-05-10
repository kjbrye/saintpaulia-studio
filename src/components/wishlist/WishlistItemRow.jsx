/**
 * WishlistItemRow — sage neumorphic card row for one wishlist item.
 *
 * Active items show an Acquired button + ⋯ menu (Edit/Delete).
 * Acquired items show "acquired {date} → {plantName}" instead of the button,
 * and a ⋯ menu with just Delete.
 */

import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, MoreHorizontal, ShoppingBag, Loader2 } from 'lucide-react';
import { PRIORITY_BY_VALUE } from '../../constants/wishlistOptions';

const TONE_PILL = {
  copper: {
    background: 'var(--gradient-copper-card)',
    color: 'var(--copper-700)',
    border: '1px solid var(--copper-400)',
  },
  purple: {
    background: 'var(--purple-100)',
    color: 'var(--purple-500)',
    border: 'var(--border-purple)',
  },
  sage: {
    background: 'var(--sage-100)',
    color: 'var(--sage-700)',
    border: 'var(--border-sage)',
  },
};

function formatRelative(iso) {
  if (!iso) return '';
  const then = new Date(iso);
  const now = new Date();
  const diffDays = Math.floor((now - then) / (1000 * 60 * 60 * 24));
  if (diffDays <= 0) return 'today';
  if (diffDays === 1) return 'yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) {
    const w = Math.floor(diffDays / 7);
    return `${w} ${w === 1 ? 'week' : 'weeks'} ago`;
  }
  if (diffDays < 365) {
    const m = Math.floor(diffDays / 30);
    return `${m} ${m === 1 ? 'month' : 'months'} ago`;
  }
  const y = Math.floor(diffDays / 365);
  return `${y} ${y === 1 ? 'year' : 'years'} ago`;
}

export default function WishlistItemRow({
  item,
  acquiredPlantName,
  onAcquire,
  onEdit,
  onDelete,
  isAcquiring = false,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!menuOpen) return;
    const close = (e) => {
      if (!menuRef.current?.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [menuOpen]);

  const isAcquired = item.status === 'acquired';
  const priority = PRIORITY_BY_VALUE[item.priority] ?? PRIORITY_BY_VALUE.medium;
  const PriorityIcon = priority.icon;
  const pillStyle = TONE_PILL[priority.tone];

  const handleCardClick = () => {
    if (isAcquired) return;
    onEdit?.(item);
  };

  return (
    <div
      className="card p-4 sm:p-5"
      style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr) auto auto',
        gap: 12,
        alignItems: 'center',
        cursor: isAcquired ? 'default' : 'pointer',
      }}
      onClick={handleCardClick}
      role={isAcquired ? undefined : 'button'}
      tabIndex={isAcquired ? -1 : 0}
      onKeyDown={(e) => {
        if (!isAcquired && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          handleCardClick();
        }
      }}
    >
      {/* Content */}
      <div style={{ minWidth: 0 }}>
        <div className="flex items-baseline flex-wrap gap-x-2 gap-y-1">
          <h3
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 18,
              fontWeight: 600,
              color: 'var(--sage-800)',
              lineHeight: 1.2,
            }}
          >
            {item.cultivar_name}
          </h3>
          {item.hybridizer && (
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: 1.2,
                textTransform: 'uppercase',
                color: 'var(--text-muted)',
              }}
            >
              {item.hybridizer}
            </span>
          )}
        </div>

        <div className="flex items-center flex-wrap gap-2 mt-2">
          <span
            className="inline-flex items-center gap-1"
            style={{
              ...pillStyle,
              padding: '3px 10px',
              borderRadius: 9999,
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            <PriorityIcon size={12} />
            {priority.pillLabel}
          </span>

          {item.source && (
            <span
              className="inline-flex items-center gap-1"
              style={{ fontSize: 13, color: 'var(--text-muted)' }}
            >
              <ShoppingBag size={12} />
              {item.source}
            </span>
          )}
        </div>

        {item.notes && (
          <p
            className="mt-2"
            style={{
              fontFamily: 'var(--font-heading)',
              fontStyle: 'italic',
              fontSize: 15,
              color: 'var(--text-muted)',
              lineHeight: 1.4,
            }}
          >
            {item.notes}
          </p>
        )}
      </div>

      {/* Acquired button OR acquired meta */}
      <div onClick={(e) => e.stopPropagation()}>
        {isAcquired ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-end',
              gap: 2,
            }}
          >
            <span
              style={{
                fontFamily: 'var(--font-heading)',
                fontStyle: 'italic',
                fontSize: 13,
                color: 'var(--sage-600)',
              }}
            >
              acquired {formatRelative(item.acquired_at)}
            </span>
            {item.acquired_plant_id && (
              <Link
                to={`/plants/${item.acquired_plant_id}`}
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: 'var(--sage-700)',
                }}
              >
                → {acquiredPlantName || 'View plant'}
              </Link>
            )}
          </div>
        ) : (
          <button
            type="button"
            className="btn btn-primary btn-small"
            onClick={() => onAcquire?.(item)}
            disabled={isAcquiring}
          >
            {isAcquiring ? (
              <>
                <Loader2 size={14} className="animate-spin" /> …
              </>
            ) : (
              <>
                <Check size={14} /> Acquired
              </>
            )}
          </button>
        )}
      </div>

      {/* Three-dot menu */}
      <div className="relative" onClick={(e) => e.stopPropagation()} ref={menuRef}>
        <button
          type="button"
          className="icon-container icon-container-sm"
          onClick={() => setMenuOpen((o) => !o)}
          aria-label="More options"
          aria-haspopup="menu"
          aria-expanded={menuOpen}
        >
          <MoreHorizontal size={16} style={{ color: 'var(--sage-600)' }} />
        </button>
        {menuOpen && (
          <div
            role="menu"
            className="card"
            style={{
              position: 'absolute',
              right: 0,
              top: 'calc(100% + 6px)',
              minWidth: 140,
              padding: 6,
              zIndex: 20,
            }}
          >
            {!isAcquired && (
              <button
                type="button"
                role="menuitem"
                className="quick-action-btn"
                style={{ width: '100%', justifyContent: 'flex-start' }}
                onClick={() => {
                  setMenuOpen(false);
                  onEdit?.(item);
                }}
              >
                Edit
              </button>
            )}
            <button
              type="button"
              role="menuitem"
              className="quick-action-btn"
              style={{
                width: '100%',
                justifyContent: 'flex-start',
                color: 'var(--color-error)',
              }}
              onClick={() => {
                setMenuOpen(false);
                onDelete?.(item);
              }}
            >
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
