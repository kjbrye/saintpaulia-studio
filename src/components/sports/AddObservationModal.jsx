/**
 * AddObservationModal - Mobile-friendly modal for logging a single observation.
 *
 * Captures observed_date, trait_held (yes/no), and optional notes.
 */

import { useState } from 'react';
import { Loader2, Check, X } from 'lucide-react';
import FormField from '../ui/FormField';

export default function AddObservationModal({ onConfirm, onCancel, isPending }) {
  const [observedDate, setObservedDate] = useState(new Date().toISOString().split('T')[0]);
  const [traitHeld, setTraitHeld] = useState(true);
  const [notes, setNotes] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm({
      observed_date: observedDate,
      trait_held: traitHeld,
      notes: notes.trim() || null,
    });
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{ background: 'rgba(0, 0, 0, 0.5)' }}
      onClick={(e) => e.target === e.currentTarget && onCancel()}
    >
      <div className="card p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
        <h2 className="heading heading-md mb-1">Log an observation</h2>
        <p className="text-small text-muted mb-4">
          Did the sport's trait hold this bloom cycle?
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label="Observed date" required>
            <input
              type="date"
              className="input w-full"
              value={observedDate}
              onChange={(e) => setObservedDate(e.target.value)}
              required
            />
          </FormField>

          <FormField label="Trait status" required>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setTraitHeld(true)}
                className={`btn ${traitHeld ? 'btn-primary' : 'btn-secondary'}`}
                style={{ minHeight: 48 }}
              >
                <Check size={18} /> Held
              </button>
              <button
                type="button"
                onClick={() => setTraitHeld(false)}
                className={`btn ${!traitHeld ? 'btn-primary' : 'btn-secondary'}`}
                style={{ minHeight: 48 }}
              >
                <X size={18} /> Reverted
              </button>
            </div>
          </FormField>

          <FormField label="Notes">
            <textarea
              className="input w-full"
              style={{ minHeight: 80, resize: 'vertical' }}
              placeholder="What did you see?"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </FormField>

          <div
            className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-3"
            style={{ borderTop: '1px solid var(--sage-200)' }}
          >
            <button type="button" className="btn btn-secondary" onClick={onCancel}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 size={18} className="animate-spin" /> Saving…
                </>
              ) : (
                'Save observation'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
