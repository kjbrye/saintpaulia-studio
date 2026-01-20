/**
 * useKeyboardShortcuts - Global keyboard shortcuts hook
 */

import { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Hook that listens for global keyboard shortcuts
 * @param {Object} options
 * @param {Function} options.onOpenCommandPalette - Called when ⌘K is pressed
 */
export function useKeyboardShortcuts({ onOpenCommandPalette }) {
  const navigate = useNavigate();

  const handleKeyDown = useCallback((e) => {
    // Ignore if user is typing in an input field
    const isInputFocused = ['INPUT', 'TEXTAREA', 'SELECT'].includes(
      document.activeElement?.tagName
    );
    const isContentEditable = document.activeElement?.isContentEditable;

    if (isInputFocused || isContentEditable) {
      // Only allow Escape to close command palette when in input
      if (e.key === 'Escape') {
        return; // Let the command palette handle its own escape
      }
      return;
    }

    // ⌘K or Ctrl+K - Open command palette
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      onOpenCommandPalette?.();
      return;
    }

    // Simple key shortcuts (no modifier required)
    switch (e.key.toLowerCase()) {
      case 'k':
        // Also allow just 'k' to open command palette
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
        // Go home
        e.preventDefault();
        navigate('/');
        break;
      case 's':
        e.preventDefault();
        navigate('/settings');
        break;
      case '?':
        // Show keyboard shortcuts help (could open a modal)
        e.preventDefault();
        // For now, just open command palette
        onOpenCommandPalette?.();
        break;
    }
  }, [navigate, onOpenCommandPalette]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}
