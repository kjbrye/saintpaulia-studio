/**
 * CollectionStatsPanel - Command center panel showing collection and bloom counts
 */

import { Link } from 'react-router-dom';
import { Flower2, Sparkles, ChevronRight } from 'lucide-react';

function StatRow({ icon: Icon, label, count, linkTo, iconColor }) {
  return (
    <Link to={linkTo} className="list-item-compact">
      <Icon size={16} style={{ color: iconColor }} />
      <span className="flex-1 text-small font-medium" style={{ color: 'var(--sage-700)' }}>
        {label}
      </span>
      <span className="font-semibold" style={{ color: 'var(--sage-800)' }}>
        {count}
      </span>
      <ChevronRight size={14} style={{ color: 'var(--sage-400)' }} />
    </Link>
  );
}

export default function NeedsAttentionPanel({ totalPlants = 0, bloomingCount = 0 }) {
  return (
    <div className="panel panel-stats">
      <div className="panel-header">
        <span className="panel-title">Collection</span>
      </div>
      <div className="panel-content">
        <StatRow
          icon={Flower2}
          label="Total plants"
          count={totalPlants}
          linkTo="/library"
          iconColor="var(--purple-500)"
        />
        <StatRow
          icon={Sparkles}
          label="Currently blooming"
          count={bloomingCount}
          linkTo="/library?filter=blooming"
          iconColor="var(--copper-500)"
        />
      </div>
      <div className="panel-footer">
        <Link
          to="/library"
          className="text-small font-semibold flex items-center gap-1"
          style={{ color: 'var(--copper-600)' }}
        >
          View full collection
          <ChevronRight size={14} />
        </Link>
      </div>
    </div>
  );
}
