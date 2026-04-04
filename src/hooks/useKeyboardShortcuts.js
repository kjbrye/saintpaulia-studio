/**
 * useKeyboardShortcuts - Global keyboard shortcuts hook
 */

import { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Hook that listens for global keyboard shortcuts.
 * All navigation shortcuts require Alt modifier to avoid conflicts with typing.
 * @param {Object} options
 * @param {Function} options.onOpenCommandPalette - Called when ⌘K is pressed
 */
export function useKeyboardShortcuts({ onOpenCommandPalette }) {
  const navigate = useNavigate();

  const handleKeyDown = useCallback(
    (e) => {
      // ⌘K or Ctrl+K - Open command palette (always active)
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        onOpenCommandPalette?.();
        return;
      }

      // Ignore all other shortcuts if user is typing
      const isInputFocused = ['INPUT', 'TEXTAREA', 'SELECT'].includes(
        document.activeElement?.tagName,
      );
      if (isInputFocused || document.activeElement?.isContentEditable) {
        return;
      }

      // Alt + key shortcuts for navigation
      if (!e.altKey || e.metaKey || e.ctrlKey) return;

      switch (e.key.toLowerCase()) {
        case 'k':
          e.preventDefault();
          onOpenCommandPalette?.();
          break;
        case 'n':
          e.preventDefault();
          navigate('/plants/new');
          break;
        case 'l':
          e.preventDefault();
          navigate('/library');
          break;
        case 'c':
          e.preventDefault();
          navigate('/care');
          break;
        case 'h':
          e.preventDefault();
          navigate('/');
          break;
        case 'p':
          e.preventDefault();
          navigate('/propagation');
          break;
        case 'b':
          e.preventDefault();
          navigate('/breeding');
          break;
        case 'g':
          e.preventDefault();
          navigate('/lineage');
          break;
        case 'a':
          e.preventDefault();
          navigate('/analytics');
          break;
        case 's':
          e.preventDefault();
          navigate('/settings');
          break;
      }
    },
    [navigate, onOpenCommandPalette],
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}
