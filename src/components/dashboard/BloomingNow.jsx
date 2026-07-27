/**
 * BloomingNow
 *
 * Up to four cards for currently-blooming plants — photo, cultivar name,
 * variety class, and a status dot + label from the existing care registers
 * (Healthy = green, Needs water = copper). Data comes from the plants the
 * Dashboard already loaded; nothing is re-queried.
 */

import { Link } from 'react-router-dom';
import { Flower2 } from 'lucide-react';
import { useSettings } from '../../hooks/useSettings.jsx';
import { getCareStatus, CARE_THRESHOLDS } from '../../utils/careStatus';
import { getVarietyClassEyebrow } from '../../constants/plantOptions';
import { DASHBOARD_COPY } from '../../constants/dashboardCopy';

const C = DASHBOARD_COPY.bloomingNow;

function BloomCard({ plant, needsWater }) {
  const name = plant.nickname || plant.cultivar_name || 'Unnamed plant';
  const eyebrow = getVarietyClassEyebrow(plant.size_class);

  return (
    <Link to={`/plants/${plant.id}`} className="ds-card bloom-card">
      <div className="bloom-card-photo">
        {plant.photo_url ? (
          <img src={plant.photo_url} alt={name} />
        ) : (
          <Flower2 size={40} style={{ color: 'var(--sage-400)' }} />
        )}
      </div>
      <div style={{ padding: '12px 14px' }}>
        <p
          style={{
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: '0.12em',
            color: 'var(--text-quiet)',
            minHeight: 14,
          }}
        >
          {eyebrow || ' '}
        </p>
        <p
          className="truncate"
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 19,
            fontWeight: 600,
            color: 'var(--text-strong)',
            lineHeight: 1.15,
          }}
        >
          {name}
        </p>
        <div className="flex items-center gap-2" style={{ marginTop: 8 }}>
          <span className={`status-dot ${needsWater ? 'status-dot-water' : 'status-dot-healthy'}`} />
          <span
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: needsWater ? 'var(--copper-signal)' : 'var(--text-body)',
            }}
          >
            {needsWater ? C.statusNeedsWater : C.statusHealthy}
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function BloomingNow({ plants }) {
  const { careThresholds } = useSettings();
  const thresholds = careThresholds ?? CARE_THRESHOLDS;

  return (
    <section style={{ marginBottom: 24 }}>
      <div className="flex items-center justify-between" style={{ marginBottom: 12 }}>
        <h2 className="ds-section-title">{C.title}</h2>
        <Link to="/library?filter=blooming" className="ds-viewall">
          {C.viewAll}
        </Link>
      </div>

      {plants.length === 0 ? (
        <div className="ds-card" style={{ padding: 20 }}>
          <p style={{ fontSize: 14, color: 'var(--text-quiet)' }}>{C.empty}</p>
        </div>
      ) : (
        <div className="blooming-grid">
          {plants.map((plant) => {
            const watering = getCareStatus(
              plant.last_watered,
              thresholds.watering ?? CARE_THRESHOLDS.watering,
            );
            return (
              <BloomCard
                key={plant.id}
                plant={plant}
                needsWater={watering.status === 'overdue'}
              />
            );
          })}
        </div>
      )}
    </section>
  );
}
