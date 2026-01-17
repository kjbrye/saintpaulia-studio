/**
 * CareLog Page - View all recent care activity across the collection
 */

import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Droplets, Scissors, Sparkles, Flower2, Search, ArrowUpDown, Calendar, ChevronDown } from 'lucide-react';
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

const SORT_OPTIONS = [
  { value: 'date-desc', label: 'Newest First' },
  { value: 'date-asc', label: 'Oldest First' },
  { value: 'care-type', label: 'Care Type' },
  { value: 'plant-name', label: 'Plant Name' },
];

export default function CareLog() {
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlantId, setSelectedPlantId] = useState('all');
  const [sortBy, setSortBy] = useState('date-desc');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const { data: careLogs = [], isLoading } = useRecentCareLogs(100);
  const { data: plants = [] } = usePlants();

  // Sort plants alphabetically for the dropdown
  const sortedPlants = useMemo(() => {
    return [...plants].sort((a, b) => {
      const nameA = a.nickname || a.cultivar_name || '';
      const nameB = b.nickname || b.cultivar_name || '';
      return nameA.localeCompare(nameB);
    });
  }, [plants]);

  // Create plant lookup map
  const plantMap = useMemo(() => {
    return plants.reduce((acc, plant) => {
      acc[plant.id] = plant;
      return acc;
    }, {});
  }, [plants]);

  // Filter, search, and sort logs
  const filteredLogs = useMemo(() => {
    let result = careLogs;

    // Filter by care type
    if (filter !== 'all') {
      result = result.filter((log) => log.care_type === filter);
    }

    // Filter by selected plant
    if (selectedPlantId !== 'all') {
      result = result.filter((log) => log.plant_id === selectedPlantId);
    }

    // Filter by date range
    if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      result = result.filter((log) => new Date(log.care_date) >= start);
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      result = result.filter((log) => new Date(log.care_date) <= end);
    }

    // Search by plant name (additional text search)
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

    // Sort results
    result = [...result].sort((a, b) => {
      switch (sortBy) {
        case 'date-asc':
          return new Date(a.care_date) - new Date(b.care_date);
        case 'date-desc':
          return new Date(b.care_date) - new Date(a.care_date);
        case 'care-type':
          return a.care_type.localeCompare(b.care_type);
        case 'plant-name': {
          const plantA = plantMap[a.plant_id];
          const plantB = plantMap[b.plant_id];
          const nameA = plantA?.nickname || plantA?.cultivar_name || '';
          const nameB = plantB?.nickname || plantB?.cultivar_name || '';
          return nameA.localeCompare(nameB);
        }
        default:
          return new Date(b.care_date) - new Date(a.care_date);
      }
    });

    return result;
  }, [careLogs, filter, selectedPlantId, startDate, endDate, searchQuery, plantMap, sortBy]);

  // Group logs based on sort mode
  const groupedLogs = useMemo(() => {
    const groups = {};
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();

    filteredLogs.forEach((log) => {
      let groupKey;

      if (sortBy === 'care-type') {
        // Group by care type
        groupKey = log.care_type.charAt(0).toUpperCase() + log.care_type.slice(1);
      } else if (sortBy === 'plant-name') {
        // Group by plant name
        const plant = plantMap[log.plant_id];
        groupKey = plant?.nickname || plant?.cultivar_name || 'Unknown Plant';
      } else {
        // Group by date (default for date sorting)
        const logDate = new Date(log.care_date).toDateString();
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
      }

      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(log);
    });

    return groups;
  }, [filteredLogs, sortBy, plantMap]);

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
        <div className="card p-4 mb-6 space-y-4">
          {/* Row 1: Care Type Filters */}
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

          {/* Row 2: Plant filter, Sort, and Date Range */}
          <div className="flex flex-wrap items-end gap-4">
            {/* Plant Dropdown */}
            <div className="flex-1 min-w-[180px]">
              <label className="block mb-1.5 text-small font-semibold" style={{ color: 'var(--sage-700)' }}>
                Plant
              </label>
              <div className="relative">
                <select
                  value={selectedPlantId}
                  onChange={(e) => setSelectedPlantId(e.target.value)}
                  className="input w-full py-2 text-small appearance-none pr-8"
                >
                  <option value="all">All Plants</option>
                  {sortedPlants.map((plant) => (
                    <option key={plant.id} value={plant.id}>
                      {plant.nickname || plant.cultivar_name}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={16}
                  className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                  style={{ color: 'var(--sage-400)' }}
                />
              </div>
            </div>

            {/* Sort By */}
            <div className="min-w-[150px]">
              <label className="block mb-1.5 text-small font-semibold" style={{ color: 'var(--sage-700)' }}>
                Sort By
              </label>
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="input w-full py-2 text-small appearance-none pr-8"
                >
                  {SORT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <ArrowUpDown
                  size={16}
                  className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                  style={{ color: 'var(--sage-400)' }}
                />
              </div>
            </div>

            {/* Date Range */}
            <div className="flex gap-2 items-end">
              <div>
                <label className="block mb-1.5 text-small font-semibold" style={{ color: 'var(--sage-700)' }}>
                  From
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="input py-2 text-small"
                    style={{ minWidth: '140px' }}
                  />
                </div>
              </div>
              <div>
                <label className="block mb-1.5 text-small font-semibold" style={{ color: 'var(--sage-700)' }}>
                  To
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="input py-2 text-small"
                    style={{ minWidth: '140px' }}
                  />
                </div>
              </div>
              {(startDate || endDate) && (
                <button
                  onClick={() => {
                    setStartDate('');
                    setEndDate('');
                  }}
                  className="px-3 py-2 rounded-xl text-small font-medium transition-all"
                  style={{
                    background: 'var(--sage-100)',
                    color: 'var(--sage-600)',
                  }}
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Row 3: Search */}
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: 'var(--sage-400)' }}
            />
            <input
              type="text"
              placeholder="Search by plant name..."
              className="input w-full py-2 text-small"
              style={{ paddingLeft: '40px' }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
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
