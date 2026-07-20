/**
 * Resolve a frontmatter `icon:` string to a lucide-react component.
 *
 * Article frontmatter names its icon as a string so the markdown stays the
 * source of truth. This map keeps the bundle honest — only the icons we
 * actually reference are imported — and falls back to a book icon.
 */
import {
  PlayCircle,
  Droplet,
  Scissors,
  Heart,
  HeartCrack,
  GitFork,
  GitBranch,
  BarChart3,
  HelpCircle,
  History,
  Mail,
  Sparkles,
  BookOpen,
} from 'lucide-react';

const ICONS = {
  PlayCircle,
  Droplet,
  Scissors,
  Heart,
  HeartCrack,
  GitFork,
  GitBranch,
  BarChart3,
  HelpCircle,
  History,
  Mail,
  Sparkles,
  BookOpen,
};

export function resolveIcon(name) {
  return ICONS[name] || BookOpen;
}
