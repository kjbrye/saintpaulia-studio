/**
 * UndoImportButton
 *
 * Copper-accented button that triggers a rollback after a confirmation
 * dialog. Only meaningful right after an import; the parent decides when
 * to show / hide it.
 */

import { useState } from 'react';
import { Undo2, Loader2 } from 'lucide-react';

export default function UndoImportButton({ batchId, plantCount, onRollback, isPending }) {
  const [confirming, setConfirming] = useState(false);

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        disabled={isPending}
        className="btn btn-small flex items-center gap-2"
        style={{
          background: 'var(--gradient-copper-card)',
          color: 'var(--copper-700)',
          border: '1px solid var(--copper-400)',
          fontWeight: 700,
        }}
      >
        <Undo2 size={14} />
        Undo this import
      </button>
    );
  }

  return (
    <div
      className="card p-4"
      style={{ borderColor: 'var(--copper-500)', borderWidth: 1, borderStyle: 'solid' }}
    >
      <p className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
        Delete all {plantCount} {plantCount === 1 ? 'plant' : 'plants'} from this import?
      </p>
      <p className="text-small mb-3" style={{ color: 'var(--text-muted)' }}>
        This permanently removes them from your collection. This cannot be undone.
      </p>
      <div className="flex gap-2">
        <button
          type="button"
          className="btn btn-secondary btn-small"
          onClick={() => setConfirming(false)}
          disabled={isPending}
        >
          Keep them
        </button>
        <button
          type="button"
          className="btn btn-danger btn-small flex items-center gap-2"
          onClick={() => onRollback(batchId)}
          disabled={isPending}
        >
          {isPending ? <Loader2 size={14} className="animate-spin" /> : <Undo2 size={14} />}
          {isPending ? 'Removing…' : 'Yes, delete them'}
        </button>
      </div>
    </div>
  );
}
