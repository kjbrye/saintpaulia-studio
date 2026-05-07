/**
 * StabilityCard - Header section above the observation list, summarizing
 * stability counts and exposing the "add observation" CTA.
 */

import { Plus } from 'lucide-react';
import StabilityIndicator from './StabilityIndicator';

export default function StabilityCard({ stats, observations, onAddObservation }) {
  return (
    <section className="card p-6 mb-6">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="heading heading-md">Stability</h2>
          <p className="text-small text-muted">
            {stats.totalCount === 0
              ? 'Log an observation each bloom cycle to track stability.'
              : `${stats.stableCount} of ${stats.totalCount} cycles held the trait.`}
          </p>
        </div>
        <StabilityIndicator status={stats.suggestedStatus} observations={observations} />
      </div>
      <button className="btn btn-primary btn-small" onClick={onAddObservation}>
        <Plus size={14} /> Add observation
      </button>
    </section>
  );
}
