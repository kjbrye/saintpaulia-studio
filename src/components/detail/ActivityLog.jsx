/**
 * ActivityLog - Unified activity feed for a plant.
 *
 * Merges care logs, treatment logs, and health observations into a single
 * filterable feed grouped by relative date buckets.
 */

import { useMemo, useState } from 'react';
import {
  Droplets,
  Sparkles,
  Scissors,
  Flower2,
  Bug,
  Stethoscope,
  Pencil,
} from 'lucide-react';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { groupActivityByDay } from '../../utils/groupActivityByDay';

const FERTILIZER_LABELS = {
  balanced: 'Balanced (20-20-20)',
  bloom: 'Bloom Booster',
  foliage: 'Foliage/Growth',
  organic: 'Organic',
  slow_release: 'Slow Release',
  other: 'Other',
};

const TREATMENT_LABELS = {
  neem_oil: 'Neem Oil',
  mosquito_bits: 'Mosquito Bits',
  hydrogen_peroxide: 'Hydrogen Peroxide',
  alcohol: 'Rubbing Alcohol',
  insecticidal_soap: 'Insecticidal Soap',
  other: 'Other',
};

const HEALTH_LABELS = {
  healthy: 'Healthy',
  recovering: 'Recovering',
  struggling: 'Struggling',
  dormant: 'Dormant',
};

const TYPE_META = {
  watering: { icon: Droplets, color: 'var(--sage-600)', verb: 'Watered', category: 'care' },
  fertilizing: { icon: Sparkles, color: 'var(--copper-500)', verb: 'Fertilized', category: 'care' },
  grooming: { icon: Scissors, color: 'var(--sage-600)', verb: 'Groomed', category: 'care' },
  repotting: { icon: Flower2, color: 'var(--sage-700)', verb: 'Repotted', category: 'care' },
  treatment: { icon: Bug, color: 'var(--copper-600)', verb: 'Treated', category: 'treatments' },
  observation: { icon: Stethoscope, color: 'var(--purple-500)', verb: 'Observation', category: 'observations' },
};

const FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'care', label: 'Care' },
  { value: 'treatments', label: 'Treatments' },
  { value: 'observations', label: 'Observations' },
];

function labelFor(log) {
  if (log._kind === 'health') {
    const status = log.health_status ? HEALTH_LABELS[log.health_status] : null;
    if (log.symptoms) return `Observation — ${log.symptoms}`;
    if (status) return `Observation — ${status}`;
    return 'Observation';
  }
  const meta = TYPE_META[log.care_type];
  const verb = meta?.verb || 'Logged';
  if (log.care_type === 'fertilizing' && log.fertilizer_type) {
    const f = FERTILIZER_LABELS[log.fertilizer_type] || log.fertilizer_type.replace(/^custom:/, '');
    return `${verb} — ${f}`;
  }
  if (log.care_type === 'treatment' && log.treatment_type) {
    const t = TREATMENT_LABELS[log.treatment_type] || log.treatment_type.replace(/^custom:/, '');
    return `${verb} — ${t}`;
  }
  if (log.care_type === 'repotting' && log.pot_size) {
    return `${verb} — ${log.pot_size}`;
  }
  return verb;
}

function ActivityRow({ entry }) {
  const meta = TYPE_META[entry.activityType] ?? { icon: Pencil, color: 'var(--sage-600)' };
  const Icon = meta.icon;
  const when = entry.occurredAt ? parseISO(entry.occurredAt) : null;
  const relative = when ? formatDistanceToNow(when, { addSuffix: true }) : '';

  return (
    <div className="flex items-center gap-3" style={{ padding: '8px 0' }}>
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ background: 'var(--cream-200)' }}
      >
        <Icon size={14} style={{ color: meta.color }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-body truncate">{entry.label}</p>
        {entry.notes && <p className="text-small text-muted truncate">{entry.notes}</p>}
      </div>
      <span className="text-small text-muted flex-shrink-0">{relative}</span>
    </div>
  );
}

function Bucket({ label, entries }) {
  if (!entries.length) return null;
  return (
    <div style={{ marginBottom: 12 }}>
      <span
        style={{
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: 1.2,
          textTransform: 'uppercase',
          color: 'var(--sage-600)',
          display: 'block',
          marginBottom: 4,
        }}
      >
        {label}
      </span>
      {entries.map((entry) => (
        <ActivityRow key={entry.id} entry={entry} />
      ))}
    </div>
  );
}

export default function ActivityLog({ careLogs = [], healthLogs = [], isLoading }) {
  const [filter, setFilter] = useState('all');

  const entries = useMemo(() => {
    const careEntries = careLogs.map((log) => {
      const meta = TYPE_META[log.care_type];
      return {
        id: `care-${log.id}`,
        activityType: log.care_type,
        category: meta?.category || 'care',
        occurredAt: log.care_date,
        label: labelFor(log),
        notes: log.notes,
      };
    });
    const healthEntries = healthLogs.map((log) => ({
      id: `health-${log.id}`,
      activityType: 'observation',
      category: 'observations',
      occurredAt: log.observation_date,
      label: labelFor({ ...log, _kind: 'health' }),
      notes: log.notes,
    }));
    return [...careEntries, ...healthEntries].sort(
      (a, b) => new Date(b.occurredAt) - new Date(a.occurredAt),
    );
  }, [careLogs, healthLogs]);

  const filtered = useMemo(() => {
    if (filter === 'all') return entries;
    return entries.filter((e) => e.category === filter);
  }, [entries, filter]);

  const buckets = groupActivityByDay(filtered);

  return (
    <div className="card p-6 mb-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="heading heading-md">Activity</h2>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-4">
        {FILTERS.map((f) => {
          const active = filter === f.value;
          return (
            <button
              key={f.value}
              type="button"
              onClick={() => setFilter(f.value)}
              className="px-3 py-1.5 rounded-lg text-small font-medium transition-colors"
              style={{
                background: active ? 'var(--sage-600)' : 'var(--cream-100)',
                color: active ? 'white' : 'var(--sage-700)',
                border: active ? 'none' : '1px solid var(--sage-200)',
              }}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      <div
        style={{
          background: 'var(--cream-100)',
          border: '1px solid var(--sage-200)',
          borderRadius: 'var(--radius-lg)',
          padding: 16,
        }}
      >
        {isLoading ? (
          <p className="text-small text-muted">Loading…</p>
        ) : filtered.length === 0 ? (
          <p className="text-small text-muted">Nothing logged yet.</p>
        ) : (
          <>
            <Bucket label="Today" entries={buckets.today} />
            <Bucket label="Yesterday" entries={buckets.yesterday} />
            <Bucket label="Earlier" entries={buckets.earlier} />
          </>
        )}
      </div>
    </div>
  );
}
