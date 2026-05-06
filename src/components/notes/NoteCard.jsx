import { useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import NoteForm from './NoteForm';

export default function NoteCard({ note, onUpdate, onDelete, isPending, onTagClick }) {
  const [isEditing, setIsEditing] = useState(false);

  const handleUpdate = async (values) => {
    await onUpdate({ id: note.id, ...values });
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="card p-6">
        <NoteForm
          initialValues={note}
          onSubmit={handleUpdate}
          onCancel={() => setIsEditing(false)}
          isPending={isPending}
          submitLabel="Save Changes"
        />
      </div>
    );
  }

  const updated = note.updated_at && note.updated_at !== note.created_at;

  return (
    <div className="card p-6 group">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex-1 min-w-0">
          {note.title && <h3 className="heading heading-md mb-1">{note.title}</h3>}
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            className="icon-container"
            style={{ width: 28, height: 28 }}
            onClick={() => setIsEditing(true)}
            title="Edit note"
          >
            <Pencil size={12} style={{ color: 'var(--sage-500)' }} />
          </button>
          <button
            className="icon-container"
            style={{ width: 28, height: 28 }}
            onClick={() => onDelete(note.id)}
            disabled={isPending}
            title="Delete note"
          >
            <Trash2 size={12} style={{ color: 'var(--sage-500)' }} />
          </button>
        </div>
      </div>

      <p className="text-body whitespace-pre-wrap" style={{ color: 'var(--sage-800)' }}>
        {note.body}
      </p>

      {note.photos && note.photos.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {note.photos.map((url) => (
            <a
              key={url}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-24 h-24 rounded-lg overflow-hidden"
              style={{ background: 'var(--cream-100)' }}
            >
              <img src={url} alt="Attachment" className="w-full h-full object-cover" />
            </a>
          ))}
        </div>
      )}

      {note.tags && note.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {note.tags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => onTagClick?.(tag)}
              className="text-small px-2 py-0.5 rounded-full transition-colors"
              style={{
                background: 'var(--purple-100)',
                color: 'var(--purple-500)',
              }}
            >
              #{tag}
            </button>
          ))}
        </div>
      )}

      <p className="text-small text-muted mt-3">
        {updated ? 'Updated' : 'Added'}{' '}
        {formatDistanceToNow(new Date(updated ? note.updated_at : note.created_at), {
          addSuffix: true,
        })}
      </p>
    </div>
  );
}
