/**
 * SportCard - List card for a single sport. Click to open detail.
 */

import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { format } from 'date-fns';
import StabilityIndicator from './StabilityIndicator';
import SportDescriptionPreview from './SportDescriptionPreview';

export default function SportCard({ sport }) {
  const parentName =
    sport.parent_plant?.cultivar_name ||
    sport.parent_plant?.nickname ||
    sport.parent_cultivar_name ||
    'Unknown parent';

  const displayName = sport.registered_name || sport.working_name || 'Unnamed sport';

  return (
    <Link to={`/sports/${sport.id}`} className="block card-subtle p-5">
      <div className="flex items-start gap-4">
        <div className="icon-container-purple" style={{ width: 44, height: 44 }}>
          <Sparkles size={20} style={{ color: 'var(--purple-500)' }} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3
                className="heading heading-sm"
                style={{ color: 'var(--sage-800)' }}
              >
                {displayName}
              </h3>
              <p className="text-small text-muted">
                Sport of <span style={{ color: 'var(--purple-400)' }}>{parentName}</span>
              </p>
            </div>
            <StabilityIndicator
              status={sport.stability_status}
              showPercentage={false}
              size="sm"
            />
          </div>

          <div className="mt-3">
            <SportDescriptionPreview
              sport={sport}
              placeholder="No description yet"
            />
          </div>

          <p className="text-small text-muted mt-2">
            Discovered {format(new Date(sport.discovered_date), 'MMM d, yyyy')}
            {sport.avsa_registration_number && (
              <span style={{ color: 'var(--copper-600)' }}>
                {' '}
                · AVSA #{sport.avsa_registration_number}
              </span>
            )}
          </p>
        </div>
      </div>
    </Link>
  );
}
