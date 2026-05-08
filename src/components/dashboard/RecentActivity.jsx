/**
 * RecentActivity
 *
 * Cream card listing the last few care + bloom events grouped into
 * TODAY / YESTERDAY / EARLIER buckets. Uses the dashboard service's
 * pre-normalized activity rows so this component stays presentational.
 */

import { Link } from 'react-router-dom';
import { formatDistanceToNow, parseISO } from 'date-fns';
import {
  Droplets,
  Flower2,
  Pencil,
  Scissors,
  Sparkles,
  Stethoscope,
} from 'lucide-react';
import { useRecentActivity } from '../../hooks/useDashboard';
import { groupActivityByDay } from '../../utils/groupActivityByDay';

const TYPE_META = {
  watering: { icon: Droplets, color: 'var(--sage-600)' },
  fertilizing: { icon: Sparkles, color: 'var(--copper-500)' },
  grooming: { icon: Scissors, color: 'var(--sage-600)' },
  repotting: { icon: Pencil, color: 'var(--sage-600)' },
  treatment: { icon: Stethoscope, color: 'var(--copper-600)' },
  bloom: { icon: Flower2, color: 'var(--purple-500)' },
};

function ActivityRow({ entry }) {
  const meta = TYPE_META[entry.type] ?? { icon: Pencil, color: 'var(--sage-600)' };
  const Icon = meta.icon;
  const when = entry.occurredAt ? parseISO(entry.occurredAt) : null;
  const relative = when ? formatDistanceToNow(when, { addSuffix: true }) : '';

  return (
    <div
      className="flex items-center gap-3"
      style={{ padding: '8px 0' }}
    >
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ background: 'var(--cream-200)' }}
      >
        <Icon size={14} style={{ color: meta.color }} />
      </div>
      <div className="flex-1 min-w-0">
        <p style={{ fontSize: 14, color: 'var(--text-primary)' }} className="truncate">
          {entry.label}{' '}
          {entry.plantId ? (
            <Link
              to={`/plants/${entry.plantId}`}
              style={{ fontWeight: 600, color: 'var(--sage-700)' }}
            >
              {entry.plantName}
            </Link>
          ) : (
            <span style={{ fontWeight: 600 }}>{entry.plantName}</span>
          )}
        </p>
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

export default function RecentActivity() {
  const { data: activity = [], isLoading, error } = useRecentActivity(8);
  const buckets = groupActivityByDay(activity);

  return (
    <section style={{ marginBottom: 24 }}>
      <div
        className="flex items-center justify-between"
        style={{ marginBottom: 12 }}
      >
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: 1.4,
            textTransform: 'uppercase',
            color: 'var(--sage-600)',
          }}
        >
          Recent activity
        </span>
        <Link
          to="/care"
          className="text-small"
          style={{ color: 'var(--sage-700)', fontWeight: 600 }}
        >
          View all →
        </Link>
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
        ) : error ? (
          <p className="text-small" style={{ color: 'var(--copper-600)' }}>
            Couldn't load activity: {error.message}
          </p>
        ) : activity.length === 0 ? (
          <p className="text-small text-muted">
            Nothing logged yet. Care actions and blooms will show up here.
          </p>
        ) : (
          <>
            <Bucket label="Today" entries={buckets.today} />
            <Bucket label="Yesterday" entries={buckets.yesterday} />
            <Bucket label="Earlier" entries={buckets.earlier} />
          </>
        )}
      </div>
    </section>
  );
}
