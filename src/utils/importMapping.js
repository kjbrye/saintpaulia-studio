/**
 * Import column mapping & row normalization.
 *
 * Pure functions for translating arbitrary spreadsheet rows into
 * plant-shaped objects ready for insert.
 */

import { parseFlexibleDate } from './dateParser';
import { SIZE_CLASS_OPTIONS, BLOOM_TYPE_OPTIONS, LEAF_TYPE_OPTIONS } from '../constants/plantOptions';

/**
 * Importable plant fields. Order matters for UI dropdowns.
 * Each entry: { value, label, type, required? }
 */
export const PLANT_FIELDS = [
  { value: 'cultivar_name', label: 'Cultivar Name', type: 'text', required: true },
  { value: 'nickname', label: 'Nickname', type: 'text' },
  { value: 'avsa_number', label: 'AVSA Number', type: 'text' },
  { value: 'hybridizer', label: 'Hybridizer', type: 'text' },
  { value: 'acquisition_date', label: 'Acquired Date', type: 'date' },
  { value: 'source', label: 'Source', type: 'text' },
  { value: 'location', label: 'Location', type: 'text' },
  { value: 'status', label: 'Status', type: 'enum' },
  { value: 'pot_size', label: 'Pot Size', type: 'text' },
  { value: 'bloom_color', label: 'Bloom Color', type: 'text' },
  { value: 'bloom_type', label: 'Bloom Type', type: 'enum' },
  { value: 'size_class', label: 'Size Class', type: 'enum' },
  { value: 'leaf_type', label: 'Leaf Type', type: 'enum' },
  { value: 'leaf_color', label: 'Leaf Color', type: 'text' },
  { value: 'pod_parent_name', label: 'Pod Parent', type: 'text' },
  { value: 'pollen_parent_name', label: 'Pollen Parent', type: 'text' },
  { value: 'lineage_notes', label: 'Lineage Notes', type: 'text' },
  { value: 'notes', label: 'Notes', type: 'text' },
];

const PLANT_FIELDS_BY_VALUE = PLANT_FIELDS.reduce((acc, f) => {
  acc[f.value] = f;
  return acc;
}, {});

/**
 * Common header synonyms users put in their spreadsheets, keyed by plant
 * field. Lowercased + punctuation-stripped at match time, so the entries
 * here mirror that same normalization.
 */
const SYNONYMS = {
  cultivar_name: [
    'cultivar', 'cultivar name', 'plant name', 'name', 'variety', 'variety name',
    'plant', 'cultivar/variety',
  ],
  nickname: ['nickname', 'common name', 'pet name', 'short name', 'alias'],
  avsa_number: ['avsa', 'avsa number', 'avsa #', 'avsa id', 'registration number', 'reg number', 'reg #'],
  hybridizer: ['hybridizer', 'breeder', 'created by', 'hybridiser', 'originator', 'creator'],
  acquisition_date: [
    'acquired', 'acquired date', 'date acquired', 'acquisition', 'acquisition date',
    'date got', 'purchase date', 'date purchased', 'received', 'date received', 'date',
  ],
  source: ['source', 'from', 'vendor', 'supplier', 'purchased from', 'where from', 'origin'],
  location: ['location', 'where', 'spot', 'shelf', 'placement', 'placed'],
  status: ['status', 'health', 'condition', 'health status'],
  pot_size: ['pot size', 'pot', 'container size', 'container'],
  bloom_color: ['bloom color', 'bloom colour', 'flower color', 'flower colour', 'color', 'colour', 'flower'],
  bloom_type: ['bloom type', 'flower type', 'bloom form', 'flower form'],
  size_class: ['size', 'size class', 'class', 'plant size', 'category'],
  leaf_type: ['leaf type', 'foliage type', 'leaf form', 'foliage'],
  leaf_color: ['leaf color', 'leaf colour', 'foliage color', 'foliage colour'],
  pod_parent_name: ['pod parent', 'seed parent', 'mother', 'female parent', 'pod'],
  pollen_parent_name: ['pollen parent', 'father', 'male parent', 'pollen'],
  lineage_notes: ['lineage', 'lineage notes', 'pedigree', 'pedigree notes', 'parentage'],
  notes: ['notes', 'comments', 'remarks', 'description', 'memo', 'observations'],
};

const NORMALIZED_SYNONYMS = Object.entries(SYNONYMS).reduce((acc, [field, terms]) => {
  for (const term of terms) {
    acc[normalizeHeader(term)] = field;
  }
  return acc;
}, {});

