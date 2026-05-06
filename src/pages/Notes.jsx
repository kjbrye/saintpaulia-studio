import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, StickyNote, Plus, Search, X } from 'lucide-react';
import { useNotes, useCreateNote, useUpdateNote, useDeleteNote } from '../hooks/useNotes';
import HeaderBar from '../components/ui/HeaderBar';
import NoteCard from '../components/notes/NoteCard';
import NoteForm from '../components/notes/NoteForm';
import { usePageTitle } from '../hooks/usePageTitle';

export default function Notes() {
  usePageTitle('Notes');
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [activeTag, setActiveTag] = useState(null);

  const { data: notes = [], isLoading, error } = useNotes();
  const createNote = useCreateNote();
  const updateNote = useUpdateNote();
  const deleteNote = useDeleteNote();

  const allTags = useMemo(() => {
    const set = new Set();
    notes.forEach((n) => (n.tags || []).forEach((t) => set.add(t)));
    return [...set].sort();
  }, [notes]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return notes.filter((n) => {
      if (activeTag && !(n.tags || []).includes(activeTag)) return false;
      if (!q) return true;
      const haystack = `${n.title ?? ''} ${n.body ?? ''}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [notes, search, activeTag]);

  const handleCreate = async (values) => {
    await createNote.mutateAsync(values);
    setShowForm(false);
  };

  const handleUpdate = (updates) => updateNote.mutateAsync(updates);
  const handleDelete = (id) => deleteNote.mutate(id);

  const isPending = createNote.isPending || updateNote.isPending || deleteNote.isPending;

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <HeaderBar />
        <div
          className="flex items-center justify-center p-8"
          style={{ minHeight: 'calc(100vh - 60px)' }}
        >
          <p className="text-muted">Loading notes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen">
        <HeaderBar />
        <div
          className="flex items-center justify-center p-8"
          style={{ minHeight: 'calc(100vh - 60px)' }}
        >
          <div className="panel p-8 text-center max-w-md">
            <p className="heading heading-lg mb-2">Failed to load</p>
            <p className="text-muted mb-4">{error.message}</p>
            <button className="btn btn-primary" onClick={() => window.location.reload()}>
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <HeaderBar />

      <main className="p-4 md:p-6 lg:p-8">
        <div className="max-w-3xl mx-auto">
          <header className="flex items-center gap-4 mb-6">
            <Link to="/">
              <button type="button" className="icon-container">
                <ArrowLeft size={20} style={{ color: 'var(--sage-600)' }} />
              </button>
            </Link>
            <div className="flex-1">
              <h1 className="heading heading-xl">Notes</h1>
              <p className="text-body text-muted">
                Tips, soil recipes, shop links, and other notes
              </p>
            </div>
          </header>

          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            {!showForm && (
              <button className="btn btn-primary" onClick={() => setShowForm(true)}>
                <Plus size={18} />
                New Note
              </button>
            )}

            {notes.length > 0 && (
              <div className="flex items-center gap-2 flex-1 max-w-xs ml-auto">
                <div className="relative flex-1">
                  <Search
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2"
                    style={{ color: 'var(--sage-500)' }}
                  />
                  <input
                    type="text"
                    className="input w-full"
                    style={{ paddingLeft: 32 }}
                    placeholder="Search notes..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>

          {allTags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {allTags.map((tag) => {
                const isActive = activeTag === tag;
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setActiveTag(isActive ? null : tag)}
                    className="text-small px-3 py-1 rounded-full transition-colors"
                    style={{
                      background: isActive ? 'var(--purple-500)' : 'var(--purple-100)',
                      color: isActive ? 'white' : 'var(--purple-500)',
                    }}
                  >
                    #{tag}
                  </button>
                );
              })}
              {activeTag && (
                <button
                  type="button"
                  onClick={() => setActiveTag(null)}
                  className="text-small px-3 py-1 rounded-full inline-flex items-center gap-1"
                  style={{ background: 'var(--sage-100)', color: 'var(--sage-600)' }}
                >
                  <X size={12} /> Clear
                </button>
              )}
            </div>
          )}

          {showForm && (
            <div className="card p-6 mb-6">
              <h2 className="heading heading-md mb-4">New Note</h2>
              <NoteForm
                onSubmit={handleCreate}
                onCancel={() => setShowForm(false)}
                isPending={createNote.isPending}
              />
            </div>
          )}

          {filtered.length > 0 ? (
            <div className="space-y-4">
              {filtered.map((note) => (
                <NoteCard
                  key={note.id}
                  note={note}
                  onUpdate={handleUpdate}
                  onDelete={handleDelete}
                  isPending={isPending}
                  onTagClick={(tag) => setActiveTag(tag)}
                />
              ))}
            </div>
          ) : notes.length === 0 ? (
            <div className="panel p-10 text-center">
              <div
                className="w-16 h-16 rounded-xl mx-auto mb-4 flex items-center justify-center"
                style={{ background: 'var(--purple-100)' }}
              >
                <StickyNote size={32} style={{ color: 'var(--purple-400)' }} />
              </div>
              <h2 className="heading heading-lg mb-2">No notes yet</h2>
              <p className="text-muted mb-6">
                Jot down tips, soil recipes, shop links, and anything else worth remembering.
              </p>
              {!showForm && (
                <button className="btn btn-primary" onClick={() => setShowForm(true)}>
                  <Plus size={18} /> Write Your First Note
                </button>
              )}
            </div>
          ) : (
            <div className="panel p-8 text-center">
              <p className="text-muted">No notes match your filters.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
