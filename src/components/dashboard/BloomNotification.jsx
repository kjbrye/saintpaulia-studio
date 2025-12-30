/**
 * BloomNotification - Purple card for blooming plants
 */

import { Flower2 } from 'lucide-react';

export default function BloomNotification({ count, latestPlant }) {
  if (count === 0) return null;

  return (
    <div className="card-purple p-6 flex items-center gap-5">
      <div className="icon-container-purple">
        <Flower2 size={28} style={{ color: 'var(--purple-400)' }} />
      </div>
      <div>
        <p className="heading heading-md">
          {count} plant{count !== 1 ? 's are' : ' is'} blooming!
        </p>
        {latestPlant && (
          <p className="text-small text-muted mt-1">
            {latestPlant} started blooming recently
          </p>
        )}
      </div>
    </div>
  );
}
