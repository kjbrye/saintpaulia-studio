/**
 * MiniPedigree - Compact pedigree view for plant detail pages.
 * Shows parents and a link to the full lineage page.
 */

import { Link } from 'react-router-dom';
import { GitFork, HelpCircle, ChevronRight } from 'lucide-react';
import { formatPedigreeNotation } from '../../utils/lineage';

export default function MiniPedigree({ plant }) {
  const hasPodParent = plant.pod_parent_id || plant.pod_parent_name;
  const hasPollenParent = plant.pollen_parent_id || plant.pollen_parent_name;
  const hasLineage = hasPodParent || hasPollenParent;
  const hasDescendantPotential = true; // Always show link since other plants might reference this one

  if (!hasLineage) {
    return (
      <div className="card p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GitFork size={18} style={{ color: 'var(--purple-400)' }} />
            <h2 className="heading heading-md">Lineage</h2>
          </div>
          <Link to={`/lineage?plant=${plant.id}`}>
            <button className="btn btn-secondary btn-small">
              View Pedigree <ChevronRight size={14} />
            </button>
          </Link>
        </div>
        <p className="text-small text-muted mt-3">
          No lineage recorded. Edit this plant to add parent information, or view the pedigree page
          to explore relationships.
        </p>
      </div>
    );
  }

  const podName =
    plant.pod_parent?.cultivar_name ||
    plant.pod_parent?.nickname ||
    plant.pod_parent_name ||
    'Unknown';
  const pollenName =
    plant.pollen_parent?.cultivar_name ||
    plant.pollen_parent?.nickname ||
    plant.pollen_parent_name ||
    'Unknown';

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <GitFork size={18} style={{ color: 'var(--purple-400)' }} />
          <h2 className="heading heading-md">Lineage</h2>
          {plant.generation != null && (
            <span className="badge badge-purple">F{plant.generation}</span>
          )}
        </div>
        <Link to={`/lineage?plant=${plant.id}`}>
          <button className="btn btn-secondary btn-small">
            Full Pedigree <ChevronRight size={14} />
          </button>
        </Link>
      </div>

      {/* Mini parent display */}
      <div className="flex items-center gap-3">
        {/* Pod parent */}
        <ParentCard
          name={podName}
          label="Pod Parent"
          plantId={plant.pod_parent_id}
          isUnknown={!hasPodParent}
        />

        <span className="text-lg font-bold flex-shrink-0" style={{ color: 'var(--purple-400)' }}>
          ×
        </span>

        {/* Pollen parent */}
        <ParentCard
          name={pollenName}
          label="Pollen Parent"
          plantId={plant.pollen_parent_id}
          isUnknown={!hasPollenParent}
        />
      </div>

      {plant.hybridizer && (
        <p className="text-small text-muted mt-3">Hybridizer: {plant.hybridizer}</p>
      )}
    </div>
  );
}

function ParentCard({ name, label, plantId, isUnknown }) {
  const isExternal = isUnknown && name && name !== 'Unknown';

  const content = (
    <div
      className="flex-1 rounded-lg p-3"
      style={{
        background: isUnknown && !isExternal ? 'var(--sage-50)' : 'var(--sage-100)',
        border:
          isUnknown && !isExternal ? '1px dashed var(--sage-300)' : '1px solid var(--sage-200)',
      }}
    >
      <p style={{ fontSize: 10, color: 'var(--sage-500)' }}>
        {label}
        {isExternal ? ' (external)' : ''}
      </p>
      <p
        className="font-medium truncate"
        style={{
          color:
            isUnknown && !isExternal
              ? 'var(--sage-400)'
              : isExternal
                ? 'var(--sage-700)'
                : 'var(--sage-800)',
          fontSize: 13,
        }}
      >
        {isUnknown && !isExternal ? (
          <span className="flex items-center gap-1">
            <HelpCircle size={12} /> Unknown
          </span>
        ) : (
          name
        )}
      </p>
    </div>
  );

  if (plantId) {
    return (
      <Link to={`/plants/${plantId}`} className="flex-1 hover:opacity-80 transition-opacity">
        {content}
      </Link>
    );
  }

  return content;
}
