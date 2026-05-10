/**
 * User-facing copy for the lineage page. Centralized so wording can be
 * refined without hunting through components.
 */

export const PAGE_SUBTITLE = 'Explore pedigrees and family relationships';

export const SELECTOR_PLACEHOLDER = 'Select a plant to view its pedigree…';

export const STATS_LABELS = {
  generations: 'Generations deep',
  lineages: 'Lineages mapped',
  relationships: 'Relationships',
};

export const FEATURED_TITLE = 'Deepest pedigree';
export const FEATURED_VIEW_LINK = 'View full pedigree →';

export const FINDER_TITLE = 'Relationship Finder';
export const FINDER_PROMPT = 'Pick two plants to compare pedigrees and find relationships';
export const FINDER_VIEW_FULL = 'View full pedigrees →';

export const PEDIGREE_LABELS = {
  ancestors: 'Ancestors',
  focal: 'Focal plant',
  descendants: 'Descendants',
  clones: 'Clones · same genome',
};

export const PLANT_INFO_LINK = 'View plant detail →';

export const SCENARIO_COPY = {
  bothClonesOfSame: {
    eyebrow: 'Identical genome',
    headline: (sourceName) => `Both are clones of ${sourceName}`,
    explanation:
      'These plants are genetically identical. Crossing them would produce offspring equivalent to selfing the source plant.',
  },
  oneIsCloneOfOther: {
    eyebrow: 'Identical genome',
    headline: (cloneName, sourceName) => `${cloneName} is a clone of ${sourceName}`,
    explanation:
      'These plants share an identical genome. They cannot be meaningfully crossed with each other.',
  },
  cloneToRelated: {
    eyebrow: 'Routed through clone',
    explanation: (otherName, sourceName, role) =>
      `${otherName} shares its genome with ${sourceName}, who is the other plant's ${role}.`,
  },
};

/**
 * Classify a relationship by genealogical role labels. Pass the closest
 * common-ancestor distance pair (distA, distB) where 0 means the ancestor
 * IS the plant. Caller handles the clone-routed "Effectively" prefix.
 */
export function relationshipLabel({ distA, distB, sharedAncestorName }) {
  if (distA === 0 && distB === 1) return 'Parent–offspring';
  if (distA === 1 && distB === 0) return 'Parent–offspring';
  if (distA === 1 && distB === 1) return sharedAncestorName ? `Half-siblings via ${sharedAncestorName}` : 'Half-siblings';
  if (distA === 2 && distB === 2) return 'Cousins';
  if ((distA === 1 && distB === 2) || (distA === 2 && distB === 1)) return 'Aunt/uncle–niece/nephew';
  if (distA === 0 || distB === 0) return 'Direct lineage';
  const total = distA + distB;
  if (total <= 4) return sharedAncestorName ? `Related via ${sharedAncestorName}` : 'Related';
  return 'Distantly related';
}

export const UNRELATED_LABEL = 'Unrelated';

export const INBREEDING_LABEL = 'Inbreeding coefficient';
