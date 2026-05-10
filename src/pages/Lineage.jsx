/**
 * Lineage Page
 *
 * Default state shows collection-wide pedigree stats, the deepest pedigree
 * featured as a preview, and the Relationship Finder.
 *
 * Selecting a plant swaps the upper sections for a hybrid pedigree (ancestors
 * → focal → descendants) plus a separate clone ribbon and a small plant-info
 * card. The Relationship Finder stays available at the bottom of the page.
 */

import { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ChevronDown, GitFork } from 'lucide-react';
import { useLineageGraph } from '../hooks/useLineage';
import HeaderBar from '../components/ui/HeaderBar';
import {
  CollectionStatsHero,
  FeaturedPedigree,
  HybridPedigree,
  CloneRibbon,
  PlantInfoCard,
  RelationshipFinder,
} from '../components/lineage';
import PremiumGate from '../components/ui/PremiumGate';
import { usePageTitle } from '../hooks/usePageTitle';
import {
  computeCollectionStats,
  findDeepestPedigree,
} from '../utils/lineage';
import { findClonesOf } from '../utils/lineageResolution';
import { PAGE_SUBTITLE, SELECTOR_PLACEHOLDER } from '../constants/lineageCopy';

export default function Lineage() {
  usePageTitle('Lineage');
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedId = searchParams.get('plant') || '';

  const { data: plants = [], isLoading } = useLineageGraph();

  const plantMap = useMemo(() => new Map(plants.map((p) => [p.id, p])), [plants]);
  const selectedPlant = selectedId ? plantMap.get(selectedId) : null;

  const stats = useMemo(() => computeCollectionStats(plants), [plants]);
  const featured = useMemo(() => findDeepestPedigree(plants), [plants]);
  const clones = useMemo(
    () => (selectedPlant ? findClonesOf(selectedPlant.id, plants) : []),
    [selectedPlant, plants],
  );

  const handleSelectPlant = (id) => {
    setSearchParams(id ? { plant: id } : {});
  };

  const sortedPlants = useMemo(
    () =>
      [...plants].sort((a, b) => {
        const an = a.cultivar_name || a.nickname || '';
        const bn = b.cultivar_name || b.nickname || '';
        return an.localeCompare(bn);
      }),
    [plants],
  );

  return (
    <div className="min-h-screen">
      <HeaderBar />
      <PremiumGate feature="lineage">
        <main className="p-4 md:p-6 lg:p-8">
          <div className="max-w-4xl mx-auto">
            <header className="flex items-center gap-4 mb-2">
              <Link to="/breeding">
                <button type="button" className="icon-container">
                  <ArrowLeft size={20} style={{ color: 'var(--sage-600)' }} />
                </button>
              </Link>
              <div className="flex-1">
                <h1
                  className="heading heading-xl"
                  style={{ fontFamily: 'Cormorant Garamond, serif' }}
                >
                  Plant Lineage
                </h1>
              </div>
            </header>
            <p
              className="mb-6 ml-14"
              style={{
                fontFamily: 'Cormorant Garamond, serif',
                fontStyle: 'italic',
                color: 'var(--purple-500)',
                fontSize: 15,
              }}
            >
              {PAGE_SUBTITLE}
            </p>

            <div className="card p-4 mb-6">
              <div className="flex items-center gap-3">
                <GitFork size={18} style={{ color: 'var(--purple-400)', flexShrink: 0 }} />
                <select
                  className="input flex-1"
                  value={selectedId}
                  onChange={(e) => handleSelectPlant(e.target.value)}
                >
                  <option value="">{SELECTOR_PLACEHOLDER}</option>
                  {sortedPlants.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.cultivar_name || p.nickname || 'Unnamed'}
                      {p.generation != null ? ` (F${p.generation})` : ''}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={16}
                  style={{ color: 'var(--sage-500)', flexShrink: 0 }}
                />
              </div>
            </div>

            {isLoading && (
              <p className="text-small text-muted text-center py-8">Loading lineage…</p>
            )}

            {!isLoading && !selectedPlant && (
              <div className="space-y-6">
                <CollectionStatsHero stats={stats} />
                {featured && featured.depth > 0 && (
                  <FeaturedPedigree featured={featured} plantMap={plantMap} />
                )}
                {plants.length >= 2 && (
                  <RelationshipFinder plants={sortedPlants} plantMap={plantMap} />
                )}
                {!isLoading && plants.length === 0 && (
                  <div className="panel p-10 text-center">
                    <GitFork
                      size={48}
                      style={{ color: 'var(--purple-400)', margin: '0 auto 16px' }}
                    />
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
            )}

            {!isLoading && selectedPlant && (
              <div className="space-y-6">
                <div>
                  <HybridPedigree
                    plant={selectedPlant}
                    plantMap={plantMap}
                    allPlants={plants}
                  />
                  <CloneRibbon clones={clones} />
                </div>
                <PlantInfoCard plant={selectedPlant} />
                {plants.length >= 2 && (
                  <RelationshipFinder plants={sortedPlants} plantMap={plantMap} />
                )}
              </div>
            )}
          </div>
        </main>
      </PremiumGate>
    </div>
  );
}
