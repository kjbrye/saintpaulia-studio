/**
 * TaskCard
 *
 * Today section card. Two visual variants:
 *  - default: cream card, soft border, copper chevron, navigates on click.
 *  - premium: dashed copper border, copper "Upgrade" arrow, opens the
 *    premium modal (parent decides which feature via onClick).
 *
 * Plant thumbnails (up to 3) render as overlapping circles using each
 * plant's photo, falling back to a sage avatar if the photo is missing.
 */

import { ArrowUpRight, ChevronRight } from 'lucide-react';

function PlantThumbnails({ plants = [] }) {
  if (!plants.length) return null;
  return (
    <div className="flex items-center" aria-hidden="true">
      {plants.slice(0, 3).map((plant, idx) => (
        <div
          key={plant.id ?? idx}
          className="w-7 h-7 rounded-full overflow-hidden flex items-center justify-center"
          style={{
            background: 'var(--sage-200)',
            border: '2px solid var(--cream-100)',
            marginLeft: idx === 0 ? 0 : -8,
            zIndex: 3 - idx,
          }}
        >
          {plant.photo_url ? (
            <img src={plant.photo_url} alt="" className="w-full h-full object-cover" />
          ) : (
            <span style={{ fontSize: 13 }}>🪻</span>
          )}
        </div>
      ))}
    </div>
  );
}

export default function TaskCard({
  icon: Icon,
  iconColor = 'var(--copper-500)',
  iconBg = 'var(--cream-200)',
  title,
  subtitle,
  thumbnails,
  onClick,
  variant = 'default',
  ariaLabel,
}) {
  const isPremium = variant === 'premium';

  const baseStyle = {
    background: 'var(--cream-100)',
    borderRadius: 'var(--radius-lg)',
    padding: 16,
    textAlign: 'left',
    cursor: 'pointer',
    transition: 'all var(--transition-fast)',
    width: '100%',
  };

  const style = isPremium
    ? { ...baseStyle, border: '2px dashed var(--copper-400)' }
    : { ...baseStyle, border: '1px solid var(--sage-200)' };

  const ArrowIcon = isPremium ? ArrowUpRight : ChevronRight;

  return (
    <button
      type="button"
      onClick={onClick}
      style={style}
      aria-label={ariaLabel || title}
      className="task-card"
    >
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: iconBg }}
        >
          {Icon ? <Icon size={20} style={{ color: iconColor }} /> : null}
        </div>
        <div className="flex-1 min-w-0">
          <p
            className="font-semibold truncate"
            style={{ color: 'var(--text-primary)', fontSize: 15 }}
          >
            {title}
          </p>
          {subtitle && (
            <p
              className="text-small truncate"
              style={{ color: 'var(--text-muted)', marginTop: 2 }}
            >
              {subtitle}
            </p>
          )}
        </div>
        <ArrowIcon
          size={18}
          style={{ color: isPremium ? 'var(--copper-500)' : 'var(--sage-500)', flexShrink: 0 }}
        />
      </div>
      {thumbnails && thumbnails.length > 0 && (
        <div className="flex justify-end mt-3">
          <PlantThumbnails plants={thumbnails} />
        </div>
      )}
    </button>
  );
}
