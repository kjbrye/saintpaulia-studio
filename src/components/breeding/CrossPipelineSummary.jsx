/**
 * CrossPipelineSummary — six stat tiles, one per stage, showing the count of
 * active crosses at that stage. Mirrors PipelineSummary on the propagation page.
 */

import { BREEDING_STAGES, ACTIVE_STAGE_KEYS } from '../../utils/breedingStages';
import { isActive } from '../../utils/breedingStages';

export default function CrossPipelineSummary({ crosses = [] }) {
  const activeCrosses = crosses.filter(isActive);
  const counts = ACTIVE_STAGE_KEYS.reduce((acc, key) => {
    acc[key] = activeCrosses.filter((c) => c.stage === key).length;
    return acc;
  }, {});
  const bloomingCount = crosses.filter(
    (c) => c.status === 'complete' || c.stage === 'blooming',
  ).length;

  return (
    <div className="card p-4 mb-6">
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-3">
        {BREEDING_STAGES.map((stage) => {
          const Icon = stage.icon;
          const count = stage.key === 'blooming' ? bloomingCount : counts[stage.key] || 0;
          const dim = count === 0;
          return (
            <div
              key={stage.key}
              className="flex flex-col items-center text-center px-1 py-2 sm:p-3 rounded-lg"
              style={{
                background: dim ? 'transparent' : 'var(--sage-50, var(--cream-100))',
              }}
            >
              <Icon size={18} style={{ color: dim ? 'var(--sage-300)' : 'var(--sage-600)' }} />
              <span
                className="mt-1"
                style={{
                  fontSize: 10,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: dim ? 'var(--sage-300)' : 'var(--text-muted)',
                  fontWeight: 600,
                }}
              >
                {stage.label}
              </span>
              <span
                className="heading"
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: 28,
                  lineHeight: 1.1,
                  marginTop: 2,
                  color: dim ? 'var(--sage-300)' : 'var(--sage-800)',
                }}
              >
                {count}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
