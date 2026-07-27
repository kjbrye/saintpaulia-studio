/**
 * LibraryFilterDrawer
 *
 * Slide-in panel from the right with all filter controls. Holds a local
 * draft copy of the filters so users can stage changes and then Apply or
 * Reset without closing.
 */

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import {
  BLOOM_TYPE_FILTER_OPTIONS,
  VARIETY_CLASS_BUCKETS,
} from '../../constants/plantOptions';

const POT_SIZE_OPTIONS = [
  { value: 'all', label: 'All sizes' },
  { value: '2"', label: '2"' },
  { value: '2.5"', label: '2.5"' },
  { value: '3"', label: '3"' },
  { value: '3.5"', label: '3.5"' },
  { value: '4"', label: '4"' },
  { value: '4.5"', label: '4.5"' },
  { value: '5"', label: '5"' },
  { value: '6"', label: '6"' },
  { value: '6"+', label: '6"+' },
];

const BLOOM_COLOR_OPTIONS = [
  { value: 'all', label: 'All colors' },
  { value: 'pink', label: 'Pink' },
  { value: 'purple', label: 'Purple' },
  { value: 'blue', label: 'Blue' },
  { value: 'white', label: 'White' },
  { value: 'red', label: 'Red' },
  { value: 'lavender', label: 'Lavender' },
  { value: 'coral', label: 'Coral' },
  { value: 'bi-color', label: 'Bi-color' },
  { value: 'multi', label: 'Multi-color' },
  { value: 'chimera', label: 'Chimera' },
  { value: 'fantasy', label: 'Fantasy' },
];

const BLOOM_STATUS_OPTIONS = [
  { value: 'all', label: 'Any' },
  { value: 'blooming', label: 'Blooming' },
  { value: 'not-blooming', label: 'Not blooming' },
];

const EMPTY_DRAFT = {
  potSize: 'all',
  bloomColor: 'all',
  bloomType: 'all',
  bloomingFilter: 'all',
  varietyClasses: [],
  hybridizer: 'all',
};

