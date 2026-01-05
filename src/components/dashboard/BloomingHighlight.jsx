/**
 * BloomingHighlight - Celebratory section for blooming plants
 * Only renders if plants are currently blooming
 */

import { Sparkles } from 'lucide-react';

function formatBloomingNames(bloomingPlants) {
  if (bloomingPlants.length === 0) return null;

  const names = bloomingPlants.map(p => p.nickname || p.cultivar_name || 'A plant');

  if (names.length === 1) {
    return `${names[0]} is blooming!`;
  }

  if (names.length === 2) {
    return `${names[0]} and ${names[1]} are blooming!`;
  }

  // More than 2: show first 2 + overflow
  const overflow = names.length - 2;
  return `${names[0]}, ${names[1]} +${overflow} more are blooming!`;
}

export default function BloomingHighlight({ bloomingPlants = [] }) {
  if (bloomingPlants.length === 0) return null;

  return (
    <section className="card-purple p-10">
      <div className="flex items-center gap-8">
        {/* Icon */}
        <div className="icon-container-purple flex-shrink-0" style={{ width: 64, height: 64 }}>
          <Sparkles size={32} style={{ color: 'var(--purple-400)' }} />
        </div>

        {/* Content */}
        <div className="flex-1">
          <p className="text-5xl font-bold text-[var(--purple-500)]" style={{ fontFamily: 'var(--font-heading)' }}>{bloomingPlants.length}</p>
          <p className="text-body text-[var(--purple-600)] mt-1">
            {formatBloomingNames(bloomingPlants)}
          </p>
        </div>
      </div>
    </section>
  );
}
