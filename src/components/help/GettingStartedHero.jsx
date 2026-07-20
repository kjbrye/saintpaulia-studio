/**
 * GettingStartedHero — the primary entry point for new users.
 *
 * A purple gradient hero above the rest of the help index, since getting
 * started is the single most important door in.
 */

import { Link } from 'react-router-dom';
import { PlayCircle, ChevronRight } from 'lucide-react';
import { getArticle } from '../../content/help';
import { HELP_COPY } from '../../constants/helpCopy';

export default function GettingStartedHero() {
  const article = getArticle(null, HELP_COPY.gettingStarted.slug);
  if (!article) return null;

  return (
    <Link to={article.to} className="help-hero">
      <span className="help-hero-icon">
        <PlayCircle size={28} style={{ color: 'var(--purple-500)' }} />
      </span>
      <span className="flex-1 min-w-0">
        <span
          className="heading heading-md block"
          style={{ color: 'var(--text-on-dark)' }}
        >
          {HELP_COPY.gettingStarted.title}
        </span>
        <span className="text-small block mt-1" style={{ color: 'rgba(255,255,255,0.9)' }}>
          {HELP_COPY.gettingStarted.description}
        </span>
      </span>
      <ChevronRight size={22} style={{ color: 'var(--text-on-dark)', flexShrink: 0 }} />
    </Link>
  );
}
