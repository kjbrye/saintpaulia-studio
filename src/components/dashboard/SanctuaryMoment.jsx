/**
 * SanctuaryMoment
 *
 * Calm closing card showing the user's most recent milestone — a bloom, a
 * propagation that reached rooting, or a new cross. Falls back to a
 * "just getting started" prompt when no milestones exist yet.
 */

import { Link } from 'react-router-dom';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { ArrowRight, Flower2, Plus, Scissors, Sparkles } from 'lucide-react';
import { useLatestMilestone } from '../../hooks/useDashboard';

const KIND_ICON = {
  bloom: Flower2,
  propagation: Scissors,
  cross: Sparkles,
};

function destinationFor(milestone) {
  if (!milestone) return null;
  if (milestone.kind === 'bloom' && milestone.plantId) return `/plants/${milestone.plantId}`;
  if (milestone.kind === 'propagation' && milestone.propagationId)
    return `/propagation`;
  if (milestone.kind === 'cross' && milestone.crossId) return `/breeding`;
  return null;
}

export default function SanctuaryMoment() {
  const { data: milestone, isLoading, error } = useLatestMilestone();

  if (error) {
    return (
      <section
        style={{
          background: 'var(--cream-100)',
          border: '1px solid var(--copper-300)',
          borderLeft: '3px solid var(--copper-500)',
          borderRadius: 'var(--radius-lg)',
          padding: 16,
          marginBottom: 24,
        }}
      >
        <p
          className="text-small"
          style={{ color: 'var(--copper-600)' }}
        >
          Couldn't load the latest milestone: {error.message}
        </p>
      </section>
    );
  }

  if (isLoading) {
    return (
      <section
        style={{
          background: 'var(--gradient-purple-card)',
          border: 'var(--border-purple)',
          borderRadius: 'var(--radius-lg)',
          padding: 20,
          marginBottom: 24,
          minHeight: 100,
        }}
        aria-hidden="true"
      />
    );
  }

  if (!milestone) {
    return (
      <section
        style={{
          background: 'var(--gradient-purple-card)',
          border: 'var(--border-purple)',
          boxShadow: 'var(--shadow-purple-raised)',
          borderRadius: 'var(--radius-lg)',
          padding: 20,
          marginBottom: 24,
        }}
      >
        <div className="flex items-center gap-4">
          <div
            className="rounded-full flex items-center justify-center flex-shrink-0"
            style={{
              width: 60,
              height: 60,
              background: 'var(--purple-200)',
            }}
          >
            <Flower2 size={26} style={{ color: 'var(--purple-500)' }} />
          </div>
          <div className="flex-1 min-w-0">
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: 1.4,
                textTransform: 'uppercase',
                color: 'var(--purple-500)',
                display: 'block',
                marginBottom: 2,
              }}
            >
              Sanctuary
            </span>
            <p
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 22,
                color: 'var(--text-primary)',
                margin: 0,
                lineHeight: 1.2,
              }}
            >
              Your sanctuary is just getting started
            </p>
            <p className="text-small text-muted" style={{ marginTop: 4 }}>
              Add a plant to begin tracking blooms and milestones.
            </p>
          </div>
          <Link
            to="/plants/new"
            className="btn btn-primary"
            style={{ flexShrink: 0 }}
          >
            <Plus size={16} /> Add plant
          </Link>
        </div>
      </section>
    );
  }

  const Icon = KIND_ICON[milestone.kind] ?? Flower2;
  const when = milestone.occurredAt ? parseISO(milestone.occurredAt) : null;
  const relative = when ? formatDistanceToNow(when, { addSuffix: true }) : '';
  const href = destinationFor(milestone);

  const card = (
    <article
      style={{
        background: 'var(--gradient-purple-card)',
        border: 'var(--border-purple)',
        boxShadow: 'var(--shadow-purple-raised)',
        borderRadius: 'var(--radius-lg)',
        padding: 20,
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        transition: 'all var(--transition-fast)',
      }}
    >
      <div
        className="rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden"
        style={{
          width: 60,
          height: 60,
          background: 'var(--purple-200)',
        }}
      >
        {milestone.plant?.photo_url ? (
          <img
            src={milestone.plant.photo_url}
            alt=""
            className="w-full h-full object-cover"
          />
        ) : (
          <Icon size={26} style={{ color: 'var(--purple-500)' }} />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: 1.4,
            textTransform: 'uppercase',
            color: 'var(--purple-500)',
            display: 'block',
            marginBottom: 2,
          }}
        >
          {milestone.eyebrow}
        </span>
        <p
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 22,
            color: 'var(--text-primary)',
            margin: 0,
            lineHeight: 1.2,
          }}
          className="truncate"
        >
          {milestone.title}
        </p>
        {relative && (
          <p
            style={{
              fontFamily: 'var(--font-heading)',
              fontStyle: 'italic',
              fontSize: 14,
              color: 'var(--purple-500)',
              marginTop: 2,
            }}
          >
            {relative}
          </p>
        )}
      </div>

      {href && (
        <ArrowRight
          size={20}
          style={{ color: 'var(--purple-500)', flexShrink: 0 }}
        />
      )}
    </article>
  );

  return (
    <section style={{ marginBottom: 24 }}>
      {href ? (
        <Link to={href} style={{ textDecoration: 'none' }}>
          {card}
        </Link>
      ) : (
        card
      )}
    </section>
  );
}
