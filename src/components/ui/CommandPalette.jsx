/**
 * CommandPalette - Global search and command interface (⌘K)
 */

import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Plus,
  BookOpen,
  Droplets,
  Settings,
  Flower2,
  X,
  ArrowRight,
  Sparkles,
  Heart,
} from 'lucide-react';
import { usePlants } from '../../hooks/usePlants';

const ACTIONS = [
  { id: 'add-plant', label: 'Add new plant', icon: Plus, path: '/plants/new', shortcut: 'N' },
  { id: 'library', label: 'Go to Library', icon: BookOpen, path: '/library', shortcut: 'L' },
  { id: 'care-log', label: 'Go to Care Log', icon: Droplets, path: '/care', shortcut: 'C' },
  { id: 'settings', label: 'Go to Settings', icon: Settings, path: '/settings' },
  { id: 'blooming', label: 'View blooming plants', icon: Sparkles, path: '/library?filter=blooming' },
  { id: 'needs-care', label: 'View plants needing care', icon: Heart, path: '/library?filter=needs-care' },
];

export default function CommandPalette({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);
  const navigate = useNavigate();
  const { data: plants = [] } = usePlants();

  // Filter plants and actions based on query
  const results = useMemo(() => {
    const q = query.toLowerCase().trim();

    // Filter plants
    const matchedPlants = plants
      .filter(plant => {
        const name = (plant.nickname || plant.cultivar_name || '').toLowerCase();
        return name.includes(q);
      })
      .slice(0, 5)
      .map(plant => ({
        id: `plant-${plant.id}`,
        type: 'plant',
        label: plant.nickname || plant.cultivar_name,
        sublabel: plant.nickname ? plant.cultivar_name : null,
        icon: Flower2,
        path: `/plants/${plant.id}`,
        isBlooming: plant.is_blooming,
      }));

    // Filter actions
    const matchedActions = ACTIONS
      .filter(action => action.label.toLowerCase().includes(q))
      .map(action => ({
        ...action,
        type: 'action',
      }));

    // If no query, show actions first, then recent plants
    if (!q) {
      return [
        ...matchedActions,
        ...plants.slice(0, 3).map(plant => ({
          id: `plant-${plant.id}`,
          type: 'plant',
          label: plant.nickname || plant.cultivar_name,
          sublabel: plant.nickname ? plant.cultivar_name : null,
          icon: Flower2,
          path: `/plants/${plant.id}`,
          isBlooming: plant.is_blooming,
        })),
      ];
    }

    return [...matchedPlants, ...matchedActions];
  }, [query, plants]);

  // Reset state when opening
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Keep selected index in bounds
  useEffect(() => {
    if (selectedIndex >= results.length) {
      setSelectedIndex(Math.max(0, results.length - 1));
    }
  }, [results.length, selectedIndex]);

  // Scroll selected item into view
  useEffect(() => {
    if (listRef.current) {
      const selectedEl = listRef.current.querySelector('[data-selected="true"]');
      if (selectedEl) {
        selectedEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(i => Math.min(i + 1, results.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(i => Math.max(i - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (results[selectedIndex]) {
          navigate(results[selectedIndex].path);
          onClose();
        }
        break;
      case 'Escape':
        e.preventDefault();
        onClose();
        break;
    }
  };

  const handleSelect = (result) => {
    navigate(result.path);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="absolute left-1/2 top-[15%] -translate-x-1/2 w-full max-w-lg">
        <div
          className="bg-[var(--cream-50)] rounded-xl shadow-2xl border border-[var(--sage-200)] overflow-hidden"
          onKeyDown={handleKeyDown}
        >
          {/* Search input */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-[var(--sage-200)]">
            <Search size={18} style={{ color: 'var(--sage-500)' }} />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSelectedIndex(0);
              }}
              placeholder="Search plants or type a command..."
              className="flex-1 bg-transparent border-none outline-none text-[var(--text-primary)] placeholder:text-[var(--text-muted)]"
              style={{ fontSize: '15px' }}
            />
            <button
              onClick={onClose}
              className="p-1 rounded hover:bg-[var(--sage-100)] transition-colors"
            >
              <X size={16} style={{ color: 'var(--sage-500)' }} />
            </button>
          </div>

          {/* Results list */}
          <div ref={listRef} className="max-h-80 overflow-y-auto py-2">
            {results.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <p className="text-muted text-small">No results found</p>
              </div>
            ) : (
              <>
                {results.map((result, index) => {
                  const Icon = result.icon;
                  const isSelected = index === selectedIndex;

                  return (
                    <button
                      key={result.id}
                      data-selected={isSelected}
                      onClick={() => handleSelect(result)}
                      className={`
                        w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors
                        ${isSelected ? 'bg-[var(--sage-100)]' : 'hover:bg-[var(--sage-50)]'}
                      `}
                    >
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{
                          background: result.type === 'plant'
                            ? result.isBlooming ? 'var(--purple-100)' : 'var(--sage-100)'
                            : 'var(--sage-100)',
                        }}
                      >
                        <Icon
                          size={16}
                          style={{
                            color: result.type === 'plant'
                              ? result.isBlooming ? 'var(--purple-500)' : 'var(--sage-600)'
                              : 'var(--sage-600)',
                          }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-small font-medium truncate" style={{ color: 'var(--sage-800)' }}>
                          {result.label}
                        </p>
                        {result.sublabel && (
                          <p className="text-small text-muted truncate">{result.sublabel}</p>
                        )}
                      </div>
                      {result.shortcut && (
                        <span className="kbd">{result.shortcut}</span>
                      )}
                      {result.type === 'plant' && (
                        <ArrowRight size={14} style={{ color: 'var(--sage-400)' }} />
                      )}
                    </button>
                  );
                })}
              </>
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-2 border-t border-[var(--sage-200)] bg-[var(--sage-50)]">
            <div className="flex items-center justify-between text-small text-muted">
              <div className="flex items-center gap-3">
                <span><span className="kbd">↑↓</span> navigate</span>
                <span><span className="kbd">↵</span> select</span>
                <span><span className="kbd">esc</span> close</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
