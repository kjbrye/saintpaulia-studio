/**
 * RecentNote
 *
 * Bottom-row companion to UpcomingTasks. Shows the most recent note with a
 * thumbnail when one has a photo, plus the sanctuary quote in a soft purple
 * tint block. Reuses the existing notes hook — no new data.
 */

import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { StickyNote } from 'lucide-react';
import { useNotes } from '../../hooks/useNotes';
import { DASHBOARD_COPY } from '../../constants/dashboardCopy';

const C = DASHBOARD_COPY.recentNote;

function mostRecent(notes) {
  if (!notes?.length) return null;
  return [...notes].sort((a, b) => {
    const at = a.created_at ?? '';
    const bt = b.created_at ?? '';
    return at < bt ? 1 : -1;
  })[0];
}

export default function RecentNote() {
  const { data: notes = [], isLoading } = useNotes();
  const note = mostRecent(notes);
  const thumb = note?.photos?.[0] ?? null;
  const when = note?.created_at
    ? formatDistanceToNow(new Date(note.created_at), { addSuffix: true })
    : '';

  return (
    <section className="ds-card" style={{ padding: 20 }}>
      <div className="flex items-center justify-between" style={{ marginBottom: 12 }}>
        <h2 className="ds-section-title" style={{ fontSize: 18 }}>
          {C.title}
        </h2>
        <Link to="/notes" className="ds-viewall">
          {C.viewAll}
        </Link>
      </div>

      {isLoading ? (
        <p style={{ fontSize: 14, color: 'var(--text-quiet)' }}>Loading…</p>
      ) : !note ? (
        <p style={{ fontSize: 14, color: 'var(--text-quiet)' }}>
          {C.empty}{' '}
          <Link to="/notes" style={{ color: 'var(--purple-emphasis)', fontWeight: 600 }}>
            {C.addNote}
          </Link>
        </p>
      ) : (
        <Link to="/notes" className="flex items-start gap-3" style={{ textDecoration: 'none' }}>
          <span
            className="flex items-center justify-center flex-shrink-0"
            style={{
              width: 56,
              height: 56,
              borderRadius: 10,
              overflow: 'hidden',
              background: 'var(--cream-200)',
            }}
          >
            {thumb ? (
              <img src={thumb} alt="" className="w-full h-full object-cover" />
            ) : (
              <StickyNote size={22} style={{ color: 'var(--sage-500)' }} />
            )}
          </span>
          <span style={{ flex: 1, minWidth: 0 }}>
            {note.title && (
              <span
                className="truncate"
                style={{
                  display: 'block',
                  fontFamily: 'var(--font-heading)',
                  fontSize: 17,
                  fontWeight: 600,
                  color: 'var(--text-strong)',
                }}
              >
                {note.title}
              </span>
            )}
            <span
              style={{
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                fontSize: 14,
                color: 'var(--text-body)',
                lineHeight: 1.45,
              }}
            >
              {note.body}
            </span>
            {when && (
              <span
                style={{
                  display: 'block',
                  marginTop: 4,
                  fontSize: 12,
                  color: 'var(--text-quiet)',
                }}
              >
                {when}
              </span>
            )}
          </span>
        </Link>
      )}
    </section>
  );
}
