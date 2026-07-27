/**
 * CollectionGlance
 *
 * Five stat tiles: Total plants, Blooming, Propagations, Crosses, Sports.
 * Each is a circular pastel icon badge + Cormorant number + label. Counts are
 * reused from useCollectionCounts. Copper is intentionally absent here — these
 * are neutral totals, not actionable status.
 */

import { Link } from 'react-router-dom';
import { Leaf, Flower2, Scissors, FlaskConical, Sparkles } from 'lucide-react';
import { DASHBOARD_COPY } from '../../constants/dashboardCopy';

const C = DASHBOARD_COPY.collection;

function GlanceTile({ icon: Icon, badgeBg, iconColor, value, label, href }) {
  return (
    <Link to={href} className="ds-card glance-tile" aria-label={`View ${label.toLowerCase()}`}>
      <span className="glance-badge" style={{ background: badgeBg }}>
        <Icon size={20} style={{ color: iconColor }} />
      </span>
      <span className="glance-number">{value}</span>
      <span className="glance-label">{label}</span>
    </Link>
  );
}

export default function CollectionGlance({ counts }) {
  const data = counts ?? {
    plants: 0,
    blooming: 0,
    propagations: 0,
    crosses: 0,
    sports: 0,
  };

  return (
    <section style={{ marginBottom: 24 }}>
      <h2 className="ds-section-title" style={{ marginBottom: 12 }}>
        {C.title}
      </h2>
      <div className="glance-grid">
        <GlanceTile
          icon={Leaf}
          badgeBg="var(--sage-100)"
          iconColor="var(--sage-600)"
          value={data.plants}
          label={C.totalPlants}
          href="/library"
        />
        <GlanceTile
          icon={Flower2}
          badgeBg="var(--purple-100)"
          iconColor="var(--purple-500)"
          value={data.blooming}
          label={C.blooming}
          href="/library?filter=blooming"
        />
        <GlanceTile
          icon={Scissors}
          badgeBg="var(--sage-100)"
          iconColor="var(--sage-600)"
          value={data.propagations}
          label={C.propagations}
          href="/propagation"
        />
        <GlanceTile
          icon={FlaskConical}
          badgeBg="var(--purple-100)"
          iconColor="var(--purple-500)"
          value={data.crosses}
          label={C.crosses}
          href="/breeding"
        />
        <GlanceTile
          icon={Sparkles}
          badgeBg="var(--sage-100)"
          iconColor="var(--sage-600)"
          value={data.sports}
          label={C.sports}
          href="/sports"
        />
      </div>
    </section>
  );
}
