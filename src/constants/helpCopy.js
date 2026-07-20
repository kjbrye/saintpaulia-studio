/**
 * Help Center copy & layout config.
 *
 * All user-facing strings for the Help pages live here so the pages and their
 * cards stay free of inline copy. The article *content* lives in the markdown
 * files under src/content/help — this file only covers the index page chrome
 * and the fixed row/section metadata (tiles, icons, ordering).
 *
 * The Roadmap intentionally stays in Notion (it's a live status database, not a
 * static article), so it's linked out to rather than migrated.
 */

import {
  Droplet,
  Scissors,
  Heart,
  GitFork,
  BarChart3,
  HelpCircle,
  Mail,
  History,
  Map,
} from 'lucide-react';

export const HELP_COPY = {
  pageTitle: 'Help',
  subtitle: 'Guides, answers, and what’s coming next',

  search: {
    placeholder: 'Search the help center…',
    label: 'Search help articles',
    noResults: 'No articles match your search.',
    resultsLabel: (n) => `${n} ${n === 1 ? 'result' : 'results'}`,
  },

  gettingStarted: {
    slug: 'getting-started',
    title: 'Getting started',
    description: 'New here? Start with the basics — from sign-up to your first logged care action.',
  },

  guides: {
    title: 'Guides',
    description: 'Step-by-step instructions for every feature',
  },

  workflows: {
    title: 'Breeding and propagation workflows',
    description: 'Full walkthroughs for each process, start to finish',
  },

  faq: {
    slug: 'faq',
    title: 'FAQ',
    description: 'Answers to common questions',
  },

  contact: {
    slug: 'contact',
    title: 'Contact',
    description: 'Report a bug or share feedback',
  },

  whatsNew: {
    title: 'What’s new and what’s next',
    changelog: {
      slug: 'changelog',
      title: 'Changelog',
    },
    roadmap: {
      title: 'Roadmap',
      description: 'What’s planned for upcoming releases',
      url: 'https://captainmothphd.notion.site/337aaf3f8df78153a21bd567b4bd5fdb',
    },
  },

  article: {
    backToHelp: 'Help',
    tocTitle: 'On this page',
    prevLabel: 'Previous',
    nextLabel: 'Next',
  },
};

/**
 * Guide rows for the Guides card. `slug` resolves title/description/route from
 * the content index; `tile` picks the sage/purple register (sage for care-side
 * features, purple for breeding-side), and `icon` is the tile glyph.
 */
export const GUIDE_ROWS = [
  { slug: 'care-tracking', icon: Droplet, tile: 'sage' },
  { slug: 'propagation-tracker', icon: Scissors, tile: 'sage' },
  { slug: 'breeding-tracker', icon: Heart, tile: 'purple' },
  { slug: 'lineage-pedigree', icon: GitFork, tile: 'purple' },
  { slug: 'analytics-insights', icon: BarChart3, tile: 'sage' },
];

/** Workflow chips (order matches the workflows section). */
export const WORKFLOW_CHIPS = [
  { slug: 'first-cross' },
  { slug: 'leaf-cutting' },
  { slug: 'failed-cross' },
  { slug: 'f2-breeding' },
];

export const FAQ_CONTACT_ICONS = { faq: HelpCircle, contact: Mail };
export const WHATS_NEW_ICONS = { changelog: History, roadmap: Map };

/** Human labels for section breadcrumbs on the article page. */
export const SECTION_LABELS = {
  guides: 'Guides',
  workflows: 'Workflows',
};
