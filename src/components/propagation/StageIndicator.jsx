/**
 * StageIndicator - Visual progress indicator for multi-stage processes
 *
 * Used by both propagation and breeding trackers to show stage progression.
 */

import clsx from 'clsx';

export default function StageIndicator({ currentStage, stages, failed }) {
  const currentIndex = stages.findIndex(s => s.key === currentStage);

  return (
    <div className="flex items-center gap-1">
      {stages.map((stage, i) => {
        const Icon = stage.icon;
        const isComplete = !failed && i < currentIndex;
        const isCurrent = i === currentIndex;
        const isFailed = failed && isCurrent;

        return (
          <div key={stage.key} className="flex items-center">
            <div
              className={clsx(
                'flex items-center justify-center w-8 h-8 rounded-full transition-all duration-150',
                isFailed && 'bg-[var(--color-error)]',
                isComplete && 'bg-[var(--color-success)]',
                isCurrent && !isFailed && 'bg-[var(--purple-400)]',
                !isComplete && !isCurrent && 'bg-[var(--sage-200)]'
              )}
              title={stage.label}
            >
              <Icon
                size={14}
                className={clsx(
                  isComplete || isCurrent ? 'text-white' : 'text-[var(--text-muted)]'
                )}
              />
            </div>
            {i < stages.length - 1 && (
              <div
                className={clsx(
                  'w-3 h-0.5 mx-0.5',
                  isComplete ? 'bg-[var(--color-success)]' : 'bg-[var(--sage-200)]'
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
