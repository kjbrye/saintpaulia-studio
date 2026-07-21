/**
 * Roadmap — native in-app view of what's ahead.
 *
 * Thin orchestrator: header, an expectation-setting intro note, the two
 * buckets (Coming soon, then Exploring), and a feedback footer. Reads
 * top-to-bottom as a narrative — what's nearly here, then what's being
 * considered. Data lives in src/content/roadmap.js; copy in helpCopy.
 */

import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { usePageTitle } from '../hooks/usePageTitle';
import { ROADMAP_COPY } from '../constants/helpCopy';
import { getRoadmapItems } from '../content/roadmap';
import { RoadmapSection } from '../components/help';

export default function Roadmap() {
  usePageTitle('Roadmap');
  const { intro, footer } = ROADMAP_COPY;

  return (
    <div className="min-h-screen p-6 md:p-10">
      <div className="max-w-3xl mx-auto space-y-6">
        <header className="flex items-center gap-4">
          <Link to="/help">
            <button className="icon-container" aria-label="Back to Help">
              <ArrowLeft size={20} style={{ color: 'var(--sage-600)' }} />
            </button>
          </Link>
          <div>
            <h1 className="heading heading-xl">{ROADMAP_COPY.pageTitle}</h1>
            <p className="italic" style={{ color: 'var(--purple-500)' }}>
              {ROADMAP_COPY.subtitle}
            </p>
          </div>
        </header>

        <div className="roadmap-intro">
          <p style={{ color: 'var(--text-primary)' }}>
            {intro.before}
            <Link
              to={intro.to}
              style={{ color: 'var(--purple-500)', textDecoration: 'underline' }}
            >
              {intro.linkText}
            </Link>
            {intro.after}
          </p>
        </div>

        <RoadmapSection bucketKey="coming-soon" items={getRoadmapItems('coming-soon')} />
        <RoadmapSection bucketKey="exploring" items={getRoadmapItems('exploring')} collapsible />

        <footer className="text-center pt-2">
          <p style={{ color: 'var(--text-secondary)' }}>
            {footer.before}
            <Link
              to={footer.to}
              style={{ color: 'var(--purple-500)', textDecoration: 'underline' }}
            >
              {footer.linkText}
            </Link>
          </p>
        </footer>
      </div>
    </div>
  );
}
