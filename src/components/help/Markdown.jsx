/**
 * Markdown — renders help article bodies with the app's design tokens.
 *
 * Uses react-markdown + remark-gfm (tables, autolinks, etc.). The component
 * overrides only stamp stable ids onto headings (so the table of contents can
 * jump to them), wrap tables so they scroll on mobile, and open external links
 * in a new tab. All visual styling lives in the `.help-markdown` CSS scope.
 */

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { slugify } from '../../utils/slugify';

/** Flatten a heading's React children to plain text for slug generation. */
function textContent(children) {
  if (children == null) return '';
  if (typeof children === 'string' || typeof children === 'number') return String(children);
  if (Array.isArray(children)) return children.map(textContent).join('');
  if (children.props) return textContent(children.props.children);
  return '';
}

const COMPONENTS = {
  h2: ({ children }) => <h2 id={slugify(textContent(children))}>{children}</h2>,
  h3: ({ children }) => <h3 id={slugify(textContent(children))}>{children}</h3>,
  table: ({ children }) => (
    <div className="help-markdown-table-wrap">
      <table>{children}</table>
    </div>
  ),
  a: ({ href, children }) => {
    const external = /^https?:\/\//.test(href || '');
    return (
      <a
        href={href}
        {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      >
        {children}
      </a>
    );
  },
};

export default function Markdown({ children }) {
  return (
    <div className="help-markdown">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={COMPONENTS}>
        {children}
      </ReactMarkdown>
    </div>
  );
}
