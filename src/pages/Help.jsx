/**
 * Help — the Help Center index.
 *
 * Thin orchestrator: a header, the search card, and the curated section cards.
 * Article content lives in src/content/help (markdown); copy lives in
 * constants/helpCopy. See the Help Center spec for the card layout.
 */

import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { usePageTitle } from '../hooks/usePageTitle';
import { HELP_COPY } from '../constants/helpCopy';
import {
  HelpSearch,
  GettingStartedHero,
  GuidesCard,
  WorkflowsCard,
  FaqContactCards,
  WhatsNewCard,
} from '../components/help';

export default function Help() {
  usePageTitle('Help');

  return (
    <div className="min-h-screen p-6 md:p-10">
      <div className="max-w-3xl mx-auto space-y-6">
        <header className="flex items-center gap-4">
          <Link to="/">
            <button className="icon-container" aria-label="Back">
              <ArrowLeft size={20} style={{ color: 'var(--sage-600)' }} />
            </button>
          </Link>
          <div>
            <h1 className="heading heading-xl">{HELP_COPY.pageTitle}</h1>
            <p className="italic" style={{ color: 'var(--purple-500)' }}>
              {HELP_COPY.subtitle}
            </p>
          </div>
        </header>

        <HelpSearch />
        <GettingStartedHero />
        <GuidesCard />
        <WorkflowsCard />
        <FaqContactCards />
        <WhatsNewCard />
      </div>
    </div>
  );
}
