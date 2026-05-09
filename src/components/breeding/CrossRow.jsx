/**
 * CrossRow — a single cross card on the breeding list page.
 *
 * Card body navigates to the cross detail page; the Advance button stops
 * propagation and opens the AdvanceCrossStageModal in the parent.
 */

import { Link, useNavigate } from 'react-router-dom';
import { ChevronRight, Calendar, RotateCcw } from 'lucide-react';
import { format } from 'date-fns';
import InlineCrossStageProgression from './InlineCrossStageProgression';
import {
  STAGE_BY_KEY,
  daysAtCurrentStage,
  isFailed,
  isComplete,
  getPodParentName,
  getPollenParentName,
} from '../../utils/breedingStages';

export default function CrossRow({ cross, stageLogs = [], onAdvance, onRestore }) {
  const navigate = useNavigate();
  const stage = STAGE_BY_KEY[cross.stage];
  const StageIcon = stage?.icon;
  const failed = isFailed(cross);
  const complete = isComplete(cross);
  const days = daysAtCurrentStage(cross, stageLogs);
  const podName = getPodParentName(cross);
  const pollenName = getPollenParentName(cross);

  const handleCardClick = () => {
    navigate(`/breeding/${cross.id}`);
  };

  return (
    <div
      className="card p-5 cursor-pointer transition-shadow hover:shadow-md"
      onClick={handleCardClick}
    >
      <div className="grid grid-cols-[1fr_auto] gap-4 items-center">
        <div className="min-w-0 flex flex-col gap-3">
          {/* Goal eyebrow */}
          {cross.goals && (
            <p
              className="truncate"
              style={{
                fontSize: 11,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: 'var(--sage-500)',
                fontWeight: 600,
              }}
            >
              GOAL · {cross.goals}
            </p>
          )}

          {/* Cross title */}
          <div className="flex items-baseline flex-wrap gap-x-2">
            {cross.pod_parent_id ? (
              <Link
                to={`/plants/${cross.pod_parent_id}`}
                onClick={(e) => e.stopPropagation()}
                className="heading hover:underline"
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: 19,
                  color: 'var(--sage-800)',
                }}
              >
                {podName}
              </Link>
            ) : (
              <span
                className="heading"
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: 19,
                  color: 'var(--sage-800)',
                }}
              >
                {podName}
              </span>
            )}
            <span
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 19,
                color: 'var(--purple-400)',
              }}
            >
              ×
            </span>
            {cross.pollen_parent_id ? (
              <Link
                to={`/plants/${cross.pollen_parent_id}`}
                onClick={(e) => e.stopPropagation()}
                className="heading hover:underline"
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: 19,
                  color: 'var(--sage-800)',
                }}
              >
                {pollenName}
              </Link>
            ) : (
              <span
                className="heading"
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: 19,
                  color: 'var(--sage-800)',
                }}
              >
                {pollenName}
              </span>
            )}
          </div>

          {/* Inline stage progression */}
          <InlineCrossStageProgression currentStage={cross.stage} failed={failed} />

          {/* Meta row */}
          <div
            className="flex flex-wrap items-center gap-x-5 gap-y-1 text-small"
            style={{ color: 'var(--text-muted)' }}
          >
            <span className="flex items-center gap-1.5">
              {StageIcon && <StageIcon size={13} />}
              {stage?.label || cross.stage}
              <span style={{ color: 'var(--sage-400)' }}>
                · {days} {days === 1 ? 'day' : 'days'} at stage
              </span>
            </span>
            {cross.cross_date && (
              <span className="flex items-center gap-1.5">
                <Calendar size={13} />
                crossed {format(new Date(cross.cross_date), 'MMM d, yyyy')}
              </span>
            )}
          </div>
        </div>

        {/* Advance / Restore button */}
        {!complete && !failed && (
          <button
            type="button"
            className="btn btn-primary flex items-center gap-1.5"
            onClick={(e) => {
              e.stopPropagation();
              onAdvance(cross);
            }}
          >
            Advance
            <ChevronRight size={16} />
          </button>
        )}
        {failed && onRestore && (
          <button
            type="button"
            className="btn btn-secondary flex items-center gap-1.5"
            onClick={(e) => {
              e.stopPropagation();
              onRestore(cross);
            }}
          >
            <RotateCcw size={14} />
            Restore
          </button>
        )}
      </div>
    </div>
  );
}
