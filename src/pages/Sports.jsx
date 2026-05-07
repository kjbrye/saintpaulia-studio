/**
 * Sports Page - List of bloom and foliage variations observed in the collection.
 */

import { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Plus } from 'lucide-react';
import { useSports } from '../hooks/useSports';
import HeaderBar from '../components/ui/HeaderBar';
import PremiumGate from '../components/ui/PremiumGate';
import { SportCard, SportsFilterBar, SportsEmptyState } from '../components/sports';
import { usePageTitle } from '../hooks/usePageTitle';

export default function Sports() {
  usePageTitle('Sports');
  const [searchParams, setSearchParams] = useSearchParams();
  const stabilityFilter = searchParams.get('stability') || 'all';
  const parentFilter = searchParams.get('parent') || '';

  const { data: sports = [], isLoading, error } = useSports();

  const parentOptions = useMemo(() => {
    const map = new Map();
    for (const s of sports) {
      const id = s.parent_plant?.id || `text:${s.parent_cultivar_name || 'Unknown'}`;
      const label =
        s.parent_plant?.cultivar_name ||
        s.parent_plant?.nickname ||
        s.parent_cultivar_name ||
        'Unknown';
      if (!map.has(id)) map.set(id, label);
    }
    return Array.from(map.entries()).map(([value, label]) => ({ value, label }));
  }, [sports]);

  const filtered = useMemo(() => {
    return sports.filter((s) => {
      if (stabilityFilter !== 'all' && s.stability_status !== stabilityFilter) return false;
      if (parentFilter) {
        const matches =
          s.parent_plant?.id === parentFilter ||
          (parentFilter.startsWith('text:') &&
            s.parent_cultivar_name === parentFilter.slice(5));
        if (!matches) return false;
      }
      return true;
    });
  }, [sports, stabilityFilter, parentFilter]);

  const setFilter = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (!value || value === 'all') next.delete(key);
    else next.set(key, value);
    setSearchParams(next);
  };

  return (
    <div className="min-h-screen">
      <HeaderBar />
      <PremiumGate feature="sports">
        <main className="p-4 md:p-6 lg:p-8">
          <div className="max-w-3xl mx-auto">
            <header className="flex items-center gap-4 mb-6">
              <Link to="/">
                <button type="button" className="icon-container">
                  <ArrowLeft size={20} style={{ color: 'var(--sage-600)' }} />
                </button>
              </Link>
              <div className="flex-1">
                <h1 className="heading heading-xl">Sports</h1>
                <p className="text-body text-muted">
                  Your record of bloom and foliage variations observed in your collection.
                </p>
              </div>
              <Link to="/sports/new">
                <button className="btn btn-primary">
                  <Plus size={18} />
                  New sport
                </button>
              </Link>
            </header>

            {sports.length > 0 && (
              <SportsFilterBar
                stabilityFilter={stabilityFilter}
                parentFilter={parentFilter}
                parentOptions={parentOptions}
                onChange={setFilter}
                onClear={() => setSearchParams({})}
              />
            )}

            {isLoading ? (
              <p className="text-muted text-center p-8">Loading sports…</p>
            ) : error ? (
              <div className="panel p-8 text-center">
                <p className="heading heading-lg mb-2">Failed to load</p>
                <p className="text-muted">{error.message}</p>
              </div>
            ) : filtered.length === 0 ? (
              <SportsEmptyState filtered={sports.length > 0} />
            ) : (
              <div className="space-y-3">
                {filtered.map((sport) => (
                  <SportCard key={sport.id} sport={sport} />
                ))}
              </div>
            )}
          </div>
        </main>
      </PremiumGate>
    </div>
  );
}
