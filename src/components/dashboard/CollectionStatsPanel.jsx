/**
 * CollectionStatsPanel - Full-width stat rows for collection and bloom counts
 */

import { Link } from 'react-router-dom';
import { Flower2, Leaf } from 'lucide-react';

export default function CollectionStatsPanel({ totalPlants = 0, bloomingCount = 0 }) {
  return (
    <div className="stats-rows-container">
      <Link to="/library" className="stat-row">
        <div className="stat-row-icon stat-row-icon-sage">
          <Leaf size={18} />
        </div>
        <span className="stat-row-label">Collection</span>
        <span className="stat-row-value">{totalPlants}</span>
      </Link>

      <Link to="/library?filter=blooming" className="stat-row stat-row-purple">
        <div className="stat-row-icon stat-row-icon-purple">
          <Flower2 size={18} />
        </div>
        <span className="stat-row-label">Blooming</span>
        <span className="stat-row-value">{bloomingCount}</span>
      </Link>
    </div>
  );
}
