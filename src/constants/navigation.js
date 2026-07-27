/**
 * Navigation — single source of truth
 *
 * Shared by the desktop Sidebar (dashboard) and the mobile AppMenu drawer so
 * the two navigation surfaces can never drift. Each item carries its icon,
 * label, route, keyboard shortcut, and (optionally) the premium feature that
 * gates it.
 *
 * PRIMARY_NAV is the slim list shown in the desktop sidebar. UTILITY_NAV and
 * SECONDARY_NAV are additional destinations the fuller mobile drawer keeps;
 * they live here too so labels and shortcuts stay centralized.
 */

import {
  Home,
  BookOpen,
  Droplets,
  Scissors,
  FlaskConical,
  GitFork,
  Heart,
  Settings,
  Plus,
  Sparkles,
  BarChart3,
  StickyNote,
  HelpCircle,
  Sprout,
} from 'lucide-react';

export const PRIMARY_NAV = [
  { label: 'Dashboard', href: '/', icon: Home, shortcut: 'H' },
  { label: 'Library', href: '/library', icon: BookOpen, shortcut: 'L' },
  { label: 'Care log', href: '/care', icon: Droplets, shortcut: 'C' },
  {
    label: 'Propagation',
    href: '/propagation',
    icon: Scissors,
    shortcut: 'P',
    feature: 'propagation',
  },
  {
    label: 'Breeding',
    href: '/breeding',
    icon: FlaskConical,
    shortcut: 'B',
    feature: 'breeding',
  },
  { label: 'Lineage', href: '/lineage', icon: GitFork, shortcut: 'G', feature: 'lineage' },
  { label: 'Wishlist', href: '/wishlist', icon: Heart, shortcut: 'W' },
  { label: 'Settings', href: '/settings', icon: Settings, shortcut: 'X' },
];

// Kept in the mobile drawer (not the slim desktop sidebar).
export const UTILITY_NAV = [
  { label: 'Add Plant', href: '/plants/new', icon: Plus, shortcut: 'N' },
  { label: 'Sports', href: '/sports', icon: Sparkles, shortcut: 'S', feature: 'sports' },
  { label: 'Analytics', href: '/analytics', icon: BarChart3, shortcut: 'A', feature: 'analytics' },
  { label: 'Notes', href: '/notes', icon: StickyNote, shortcut: 'J' },
];

export const SECONDARY_NAV = [
  { label: 'Help', href: '/help', icon: HelpCircle },
  { label: 'Welcome Page', href: '/welcome', icon: Sprout },
];
