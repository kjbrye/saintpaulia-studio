/**
 * CollectionStatsPanel - Row-shaped panel showing collection and bloom counts
 */

import { Link } from 'react-router-dom';
import { Flower2, Leaf } from 'lucide-react';

export default function CollectionStatsPanel({ totalPlants = 0, bloomingCount = 0 }) {
  return (
    <div className="panel panel-stats-row">
      <div className="stats-row">
        <Link to="/library" className="stat-cell">
          <div className="stat-cell-icon stat-cell-icon-sage">
            <Leaf size={20} />
          </div>
          <div className="stat-cell-content">
            <span className="stat-cell-value">{totalPlants}</span>
            <span className="stat-cell-label">
              {totalPlants === 1 ? 'Plant' : 'Plants'}
            </span>
          </div>
        </Link>

        <div className="stats-row-divider" />

        <Link to="/library?filter=blooming" className="stat-cell">
          <div className="stat-cell-icon stat-cell-icon-purple">
            <Flower2 size={20} />
          </div>
          <div className="stat-cell-content">
            <span className="stat-cell-value stat-cell-value-purple">{bloomingCount}</span>
            <span className="stat-cell-label">
              Blooming
            </span>
          </div>
        </Link>
      </div>
    </div>
  );
}
