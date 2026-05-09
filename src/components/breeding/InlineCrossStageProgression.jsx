/**
 * InlineCrossStageProgression — six small dots connected by lines for list rows.
 */

import { BREEDING_STAGES, getStageIndex } from '../../utils/breedingStages';

export default function InlineCrossStageProgression({ currentStage, failed = false, max = 420 }) {
  const currentIdx = getStageIndex(currentStage);

  return (
    <div className="flex items-center w-full" style={{ maxWidth: max }}>
      {BREEDING_STAGES.map((stage, i) => {
        const Icon = stage.icon;
        const isDone = !failed && i < currentIdx;
        const isCurrent = !failed && i === currentIdx;
        const isFuture = failed || i > currentIdx;
        const lineActive = !failed && i < currentIdx;

        let bg, color, border, shadow;
        if (isDone) {
          bg = 'var(--sage-500)';
          color = '#fff';
          border = 'transparent';
          shadow = 'none';
        } else if (isCurrent) {
          bg = 'linear-gradient(135deg, var(--purple-400), var(--purple-500))';
          color = '#fff';
          border = 'transparent';
          shadow = '0 0 0 3px rgba(119, 99, 145, 0.18)';
        } else {
          bg = 'var(--sage-100)';
          color = isFuture ? 'var(--sage-400)' : 'var(--sage-500)';
          border = '1px solid var(--sage-200)';
          shadow = 'none';
        }

        return (
          <div
            key={stage.key}
            className="flex items-center"
            style={{ flex: i === BREEDING_STAGES.length - 1 ? '0 0 auto' : '1 1 0' }}
          >
            <div
              className="flex-shrink-0 flex items-center justify-center rounded-full"
              style={{
                width: 24,
                height: 24,
                background: bg,
                border,
                boxShadow: shadow,
              }}
              title={stage.label}
            >
              <Icon size={12} style={{ color }} />
            </div>
            {i < BREEDING_STAGES.length - 1 && (
              <div
                className="flex-1 mx-1"
                style={{
                  height: 2,
                  background: lineActive ? 'var(--sage-400)' : 'var(--sage-200)',
                  borderRadius: 2,
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
