/**
 * Lineage Page - Full pedigree exploration with tree view and relationship finder.
 */

import { useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, GitFork, Pencil } from 'lucide-react';
import { usePlants } from '../hooks/usePlants';
import {
  useAncestors,
  useUpdateLineage,
  useTraitObservations,
  useCreateTraitObservation,
  useDeleteTraitObservation,
} from '../hooks/useLineage';
import HeaderBar from '../components/ui/HeaderBar';
import {
  PedigreeTree,
  LineageEditor,
  RelationshipFinder,
  TraitInheritance,
} from '../components/lineage';
import PremiumGate from '../components/ui/PremiumGate';
import { usePageTitle } from '../hooks/usePageTitle';

export default function Lineage() {
  usePageTitle('Lineage');
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedId = searchParams.get('plant') || '';
  const [editing, setEditing] = useState(false);

  const { data: plants = [], isLoading: plantsLoading } = usePlants();
  const { data: ancestors = [], isLoading: ancestorsLoading } = useAncestors(selectedId, 4);
  const { data: traits = [], isLoading: traitsLoading } = useTraitObservations(selectedId);
  const updateLineage = useUpdateLineage();
  const createTrait = useCreateTraitObservation();
  const deleteTrait = useDeleteTraitObservation();

  const plantMap = useMemo(() => {
    const map = new Map();
    for (const p of plants) map.set(p.id, p);
    for (const p of ancestors) map.set(p.id, p);
    return map;
  }, [plants, ancestors]);

  const selectedPlant = plantMap.get(selectedId);

  const handleSelectPlant = (id) => {
    setSearchParams(id ? { plant: id } : {});
    setEditing(false);
  };

  const handleSaveLineage = async (lineageData) => {
    await updateLineage.mutateAsync({ id: selectedId, lineageData });
    setEditing(false);
  };

  return (
    <div className="min-h-screen">
      <HeaderBar />
      <PremiumGate feature="lineage">
      <main className="p-4 md:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <header className="flex items-center gap-4 mb-6">
            <Link to="/breeding">
              <button type="button" className="icon-container">
                <ArrowLeft size={20} style={{ color: 'var(--sage-600)' }} />
              </button>
            </Link>
            <div className="flex-1">
              <h1 className="heading heading-xl">Plant Lineage</h1>
              <p className="text-body text-muted">Explore pedigrees and family relationships</p>
            </div>
          </header>

          {/* Plant selector */}
          <div className="card p-4 mb-6">
            <div className="flex items-center gap-3">
              <GitFork size={18} style={{ color: 'var(--purple-400)', flexShrink: 0 }} />
              <select
                className="input flex-1"
                value={selectedId}
                onChange={(e) => handleSelectPlant(e.target.value)}
              >
                <option value="">Select a plant to view pedigree...</option>
                {plants.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.cultivar_name || p.nickname || 'Unnamed'}
                    {p.generation != null ? ` (F${p.generation})` : ''}
                  </option>
                ))}
              </select>
              {selectedId && !editing && (
                <button className="btn btn-secondary btn-small" onClick={() => setEditing(true)}>
                  <Pencil size={14} /> Edit Lineage
                </button>
              )}
            </div>
          </div>

          {plantsLoading && (
            <p className="text-small text-muted text-center py-8">Loading plants...</p>
          )}

          {/* Lineage editor */}
          {editing && selectedPlant && (
            <div className="card p-6 mb-6">
              <h2 className="heading heading-md mb-4">Edit Lineage</h2>
              <LineageEditor
                plant={selectedPlant}
                plants={plants}
                onSave={handleSaveLineage}
                isPending={updateLineage.isPending}
                onCancel={() => setEditing(false)}
              />
            </div>
          )}

          {/* Pedigree tree */}
          {selectedId && !editing && (
            <>
              <PedigreeTree
                plantId={selectedId}
                ancestorPlants={ancestors}
                allPlants={plants}
                isLoading={ancestorsLoading}
              />

              {/* Trait inheritance */}
              <div className="mt-4">
                <TraitInheritance
                  plantId={selectedId}
                  traits={traits}
                  onCreate={createTrait.mutateAsync}
                  onDelete={(traitId) => deleteTrait.mutate({ id: traitId, plantId: selectedId })}
                  isLoading={traitsLoading}
                  isPending={createTrait.isPending || deleteTrait.isPending}
                />
              </div>
            </>
          )}

          {/* Relationship finder (always visible when plants loaded) */}
          {plants.length >= 2 && (
            <div className="mt-6">
              <RelationshipFinder plants={plants} plantMap={plantMap} />
            </div>
          )}

          {/* Empty state */}
          {!plantsLoading && !selectedId && plants.length === 0 && (
            <div className="panel p-10 text-center">
              <GitFork size={48} style={{ color: 'var(--purple-400)', margin: '0 auto 16px' }} />
              <h2 className="heading heading-lg mb-2">No plants yet</h2>
              <p className="text-muted mb-6">
                Add plants to your library to start exploring lineage.
              </p>
              <Link to="/plants/new">
                <button className="btn btn-primary">Add Your First Plant</button>
              </Link>
            </div>
          )}
        </div>
      </main>
      </PremiumGate>
    </div>
  );
}
