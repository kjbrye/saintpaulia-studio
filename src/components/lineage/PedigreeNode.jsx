/**
 * PedigreeNode - Single plant node in a pedigree tree
 */

import { Link } from 'react-router-dom';
import { HelpCircle, Flower2 } from 'lucide-react';

export default function PedigreeNode({ plant, label, isCenter, isUnknown, externalName, compact }) {
  // External parent: known by name but not in the library
  if (externalName) {
    return (
      <div
        className="rounded-lg p-2.5"
        style={{
          background: 'var(--sage-50)',
          border: '1px solid var(--sage-200)',
          minWidth: compact ? 100 : 130,
        }}
      >
        <p
          className={`font-medium truncate ${compact ? 'text-small' : ''}`}
          style={{ color: 'var(--sage-700)', fontSize: compact ? 12 : undefined }}
        >
          {externalName}
        </p>
        <span className="text-muted" style={{ fontSize: 10 }}>External</span>
      </div>
    );
  }

  if (isUnknown) {
    return (
      <div
        className="rounded-lg p-2 flex items-center gap-2 text-center"
        style={{
          background: 'var(--sage-100)',
          border: '1px dashed var(--sage-300)',
          minWidth: compact ? 100 : 130,
        }}
      >
        <HelpCircle size={14} style={{ color: 'var(--sage-400)', flexShrink: 0 }} />
        <span className="text-small text-muted truncate">{label || 'Unknown'}</span>
      </div>
    );
  }

  const displayName = plant.nickname || plant.cultivar_name || 'Unnamed';
  const genBadge = plant.generation != null ? `F${plant.generation}` : null;

  const content = (
    <div
      className={`rounded-lg p-2.5 transition-all ${isCenter ? 'card' : ''}`}
      style={{
        background: isCenter ? undefined : 'var(--sage-50)',
        border: isCenter ? undefined : '1px solid var(--sage-200)',
        boxShadow: isCenter ? undefined : 'none',
        minWidth: compact ? 100 : 130,
        cursor: plant.id ? 'pointer' : 'default',
      }}
    >
      <p
        className={`font-medium truncate ${compact ? 'text-small' : ''}`}
        style={{ color: isCenter ? 'var(--purple-500)' : 'var(--sage-800)', fontSize: compact ? 12 : undefined }}
      >
        {displayName}
      </p>
      {!compact && plant.cultivar_name && plant.nickname && (
        <p className="text-small text-muted truncate" style={{ fontSize: 11 }}>
          {plant.cultivar_name}
        </p>
      )}
      <div className="flex items-center gap-1.5 mt-1">
        {label && (
          <span className="text-muted" style={{ fontSize: 10 }}>{label}</span>
        )}
        {genBadge && (
          <span
            className="badge"
            style={{ fontSize: 10, padding: '0 5px', lineHeight: '16px' }}
          >
            {genBadge}
          </span>
        )}
      </div>
    </div>
  );

  if (plant.id) {
    return (
      <Link to={`/plants/${plant.id}`} className="hover:opacity-80 transition-opacity block">
        {content}
      </Link>
    );
  }

  return content;
}
