import { useEffect } from 'react';

const BASE_TITLE = 'Saintpaulia Studio';

/**
 * Sets the document title for the current page.
 * @param {string} [title] - Page-specific title. Omit for just the base title.
 */
export function usePageTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} — ${BASE_TITLE}` : BASE_TITLE;
    return () => {
      document.title = BASE_TITLE;
    };
  }, [title]);
}