export default function LibraryFilterDrawer({
  open,
  onClose,
  filters,
  onApply,
  hybridizers = [],
}) {
  const [draft, setDraft] = useState(filters || EMPTY_DRAFT);
  const [hybridizerSearch, setHybridizerSearch] = useState('');

  // Sync draft state when drawer opens or external filters change.
  useEffect(() => {
    if (open) {
      setDraft(filters || EMPTY_DRAFT);
      setHybridizerSearch('');
    }
  }, [open, filters]);

  // Esc closes the drawer.
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const setField = (key, value) => setDraft((prev) => ({ ...prev, [key]: value }));

  const toggleVariety = (value) => {
    setDraft((prev) => {
      const set = new Set(prev.varietyClasses);
      if (set.has(value)) set.delete(value);
      else set.add(value);
      return { ...prev, varietyClasses: Array.from(set) };
    });
  };

  const handleReset = () => setDraft(EMPTY_DRAFT);

  const handleApply = () => {
    onApply(draft);
    onClose();
  };

  const filteredHybridizers = hybridizers.filter((h) =>
    h.toLowerCase().includes(hybridizerSearch.toLowerCase()),
  );

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 transition-opacity ${
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        style={{ background: 'rgba(38, 51, 42, 0.4)' }}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <aside
        className={`fixed top-0 right-0 z-50 h-full w-full max-w-md flex flex-col transition-transform ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{
          background: 'var(--surface-card)',
          boxShadow: '-4px 0 16px rgba(45, 58, 40, 0.18)',
        }}
        aria-hidden={!open}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[var(--card-border)]">
          <h2 className="heading heading-md" style={{ color: 'var(--text-strong)' }}>
            Filters
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="icon-container icon-container-sm"
            aria-label="Close filters"
          >
            <X size={16} style={{ color: 'var(--text-body)' }} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          <FilterSection title="Pot size">
            <select
              className="input w-full"
              value={draft.potSize}
              onChange={(e) => setField('potSize', e.target.value)}
            >
              {POT_SIZE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </FilterSection>

          <FilterSection title="Bloom color">
            <select
              className="input w-full"
              value={draft.bloomColor}
              onChange={(e) => setField('bloomColor', e.target.value)}
            >
              {BLOOM_COLOR_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </FilterSection>

          <FilterSection title="Bloom type">
            <select
              className="input w-full"
              value={draft.bloomType}
              onChange={(e) => setField('bloomType', e.target.value)}
            >
              {BLOOM_TYPE_FILTER_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </FilterSection>

          <FilterSection title="Bloom status">
            <div className="flex flex-wrap gap-2">
              {BLOOM_STATUS_OPTIONS.map((opt) => (
                <ChipButton
                  key={opt.value}
                  active={draft.bloomingFilter === opt.value}
                  onClick={() => setField('bloomingFilter', opt.value)}
                >
                  {opt.label}
                </ChipButton>
              ))}
            </div>
          </FilterSection>

          <FilterSection title="Variety class">
            <div className="flex flex-wrap gap-2">
              {VARIETY_CLASS_BUCKETS.map((bucket) => (
                <ChipButton
                  key={bucket.value}
                  active={draft.varietyClasses.includes(bucket.value)}
                  onClick={() => toggleVariety(bucket.value)}
                >
                  {bucket.label}
                </ChipButton>
              ))}
            </div>
          </FilterSection>

          <FilterSection title="Hybridizer">
            {hybridizers.length > 8 ? (
              <>
                <input
                  type="text"
                  placeholder="Search hybridizers..."
                  className="input w-full mb-2"
                  value={hybridizerSearch}
                  onChange={(e) => setHybridizerSearch(e.target.value)}
                />
                <div
                  className="border rounded-md overflow-y-auto"
                  style={{
                    borderColor: 'var(--card-border)',
                    maxHeight: 200,
                    background: 'var(--page-bg)',
                  }}
                >
                  <HybridizerOption
                    value="all"
                    label="Any hybridizer"
                    selected={draft.hybridizer === 'all'}
                    onSelect={() => setField('hybridizer', 'all')}
                  />
                  {filteredHybridizers.map((h) => (
                    <HybridizerOption
                      key={h}
                      value={h}
                      label={h}
                      selected={draft.hybridizer === h}
                      onSelect={() => setField('hybridizer', h)}
                    />
                  ))}
                  {filteredHybridizers.length === 0 && (
                    <p className="p-3 text-small text-muted">No matches</p>
                  )}
                </div>
              </>
            ) : (
              <select
                className="input w-full"
                value={draft.hybridizer}
                onChange={(e) => setField('hybridizer', e.target.value)}
              >
                <option value="all">Any hybridizer</option>
                {hybridizers.map((h) => (
                  <option key={h} value={h}>
                    {h}
                  </option>
                ))}
              </select>
            )}
          </FilterSection>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 p-4 border-t border-[var(--card-border)]">
          <button
            type="button"
            onClick={handleReset}
            className="text-small font-semibold"
            style={{ color: 'var(--text-body)' }}
          >
            Reset
          </button>
          <button type="button" onClick={handleApply} className="ds-btn-primary">
            Apply
          </button>
        </div>
      </aside>
    </>
  );
}

function FilterSection({ title, children }) {
  return (
    <div>
      <h3
        className="mb-2"
        style={{
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: 'var(--text-quiet)',
        }}
      >
        {title}
      </h3>
      {children}
    </div>
  );
}

function ChipButton({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="px-3 py-1.5 rounded-lg text-small font-medium transition-all"
      style={{
        background: active ? 'var(--purple-emphasis)' : 'var(--page-bg)',
        color: active ? 'white' : 'var(--text-body)',
        border: active ? '1px solid var(--purple-emphasis)' : '0.5px solid var(--card-border)',
      }}
    >
      {children}
    </button>
  );
}

function HybridizerOption({ label, selected, onSelect }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className="w-full text-left px-3 py-2 transition-colors"
      style={{
        fontSize: 14,
        color: selected ? 'var(--text-strong)' : 'var(--text-body)',
        fontWeight: selected ? 700 : 500,
        background: selected ? 'var(--page-bg)' : 'transparent',
      }}
    >
      {label}
    </button>
  );
}
