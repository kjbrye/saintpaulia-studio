/**
 * AncestorGrid - CSS Grid layout for ancestor pedigree tree.
 *
 * Displays up to 3 generations of ancestors in a right-to-left grid:
 *   Grandparents (4) → Parents (2) → Plant (1)
 *
 * Connecting lines use CSS pseudo-elements.
 */

import { useMemo } from 'react';
import PedigreeNode from './PedigreeNode';
import { buildAncestorTree } from '../../utils/lineage';

export default function AncestorGrid({ plantId, plantMap, generations = 3, onSelect }) {
  const tree = useMemo(
    () => buildAncestorTree(plantId, plantMap, generations),
    [plantId, plantMap, generations],
  );

  if (!tree) return null;

  // Flatten tree into generation columns
  const columns = [];
  flattenTree(tree, columns, 0);

  // Render up to 3 ancestor generations + the center plant
  const maxGen = Math.min(generations, 3);

  return (
    <div className="ancestor-grid-container overflow-x-auto">
      <div
        className="flex items-stretch gap-1"
        style={{ minWidth: maxGen >= 3 ? 700 : maxGen >= 2 ? 500 : 350 }}
      >
        {/* Ancestor generations (furthest first) */}
        {Array.from({ length: maxGen }, (_, i) => maxGen - i).map((gen) => (
          <div key={gen} className="flex flex-col justify-around gap-1 flex-1">
            <p className="text-center mb-1" style={{ fontSize: 10, color: 'var(--sage-400)' }}>
              {gen === 1 ? 'Parents' : gen === 2 ? 'Grandparents' : 'Great-grandparents'}
            </p>
            {getNodesAtDepth(tree, gen).map((node, idx) => (
              <div key={node.key} className="flex-1 flex items-center justify-center px-1">
                <PedigreeNode
                  plant={node.plant}
                  label={node.isUnknown ? node.label || 'Unknown' : node.role}
                  isUnknown={node.isUnknown && !node.label}
                  externalName={node.isUnknown && node.label ? node.label : undefined}
                  compact={gen >= 2}
                />
              </div>
            ))}
          </div>
        ))}

        {/* Center plant */}
        <div className="flex flex-col justify-center flex-1 px-1">
          <p className="text-center mb-1" style={{ fontSize: 10, color: 'var(--sage-400)' }}>
            Selected
          </p>
          <div className="flex items-center justify-center">
            <PedigreeNode plant={tree.plant} isCenter />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Get all nodes at a specific depth in the tree.
 * Depth 1 = parents, 2 = grandparents, 3 = great-grandparents.
 * Returns 2^depth nodes (with unknowns for missing branches).
 */
function getNodesAtDepth(tree, depth) {
  if (depth === 0) return [{ plant: tree.plant, role: '', key: tree.plant.id, isUnknown: false }];

  const nodes = [];
  collectAtDepth(tree, depth, 0, nodes, '');
  return nodes;
}

function collectAtDepth(node, targetDepth, currentDepth, results, path) {
  if (currentDepth === targetDepth) {
    // We should have arrived at this node's level
    return;
  }

  const nextDepth = currentDepth + 1;

  // Pod parent branch
  if (nextDepth === targetDepth) {
    if (node.podParent) {
      results.push({
        plant: node.podParent.plant,
        role: 'pod',
        key: `${path}pod-${node.podParent.plant.id}`,
        isUnknown: false,
      });
    } else {
      results.push({
        plant: {},
        role: 'pod',
        key: `${path}pod-unknown`,
        isUnknown: true,
        label: node.podParentName || 'Unknown',
      });
    }

    if (node.pollenParent) {
      results.push({
        plant: node.pollenParent.plant,
        role: 'pollen',
        key: `${path}pollen-${node.pollenParent.plant.id}`,
        isUnknown: false,
      });
    } else {
      results.push({
        plant: {},
        role: 'pollen',
        key: `${path}pollen-unknown`,
        isUnknown: true,
        label: node.pollenParentName || 'Unknown',
      });
    }
  } else {
    // Recurse deeper
    if (node.podParent) {
      collectAtDepth(node.podParent, targetDepth, nextDepth, results, `${path}pod-`);
    } else {
      // Fill with unknowns for all slots at target depth
      const slotsNeeded = Math.pow(2, targetDepth - nextDepth);
      for (let i = 0; i < slotsNeeded; i++) {
        results.push({
          plant: {},
          role: '',
          key: `${path}pod-unk-${i}`,
          isUnknown: true,
          label: 'Unknown',
        });
      }
    }

    if (node.pollenParent) {
      collectAtDepth(node.pollenParent, targetDepth, nextDepth, results, `${path}pollen-`);
    } else {
      const slotsNeeded = Math.pow(2, targetDepth - nextDepth);
      for (let i = 0; i < slotsNeeded; i++) {
        results.push({
          plant: {},
          role: '',
          key: `${path}pollen-unk-${i}`,
          isUnknown: true,
          label: 'Unknown',
        });
      }
    }
  }
}

function flattenTree(node, columns, depth) {
  if (!columns[depth]) columns[depth] = [];
  columns[depth].push(node);
  if (node.podParent) flattenTree(node.podParent, columns, depth + 1);
  if (node.pollenParent) flattenTree(node.pollenParent, columns, depth + 1);
}
