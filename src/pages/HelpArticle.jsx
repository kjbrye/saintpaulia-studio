/**
 * HelpArticle — renders a single migrated markdown article.
 *
 * Handles both `/help/:section/:slug` (guides, workflows) and `/help/:slug`
 * (top-level articles). Shows a breadcrumb, the rendered body, a table of
 * contents when the article has more than three headings, and prev/next
 * navigation within the same section.
 */

import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import { usePageTitle } from '../hooks/usePageTitle';
import { getArticle, getSiblings } from '../content/help';
import { extractHeadings } from '../utils/slugify';
import { resolveIcon } from '../utils/helpIcons';
import { HELP_COPY, SECTION_LABELS } from '../constants/helpCopy';
import { Markdown, ArticleTOC } from '../components/help';

export default function HelpArticle() {
  const { section, slug } = useParams();
  const article = getArticle(section, slug);

  usePageTitle(article ? article.title : 'Help');

  // Jump to the top when navigating between articles (prev/next, links).
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [section, slug]);

  if (!article) {
    return (
      <div className="min-h-screen p-6 md:p-10">
        <div className="max-w-3xl mx-auto">
          <div className="card p-8 text-center">
            <h1 className="heading heading-lg mb-2">Article not found</h1>
            <p className="text-muted mb-6">
              We couldn’t find that help article. It may have moved.
            </p>
            <Link to="/help" className="btn btn-primary">
              Back to Help
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const headings = extractHeadings(article.body);
  const showToc = headings.length > 3;
  const { prev, next } = getSiblings(article);
  const sectionLabel = article.section ? SECTION_LABELS[article.section] : null;
  const Icon = resolveIcon(article.icon);

  return (
    <div className="min-h-screen p-6 md:p-10">
      <div className="max-w-3xl mx-auto">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 flex-wrap mb-6 text-small">
          <Link
            to="/help"
            className="inline-flex items-center gap-1"
            style={{ color: 'var(--sage-600)' }}
          >
            <ArrowLeft size={16} /> {HELP_COPY.article.backToHelp}
          </Link>
          {sectionLabel && (
            <>
              <span style={{ color: 'var(--text-muted)' }}>/</span>
              <span style={{ color: 'var(--text-muted)' }}>{sectionLabel}</span>
            </>
          )}
        </nav>

        {/* Title */}
        <header className="flex items-start gap-4 mb-6">
          <span className="icon-container-lg" style={{ marginTop: 4 }}>
            <Icon size={22} style={{ color: 'var(--sage-600)' }} />
          </span>
          <div className="min-w-0">
            <h1 className="heading heading-xl">{article.title}</h1>
            {article.description && (
              <p className="italic mt-1" style={{ color: 'var(--purple-500)' }}>
                {article.description}
              </p>
            )}
          </div>
        </header>

        {showToc && <ArticleTOC headings={headings} />}

        {/* Body */}
        <article className="card p-6 md:p-8">
          <Markdown>{article.body}</Markdown>
        </article>

        {/* Prev / next within the section */}
        {(prev || next) && (
          <nav className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
            {prev ? (
              <Link to={prev.to} className="card p-4 flex items-center gap-3">
                <ChevronLeft size={20} style={{ color: 'var(--sage-500)', flexShrink: 0 }} />
                <span className="min-w-0">
                  <span className="text-label block">{HELP_COPY.article.prevLabel}</span>
                  <span className="font-semibold truncate block" style={{ color: 'var(--text-primary)' }}>
                    {prev.title}
                  </span>
                </span>
              </Link>
            ) : (
              <span />
            )}
            {next && (
              <Link
                to={next.to}
                className="card p-4 flex items-center gap-3 sm:text-right"
                style={{ justifyContent: 'flex-end' }}
              >
                <span className="min-w-0">
                  <span className="text-label block">{HELP_COPY.article.nextLabel}</span>
                  <span className="font-semibold truncate block" style={{ color: 'var(--text-primary)' }}>
                    {next.title}
                  </span>
                </span>
                <ChevronRight size={20} style={{ color: 'var(--sage-500)', flexShrink: 0 }} />
              </Link>
            )}
          </nav>
        )}
      </div>
    </div>
  );
}
