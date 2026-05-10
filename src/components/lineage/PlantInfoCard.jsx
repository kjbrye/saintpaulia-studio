/**
 * PlantInfoCard - Compact card with hybridizer / variety / bloom summary
 * and a link to the plant detail page. Shown below the pedigree.
 */

import { Link } from 'react-router-dom';
import { PLANT_INFO_LINK } from '../../constants/lineageCopy';

function Row({ label, value }) {
  if (!value) return null;
  return (
    <div className="flex items-baseline gap-2">
      <span
        className="text-label text-muted"
        style={{ fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', minWidth: 96 }}
      >
        {label}
      </span>
      <span className="text-small" style={{ color: 'var(--sage-800)' }}>
        {value}
      </span>
    </div>
  );
}

export default function PlantInfoCard({ plant }) {
  if (!plant) return null;
  const bloomDescription = [plant.bloom_color, plant.bloom_type].filter(Boolean).join(' · ');

  return (
    <div
      className="rounded-xl p-4 mt-4"
      style={{
        background: 'var(--cream-50, var(--sage-50))',
        border: '1px solid var(--sage-200)',
      }}
    >
      <div className="space-y-1.5">
        <Row label="Hybridizer" value={plant.hybridizer} />
        <Row label="Variety class" value={plant.size_class} />
        <Row label="Bloom" value={bloomDescription || null} />
      </div>
      <div className="mt-3">
        <Link
          to={`/plants/${plant.id}`}
          className="text-small"
          style={{ color: 'var(--purple-500)', fontWeight: 500 }}
        >
          {PLANT_INFO_LINK}
        </Link>
      </div>
    </div>
  );
}
