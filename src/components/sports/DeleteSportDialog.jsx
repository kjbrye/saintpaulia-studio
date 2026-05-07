/**
 * DeleteSportDialog - Confirmation modal for deleting a sport.
 */

export default function DeleteSportDialog({ onConfirm, onCancel, isPending }) {
  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{ background: 'rgba(0, 0, 0, 0.5)' }}
      onClick={(e) => e.target === e.currentTarget && onCancel()}
    >
      <div className="card p-8 max-w-md w-full">
        <h2 className="heading heading-lg mb-2">Delete sport?</h2>
        <p className="text-muted mb-6">
          This will remove the sport and all its observations. This cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <button className="btn btn-secondary" onClick={onCancel}>
            Cancel
          </button>
          <button className="btn btn-danger" onClick={onConfirm} disabled={isPending}>
            {isPending ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}
