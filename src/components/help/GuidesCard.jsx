/**
 * GuidesCard — the five feature guides, one row each.
 *
 * Row order, tile register (sage for care-side, purple for breeding-side), and
 * icon come from GUIDE_ROWS; the title/description/route resolve from the
 * markdown content index so copy stays single-sourced.
 */

import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { getArticle } from '../../content/help';
import { HELP_COPY, GUIDE_ROWS } from '../../constants/helpCopy';

export default function GuidesCard() {
  return (
    <section className="card p-6">
      <h2 className="heading heading-lg mb-1">{HELP_COPY.guides.title}</h2>
      <p className="text-small text-muted mb-2">{HELP_COPY.guides.description}</p>
      <div>
        {GUIDE_ROWS.map(({ slug, icon: Icon, tile }) => {
          const article = getArticle('guides', slug);
          if (!article) return null;
          const iconColor = tile === 'purple' ? 'var(--purple-500)' : 'var(--sage-600)';
          return (
            <Link key={slug} to={article.to} className="help-row">
              <span className={`help-tile help-tile-${tile}`}>
                <Icon size={20} style={{ color: iconColor }} />
              </span>
              <span className="flex-1 min-w-0">
                <span className="font-semibold block" style={{ color: 'var(--text-primary)' }}>
                  {article.title}
                </span>
                <span className="text-small text-muted block truncate">
                  {article.description}
                </span>
              </span>
              <ChevronRight size={18} style={{ color: 'var(--sage-500)', flexShrink: 0 }} />
            </Link>
          );
        })}
      </div>
    </section>
  );
}
