/**
 * SportDescriptionBuilder - The structured description fields for a sport.
 *
 * Reusable form section used by SportRegistrationForm and any future edit flow.
 * Owns nothing — call site supplies `value` and `onChange(patch)`.
 */

import FormField from '../ui/FormField';
import {
  BLOOM_TYPES,
  BLOOM_SHAPES,
  EDGE_STYLES,
  FOLIAGE_COLORS,
  FOLIAGE_SHAPES,
  SIZE_CLASSES,
} from '../../utils/sportVocabulary';

function Select({ value, onChange, options, placeholder }) {
  return (
    <select
      className="input w-full"
      value={value || ''}
      onChange={(e) => onChange(e.target.value || null)}
    >
      <option value="">{placeholder || 'Select…'}</option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}

function Toggle({ label, hint, checked, onChange }) {
  return (
    <label className="flex items-start gap-3 cursor-pointer">
      <input
        type="checkbox"
        checked={!!checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-1"
        style={{ accentColor: 'var(--purple-500)', width: 18, height: 18 }}
      />
      <span className="flex-1">
        <span
          className="text-small font-semibold"
          style={{ color: 'var(--sage-700)' }}
        >
          {label}
        </span>
        {hint && (
          <span className="block text-small text-muted" style={{ marginTop: 2 }}>
            {hint}
          </span>
        )}
      </span>
    </label>
  );
}

export default function SportDescriptionBuilder({ value, onChange }) {
  const v = value || {};
  const set = (patch) => onChange({ ...v, ...patch });

  return (
    <div className="space-y-6">
      {/* Bloom */}
      <section className="space-y-4">
        <h3 className="text-label" style={{ color: 'var(--purple-500)' }}>
          Bloom
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Bloom type">
            <Select
              value={v.bloom_type}
              onChange={(val) => set({ bloom_type: val })}
              options={BLOOM_TYPES}
            />
          </FormField>
          <FormField label="Bloom shape">
            <Select
              value={v.bloom_shape}
              onChange={(val) => set({ bloom_shape: val })}
              options={BLOOM_SHAPES}
            />
          </FormField>
          <FormField label="Primary color">
            <input
              type="text"
              className="input w-full"
              placeholder="e.g., fuchsia, lavender, white"
              value={v.primary_color || ''}
              onChange={(e) => set({ primary_color: e.target.value || null })}
            />
          </FormField>
          <FormField label="Secondary color">
            <input
              type="text"
              className="input w-full"
              placeholder="optional accent color"
              value={v.secondary_color || ''}
              onChange={(e) => set({ secondary_color: e.target.value || null })}
            />
          </FormField>
          <FormField label="Edge style">
            <Select
              value={v.edge_style}
              onChange={(val) => set({ edge_style: val })}
              options={EDGE_STYLES}
            />
          </FormField>
          <FormField label="Edge / accent detail">
            <input
              type="text"
              className="input w-full"
              placeholder='e.g., "white stripe", "blue fantasy"'
              value={v.edge_detail || ''}
              onChange={(e) => set({ edge_detail: e.target.value || null })}
            />
          </FormField>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <Toggle
            label="Chimera"
            hint="Pinwheel-like color pattern. Cannot reproduce from leaf cuttings — only suckers/crowns."
            checked={v.is_chimera}
            onChange={(val) => set({ is_chimera: val })}
          />
          <Toggle
            label="Sticktite"
            hint="Spent blooms cling rather than dropping."
            checked={v.is_sticktite}
            onChange={(val) => set({ is_sticktite: val })}
          />
        </div>
      </section>

      {/* Foliage */}
      <section className="space-y-4">
        <h3 className="text-label" style={{ color: 'var(--purple-500)' }}>
          Foliage
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Foliage color">
            <Select
              value={v.foliage_color}
              onChange={(val) => set({ foliage_color: val })}
              options={FOLIAGE_COLORS}
            />
          </FormField>
          <FormField label="Foliage shape">
            <Select
              value={v.foliage_shape}
              onChange={(val) => set({ foliage_shape: val })}
              options={FOLIAGE_SHAPES}
            />
          </FormField>
          <FormField
            label="Variegation detail"
            className="sm:col-span-2"
          >
            <input
              type="text"
              className="input w-full"
              placeholder='e.g., "Tommie Lou variegated", "crown variegated green and cream"'
              value={v.foliage_variegation || ''}
              onChange={(e) => set({ foliage_variegation: e.target.value || null })}
            />
          </FormField>
        </div>
      </section>

      {/* Size */}
      <section className="space-y-4">
        <h3 className="text-label" style={{ color: 'var(--purple-500)' }}>
          Size class
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Size class">
            <Select
              value={v.size_class}
              onChange={(val) =>
                set({
                  size_class: val,
                  is_trailer: val ? val.includes('trailer') : v.is_trailer,
                })
              }
              options={SIZE_CLASSES}
            />
          </FormField>
        </div>
      </section>
    </div>
  );
}
