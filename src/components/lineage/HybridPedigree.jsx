/**
 * HybridPedigree - Vertical pedigree visualization centered on a focal plant.
 *
 *   Ancestors        (rows of compact pills, fading older = more transparent)
 *      ↓
 *   Focal plant      (large purple gradient card)
 *      ↓
 *   Descendants      (offspring + clone-routed offspring)
 *
 * Clones are surfaced separately via CloneRibbon, not in the descendants row.
 */

import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Dna, Plus } from 'lucide-react';
import { PEDIGREE_LABELS } from '../../constants/lineageCopy';
import { findCloneRoutedDescendants } from '../../utils/lineageResolution';

const ANCESTOR_OPACITY = [1, 0.85, 0.75, 0.55, 0.4];

function SectionLabel({ children }) {
  return (
    <div
      className="text-label text-muted text-center"
      style={{
        fontSize: 11,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        marginBottom: 8,
      }}
    >
      {children}
    </div>
  );
}

function NodePill({ plant, externalName, opacity = 1, viaClone, hasMore, onExpand }) {
  if (externalName) {
    return (
      <div
        className="rounded-lg px-3 py-1.5"
        style={{
          background: 'var(--cream-50, var(--sage-50))',
          border: '1px dashed var(--sage-300)',
          opacity,
          minWidth: 100,
          textAlign: 'center',
          fontSize: 12,
          color: 'var(--sage-700)',
        }}
      >
        {externalName}
        <div className="text-muted" style={{ fontSize: 10 }}>
          External
        </div>
      </div>
    );
  }
  if (!plant) return null;
  const name = plant.nickname || plant.cultivar_name || 'Unnamed';
  const inner = (
    <div
      className="rounded-lg px-3 py-1.5 flex items-center gap-1.5"
      style={{
        background: 'var(--cream-50, var(--sage-50))',
        border: '1px solid var(--sage-200)',
        opacity,
        minWidth: 110,
        fontSize: 12,
        fontWeight: 500,
        color: 'var(--sage-800)',
        cursor: 'pointer',
      }}
    >
      {viaClone && <Dna size={12} style={{ color: 'var(--sage-500)', flexShrink: 0 }} />}
      <span className="truncate">{name}</span>
      {hasMore && (
        <button
          type="button"
          aria-label="Expand descendants"
          onClick={(e) => {
            e.preventDefault();
            onExpand?.();
          }}
          style={{
            border: '1px solid var(--sage-300)',
            background: 'var(--sage-100)',
            borderRadius: 999,
            width: 16,
            height: 16,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--sage-700)',
            flexShrink: 0,
          }}
        >
          <Plus size={10} />
        </button>
      )}
    </div>
  );
  return (
    <Link to={`/plants/${plant.id}`} className="hover:opacity-80 transition-opacity">
      {inner}
    </Link>
  );
}

function FocalCard({ plant }) {
  const photo = plant.photo_url || (plant.photo_urls && plant.photo_urls[0]);
  const name = plant.nickname || plant.cultivar_name || 'Unnamed';
  return (
    <div
      className="card-purple rounded-2xl p-4 flex items-center gap-3"
      style={{ minWidth: 220 }}
    >
      {photo ? (
        <img
          src={photo}
          alt=""
          style={{
            width: 44,
            height: 44,
            borderRadius: 10,
            objectFit: 'cover',
            flexShrink: 0,
          }}
        />
      ) : (
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 10,
            background: 'var(--purple-100)',
            flexShrink: 0,
          }}
        />
      )}
      <div className="min-w-0">
        <div
          className="text-label"
          style={{
            fontSize: 10,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'var(--purple-500)',
            opacity: 0.8,
          }}
        >
          {PEDIGREE_LABELS.focal}
        </div>
        <div
          style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontSize: 18,
            color: 'var(--purple-500)',
            fontWeight: 500,
            lineHeight: 1.2,
          }}
        >
          {name}
        </div>
      </div>
    </div>
  );
}

/**
 * Build the ancestor rows: an array (one per generation, parents first)
 * of `{ plant, externalName }` slots. Parents at depth 1, grandparents at 2…
 */
