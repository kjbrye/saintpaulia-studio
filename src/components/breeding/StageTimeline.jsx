/**
 * StageTimeline - Visual timeline of breeding stages with expandable stage cards.
 * Shows completed stages with dates/notes, current stage highlighted, future stages dimmed.
 */

import { useState } from 'react';
import { format } from 'date-fns';
import { ChevronDown, ChevronRight, Check } from 'lucide-react';
import clsx from 'clsx';
import { BREEDING_STAGES } from './CrossCard';

export default function StageTimeline({ cross, stageLogs = [], onAdvance, isPending }) {
  const [expandedStage, setExpandedStage] = useState(null);

  const currentIndex = BREEDING_STAGES.findIndex((s) => s.key === cross.stage);
  const isFailed = cross.status === 'failed' || cross.stage === 'failed';
  const isComplete = cross.status === 'complete' || cross.stage === 'blooming';

  // Build a map of stage → log entries
  const logsByStage = new Map();
  for (const log of stageLogs) {
    if (!logsByStage.has(log.stage)) logsByStage.set(log.stage, []);
    logsByStage.get(log.stage).push(log);
  }

  const toggleExpand = (stageKey) => {
    setExpandedStage((prev) => (prev === stageKey ? null : stageKey));
  };

  return (
    <div className="space-y-0">
      {BREEDING_STAGES.map((stage, i) => {
        const Icon = stage.icon;
        const isCompleted = !isFailed && i < currentIndex;
        const isCurrent = i === currentIndex;
        const isFuture = i > currentIndex;
        const logs = logsByStage.get(stage.key) || [];
        const latestLog = logs[logs.length - 1];
        const isExpanded = expandedStage === stage.key;
        const hasContent = logs.length > 0;
        const isLast = i === BREEDING_STAGES.length - 1;

        // Next advanceable stage
        const isNextStage = !isFailed && !isComplete && i === currentIndex + 1;

        return (
          <div key={stage.key} className="relative">
            {/* Vertical connector line */}
            {!isLast && (
              <div
                className="absolute left-4 top-10 w-0.5"
                style={{
                  height: isExpanded ? 'calc(100% - 24px)' : 'calc(100% - 16px)',
                  background: isCompleted ? 'var(--color-success)' : 'var(--sage-200)',
                }}
              />
            )}

            {/* Stage row */}
            <div
              className={clsx(
                'flex items-start gap-3 p-2 rounded-lg transition-colors cursor-pointer',
                isCurrent && !isFailed && 'bg-[var(--purple-50)]',
                isFailed && isCurrent && 'bg-red-50',
                hasContent && 'hover:bg-[var(--sage-50)]',
              )}
              onClick={() => hasContent && toggleExpand(stage.key)}
            >
              {/* Stage icon circle */}
              <div
                className={clsx(
                  'flex items-center justify-center w-8 h-8 rounded-full flex-shrink-0 transition-all',
                  isFailed && isCurrent && 'bg-[var(--color-error)]',
                  isCompleted && 'bg-[var(--color-success)]',
                  isCurrent && !isFailed && 'bg-[var(--purple-400)]',
                  isFuture && 'bg-[var(--sage-200)]',
                )}
              >
                {isCompleted ? (
                  <Check size={14} className="text-white" />
                ) : (
                  <Icon
                    size={14}
                    className={clsx(
                      isCompleted || isCurrent ? 'text-white' : 'text-[var(--text-muted)]',
                    )}
                  />
                )}
              </div>

              {/* Stage info */}
              <div className="flex-1 min-w-0 pt-0.5">
                <div className="flex items-center gap-2">
                  <span
                    className={clsx(
                      'text-body font-semibold',
                      isFuture && 'text-[var(--text-muted)]',
                      isCurrent && !isFailed && 'text-[var(--purple-500)]',
                      isFailed && isCurrent && 'text-[var(--color-error)]',
                    )}
                    style={isCompleted ? { color: 'var(--sage-800)' } : undefined}
                  >
                    {stage.label}
                    {isFailed && isCurrent && ' (Failed)'}
                  </span>
                  {latestLog?.entered_at && (
                    <span className="text-small text-muted">
                      {format(new Date(latestLog.entered_at), 'MMM d, yyyy')}
                    </span>
                  )}
                  {hasContent &&
                    (isExpanded ? (
                      <ChevronDown size={14} style={{ color: 'var(--sage-500)' }} />
                    ) : (
                      <ChevronRight size={14} style={{ color: 'var(--sage-500)' }} />
                    ))}
                </div>
                {latestLog?.notes && !isExpanded && (
                  <p className="text-small text-muted truncate mt-0.5">{latestLog.notes}</p>
                )}
              </div>

              {/* Advance button for next stage */}
              {isNextStage && (
                <button
                  className="btn btn-primary btn-small flex-shrink-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAdvance(stage);
                  }}
                  disabled={isPending}
                >
                  Advance
                </button>
              )}
            </div>

            {/* Expanded stage details */}
            {isExpanded && logs.length > 0 && (
              <div className="ml-11 mt-1 mb-2 space-y-2">
                {logs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3 rounded-lg"
                    style={{ background: 'var(--sage-50)' }}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-small text-muted">
                        {format(new Date(log.entered_at), 'MMM d, yyyy h:mm a')}
                      </span>
                    </div>
                    {log.notes && (
                      <p className="text-body" style={{ color: 'var(--sage-800)' }}>
                        {log.notes}
                      </p>
                    )}
                    {log.data && <StageDataDisplay data={log.data} stage={log.stage} />}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function StageDataDisplay({ data, stage }) {
  if (!data || Object.keys(data).length === 0) return null;

  const items = [];
  if (data.seed_count != null) items.push(['Seeds', data.seed_count]);
  if (data.germination_count != null) items.push(['Germinated', data.germination_count]);
  if (data.pod_size) items.push(['Pod Size', data.pod_size]);
  if (data.days_to_germinate != null) items.push(['Days to Germinate', data.days_to_germinate]);

  // Show any other fields generically
  for (const [key, value] of Object.entries(data)) {
    if (['seed_count', 'germination_count', 'pod_size', 'days_to_germinate'].includes(key))
      continue;
    items.push([key.replace(/_/g, ' '), String(value)]);
  }

  if (items.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-3 mt-2">
      {items.map(([label, value]) => (
        <div key={label} className="text-small">
          <span className="text-muted">{label}: </span>
          <span className="font-semibold" style={{ color: 'var(--sage-800)' }}>
            {value}
          </span>
        </div>
      ))}
    </div>
  );
}
