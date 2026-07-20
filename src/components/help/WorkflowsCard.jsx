/**
 * WorkflowsCard — breeding & propagation walkthroughs.
 *
 * A purple flower tile heads the card; the individual workflows sit below as
 * small cream chips that wrap on mobile.
 */

import { Link } from 'react-router-dom';
import { Flower2 } from 'lucide-react';
import { getArticle } from '../../content/help';
import { HELP_COPY, WORKFLOW_CHIPS } from '../../constants/helpCopy';

export default function WorkflowsCard() {
  return (
    <section className="card p-6">
      <div className="flex items-center gap-4 mb-4">
        <span className="help-tile help-tile-purple" style={{ width: 44, height: 44 }}>
          <Flower2 size={22} style={{ color: 'var(--purple-500)' }} />
        </span>
        <div className="min-w-0">
          <h2 className="heading heading-md">{HELP_COPY.workflows.title}</h2>
          <p className="text-small text-muted">{HELP_COPY.workflows.description}</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {WORKFLOW_CHIPS.map(({ slug }) => {
          const article = getArticle('workflows', slug);
          if (!article) return null;
          return (
            <Link key={slug} to={article.to} className="help-chip">
              {article.title}
            </Link>
          );
        })}
      </div>
    </section>
  );
}
