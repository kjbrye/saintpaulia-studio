/**
 * CareSnapshot
 *
 * Four icon-tiles with dividers between them: Need water, Need fertilizer,
 * Blooming, Up to date. Copper is reserved as a signal — only the "Need
 * water" number turns copper when it's > 0 (something to act on). All counts
 * are reused from the existing dashboard hooks; nothing is re-queried.
 */

import { Link } from 'react-router-dom';
import { Droplets, Sparkles, Flower2, CheckCircle2 } from 'lucide-react';
import { DASHBOARD_COPY } from '../../constants/dashboardCopy';

const C = DASHBOARD_COPY.careSnapshot;

function Tile({ icon: Icon, badgeBg, iconColor, value, label, signal = false }) {
  return (
    <div className="care-snapshot-tile">
      <span className="care-snapshot-badge" style={{ background: badgeBg }}>
        <Icon size={20} style={{ color: iconColor }} />
      </span>
      <span className="care-snapshot-number" data-signal={signal || undefined}>
        {value}
      </span>
      <span className="care-snapshot-label">{label}</span>
    </div>
  );
}

export default function CareSnapshot({ needWater, needFertilizer, blooming, upToDatePct }) {
  return (
    <section className="ds-card" style={{ padding: 20, marginBottom: 24 }}>
      <div
        className="flex items-center justify-between"
        style={{ marginBottom: 8, gap: 12 }}
      >
        <h2 className="ds-section-title" style={{ fontSize: 18 }}>
          {C.title}
        </h2>
        <Link to="/care" className="ds-viewall">
          {C.viewCareLog}
        </Link>
      </div>

      <div className="care-snapshot-row">
        <Tile
          icon={Droplets}
          badgeBg="rgba(199, 122, 61, 0.12)"
          iconColor="var(--copper-signal)"
          value={needWater}
          label={C.needWater}
          signal={needWater > 0}
        />
        <Tile
          icon={Sparkles}
          badgeBg="var(--sage-100)"
          iconColor="var(--sage-600)"
          value={needFertilizer}
          label={C.needFertilizer}
        />
        <Tile
          icon={Flower2}
          badgeBg="var(--purple-100)"
          iconColor="var(--purple-500)"
          value={blooming}
          label={C.blooming}
        />
        <Tile
          icon={CheckCircle2}
          badgeBg="rgba(124, 184, 124, 0.18)"
          iconColor="var(--color-success)"
          value={`${upToDatePct}%`}
          label={C.upToDate}
        />
      </div>
    </section>
  );
}