function collectAncestorRows(plant, plantMap, maxDepth) {
  const rows = []; // rows[0] = parents
  let frontier = [{ id: plant.pod_parent_id, name: plant.pod_parent_name }, { id: plant.pollen_parent_id, name: plant.pollen_parent_name }];
  for (let d = 0; d < maxDepth; d += 1) {
    const slots = [];
    const next = [];
    let any = false;
    for (const slot of frontier) {
      if (slot.id) {
        const p = plantMap.get(slot.id);
        if (p) {
          any = true;
          slots.push({ plant: p });
          next.push({ id: p.pod_parent_id, name: p.pod_parent_name });
          next.push({ id: p.pollen_parent_id, name: p.pollen_parent_name });
          continue;
        }
      }
      if (slot.name) {
        any = true;
        slots.push({ externalName: slot.name });
      } else {
        slots.push(null);
      }
      next.push({ id: null, name: null });
      next.push({ id: null, name: null });
    }
    if (!any) break;
    rows.push(slots);
    frontier = next;
  }
  return rows;
}

export default function HybridPedigree({ plant, plantMap, allPlants, maxDepth = 3 }) {
  const [expanded, setExpanded] = useState(new Set());
  const ancestorRows = useMemo(
    () => collectAncestorRows(plant, plantMap, maxDepth),
    [plant, plantMap, maxDepth],
  );

  const directDescendants = useMemo(() => {
    return allPlants.filter(
      (p) => p.pod_parent_id === plant.id || p.pollen_parent_id === plant.id,
    );
  }, [allPlants, plant.id]);

  const cloneRouted = useMemo(
    () => findCloneRoutedDescendants(plant.id, allPlants),
    [allPlants, plant.id],
  );

  const grandchildrenByParent = useMemo(() => {
    const map = new Map();
    for (const dc of directDescendants) {
      const grand = allPlants.filter(
        (p) => p.pod_parent_id === dc.id || p.pollen_parent_id === dc.id,
      );
      if (grand.length > 0) map.set(dc.id, grand);
    }
    return map;
  }, [allPlants, directDescendants]);

  const hasAnyDescendants = directDescendants.length > 0 || cloneRouted.length > 0;

  return (
    <div className="card p-6">
      {ancestorRows.length > 0 && (
        <div className="mb-6">
          <SectionLabel>{PEDIGREE_LABELS.ancestors}</SectionLabel>
          <div className="flex flex-col gap-3">
            {ancestorRows
              .slice()
              .reverse()
              .map((row, idxFromTop) => {
                const rowDepth = ancestorRows.length - idxFromTop;
                const opacity =
                  ANCESTOR_OPACITY[Math.min(rowDepth - 1, ANCESTOR_OPACITY.length - 1)];
                return (
                  <div key={rowDepth} className="flex flex-wrap gap-2 justify-center">
                    {row.map((slot, i) =>
                      slot ? (
                        <NodePill
                          key={i}
                          plant={slot.plant}
                          externalName={slot.externalName}
                          opacity={opacity}
                        />
                      ) : null,
                    )}
                  </div>
                );
              })}
          </div>
        </div>
      )}

      <div className="flex justify-center mb-6">
        <FocalCard plant={plant} />
      </div>

      {hasAnyDescendants && (
        <div>
          <SectionLabel>{PEDIGREE_LABELS.descendants}</SectionLabel>
          <div className="flex flex-wrap gap-2 justify-center">
            {directDescendants.map((d) => {
              const grand = grandchildrenByParent.get(d.id);
              const isExpanded = expanded.has(d.id);
              return (
                <div key={d.id} className="flex flex-col items-center gap-2">
                  <NodePill
                    plant={d}
                    hasMore={!!grand && !isExpanded}
                    onExpand={() =>
                      setExpanded((prev) => {
                        const next = new Set(prev);
                        next.add(d.id);
                        return next;
                      })
                    }
                  />
                  {isExpanded && grand && (
                    <div className="flex flex-wrap gap-2 justify-center">
                      {grand.map((g) => (
                        <NodePill key={g.id} plant={g} opacity={0.85} />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
            {cloneRouted.map(({ plant: d, viaClone }) => (
              <NodePill key={`clone-${d.id}`} plant={d} viaClone={viaClone} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
