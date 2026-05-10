/**
 * CollectionStatsHero - Purple gradient card with three big lineage stats.
 */

import { STATS_LABELS } from '../../constants/lineageCopy';

function Stat({ value, label }) {
  return (
    <div className="text-center">
      <div
        style={{
          fontFamily: 'Cormorant Garamond, serif',
          fontSize: 36,
          lineHeight: 1.1,
          color: 'var(--purple-500)',
          fontWeight: 500,
        }}
      >
        {value}
      </div>
      <div
        className="text-label text-muted"
        style={{
          fontSize: 11,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          marginTop: 6,
        }}
      >
        {label}
      </div>
    </div>
  );
}

export default function CollectionStatsHero({ stats }) {
  if (!stats) return null;
  return (
    <div className="card-purple p-6">
      <div className="grid grid-cols-3 gap-4">
        <Stat value={stats.generationsDeep} label={STATS_LABELS.generations} />
        <Stat value={stats.lineagesMapped} label={STATS_LABELS.lineages} />
        <Stat value={stats.relationships} label={STATS_LABELS.relationships} />
      </div>
    </div>
  );
}
