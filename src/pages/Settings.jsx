/**
 * Settings Page
 *
 * Thin orchestrator: sidebar/tab navigation on the left, the active pane on the
 * right. The active pane is reflected in the URL (/settings/:pane) so panes are
 * linkable and the browser back button works.
 */

import { Link, Navigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { usePageTitle } from '../hooks/usePageTitle';
import SettingsNav from '../components/settings/SettingsNav';
import AccountPane from '../components/settings/panes/AccountPane';
import SubscriptionPane from '../components/settings/panes/SubscriptionPane';
import CarePane from '../components/settings/panes/CarePane';
import DisplayPane from '../components/settings/panes/DisplayPane';
import DataPane from '../components/settings/panes/DataPane';
import { SETTINGS_COPY, DEFAULT_PANE } from '../constants/settings';

const PANES = {
  account: AccountPane,
  subscription: SubscriptionPane,
  care: CarePane,
  display: DisplayPane,
  data: DataPane,
};

export default function Settings() {
  usePageTitle(SETTINGS_COPY.pageTitle);
  const { pane } = useParams();
  const activePane = pane || DEFAULT_PANE;

  // Unknown pane in the URL → fall back to the default pane.
  if (!PANES[activePane]) {
    return <Navigate to={`/settings/${DEFAULT_PANE}`} replace />;
  }

  const ActivePane = PANES[activePane];

  return (
    <div className="settings-root min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <header className="flex items-center gap-4 mb-8">
          <Link to="/">
            <button className="icon-container">
              <ArrowLeft size={20} color="var(--sage-600)" />
            </button>
          </Link>
          <h1 className="heading heading-xl">{SETTINGS_COPY.pageTitle}</h1>
        </header>

        <div className="md:grid md:grid-cols-[180px_1fr] md:gap-8">
          <SettingsNav activePane={activePane} />
          <div className="min-w-0">
            <ActivePane />
          </div>
        </div>
      </div>
    </div>
  );
}