function normalizeHeader(s) {
  return String(s ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

/**
 * Best-guess mapping from file columns to plant fields.
 * Returns { [fileColumn]: plantField | null }
 *
 * The same plant field is never mapped twice -- the first column to win it
 * keeps it, later columns map to null so the user can resolve manually.
 */
export function detectColumnMappings(fileColumns) {
  const mapping = {};
  const claimed = new Set();

  for (const col of fileColumns) {
    const key = normalizeHeader(col);
    const direct = NORMALIZED_SYNONYMS[key];
    if (direct && !claimed.has(direct)) {
      mapping[col] = direct;
      claimed.add(direct);
      continue;
    }

    // Fall back to substring match for cases like "Cultivar (English)".
    const partial = Object.entries(NORMALIZED_SYNONYMS).find(
      ([syn, field]) => !claimed.has(field) && (key.includes(syn) || syn.includes(key)) && key.length > 0,
    );
    if (partial) {
      const field = partial[1];
      mapping[col] = field;
      claimed.add(field);
    } else {
      mapping[col] = null;
    }
  }

  return mapping;
}

/**
 * Normalize a single field value based on its target plant field type.
 * Keeps unknowns as raw text; the validator decides whether to flag them.
 */
function normalizeValue(field, raw) {
  if (raw == null) return null;
  const str = typeof raw === 'string' ? raw.trim() : raw;
  if (str === '' || str === null || str === undefined) return null;

  const fieldDef = PLANT_FIELDS_BY_VALUE[field];
  if (!fieldDef) return null;

  if (fieldDef.type === 'date') {
    return parseFlexibleDate(str);
  }

  if (fieldDef.type === 'enum') {
    return matchEnumValue(field, String(str));
  }

  return String(str).trim();
}

const ENUM_OPTIONS = {
  size_class: SIZE_CLASS_OPTIONS,
  bloom_type: BLOOM_TYPE_OPTIONS,
  leaf_type: LEAF_TYPE_OPTIONS,
  status: [
    { value: 'healthy', label: 'Healthy' },
    { value: 'recovering', label: 'Recovering' },
    { value: 'struggling', label: 'Struggling' },
    { value: 'dormant', label: 'Dormant' },
  ],
};

function matchEnumValue(field, raw) {
  const options = ENUM_OPTIONS[field];
  if (!options) return raw.trim();

  const target = normalizeHeader(raw);
  for (const opt of options) {
    if (!opt.value) continue;
    if (normalizeHeader(opt.value) === target) return opt.value;
    if (normalizeHeader(opt.label) === target) return opt.value;
  }

  // Soft fallback: substring match against labels.
  for (const opt of options) {
    if (!opt.value) continue;
    if (target && normalizeHeader(opt.label).includes(target)) return opt.value;
  }

  return raw.trim();
}

/**
 * Apply a column mapping to a raw row, producing a partial plant object.
 * Columns with a null mapping are dropped.
 */
export function normalizeRow(row, mapping) {
  const out = {};
  for (const [col, field] of Object.entries(mapping)) {
    if (!field) continue;
    const value = normalizeValue(field, row[col]);
    if (value !== null && value !== '') out[field] = value;
  }
  return out;
}

/**
 * Validate a normalized row. Required field is `cultivar_name` only --
 * everything else is optional and either ends up as null or carries a
 * non-blocking warning.
 */
export function validateRow(plantData) {
  const errors = [];
  const warnings = [];

  if (!plantData.cultivar_name || !String(plantData.cultivar_name).trim()) {
    errors.push('Missing cultivar name');
  }

  // Date fields that came in but failed to parse are dropped at normalize
  // time, so the normalized object simply lacks them. Warn about that.
  // (We can't tell here whether the column was mapped or empty; the page
  // layer compares raw vs normalized to decide what to surface.)

  for (const field of ['size_class', 'bloom_type', 'leaf_type', 'status']) {
    const value = plantData[field];
    if (!value) continue;
    const options = ENUM_OPTIONS[field];
    if (!options) continue;
    const valid = options.some((o) => o.value === value);
    if (!valid) warnings.push(`Unrecognized ${field.replace('_', ' ')}: "${value}"`);
  }

  return { valid: errors.length === 0, errors, warnings };
}

/**
 * Convenience helper: take a full file (columns + rows + mapping) and return
 * the per-row normalized + validated payload that the review step renders.
 *
 * Returns Array<{ raw, normalized, valid, errors, warnings, _key }>.
 */
export function processRows(rows, mapping) {
  return rows.map((raw, idx) => {
    const normalized = normalizeRow(raw, mapping);
    const validation = validateRow(normalized);
    return {
      _key: `row-${idx}`,
      raw,
      normalized,
      ...validation,
    };
  });
}
