/**
 * NotesLog - Reusable timestamped notes/journal component
 *
 * Shows a list of journal entries with an inline form to add new ones.
 * Used on PlantDetail, PropagationDetail, and CrossDetail pages.
 */

import { useState } from 'react';
import { Trash2, Plus, Loader2, BookOpen } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function NotesLog({ entries = [], onAdd, onDelete, isLoading, isPending }) {
  const [newNote, setNewNote] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    try {
      await onAdd(newNote.trim());
      setNewNote('');
      setIsAdding(false);
    } catch {
      // error handled by parent
    }
  };

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BookOpen size={18} style={{ color: 'var(--purple-400)' }} />
          <h2 className="heading heading-md">Notes</h2>
          {entries.length > 0 && (
            <span className="text-small text-muted">({entries.length})</span>
          )}
        </div>
        {!isAdding && (
          <button
            className="btn btn-primary btn-small"
            onClick={() => setIsAdding(true)}
          >
            <Plus size={14} />
            Add Note
          </button>
        )}
      </div>

      {/* Add note form */}
      {isAdding && (
        <form onSubmit={handleSubmit} className="mb-4">
          <textarea
            className="input w-full mb-3"
            style={{ minHeight: 80, resize: 'vertical' }}
            placeholder="Write a note..."
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            autoFocus
          />
          <div className="flex items-center gap-2">
            <button
              type="submit"
              className="btn btn-primary btn-small"
              disabled={isPending || !newNote.trim()}
            >
              {isPending ? (
                <><Loader2 size={14} className="animate-spin" /> Saving...</>
              ) : (
                'Save Note'
              )}
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-small"
              onClick={() => { setIsAdding(false); setNewNote(''); }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Notes list */}
      {isLoading ? (
        <p className="text-small text-muted py-4 text-center">Loading notes...</p>
      ) : entries.length > 0 ? (
        <div className="space-y-3">
          {entries.map(entry => (
            <div
              key={entry.id}
              className="group flex gap-3 p-3 rounded-lg"
              style={{ background: 'var(--sage-50)' }}
            >
              <div className="flex-1 min-w-0">
                <p className="text-body whitespace-pre-wrap" style={{ color: 'var(--sage-800)' }}>
                  {entry.content}
                </p>
                <p className="text-small text-muted mt-1">
                  {formatDistanceToNow(new Date(entry.created_at), { addSuffix: true })}
                </p>
              </div>
              <button
                className="icon-container flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ width: 28, height: 28 }}
                onClick={() => onDelete(entry.id)}
                disabled={isPending}
                title="Delete note"
              >
                <Trash2 size={12} style={{ color: 'var(--sage-500)' }} />
              </button>
            </div>
          ))}
        </div>
      ) : !isAdding ? (
        <p className="text-small text-muted text-center py-4">
          No notes yet. Add one to track observations over time.
        </p>
      ) : null}
    </div>
  );
}
