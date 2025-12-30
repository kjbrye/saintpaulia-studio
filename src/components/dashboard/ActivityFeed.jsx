/**
 * ActivityFeed - Recent care activity list
 */

import { History } from 'lucide-react';
import ActivityItem from './ActivityItem';

export default function ActivityFeed({ activities = [], isLoading = false }) {
  // Empty state
  if (!isLoading && activities.length === 0) {
    return (
      <section className="card p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="icon-container icon-container-sm">
            <History size={16} style={{ color: 'var(--sage-600)' }} />
          </div>
          <h2 className="heading heading-md">Recent Activity</h2>
        </div>
        <div className="card-inset p-6 text-center">
          <p className="text-muted">No activity yet. Log your first care action!</p>
        </div>
      </section>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <section className="card p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="icon-container icon-container-sm">
            <History size={16} style={{ color: 'var(--sage-600)' }} />
          </div>
          <h2 className="heading heading-md">Recent Activity</h2>
        </div>
        <div className="card-inset p-6">
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center gap-3 animate-pulse">
                <div className="w-8 h-8 rounded-lg bg-[var(--sage-200)]" />
                <div className="flex-1">
                  <div className="h-4 bg-[var(--sage-200)] rounded w-3/4" />
                </div>
                <div className="h-3 bg-[var(--sage-200)] rounded w-12" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="card p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="icon-container icon-container-sm">
          <History size={16} style={{ color: 'var(--sage-600)' }} />
        </div>
        <h2 className="heading heading-md">Recent Activity</h2>
      </div>
      <div className="card-inset px-4">
        {activities.map(activity => (
          <ActivityItem key={activity.id} {...activity} />
        ))}
      </div>
    </section>
  );
}
