/**
 * CloneRibbon - Horizontal row of clones below the pedigree card.
 * Visually distinct from descendants (sage tint, dashed border).
 */

import { Link } from 'react-router-dom';
import { Dna } from 'lucide-react';
import { PEDIGREE_LABELS } from '../../constants/lineageCopy';

function CloneNode({ clone }) {
  const name = clone.nickname || clone.cultivar_name || 'Unnamed';
  const context = clone.nickname && clone.cultivar_name ? clone.cultivar_name : null;
  return (
    <Link
      to={`/plants/${clone.id}`}
      className="rounded-lg px-3 py-2 flex items-center gap-2 hover:opacity-80 transition-opacity"
      style={{
        background: 'var(--sage-100)',
        border: '1px dashed var(--sage-400)',
        color: 'var(--sage-800)',
        minWidth: 130,
      }}
    >
      <Dna size={14} style={{ color: 'var(--sage-600)', flexShrink: 0 }} />
      <div className="min-w-0">
        <div className="text-small font-medium truncate">{name}</div>
        {context && (
          <div className="text-muted truncate" style={{ fontSize: 11 }}>
            {context}
          </div>
        )}
      </div>
    </Link>
  );
}

export default function CloneRibbon({ clones }) {
  if (!clones || clones.length === 0) return null;

  return (
    <div className="mt-4">
      <div
        style={{
          height: 1,
          background: 'var(--sage-200)',
          margin: '0 0 16px',
        }}
      />
      <div className="flex items-center gap-2 mb-3">
        <Dna size={16} style={{ color: 'var(--sage-600)' }} />
        <span
          className="text-label text-muted"
          style={{
            fontSize: 11,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}
        >
          {PEDIGREE_LABELS.clones}
        </span>
        <span
          className="text-muted"
          style={{ fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic', fontSize: 14 }}
        >
          {clones.length} plant{clones.length === 1 ? '' : 's'}
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {clones.map((c) => (
          <CloneNode key={c.id} clone={c} />
        ))}
      </div>
    </div>
  );
}
