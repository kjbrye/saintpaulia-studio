/**
 * HelpSearch — client-side substring search across all help articles.
 *
 * Content ships in the bundle, so a case-insensitive match over article titles,
 * descriptions, and body text (see searchArticles) is plenty at this scale — no
 * search service. Results render as a simple list with the matched snippet.
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, ChevronRight } from 'lucide-react';
import { searchArticles } from '../../content/help';
import { HELP_COPY } from '../../constants/helpCopy';

export default function HelpSearch() {
  const [query, setQuery] = useState('');
  const trimmed = query.trim();
  const results = trimmed ? searchArticles(trimmed) : [];

  return (
    <div className="card p-4">
      <div className="flex items-center gap-3 input" style={{ padding: '10px 14px' }}>
        <Search size={18} style={{ color: 'var(--sage-600)', flexShrink: 0 }} />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={HELP_COPY.search.placeholder}
          aria-label={HELP_COPY.search.label}
          className="flex-1"
          style={{
            border: 'none',
            background: 'transparent',
            outline: 'none',
            fontFamily: 'var(--font-body)',
            fontSize: 16,
            color: 'var(--text-primary)',
          }}
        />
      </div>

      {trimmed && (
        <div className="mt-3">
          {results.length === 0 ? (
            <p className="text-small text-muted px-2 py-2">{HELP_COPY.search.noResults}</p>
          ) : (
            <>
              <p className="text-label px-2 mb-1">{HELP_COPY.search.resultsLabel(results.length)}</p>
              <div>
                {results.map(({ article, snippet }) => (
                  <Link key={article.to} to={article.to} className="help-search-result">
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                        {article.title}
                      </span>
                      <ChevronRight
                        size={16}
                        style={{ color: 'var(--sage-500)', flexShrink: 0 }}
                      />
                    </div>
                    <p className="text-small text-muted mt-1" style={{ lineHeight: 1.5 }}>
                      {snippet}
                    </p>
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
