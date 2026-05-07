/**
 * SportDetailHeader - Title row + parent link + delete control for SportDetail.
 */

import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2 } from 'lucide-react';

export default function SportDetailHeader({ sport, onDeleteClick }) {
  const navigate = useNavigate();

  const parentName =
    sport.parent_plant?.cultivar_name ||
    sport.parent_plant?.nickname ||
    sport.parent_cultivar_name ||
    'Unknown parent';
  const displayName = sport.registered_name || sport.working_name || 'Unnamed sport';

  return (
    <header className="flex items-start justify-between gap-3 mb-6">
      <div className="flex items-start gap-3 min-w-0">
        <button onClick={() => navigate('/sports')} className="icon-container">
          <ArrowLeft size={20} style={{ color: 'var(--sage-600)' }} />
        </button>
        <div className="min-w-0">
          <h1 className="heading heading-xl">{displayName}</h1>
          <p className="text-body text-muted">
            Sport of{' '}
            {sport.parent_plant ? (
              <Link
                to={`/plants/${sport.parent_plant.id}`}
                style={{ color: 'var(--purple-400)' }}
              >
                {parentName}
              </Link>
            ) : (
              <span style={{ color: 'var(--purple-400)' }}>{parentName}</span>
            )}
          </p>
        </div>
      </div>
      <button className="icon-container" onClick={onDeleteClick} title="Delete sport">
        <Trash2 size={18} style={{ color: 'var(--color-error)' }} />
      </button>
    </header>
  );
}
