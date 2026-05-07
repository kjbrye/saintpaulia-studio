/**
 * BloomColorPicker - Multi-select chips for the specific colors that make up a
 * bi-color or multi-color bloom.
 *
 * Renders only when the parent passes a non-empty `options` list. The caller
 * decides when to mount it (typically when bloom_color is 'bi-color' / 'multi').
 */

import { BI_MULTI_COLOR_OPTIONS } from '../../constants/plantOptions';

export default function BloomColorPicker({
  value = [],
  onChange,
  options = BI_MULTI_COLOR_OPTIONS,
  label = 'Specific colors',
  hint,
}) {
  const selected = new Set(value || []);

  const toggle = (color) => {
    const next = new Set(selected);
    if (next.has(color)) next.delete(color);
    else next.add(color);
    // Preserve the display order from `options` rather than insertion order
    const ordered = options.map((o) => o.value).filter((v) => next.has(v));
    onChange(ordered);
  };

  return (
    <div>
      <label className="block mb-2">
        <span className="text-small font-semibold" style={{ color: 'var(--sage-700)' }}>
          {label}
        </span>
      </label>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const isSelected = selected.has(opt.value);
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => toggle(opt.value)}
              className={`badge ${isSelected ? 'badge-purple' : ''}`}
              style={{
                cursor: 'pointer',
                padding: '6px 12px',
                fontSize: 13,
                background: isSelected ? undefined : 'var(--cream-200)',
                color: isSelected ? undefined : 'var(--sage-700)',
                border: isSelected ? undefined : '1px solid var(--sage-300)',
              }}
              aria-pressed={isSelected}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
      {hint && (
        <p className="text-small text-muted" style={{ marginTop: 6 }}>
          {hint}
        </p>
      )}
    </div>
  );
}
