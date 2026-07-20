/**
 * Help content index.
 *
 * The markdown files in this directory are the single source of truth for the
 * Help Center. A Vite glob import pulls every `.md` file in as raw text, so
 * adding a new article is just dropping a file here — no manual registration.
 *
 * Each file carries YAML-ish frontmatter (title, description, icon, section,
 * order). We parse it into article objects the Help pages render and search
 * against. Nothing here touches the database — it's all static bundle content.
 */

// Raw markdown for every file, keyed by path (e.g. './guides/care-tracking.md').
const modules = import.meta.glob('./**/*.md', {
  eager: true,
  query: '?raw',
  import: 'default',
});

/** Parse frontmatter (flat `key: value` pairs) and return { data, body }. */
function parseFrontmatter(raw) {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(raw);
  if (!match) return { data: {}, body: raw };
  const data = {};
  for (const line of match[1].split(/\r?\n/)) {
    const idx = line.indexOf(':');
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    let value = line.slice(idx + 1).trim();
    if (/^-?\d+$/.test(value)) value = Number(value);
    else value = value.replace(/^["']|["']$/g, '');
    data[key] = value;
  }
  return { data, body: raw.slice(match[0].length).trim() };
}

/** './guides/care-tracking.md' → { section: 'guides', slug: 'care-tracking' }. */
function parsePath(path) {
  const rel = path.replace(/^\.\//, '').replace(/\.md$/, '');
  const parts = rel.split('/');
  if (parts.length >= 2) return { section: parts[0], slug: parts[parts.length - 1] };
  return { section: null, slug: parts[0] };
}

/** Strip markdown syntax down to plain text for search + snippets. */
function toPlainText(body) {
  return body
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/^\s{0,3}#{1,6}\s+/gm, '')
    .replace(/[*_>#|]/g, ' ')
    .replace(/-{3,}/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export const ARTICLES = Object.entries(modules)
  .map(([path, raw]) => {
    const { data, body } = parseFrontmatter(raw);
    const { section, slug } = parsePath(path);
    const resolvedSection = data.section || section || null;
    return {
      slug,
      section: resolvedSection,
      title: data.title || slug,
      description: data.description || '',
      icon: data.icon || null,
      order: typeof data.order === 'number' ? data.order : 999,
      body,
      plainText: toPlainText(body),
      to: resolvedSection ? `/help/${resolvedSection}/${slug}` : `/help/${slug}`,
    };
  })
  .sort((a, b) => a.order - b.order || a.title.localeCompare(b.title));

const BY_KEY = new Map(ARTICLES.map((a) => [`${a.section || ''}/${a.slug}`, a]));

/**
 * Look up an article by its route params. Top-level articles are stored with a
 * null section, so a `/help/:slug` route (no section) resolves against `''`.
 */
export function getArticle(section, slug) {
  if (!slug) return null;
  return BY_KEY.get(`${section || ''}/${slug}`) || null;
}

/** All articles in a section, in reading order — used for prev/next. */
export function getSectionArticles(section) {
  return ARTICLES.filter((a) => (a.section || null) === (section || null));
}

/** Neighboring articles within the same section for prev/next navigation. */
export function getSiblings(article) {
  if (!article) return { prev: null, next: null };
  const siblings = getSectionArticles(article.section);
  const i = siblings.findIndex((a) => a.slug === article.slug);
  return {
    prev: i > 0 ? siblings[i - 1] : null,
    next: i >= 0 && i < siblings.length - 1 ? siblings[i + 1] : null,
  };
}

/**
 * Case-insensitive substring search over title, description, and body. Returns
 * matches ranked by where the hit landed (title > description > body), each with
 * a short snippet around the first body match for the results list.
 */
export function searchArticles(query) {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const results = [];
  for (const article of ARTICLES) {
    const title = article.title.toLowerCase();
    const description = article.description.toLowerCase();
    const text = article.plainText.toLowerCase();
    const inTitle = title.includes(q);
    const inDescription = description.includes(q);
    const bodyIdx = text.indexOf(q);
    if (!inTitle && !inDescription && bodyIdx === -1) continue;

    let snippet = article.description;
    if (bodyIdx !== -1) {
      const start = Math.max(0, bodyIdx - 60);
      const end = Math.min(article.plainText.length, bodyIdx + q.length + 60);
      snippet =
        (start > 0 ? '…' : '') +
        article.plainText.slice(start, end).trim() +
        (end < article.plainText.length ? '…' : '');
    }
    const rank = inTitle ? 0 : inDescription ? 1 : 2;
    results.push({ article, snippet, rank });
  }
  return results.sort((a, b) => a.rank - b.rank || a.article.order - b.article.order);
}
