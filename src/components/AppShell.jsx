/**
 * AppShell - Wraps the app with global features like command palette and keyboard shortcuts
 */

import { useState } from 'react';
import CommandPalette from './ui/CommandPalette';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';

export default function AppShell({ children }) {
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  // Set up global keyboard shortcuts
  useKeyboardShortcuts({
    onOpenCommandPalette: () => setIsCommandPaletteOpen(true),
  });

  return (
    <>
      {children}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
      />
    </>
  );
}
