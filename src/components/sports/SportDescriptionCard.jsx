/**
 * SportDescriptionCard - The "canonical description" hero card on SportDetail.
 *
 * Renders the assembled AVSA-style description plus discovery / registration
 * metadata. Pure display.
 */

import { Sparkles } from 'lucide-react';
import { format } from 'date-fns';
import SportDescriptionPreview from './SportDescriptionPreview';

export default function SportDescriptionCard({ sport }) {
  return (
    <section className="card-purple p-6 mb-6">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles size={16} style={{ color: 'var(--purple-500)' }} />
        <span className="text-label" style={{ color: 'var(--purple-500)' }}>
          Canonical description
        </span>
      </div>
      <SportDescriptionPreview
        sport={sport}
        placeholder="No structured description yet — edit the sport to assemble one."
      />
      <p className="text-small text-muted mt-3">
        Discovered {format(new Date(sport.discovered_date), 'MMMM d, yyyy')}
        {sport.discovered_by ? ` by ${sport.discovered_by}` : ''}
        {sport.avsa_registration_number && (
          <>
            {' · '}
            <span style={{ color: 'var(--copper-600)' }}>
              AVSA #{sport.avsa_registration_number}
            </span>
          </>
        )}
      </p>
    </section>
  );
}
