/**
 * CareLog Page - View all recent care activity across the collection
 */

import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Droplets, Scissors, Sparkles, Flower2, Search } from 'lucide-react';
import { useRecentCareLogs } from '../hooks/useCare';
import { usePlants } from '../hooks/usePlants';
import { CareLogItem } from '../components/care';

const FILTER_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'watering', label: 'Watering', icon: Droplets },
  { value: 'fertilizing', label: 'Fertilizing', icon: Sparkles },
  { value: 'grooming', label: 'Grooming', icon: Scissors },
  { value: 'repotting', label: 'Repotting', icon: Flower2 },
];

export default function CareLog() {
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: careLogs = [], isLoading } = useRecentCareLogs(100);
  const { data: plants = [] } = usePlants();

  // Create plant lookup map
  const plantMap = useMemo(() => {
    return plants.reduce((acc, plant) => {
      acc[plant.id] = plant;
      return acc;
    }, {});
  }, [plants]);

  // Filter and search logs
  const filteredLogs = useMemo(() => {
    let result = careLogs;

    // Filter by care type
    if (filter !== 'all') {
      result = result.filter((log) => log.care_type === filter);
    }

    // Search by plant name
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter((log) => {
        const plant = plantMap[log.plant_id];
        if (!plant) return false;
        return (
          plant.nickname?.toLowerCase().includes(query) ||
          plant.cultivar_name?.toLowerCase().includes(query)
        );
      });
    }

    return result;
  }, [careLogs, filter, searchQuery, plantMap]);

  // Group logs by date
  const groupedLogs = useMemo(() => {
    const groups = {};
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();

    filteredLogs.forEach((log) => {
      const logDate = new Date(log.care_date).toDateString();
      let groupKey;

      if (logDate === today) {
        groupKey = 'Today';
      } else if (logDate === yesterday) {
        groupKey = 'Yesterday';
      } else {
        groupKey = new Date(log.care_date).toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
        });
      }

      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(log);
    });

    return groups;
  }, [filteredLogs]);

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <header className="flex items-center gap-4 mb-8">
          <Link to="/">
            <button className="icon-container">
              <ArrowLeft size={20} style={{ color: 'var(--sage-600)' }} />
            </button>
          </Link>
          <h1 className="heading heading-xl">Care Log</h1>
        </header>

        {/* Filters */}
        <div className="card p-4 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            {/* Care Type Filters */}
            <div className="flex gap-2 flex-wrap">
              {FILTER_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setFilter(option.value)}
                  className="px-4 py-2 rounded-xl text-small font-semibold transition-all"
                  style={{
                    background:
                      filter === option.value
                        ? 'var(--sage-600)'
                        : 'var(--sage-100)',
                    color:
                      filter === option.value ? 'white' : 'var(--sage-600)',
                    boxShadow:
                      filter === option.value
                        ? 'var(--shadow-sage-primary)'
                        : 'none',
                  }}
                >
                  {option.label}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="flex-1 min-w-[200px] relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2"
                style={{ color: 'var(--sage-400)' }}
              />
              <input
                type="text"
                placeholder="Search by plant..."
                className="input w-full py-2 text-small"
                style={{ paddingLeft: '40px' }}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Care Logs */}
        {isLoading ? (
          <div className="card p-8 text-center">
            <p className="text-muted">Loading care history...</p>
          </div>
        ) : Object.keys(groupedLogs).length === 0 ? (
          <div className="card p-8 text-center">
            <div
              className="icon-container mx-auto mb-4"
              style={{ width: 64, height: 64 }}
            >
              <Droplets size={32} style={{ color: 'var(--sage-400)' }} />
            </div>
            <h2 className="heading heading-lg mb-2">No care logs found</h2>
            <p className="text-muted">
              {filter !== 'all' || searchQuery
                ? 'Try adjusting your filters'
                : 'Start logging care from your plant pages'}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedLogs).map(([date, logs]) => (
              <section key={date}>
                <h3 className="text-label mb-3">{date}</h3>
                <div className="card p-4">
                  <div
                    className="divide-y"
                    style={{ borderColor: 'var(--sage-200)' }}
                  >
                    {logs.map((log) => {
                      const plant = plantMap[log.plant_id];
                      return (
                        <Link
                          key={log.id}
                          to={`/plants/${log.plant_id}`}
                          className="block hover:bg-[var(--sage-100)] -mx-4 px-4 transition-colors rounded-lg"
                        >
                          <CareLogItem
                            log={log}
                            showPlantName
                            plantName={
                              plant?.nickname || plant?.cultivar_name
                            }
                          />
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
