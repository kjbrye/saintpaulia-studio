/**
 * CollectionAtAGlance
 *
 * Six tiles in a 3-column grid (2 on mobile). First row is always real
 * counts (Plants, Blooming, Wishlist). Second row shows real counts for
 * premium users; for free users it renders PremiumDiscoveryTile in each
 * slot.
 *
 * Wishlist count is hardcoded to 0 with no link — the wishlist_items
 * table doesn't exist yet (per the v0.2 spec, out of scope for this PR).
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Flower2, Heart, Leaf, FlaskConical, Scissors, Sparkles } from 'lucide-react';
import PremiumDiscoveryTile from './PremiumDiscoveryTile';
import { PremiumFeatureModal } from '../ui';

const TONE_STYLES = {
  sage: {
    background: 'var(--gradient-sage-card)',
    border: 'var(--border-sage)',
    iconColor: 'var(--sage-600)',
    labelColor: 'var(--sage-600)',
    countColor: 'var(--sage-700)',
  },
  purple: {
    background: 'var(--gradient-purple-card)',
    border: 'var(--border-purple)',
    iconColor: 'var(--purple-400)',
    labelColor: 'var(--purple-400)',
    countColor: 'var(--purple-500)',
  },
  copper: {
    background: 'var(--gradient-copper-card)',
    border: '1px solid var(--copper-400)',
    iconColor: 'var(--copper-500)',
    labelColor: 'var(--copper-600)',
    countColor: 'var(--copper-700)',
  },
};

function CountTile({ icon: Icon, label, count, tone = 'sage', href }) {
  const t = TONE_STYLES[tone] ?? TONE_STYLES.sage;
  const inner = (
    <div
      style={{
        background: t.background,
        border: t.border,
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-panel)',
        padding: 18,
        minHeight: 120,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        transition: 'all var(--transition-fast)',
      }}
      className="collection-tile"
    >
      <div className="flex items-center gap-2">
        <Icon size={14} style={{ color: t.iconColor }} />
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: 1.2,
            textTransform: 'uppercase',
            color: t.labelColor,
          }}
        >
          {label}
        </span>
      </div>
      <span
        style={{
          fontFamily: 'var(--font-heading)',
          fontSize: 36,
          fontWeight: 700,
          color: t.countColor,
          lineHeight: 1,
        }}
      >
        {count}
      </span>
    </div>
  );

  if (!href) return inner;
  return (
    <Link to={href} style={{ textDecoration: 'none' }} aria-label={`View ${label.toLowerCase()}`}>
      {inner}
    </Link>
  );
}

export default function CollectionAtAGlance({ counts, isPremium }) {
  const [premiumFeature, setPremiumFeature] = useState(null);
  const data = counts ?? {
    plants: 0,
    blooming: 0,
    wishlist: 0,
    propagations: 0,
    crosses: 0,
    sports: 0,
  };

  return (
    <section style={{ marginBottom: 24 }}>
      <span
        style={{
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: 1.4,
          textTransform: 'uppercase',
          color: 'var(--sage-600)',
          display: 'block',
          marginBottom: 12,
        }}
      >
        Collection at a glance
      </span>

      <div className="collection-grid">
        <CountTile
          icon={Leaf}
          label="Plants"
          count={data.plants}
          tone="sage"
          href="/library"
        />
        <CountTile
          icon={Flower2}
          label="Blooming"
          count={data.blooming}
          tone="purple"
          href="/library?filter=blooming"
        />
        <CountTile
          icon={Heart}
          label="Wishlist"
          count={data.wishlist}
          tone="copper"
          href="/wishlist"
        />

        {isPremium ? (
          <>
            <CountTile
              icon={Scissors}
              label="Propagations"
              count={data.propagations}
              tone="sage"
              href="/propagation"
            />
            <CountTile
              icon={Sparkles}
              label="Sports"
              count={data.sports}
              tone="purple"
              href="/sports"
            />
            <CountTile
              icon={FlaskConical}
              label="Crosses"
              count={data.crosses}
              tone="copper"
              href="/breeding"
            />
          </>
        ) : (
          <>
            <PremiumDiscoveryTile feature="propagation" onClick={setPremiumFeature} />
            <PremiumDiscoveryTile feature="sports" onClick={setPremiumFeature} />
            <PremiumDiscoveryTile feature="breeding" onClick={setPremiumFeature} />
          </>
        )}
      </div>

      <PremiumFeatureModal
        feature={premiumFeature}
        open={!!premiumFeature}
        onClose={() => setPremiumFeature(null)}
      />
    </section>
  );
}
