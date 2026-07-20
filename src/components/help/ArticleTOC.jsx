/**
 * ArticleTOC — jump-link table of contents for a help article.
 *
 * Only rendered when an article has more than three headings (the page decides).
 * A cream card of anchor links; collapsible via <details> so it folds away on
 * mobile while staying open by default on wider screens.
 */

import { List } from 'lucide-react';
import { HELP_COPY } from '../../constants/helpCopy';

export default function ArticleTOC({ headings }) {
  if (!headings || headings.length === 0) return null;

  return (
    <details className="help-toc card-inset p-4 mb-8" open>
      <summary className="flex items-center gap-2">
        <List size={16} style={{ color: 'var(--sage-600)' }} />
        <span className="text-label" style={{ letterSpacing: '1px' }}>
          {HELP_COPY.article.tocTitle}
        </span>
      </summary>
      <ul className="mt-3 space-y-2">
        {headings.map((h) => (
          <li key={h.id} style={{ paddingLeft: h.level === 3 ? 16 : 0 }}>
            <a href={`#${h.id}`} className="text-small">
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </details>
  );
}
