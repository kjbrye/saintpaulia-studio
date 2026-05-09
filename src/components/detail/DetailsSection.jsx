/**
 * DetailsSection - Condensed metadata grid with "missing details" copper chips.
 *
 * Only renders fields that have values. A wrap of dashed copper chips
 * surfaces optional fields that are still unset; tapping a chip opens the
 * page's edit mode.
 */

import { Plus } from 'lucide-react';
import {
  BLOOM_TYPE_LABELS,
  SIZE_CLASS_LABELS,
  LEAF_TYPE_LABELS,
  LEAF_COLOR_LABELS,
  COMPOUND_BLOOM_COLORS,
  BI_MULTI_COLOR_OPTIONS,
} from '../../constants/plantOptions';
import { STATUS_LABELS } from '../../constants/plantStatus';

const BLOOM_COLOR_LABELS = {
  pink: 'Pink',
  purple: 'Purple',
  blue: 'Blue',
  white: 'White',
  red: 'Red',
  lavender: 'Lavender',
  coral: 'Coral',
  'bi-color': 'Bi-color',
  multi: 'Multi-color',
  chimera: 'Chimera',
  fantasy: 'Fantasy',
};

const BI_MULTI_LABELS = BI_MULTI_COLOR_OPTIONS.reduce((acc, o) => {
  acc[o.value] = o.label;
  return acc;
}, {});

const LOCATION_LABELS = {
  windowsill: 'Windowsill',
  shelf: 'Plant Shelf',
  light_stand: 'Light Stand',
  greenhouse: 'Greenhouse',
  other: 'Other',
};

function formatDate(d) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatBloomColor(plant) {
  const base = BLOOM_COLOR_LABELS[plant.bloom_color];
  if (!base) return '';
  if (!COMPOUND_BLOOM_COLORS.has(plant.bloom_color)) return base;
  const detail = (plant.bloom_colors || []).map((c) => BI_MULTI_LABELS[c] || c).join(' & ');
  return detail ? `${base} (${detail})` : base;
}

function formatLocation(loc) {
  if (!loc) return '';
  if (loc.startsWith('custom:')) return loc.slice(7);
  return LOCATION_LABELS[loc] || loc;
}

export default function DetailsSection({ plant, onEdit }) {
  const fields = [
    { key: 'cultivar_name', label: 'Cultivar', value: plant.cultivar_name },
    { key: 'source', label: 'Source', value: plant.source },
    { key: 'size_class', label: 'Variety class', value: SIZE_CLASS_LABELS[plant.size_class] },
    { key: 'pot_size', label: 'Pot size', value: plant.pot_size },
    { key: 'bloom_color', label: 'Bloom color', value: formatBloomColor(plant) },
    { key: 'bloom_type', label: 'Bloom type', value: BLOOM_TYPE_LABELS[plant.bloom_type] },
    { key: 'leaf_type', label: 'Leaf type', value: LEAF_TYPE_LABELS[plant.leaf_type] },
    { key: 'leaf_color', label: 'Leaf color', value: LEAF_COLOR_LABELS[plant.leaf_color] },
    { key: 'status', label: 'Status', value: STATUS_LABELS[plant.status] },
    { key: 'location', label: 'Location', value: formatLocation(plant.location) },
    { key: 'acquisition_date', label: 'Acquired', value: formatDate(plant.acquisition_date) },
    { key: 'avsa_number', label: 'AVSA number', value: plant.avsa_number },
    { key: 'hybridizer', label: 'Hybridizer', value: plant.hybridizer },
  ];

  const set = fields.filter((f) => f.value);
  const missing = fields.filter((f) => !f.value && f.key !== 'cultivar_name');

  return (
    <div className="card p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="heading heading-md">Details</h2>
        <button onClick={onEdit} className="btn btn-secondary btn-small">Edit all</button>
      </div>

      {set.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
          {set.map((f, i) => (
            <div
              key={f.key}
              className="flex items-baseline justify-between gap-3 py-2"
              style={{
                borderTop: i >= (set.length % 2 === 0 ? 2 : set.length > 2 ? 2 : 1) ? '1px solid var(--sage-100)' : 'none',
              }}
            >
              <span className="text-label text-muted">{f.label}</span>
              <span className="text-body font-medium text-right truncate">{f.value}</span>
            </div>
          ))}
        </div>
      )}

      {missing.length > 0 && (
        <div className="mt-5 pt-4" style={{ borderTop: '1px solid var(--sage-200)' }}>
          <p
            style={{
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: 1.2,
              textTransform: 'uppercase',
              color: 'var(--sage-600)',
              marginBottom: 8,
            }}
          >
            {missing.length} {missing.length === 1 ? 'detail' : 'details'} missing
          </p>
          <div className="flex flex-wrap gap-2">
            {missing.map((f) => (
              <button
                key={f.key}
                type="button"
                onClick={onEdit}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-small transition-colors"
                style={{
                  background: 'transparent',
                  border: '1px dashed var(--copper-500)',
                  color: 'var(--copper-600)',
                }}
              >
                <Plus size={12} />
                {f.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
