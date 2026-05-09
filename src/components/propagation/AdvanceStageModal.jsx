/**
 * AdvanceStageModal — confirms advancing a propagation to the next stage with
 * an optional transition note. For the "Established" terminal stage we route
 * to the AddPlant page instead and never open this modal.
 */

import { useState } from 'react';
import { Loader2, ChevronRight } from 'lucide-react';
import { STAGE_BY_KEY } from '../../utils/propagationStages';

export default function AdvanceStageModal({
  open,
  propagation,
  nextStageKey,
  onConfirm,
  onCancel,
  isPending,
}) {
  const [note, setNote] = useState('');
  if (!open) return null;
  const nextStage = STAGE_BY_KEY[nextStageKey];

  const handleConfirm = async () => {
    await onConfirm({ note: note.trim() || null });
    setNote('');
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{ background: 'rgba(0, 0, 0, 0.5)' }}
      onClick={onCancel}
    >
      <div className="card p-7 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
        <h2 className="heading heading-lg mb-1">Advance to {nextStage?.label}?</h2>
        <p className="text-muted mb-5">
          {nextStage?.watchFor
            ? `Watch for ${nextStage.watchFor}.`
            : 'This will record the transition with today’s timestamp.'}
        </p>

        <label className="text-label text-muted block mb-2">
          Anything to log about this transition? (optional)
        </label>
        <textarea
          className="input w-full mb-5"
          style={{ minHeight: 80, resize: 'vertical' }}
          placeholder="First roots visible at the cut, ~5mm long..."
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />

        <div className="flex justify-end gap-3">
          <button className="btn btn-secondary" onClick={onCancel} disabled={isPending}>
            Cancel
          </button>
          <button
            className="btn btn-primary flex items-center gap-1.5"
            onClick={handleConfirm}
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Advancing...
              </>
            ) : (
              <>
                Advance
                <ChevronRight size={16} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
