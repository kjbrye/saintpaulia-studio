/**
 * TodaySection
 *
 * "TODAY" actionable strip. Up to four cards in a 2×2 grid (single column
 * on mobile). Card selection rules:
 *   - Among water/fertilize/groom: if all three are overdue, pick the top 2
 *     by count; otherwise show every overdue type in priority order.
 *   - Append "Blooms to update" if count > 0.
 *   - Free users: fill the last slot with a Propagation discovery card.
 *   - Premium users with no fourth-card candidate: omit the slot.
 *   - Nothing overdue and no blooms-to-update: show a single full-width
 *     "happy today" calm card.
 */

import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Droplets, Flower2, Scissors, Sparkles, Shovel } from 'lucide-react';
import TaskCard from './TaskCard';
import { PremiumFeatureModal } from '../ui';

const CARE_CARD_DEFS = {
  watering: {
    icon: Droplets,
    title: 'Water overdue plants',
    iconColor: 'var(--copper-600)',
    iconBg: 'var(--cream-300)',
    href: '/library?filter=water-overdue',
  },
  fertilizing: {
    icon: Sparkles,
    title: 'Feed your collection',
    iconColor: 'var(--copper-500)',
    iconBg: 'var(--cream-300)',
    href: '/library?filter=fertilize-overdue',
  },
  grooming: {
    icon: Scissors,
    title: 'Groom & deadhead',
    iconColor: 'var(--sage-600)',
    iconBg: 'var(--sage-100)',
    href: '/library?filter=groom-overdue',
  },
  repotting: {
    icon: Shovel,
    title: 'Repot due plants',
    iconColor: 'var(--copper-500)',
    iconBg: 'var(--cream-300)',
    href: '/library?filter=repot-overdue',
  },
};

function pickCareCards(overdueCounts) {
  const types = ['watering', 'fertilizing', 'grooming', 'repotting'];
  const overdue = types
    .map((type) => ({ type, count: overdueCounts?.[type]?.count ?? 0 }))
    .filter((entry) => entry.count > 0);

  if (overdue.length >= 3) {
    overdue.sort((a, b) => b.count - a.count);
    return overdue.slice(0, 2).map((entry) => entry.type);
  }
  return overdue.map((entry) => entry.type);
}

export default function TodaySection({ overdueCounts, bloomsToUpdate, isPremium }) {
  const navigate = useNavigate();
  const [premiumFeature, setPremiumFeature] = useState(null);

  const careCardTypes = useMemo(() => pickCareCards(overdueCounts), [overdueCounts]);
  const bloomsCount = bloomsToUpdate?.count ?? 0;

  const cards = [];

  for (const type of careCardTypes) {
    const def = CARE_CARD_DEFS[type];
    const data = overdueCounts[type];
    cards.push({
      key: `care-${type}`,
      icon: def.icon,
      iconColor: def.iconColor,
      iconBg: def.iconBg,
      title: def.title,
      subtitle: `${data.count} ${data.count === 1 ? 'plant' : 'plants'} overdue`,
      thumbnails: data.plants,
      onClick: () => navigate(def.href),
    });
  }

  if (bloomsCount > 0) {
    cards.push({
      key: 'blooms-to-update',
      icon: Flower2,
      iconColor: 'var(--purple-500)',
      iconBg: 'var(--purple-100)',
      title: 'Blooms waiting for an update',
      subtitle: `${bloomsCount} ${bloomsCount === 1 ? 'bloom' : 'blooms'} active 30+ days`,
      thumbnails: bloomsToUpdate?.plants,
      onClick: () => navigate('/library?filter=needs-bloom-update'),
    });
  }

  if (!isPremium && cards.length < 4) {
    cards.push({
      key: 'discover-propagation',
      icon: Scissors,
      iconColor: 'var(--copper-500)',
      iconBg: 'var(--cream-300)',
      title: 'Track every cutting',
      subtitle: 'Propagation tracking — Premium',
      variant: 'premium',
      onClick: () => setPremiumFeature('propagation'),
    });
  }

  if (cards.length === 0) {
    return (
      <section style={{ marginBottom: 24 }}>
        <SectionHeading />
        <div
          style={{
            background: 'var(--cream-100)',
            border: '1px solid var(--sage-200)',
            borderRadius: 'var(--radius-lg)',
            padding: '28px 20px',
            textAlign: 'center',
          }}
        >
          <p
            style={{
              fontFamily: 'var(--font-heading)',
              fontStyle: 'italic',
              fontSize: 22,
              color: 'var(--purple-500)',
              marginBottom: 4,
            }}
          >
            Your collection is happy today 🌱
          </p>
          <p className="text-small text-muted">
            Nothing's overdue. Take a moment to enjoy the blooms.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section style={{ marginBottom: 24 }}>
      <SectionHeading />
      <div className="today-grid">
        {cards.map((card) => (
          <TaskCard
            key={card.key}
            icon={card.icon}
            iconColor={card.iconColor}
            iconBg={card.iconBg}
            title={card.title}
            subtitle={card.subtitle}
            thumbnails={card.thumbnails}
            onClick={card.onClick}
            variant={card.variant ?? 'default'}
          />
        ))}
      </div>

      <PremiumFeatureModal
        feature={premiumFeature}
        open={!!premiumFeature}
        onClose={() => setPremiumFeature(null)}
      />
    </section>
  );
}

function SectionHeading() {
  const today = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });
  return (
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
        Today
      </span>
      <span className="text-small text-muted">{today}</span>
    </div>
  );
}
