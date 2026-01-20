/**
 * QuickActionsPanel - Command center panel with primary navigation actions
 */

import { Link } from 'react-router-dom';
import { BookOpen, Droplets, Plus, BarChart3 } from 'lucide-react';

export default function QuickActionsPanel() {
  return (
    <div className="panel">
      <div className="panel-header">
        <span className="panel-title">Quick Actions</span>
      </div>
      <div className="panel-content space-y-3">
        <Link to="/plants/new" className="quick-action-btn quick-action-btn-primary w-full">
          <Plus size={18} />
          <span className="flex-1 text-left">Add Plant</span>
          <span className="kbd">N</span>
        </Link>
        <Link to="/library" className="quick-action-btn w-full">
          <BookOpen size={18} />
          <span className="flex-1 text-left">Library</span>
          <span className="kbd">L</span>
        </Link>
        <Link to="/care" className="quick-action-btn w-full">
          <Droplets size={18} />
          <span className="flex-1 text-left">Care Log</span>
          <span className="kbd">C</span>
        </Link>
      </div>
      <div className="panel-footer">
        <p className="text-small text-muted">
          Press <span className="kbd">K</span> to search
        </p>
      </div>
    </div>
  );
}
