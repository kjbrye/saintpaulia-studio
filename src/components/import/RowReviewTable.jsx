/**
 * RowReviewTable
 *
 * The full list of import rows: drag-handle to reorder, checkbox to
 * select, validation badge, and an expand toggle for full row details.
 *
 * Selection is capped at availableCapacity. Once the cap is reached,
 * additional checkboxes are disabled. Invalid rows can't be selected.
 */

import { useState, useMemo } from 'react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, ChevronDown, ChevronRight } from 'lucide-react';
import ValidationIssueBadge from './ValidationIssueBadge';
import { PLANT_FIELDS } from '../../utils/importMapping';

function SortableRow({
  row,
  index,
  selected,
  onToggleSelect,
  expanded,
  onToggleExpand,
  selectionDisabled,
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: row._key,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const name = row.normalized.cultivar_name || (
    <span style={{ color: 'var(--color-error)', fontStyle: 'italic' }}>
      Missing cultivar name
    </span>
  );

  const checkboxDisabled = !row.valid || (selectionDisabled && !selected);

  return (
    <li
      ref={setNodeRef}
      style={style}
      className="rounded-lg overflow-hidden"
    >
      <div
        className="flex items-center gap-3 px-3 py-2"
        style={{
          background: selected ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.25)',
          border: '1px solid var(--sage-200)',
        }}
      >
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing"
          aria-label="Drag to reorder"
          style={{ color: 'var(--sage-500)', touchAction: 'none' }}
        >
          <GripVertical size={18} />
        </button>

        <input
          type="checkbox"
          checked={selected}
          disabled={checkboxDisabled}
          onChange={() => onToggleSelect(row._key)}
          aria-label={`Import row ${index + 1}`}
          style={{ accentColor: 'var(--sage-600)' }}
        />

        <span
          className="text-small font-semibold tabular-nums"
          style={{ color: 'var(--text-muted)', minWidth: 28 }}
        >
          {index + 1}
        </span>

        <div className="flex-1 min-w-0">
          <p className="font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
            {name}
          </p>
          <p className="text-small truncate" style={{ color: 'var(--text-muted)' }}>
            {row.normalized.hybridizer || row.normalized.size_class || row.normalized.notes || ' '}
          </p>
        </div>

        <ValidationIssueBadge
          valid={row.valid}
          errors={row.errors}
          warnings={row.warnings}
        />

        <button
          type="button"
          onClick={() => onToggleExpand(row._key)}
          className="icon-container icon-container-sm"
          aria-label={expanded ? 'Hide details' : 'Show details'}
          aria-expanded={expanded}
        >
          {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </button>
      </div>

      {expanded && (
        <div
          className="px-4 py-3"
          style={{
            background: 'rgba(255,255,255,0.4)',
            borderLeft: '1px solid var(--sage-200)',
            borderRight: '1px solid var(--sage-200)',
            borderBottom: '1px solid var(--sage-200)',
          }}
        >
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-small">
            {PLANT_FIELDS.filter((f) => row.normalized[f.value] != null).map((f) => (
              <div key={f.value} className="flex justify-between gap-3">
                <dt style={{ color: 'var(--text-muted)' }}>{f.label}</dt>
                <dd style={{ color: 'var(--text-primary)' }} className="text-right truncate">
                  {String(row.normalized[f.value])}
                </dd>
              </div>
            ))}
          </dl>
          {row.warnings.length > 0 && (
            <p className="text-small mt-3" style={{ color: 'var(--copper-600)' }}>
              {row.warnings.join(' · ')}
            </p>
          )}
        </div>
      )}
    </li>
  );
}

export default function RowReviewTable({
  rows,
  selectedKeys,
  onSelectionChange,
  onReorder,
  availableCapacity,
}) {
  const [expandedKeys, setExpandedKeys] = useState(() => new Set());

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const validCount = useMemo(() => rows.filter((r) => r.valid).length, [rows]);
  const selectedCount = selectedKeys.size;
  const cap = Number.isFinite(availableCapacity) ? availableCapacity : Infinity;
  const selectionDisabled = selectedCount >= cap;

  function toggleSelect(key) {
    const next = new Set(selectedKeys);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    onSelectionChange(next);
  }

  function toggleExpand(key) {
    setExpandedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function handleDragEnd(event) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = rows.findIndex((r) => r._key === active.id);
    const newIndex = rows.findIndex((r) => r._key === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    onReorder(arrayMove(rows, oldIndex, newIndex));
  }

  function selectFirstN(n) {
    const next = new Set();
    for (const row of rows) {
      if (next.size >= n) break;
      if (row.valid) next.add(row._key);
    }
    onSelectionChange(next);
  }

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
        <div>
          <h3 className="heading heading-sm">Review your plants</h3>
          <p className="text-small" style={{ color: 'var(--text-muted)' }}>
            {validCount} of {rows.length} valid
            {Number.isFinite(cap) ? ` · ${selectedCount} of ${cap} selected` : ` · ${selectedCount} selected`}
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            type="button"
            className="batch-action-btn"
            onClick={() => selectFirstN(Number.isFinite(cap) ? cap : validCount)}
          >
            Select first {Number.isFinite(cap) ? Math.min(cap, validCount) : validCount}
          </button>
          <button
            type="button"
            className="batch-action-btn"
            onClick={() => onSelectionChange(new Set())}
            disabled={selectedCount === 0}
          >
            Clear selection
          </button>
        </div>
      </div>

      {Number.isFinite(cap) && (
        <div className="mb-4">
          <div className="care-progress-bar-track" style={{ height: 6 }}>
            <div
              className="care-progress-bar-fill"
              style={{ width: `${Math.min(100, (selectedCount / cap) * 100)}%` }}
            />
          </div>
        </div>
      )}

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={rows.map((r) => r._key)} strategy={verticalListSortingStrategy}>
          <ul className="space-y-2 list-none p-0 m-0">
            {rows.map((row, idx) => (
              <SortableRow
                key={row._key}
                row={row}
                index={idx}
                selected={selectedKeys.has(row._key)}
                onToggleSelect={toggleSelect}
                expanded={expandedKeys.has(row._key)}
                onToggleExpand={toggleExpand}
                selectionDisabled={selectionDisabled}
              />
            ))}
          </ul>
        </SortableContext>
      </DndContext>
    </div>
  );
}
