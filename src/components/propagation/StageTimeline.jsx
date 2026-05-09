/**
 * StageTimeline — vertical timeline of the five propagation stages with
 * educational content on the active stage and quiet "skip / mark failed"
 * controls in the footer.
 */

import { useState } from 'react';
import { format } from 'date-fns';
import { ChevronRight, Plus, Minus, X, MoreHorizontal } from 'lucide-react';
import {
  PROPAGATION_STAGES,
  getStageIndex,
  getStageEntry,
  getStageHistory,
  daysAtCurrentStage,
  daysBetween,
  isFailed,
  isEstablished,
} from '../../utils/propagationStages';

export default function StageTimeline({
  propagation,
  onAdvance,
  onMarkFailed,
  onSkipTo,
  onPlantletCount,
  isPending,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const failed = isFailed(propagation);
  const established = isEstablished(propagation);
  const currentIdx = failed ? -1 : getStageIndex(propagation.stage);
  const totalSteps = PROPAGATION_STAGES.length;
  const stepLabel = failed ? 'Failed' : `Stage ${currentIdx + 1} of ${totalSteps}`;

  return (
    <div className="card p-6 mb-6 relative">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="heading heading-md">Progress</h2>
        <span
          style={{
            fontFamily: 'var(--font-heading)',
            fontStyle: 'italic',
            fontSize: 15,
            color: failed ? 'var(--color-error)' : 'var(--purple-500)',
          }}
        >
          {stepLabel}
        </span>
      </div>

      <div className="relative">
        {/* Vertical track behind dots */}
        <div
          aria-hidden
          className="absolute"
          style={{
            left: 15,
            top: 12,
            bottom: 12,
            width: 2,
            background: 'var(--sage-200)',
          }}
        />
        {!failed && currentIdx > 0 && (
          <div
            aria-hidden
            className="absolute"
            style={{
              left: 15,
              top: 12,
              height: `calc(${(currentIdx / (totalSteps - 1)) * 100}% - 24px)`,
              width: 2,
              background: 'var(--sage-500)',
            }}
          />
        )}

        <ol className="space-y-5 relative">
          {PROPAGATION_STAGES.map((stage, i) => {
            const Icon = stage.icon;
            const entry = getStageEntry(propagation, stage.key);
            const isDone = !failed && i < currentIdx;
            const isCurrent = !failed && i === currentIdx;
            const isFuture = failed || i > currentIdx;

            let dotBg, dotColor, dotShadow, dotBorder;
            if (isDone) {
              dotBg = 'var(--sage-500)';
              dotColor = '#fff';
              dotShadow = 'none';
              dotBorder = 'transparent';
            } else if (isCurrent) {
              dotBg = 'linear-gradient(135deg, var(--purple-400), var(--purple-500))';
              dotColor = '#fff';
              dotShadow = '0 0 0 4px rgba(119, 99, 145, 0.18)';
              dotBorder = 'transparent';
            } else {
              dotBg = 'var(--sage-100)';
              dotColor = 'var(--sage-400)';
              dotShadow = 'none';
              dotBorder = '1px solid var(--sage-200)';
            }

            return (
              <li key={stage.key} className="grid grid-cols-[32px_1fr] gap-3 items-start relative">
                <div
                  className="flex items-center justify-center rounded-full"
                  style={{
                    width: 32,
                    height: 32,
                    background: dotBg,
                    boxShadow: dotShadow,
                    border: dotBorder,
                    zIndex: 1,
                  }}
                >
                  <Icon size={15} style={{ color: dotColor }} />
                </div>
                <div className="min-w-0">
                  {isDone && (
                    <DoneStage stage={stage} entry={entry} nextEntry={getStageEntry(propagation, PROPAGATION_STAGES[i + 1]?.key)} />
                  )}
                  {isCurrent && (
                    <CurrentStage
                      stage={stage}
                      propagation={propagation}
                      isLastBeforeEstablished={stage.key === 'potted'}
                      isPending={isPending}
                      onAdvance={onAdvance}
                      onPlantletCount={onPlantletCount}
                      transitionNote={
                        getStageHistory(propagation)
                          .filter((h) => h.stage === stage.key)
                          .pop()?.note || null
                      }
                    />
                  )}
                  {isFuture && <FutureStage stage={stage} />}
                </div>
              </li>
            );
          })}
        </ol>
      </div>

      {/* Quiet footer actions */}
      {!established && !failed && (
        <div className="mt-5 pt-4 flex justify-end relative" style={{ borderTop: '1px solid var(--sage-200)' }}>
          <button
            type="button"
            className="text-small flex items-center gap-1"
            style={{ color: 'var(--text-muted)' }}
            onClick={() => setMenuOpen((v) => !v)}
          >
            <MoreHorizontal size={14} />
            Skip ahead or mark failed
          </button>
          {menuOpen && (
            <div
              className="absolute right-0 bottom-full mb-2 card p-2 z-10"
              style={{ minWidth: 220 }}
            >
              {PROPAGATION_STAGES.map((s, i) => {
                if (i <= currentIdx + 1) return null;
                if (s.key === 'complete') return null;
                return (
                  <button
                    key={s.key}
                    className="block w-full text-left text-small px-3 py-2 rounded hover:bg-[var(--sage-50)]"
                    onClick={() => {
                      setMenuOpen(false);
                      onSkipTo(s.key);
                    }}
                  >
                    Skip to {s.label}
                  </button>
                );
              })}
              <div className="my-1" style={{ borderTop: '1px solid var(--sage-200)' }} />
              <button
                className="flex items-center gap-2 w-full text-left text-small px-3 py-2 rounded hover:bg-[var(--sage-50)]"
                style={{ color: 'var(--color-error)' }}
                onClick={() => {
                  setMenuOpen(false);
                  onMarkFailed();
                }}
              >
                <X size={13} />
                Mark Failed
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function DoneStage({ stage, entry, nextEntry }) {
  const enteredAt = entry?.entered_at;
  const days = enteredAt && nextEntry?.entered_at
    ? daysBetween(enteredAt, nextEntry.entered_at)
    : null;
  return (
    <div className="pt-1">
      <p
        style={{
          fontFamily: 'var(--font-heading)',
          fontSize: 18,
          color: 'var(--sage-800)',
        }}
      >
        {stage.label}
      </p>
      {enteredAt && (
        <p
          style={{
            fontFamily: 'var(--font-heading)',
            fontStyle: 'italic',
            fontSize: 14,
            color: 'var(--sage-500)',
          }}
        >
          entered {format(new Date(enteredAt), 'MMM d')}
          {days != null && ` · ${days} ${days === 1 ? 'day' : 'days'} at stage`}
        </p>
      )}
      {entry?.note && (
        <p
          className="mt-1.5 p-2 rounded"
          style={{
            background: 'var(--sage-50, var(--cream-100))',
            fontSize: 14,
            color: 'var(--sage-700)',
            lineHeight: 1.5,
          }}
        >
          {entry.note}
        </p>
      )}
    </div>
  );
}

function FutureStage({ stage }) {
  return (
    <div className="pt-1">
      <p
        style={{
          fontFamily: 'var(--font-heading)',
          fontSize: 18,
          color: 'var(--sage-400)',
        }}
      >
        {stage.label}
      </p>
      {stage.typicalDuration && (
        <p
          style={{
            fontFamily: 'var(--font-heading)',
            fontStyle: 'italic',
            fontSize: 14,
            color: 'var(--sage-400)',
          }}
        >
          typical {stage.typicalDuration}
          {stage.watchFor && ` · ${stage.watchFor}`}
        </p>
      )}
    </div>
  );
}

function CurrentStage({ stage, propagation, isLastBeforeEstablished, isPending, onAdvance, onPlantletCount, transitionNote }) {
  const days = daysAtCurrentStage(propagation);
  return (
    <div
      className="rounded-xl p-4 relative"
      style={{ background: 'var(--cream-100)', border: '1px solid var(--sage-200)' }}
    >
      <span
        className="absolute top-3 right-3 px-2 py-0.5 rounded-full"
        style={{
          background: 'var(--purple-400)',
          color: '#fff',
          fontSize: 10,
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
        }}
      >
        Current
      </span>

      <p
        style={{
          fontFamily: 'var(--font-heading)',
          fontSize: 22,
          color: 'var(--sage-800)',
        }}
      >
        {stage.label}
      </p>
      <p className="text-small text-muted">
        {days} {days === 1 ? 'day' : 'days'} at this stage
      </p>

      {transitionNote && (
        <p
          className="mt-3 p-2 rounded"
          style={{
            background: 'rgba(255, 255, 255, 0.55)',
            fontSize: 14,
            color: 'var(--sage-700)',
            lineHeight: 1.5,
          }}
        >
          <span style={{ fontWeight: 600 }}>Note: </span>
          {transitionNote}
        </p>
      )}

      {(stage.typicalDuration || stage.description) && (
        <div
          className="mt-3 p-3 rounded-lg"
          style={{ background: 'rgba(255, 255, 255, 0.55)' }}
        >
          {(stage.typicalDuration || stage.watchFor) && (
            <p className="text-small font-semibold" style={{ color: 'var(--sage-700)' }}>
              {stage.typicalDuration && <>Typical: {stage.typicalDuration}</>}
              {stage.typicalDuration && stage.watchFor && ' · '}
              {stage.watchFor && <>Watch for {stage.watchFor}</>}
            </p>
          )}
          {stage.description && (
            <p
              className="mt-1.5"
              style={{
                fontFamily: 'var(--font-heading)',
                fontStyle: 'italic',
                fontSize: 15,
                lineHeight: 1.55,
                color: 'var(--sage-700)',
              }}
            >
              {stage.description}
            </p>
          )}
        </div>
      )}

      {/* Plantlet count editor on the plantlets stage */}
      {stage.key === 'plantlets' && (
        <div className="mt-3 flex items-center gap-2">
          <span className="text-small" style={{ color: 'var(--sage-700)', fontWeight: 600 }}>
            Plantlets:
          </span>
          <button
            type="button"
            className="icon-container"
            style={{ width: 28, height: 28 }}
            onClick={() => onPlantletCount(-1)}
            disabled={isPending || (propagation.plantlet_count || 0) <= 0}
          >
            <Minus size={12} style={{ color: 'var(--sage-600)' }} />
          </button>
          <span
            className="font-bold w-7 text-center"
            style={{ fontFamily: 'var(--font-heading)', fontSize: 18, color: 'var(--sage-800)' }}
          >
            {propagation.plantlet_count || 0}
          </span>
          <button
            type="button"
            className="icon-container"
            style={{ width: 28, height: 28 }}
            onClick={() => onPlantletCount(1)}
            disabled={isPending}
          >
            <Plus size={12} style={{ color: 'var(--sage-600)' }} />
          </button>
        </div>
      )}

      <button
        type="button"
        className="btn btn-primary mt-4 flex items-center gap-1.5"
        onClick={onAdvance}
        disabled={isPending}
      >
        Advance to {isLastBeforeEstablished ? 'Established' : nextLabel(stage.key)}
        <ChevronRight size={16} />
      </button>
    </div>
  );
}

function nextLabel(key) {
  const i = getStageIndex(key);
  return PROPAGATION_STAGES[i + 1]?.label || '';
}
