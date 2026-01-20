/**
 * RecentActivityPanel - Command center panel showing recent care activity
 */

import { Link } from 'react-router-dom';
import { Droplets, Sparkles, Scissors, ChevronRight, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const CARE_ICONS = {
  watering: Droplets,
  fertilizing: Sparkles,
  grooming: Scissors,
};

const CARE_COLORS = {
  watering: 'var(--sage-600)',
  fertilizing: 'var(--purple-400)',
  grooming: 'var(--copper-500)',
};

function ActivityItem({ log }) {
  const Icon = CARE_ICONS[log.care_type] || Droplets;
  const color = CARE_COLORS[log.care_type] || 'var(--sage-600)';
  const plantName = log.plants?.nickname || log.plants?.cultivar_name || 'Plant';
  const timeAgo = formatDistanceToNow(new Date(log.care_date), { addSuffix: true });

  return (
    <Link to={`/plants/${log.plant_id}`} className="list-item-compact">
      <Icon size={16} style={{ color }} />
      <div className="flex-1 min-w-0">
        <p className="text-small font-medium truncate" style={{ color: 'var(--sage-700)' }}>
          {plantName}
        </p>
        <p className="text-small text-muted truncate">
          {log.care_type} {timeAgo}
        </p>
      </div>
    </Link>
  );
}

export default function RecentActivityPanel({ careLogs = [], isLoading = false }) {
  if (isLoading) {
    return (
      <div className="panel panel-wide">
        <div className="panel-header">
          <span className="panel-title">Recent Activity</span>
        </div>
        <div className="panel-content flex items-center justify-center py-8">
          <p className="text-small text-muted">Loading...</p>
        </div>
      </div>
    );
  }

  if (careLogs.length === 0) {
    return (
      <div className="panel panel-wide">
        <div className="panel-header">
          <span className="panel-title">Recent Activity</span>
        </div>
        <div className="panel-content flex items-center justify-center py-6">
          <div className="text-center">
            <Clock size={24} style={{ color: 'var(--sage-400)', margin: '0 auto 8px' }} />
            <p className="text-small text-muted">No recent activity</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="panel panel-wide">
      <div className="panel-header">
        <span className="panel-title">Recent Activity</span>
      </div>
      <div className="panel-content">
        {careLogs.slice(0, 5).map(log => (
          <ActivityItem key={log.id} log={log} />
        ))}
      </div>
      <div className="panel-footer">
        <Link
          to="/care"
          className="text-small font-semibold flex items-center gap-1"
          style={{ color: 'var(--sage-600)' }}
        >
          View all activity
          <ChevronRight size={14} />
        </Link>
      </div>
    </div>
  );
}
