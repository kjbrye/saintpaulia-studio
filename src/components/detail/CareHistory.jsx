/**
 * CareHistory - List of recent care logs for this plant
 */

import { useState, useMemo } from 'react';
import { Droplets, Sparkles, Scissors, Clock, Flower2, ArrowUpDown, ChevronDown } from 'lucide-react';

const careConfig = {
  watering: {
    icon: Droplets,
    label: 'Watered',
    color: 'var(--sage-600)',
  },
  fertilizing: {
    icon: Sparkles,
    label: 'Fertilized',
    color: 'var(--purple-400)',
  },
  grooming: {
    icon: Scissors,
    label: 'Groomed',
    color: 'var(--copper-500)',
  },
  repotting: {
    icon: Flower2,
    label: 'Repotted',
    color: 'var(--sage-700)',
  },
};

const FERTILIZER_LABELS = {
  balanced: 'Balanced (20-20-20)',
  bloom: 'Bloom Booster',
  foliage: 'Foliage/Growth',
  organic: 'Organic',
  slow_release: 'Slow Release',
  other: 'Other',
};

const FILTER_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'watering', label: 'Watering' },
  { value: 'fertilizing', label: 'Fertilizing' },
  { value: 'grooming', label: 'Grooming' },
  { value: 'repotting', label: 'Repotting' },
];

const SORT_OPTIONS = [
  { value: 'date-desc', label: 'Newest First' },
  { value: 'date-asc', label: 'Oldest First' },
  { value: 'care-type', label: 'Care Type' },
];

function CareLogItem({ log }) {
  const config = careConfig[log.care_type] || careConfig.watering;
  const Icon = config.icon;
  const fertilizerLabel = log.fertilizer_type ? FERTILIZER_LABELS[log.fertilizer_type] : null;
  const potSize = log.pot_size;

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="flex items-center gap-4 py-3">
      <div className="icon-container icon-container-sm">
        <Icon size={14} style={{ color: config.color }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-body font-medium">
          {config.label}
          {fertilizerLabel && (
            <span style={{ color: 'var(--purple-400)' }} className="font-normal"> - {fertilizerLabel}</span>
          )}
          {potSize && (
            <span style={{ color: 'var(--sage-600)' }} className="font-normal"> - {potSize}</span>
          )}
        </p>
        {log.notes && (
          <p className="text-small text-muted truncate">{log.notes}</p>
        )}
      </div>
      <div className="flex items-center gap-1 text-small text-muted flex-shrink-0">
        <Clock size={12} />
        <span>{formatDate(log.care_date)}</span>
      </div>
    </div>
  );
}

export default function CareHistory({ logs = [], isLoading }) {
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date-desc');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Filter and sort logs
  const filteredLogs = useMemo(() => {
    let result = logs;

    // Filter by care type
    if (filter !== 'all') {
      result = result.filter((log) => log.care_type === filter);
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

    // Sort results
    result = [...result].sort((a, b) => {
      switch (sortBy) {
        case 'date-asc':
          return new Date(a.care_date) - new Date(b.care_date);
        case 'date-desc':
          return new Date(b.care_date) - new Date(a.care_date);
        case 'care-type':
          return a.care_type.localeCompare(b.care_type);
        default:
          return new Date(b.care_date) - new Date(a.care_date);
      }
    });

    return result;
  }, [logs, filter, startDate, endDate, sortBy]);

  const hasActiveFilters = filter !== 'all' || startDate || endDate;

  if (isLoading) {
    return (
      <div className="card p-6">
        <h2 className="heading heading-md mb-4">Care History</h2>
        <p className="text-muted">Loading history...</p>
      </div>
    );
  }

  return (
    <div className="card p-6">
      <h2 className="heading heading-md mb-4">Care History</h2>

      {/* Filters */}
      <div className="space-y-3 mb-4">
        {/* Care Type Filter */}
        <div className="flex gap-1.5 flex-wrap">
          {FILTER_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => setFilter(option.value)}
              className="px-3 py-1.5 rounded-lg text-small font-medium transition-all"
              style={{
                background:
                  filter === option.value
                    ? 'var(--sage-600)'
                    : 'var(--sage-100)',
                color:
                  filter === option.value ? 'white' : 'var(--sage-600)',
              }}
            >
              {option.label}
            </button>
          ))}
        </div>

        {/* Sort and Date Range */}
        <div className="flex flex-wrap items-end gap-3">
          {/* Sort By */}
          <div className="min-w-[130px]">
            <label className="block mb-1 text-small font-medium" style={{ color: 'var(--sage-600)' }}>
              Sort
            </label>
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="input w-full py-1.5 text-small appearance-none pr-7"
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <ArrowUpDown
                size={14}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
                style={{ color: 'var(--sage-400)' }}
              />
            </div>
          </div>

          {/* Date Range */}
          <div className="flex gap-2 items-end flex-wrap">
            <div>
              <label className="block mb-1 text-small font-medium" style={{ color: 'var(--sage-600)' }}>
                From
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="input py-1.5 text-small"
                style={{ minWidth: '130px' }}
              />
            </div>
            <div>
              <label className="block mb-1 text-small font-medium" style={{ color: 'var(--sage-600)' }}>
                To
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="input py-1.5 text-small"
                style={{ minWidth: '130px' }}
              />
            </div>
            {(startDate || endDate) && (
              <button
                onClick={() => {
                  setStartDate('');
                  setEndDate('');
                }}
                className="px-2.5 py-1.5 rounded-lg text-small font-medium transition-all"
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
      </div>

      {/* Care Logs */}
      {logs.length === 0 ? (
        <div className="card-inset p-6 text-center">
          <Clock size={24} style={{ color: 'var(--sage-400)' }} className="mx-auto mb-2" />
          <p className="text-muted">No care recorded yet</p>
        </div>
      ) : filteredLogs.length === 0 ? (
        <div className="card-inset p-6 text-center">
          <Clock size={24} style={{ color: 'var(--sage-400)' }} className="mx-auto mb-2" />
          <p className="text-muted">No care logs match your filters</p>
        </div>
      ) : (
        <div className="card-inset p-4">
          <div className="divide-y divide-[var(--sage-200)]">
            {filteredLogs.map((log) => (
              <CareLogItem key={log.id} log={log} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
