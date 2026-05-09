/**
 * CrossFilterBar — stage / parent / sort controls for the breeding list page.
 * Parent filter matches either pod or pollen parent.
 */

import { BREEDING_STAGES, ACTIVE_STAGE_KEYS } from '../../utils/breedingStages';

export const SORT_OPTIONS = [
  { value: 'oldest', label: 'Oldest first' },
  { value: 'newest', label: 'Newest first' },
  { value: 'stage', label: 'By stage' },
  { value: 'parent', label: 'By parent' },
];

export default function CrossFilterBar({
  stage,
  onStageChange,
  parentId,
  onParentChange,
  parentOptions = [],
  sortBy,
  onSortChange,
}) {
  return (
    <div className="flex flex-wrap items-center gap-3 mb-5">
      <select className="input" value={stage} onChange={(e) => onStageChange(e.target.value)}>
        <option value="all">All stages</option>
        {BREEDING_STAGES.filter((s) => ACTIVE_STAGE_KEYS.includes(s.key)).map((s) => (
          <option key={s.key} value={s.key}>
            {s.label}
          </option>
        ))}
      </select>

      <select
        className="input"
        value={parentId}
        onChange={(e) => onParentChange(e.target.value)}
      >
        <option value="all">All parents</option>
        {parentOptions.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>

      <div className="flex-1" />

      <select className="input" value={sortBy} onChange={(e) => onSortChange(e.target.value)}>
        {SORT_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            Sort: {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
