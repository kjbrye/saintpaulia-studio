/**
 * LineageBadge - Surfaces sports descended from a plant.
 *
 * Drop into a plant detail layout: if the plant has any logged sports, render a
 * small purple badge linking to /sports?parent={plantId}. Returns null if no
 * sports — safe to mount unconditionally.
 */

import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { useSportsByParent } from '../../hooks/useSports';

export default function LineageBadge({ plantId }) {
  const { data: sports = [] } = useSportsByParent(plantId);
  if (!sports.length) return null;

  const count = sports.length;
  const label = count === 1 ? '1 sport' : `${count} sports`;

  return (
    <Link
      to={`/sports?parent=${plantId}`}
      className="badge badge-purple"
      title="Sports descended from this plant"
    >
      <Sparkles size={12} />
      {label}
    </Link>
  );
}
