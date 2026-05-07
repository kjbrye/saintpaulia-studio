/**
 * SportsEmptyState - Empty state shown on the Sports list page.
 */

import { Link } from 'react-router-dom';
import { Plus, Sparkles } from 'lucide-react';

export default function SportsEmptyState({ filtered }) {
  if (filtered) {
    return (
      <div className="panel p-8 text-center">
        <p className="heading heading-md mb-2">No sports match these filters</p>
        <p className="text-muted">Try clearing the stability or parent filter.</p>
      </div>
    );
  }
  return (
    <div className="panel p-10 text-center">
      <div
        className="w-16 h-16 rounded-xl mx-auto mb-4 flex items-center justify-center"
        style={{ background: 'var(--purple-100)' }}
      >
        <Sparkles size={32} style={{ color: 'var(--purple-400)' }} />
      </div>
      <h2 className="heading heading-lg mb-2">No sports yet</h2>
      <p className="text-muted mb-6 max-w-md mx-auto">
        When a plant blooms or grows in a way that differs from its description, log it here.
        Repeated observations help you decide whether the trait is stable enough to propagate.
      </p>
      <Link to="/sports/new">
        <button className="btn btn-primary">
          <Plus size={18} /> Register a sport
        </button>
      </Link>
    </div>
  );
}
