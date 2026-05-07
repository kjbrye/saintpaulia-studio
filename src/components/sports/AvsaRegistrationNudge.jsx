/**
 * AvsaRegistrationNudge - Gentle prompt suggesting the user consider AVSA
 * registration once a sport has been observed as stable.
 */

import { Award } from 'lucide-react';

const AVSA_REGISTRATION_URL =
  'https://africanvioletsocietyofamerica.org/participate/plant-registration/african-violet-sports/';

export default function AvsaRegistrationNudge() {
  return (
    <section
      className="card-subtle p-5 mb-6 flex items-start gap-3"
      style={{ borderLeft: '3px solid var(--copper-500)' }}
    >
      <Award size={20} style={{ color: 'var(--copper-500)', flexShrink: 0 }} />
      <div className="text-small">
        <p style={{ color: 'var(--sage-800)', fontWeight: 600 }}>This sport looks stable.</p>
        <p className="text-muted" style={{ marginTop: 4 }}>
          Consider giving it a working name or submitting it to the{' '}
          <a
            href={AVSA_REGISTRATION_URL}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'var(--copper-600)', textDecoration: 'underline' }}
          >
            AVSA sport registry
          </a>
          .
        </p>
      </div>
    </section>
  );
}
