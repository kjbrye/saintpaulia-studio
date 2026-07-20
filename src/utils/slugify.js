/**
 * Turn heading text into a URL-safe anchor id.
 *
 * Shared by the markdown renderer (which stamps ids onto h2/h3) and the table
 * of contents (which links to them), so both sides always agree on the id.
 */
export function slugify(text) {
  return String(text)
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Pull the h2/h3 headings out of a markdown body for a table of contents.
 * Skips fenced code blocks and strips inline formatting so the label and its
 * slug match the id the renderer stamps onto the heading.
 */
export function extractHeadings(body) {
  const headings = [];
  let inFence = false;
  for (const line of String(body).split(/\r?\n/)) {
    if (/^\s*```/.test(line)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;
    const match = /^(#{2,3})\s+(.*)$/.exec(line);
    if (!match) continue;
    const text = match[2].replace(/[*_`]/g, '').trim();
    headings.push({ level: match[1].length, text, id: slugify(text) });
  }
  return headings;
}
