/**
 * WhatsNewCard — Changelog (native) and Roadmap (external, Notion).
 *
 * The changelog subtitle reads the live version from package.json so it never
 * goes stale. The roadmap stays in Notion — it's a live status database, not a
 * static article — so its row carries an external-link icon and opens a new tab.
 */

import { Link } from 'react-router-dom';
import { History, Map, ChevronRight, ExternalLink } from 'lucide-react';
import { version } from '../../../package.json';
import { getArticle } from '../../content/help';
import { HELP_COPY } from '../../constants/helpCopy';

export default function WhatsNewCard() {
  const changelog = getArticle(null, HELP_COPY.whatsNew.changelog.slug);

  return (
    <section className="card p-6">
      <h2 className="heading heading-lg mb-2">{HELP_COPY.whatsNew.title}</h2>

      {changelog && (
        <Link to={changelog.to} className="help-row">
          <span className="help-tile help-tile-sage">
            <History size={20} style={{ color: 'var(--sage-600)' }} />
          </span>
          <span className="flex-1 min-w-0">
            <span className="font-semibold block" style={{ color: 'var(--text-primary)' }}>
              {HELP_COPY.whatsNew.changelog.title}
            </span>
            <span className="text-small text-muted block">Version {version}</span>
          </span>
          <ChevronRight size={18} style={{ color: 'var(--sage-500)', flexShrink: 0 }} />
        </Link>
      )}

      <a
        href={HELP_COPY.whatsNew.roadmap.url}
        target="_blank"
        rel="noopener noreferrer"
        className="help-row"
      >
        <span className="help-tile help-tile-purple">
          <Map size={20} style={{ color: 'var(--purple-500)' }} />
        </span>
        <span className="flex-1 min-w-0">
          <span className="font-semibold block" style={{ color: 'var(--text-primary)' }}>
            {HELP_COPY.whatsNew.roadmap.title}
          </span>
          <span className="text-small text-muted block truncate">
            {HELP_COPY.whatsNew.roadmap.description}
          </span>
        </span>
        <ExternalLink size={16} style={{ color: 'var(--purple-400)', flexShrink: 0 }} />
      </a>
    </section>
  );
}
