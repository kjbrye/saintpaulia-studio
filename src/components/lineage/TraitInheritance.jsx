/**
 * TraitInheritance - Record and display trait observations for a plant.
 */

import { useState } from 'react';
import { Dna, Plus, Trash2, Loader2 } from 'lucide-react';

const TRAIT_CATEGORIES = [
  { value: 'flower_color', label: 'Flower Color' },
  { value: 'flower_type', label: 'Flower Type' },
  { value: 'flower_size', label: 'Flower Size' },
  { value: 'leaf_color', label: 'Leaf Color' },
  { value: 'leaf_shape', label: 'Leaf Shape' },
  { value: 'leaf_variegation', label: 'Leaf Variegation' },
  { value: 'growth_habit', label: 'Growth Habit' },
  { value: 'bloom_frequency', label: 'Bloom Frequency' },
  { value: 'other', label: 'Other' },
];

const INHERITED_FROM_OPTIONS = [
  { value: 'pod_parent', label: 'Pod Parent' },
  { value: 'pollen_parent', label: 'Pollen Parent' },
  { value: 'both', label: 'Both Parents' },
  { value: 'unknown', label: 'Unknown' },
  { value: 'mutation', label: 'Mutation / Sport' },
];

const CATEGORY_LABELS = Object.fromEntries(TRAIT_CATEGORIES.map(c => [c.value, c.label]));
const INHERITED_LABELS = Object.fromEntries(INHERITED_FROM_OPTIONS.map(o => [o.value, o.label]));

export default function TraitInheritance({ plantId, traits = [], onCreate, onDelete, isLoading, isPending }) {
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    trait_category: 'flower_color',
    trait_value: '',
    inherited_from: 'unknown',
    notes: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.trait_value.trim()) return;
    try {
      await onCreate({
        plant_id: plantId,
        trait_category: formData.trait_category,
        trait_value: formData.trait_value.trim(),
        inherited_from: formData.inherited_from,
        notes: formData.notes.trim() || null,
      });
      setFormData({ trait_category: 'flower_color', trait_value: '', inherited_from: 'unknown', notes: '' });
      setIsAdding(false);
    } catch {
      // handled by parent
    }
  };

  // Group traits by category
  const grouped = new Map();
  for (const trait of traits) {
    const cat = trait.trait_category;
    if (!grouped.has(cat)) grouped.set(cat, []);
    grouped.get(cat).push(trait);
  }

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Dna size={18} style={{ color: 'var(--purple-400)' }} />
          <h2 className="heading heading-md">Traits</h2>
          {traits.length > 0 && (
            <span className="text-small text-muted">({traits.length})</span>
          )}
        </div>
        {!isAdding && (
          <button className="btn btn-primary btn-small" onClick={() => setIsAdding(true)}>
            <Plus size={14} /> Add Trait
          </button>
        )}
      </div>

      {/* Add form */}
      {isAdding && (
        <form onSubmit={handleSubmit} className="mb-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-label text-muted block mb-1">Category</label>
              <select
                className="input w-full"
                value={formData.trait_category}
                onChange={(e) => setFormData(prev => ({ ...prev, trait_category: e.target.value }))}
              >
                {TRAIT_CATEGORIES.map(c => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-label text-muted block mb-1">Value</label>
              <input
                className="input w-full"
                value={formData.trait_value}
                onChange={(e) => setFormData(prev => ({ ...prev, trait_value: e.target.value }))}
                placeholder="e.g., double pink, girl-leaf"
                autoFocus
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-label text-muted block mb-1">Inherited From</label>
              <select
                className="input w-full"
                value={formData.inherited_from}
                onChange={(e) => setFormData(prev => ({ ...prev, inherited_from: e.target.value }))}
              >
                {INHERITED_FROM_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-label text-muted block mb-1">Notes (optional)</label>
              <input
                className="input w-full"
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Observations..."
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button type="submit" className="btn btn-primary btn-small" disabled={isPending || !formData.trait_value.trim()}>
              {isPending ? <><Loader2 size={14} className="animate-spin" /> Saving...</> : 'Save Trait'}
            </button>
            <button type="button" className="btn btn-secondary btn-small" onClick={() => setIsAdding(false)}>
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Traits list */}
      {isLoading ? (
        <p className="text-small text-muted text-center py-4">Loading traits...</p>
      ) : traits.length > 0 ? (
        <div className="space-y-3">
          {[...grouped.entries()].map(([category, items]) => (
            <div key={category}>
              <p className="text-label text-muted mb-1.5">{CATEGORY_LABELS[category] || category}</p>
              <div className="space-y-1">
                {items.map(trait => (
                  <div
                    key={trait.id}
                    className="group flex items-center justify-between gap-2 p-2 rounded-lg"
                    style={{ background: 'var(--sage-50)' }}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-body font-medium" style={{ color: 'var(--sage-800)' }}>
                        {trait.trait_value}
                      </span>
                      {trait.inherited_from && trait.inherited_from !== 'unknown' && (
                        <span className="badge" style={{ fontSize: 10 }}>
                          {INHERITED_LABELS[trait.inherited_from]}
                        </span>
                      )}
                      {trait.notes && (
                        <span className="text-small text-muted truncate">{trait.notes}</span>
                      )}
                    </div>
                    <button
                      className="icon-container flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ width: 24, height: 24 }}
                      onClick={() => onDelete(trait.id)}
                      disabled={isPending}
                      title="Remove trait"
                    >
                      <Trash2 size={12} style={{ color: 'var(--sage-500)' }} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : !isAdding ? (
        <p className="text-small text-muted text-center py-4">
          No traits recorded. Add observations to track inherited characteristics.
        </p>
      ) : null}
    </div>
  );
}
