/**
 * PropagationRow — a single propagation card on the list page.
 *
 * Card body navigates to the detail page; the Advance button stops propagation
 * and opens the AdvanceStageModal in the parent.
 */

import { Link, useNavigate } from 'react-router-dom';
import { ChevronRight, Droplet, FlaskConical, RotateCcw } from 'lucide-react';
import InlineStageProgression from './InlineStageProgression';
import {
  STAGE_BY_KEY,
  METHOD_LABELS,
  daysAtCurrentStage,
  isFailed,
  isEstablished,
  getParentName,
  getPropagationDisplayName,
} from '../../utils/propagationStages';

const METHOD_ICON = {
  water: Droplet,
  soil: FlaskConical,
  sphagnum: FlaskConical,
  perlite: FlaskConical,
  other: FlaskConical,
};

export default function PropagationRow({ propagation, onAdvance, onRestore, allPropagations }) {
  const navigate = useNavigate();
  const stage = STAGE_BY_KEY[propagation.stage];
  const StageIcon = stage?.icon;
  const failed = isFailed(propagation);
  const established = isEstablished(propagation);
  const days = daysAtCurrentStage(propagation);
  const MethodIcon = METHOD_ICON[propagation.method] || FlaskConical;

  const handleCardClick = () => {
    navigate(`/propagation/${propagation.id}`);
  };

  return (
    <div
      className="card p-5 cursor-pointer transition-shadow hover:shadow-md"
      onClick={handleCardClick}
    >
      <div className="grid grid-cols-[1fr_auto] gap-4 items-center">
        <div className="min-w-0 flex flex-col gap-3">
          {/* Title */}
          <div className="flex items-baseline flex-wrap gap-x-2">
            <span
              className="heading"
              style={{ fontFamily: 'var(--font-heading)', fontSize: 19, color: 'var(--sage-800)' }}
            >
              {getPropagationDisplayName(propagation, allPropagations)}
            </span>
            <span className="text-small" style={{ color: 'var(--sage-500)' }}>
              from{' '}
              {propagation.parent_plant_id ? (
                <Link
                  to={`/plants/${propagation.parent_plant_id}`}
                  onClick={(e) => e.stopPropagation()}
                  className="hover:underline"
                  style={{ color: 'var(--purple-500)' }}
                >
                  {getParentName(propagation)}
                </Link>
              ) : (
                getParentName(propagation)
              )}
            </span>
          </div>

          {/* Inline stage progression */}
          <InlineStageProgression currentStage={propagation.stage} failed={failed} />

          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-small" style={{ color: 'var(--text-muted)' }}>
            <span className="flex items-center gap-1.5">
              {StageIcon && <StageIcon size={13} />}
              {stage?.label || propagation.stage}
              <span style={{ color: 'var(--sage-400)' }}>
                · {days} {days === 1 ? 'day' : 'days'} at stage
              </span>
            </span>
            {propagation.plantlet_count > 0 &&
              ['plantlets', 'potted', 'complete'].includes(propagation.stage) && (
                <span>
                  {propagation.plantlet_count}{' '}
                  {propagation.plantlet_count === 1 ? 'plantlet' : 'plantlets'}
                </span>
              )}
            {propagation.method && (
              <span className="flex items-center gap-1.5">
                <MethodIcon size={13} />
                {METHOD_LABELS[propagation.method]}
              </span>
            )}
          </div>
        </div>

        {/* Advance button */}
        {!established && !failed && (
          <button
            type="button"
            className="btn btn-primary flex items-center gap-1.5"
            onClick={(e) => {
              e.stopPropagation();
              onAdvance(propagation);
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
              onRestore(propagation);
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
