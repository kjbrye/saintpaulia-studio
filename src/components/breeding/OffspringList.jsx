/**
 * OffspringList - Display and manage offspring linked to a cross.
 * Includes adding new offspring from library or by creating new plants.
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sprout, Plus, X, Loader2, Leaf } from 'lucide-react';

export default function OffspringList({
  offspring = [],
  plants = [],
  crossId,
  onAddOffspring,
  onRemoveOffspring,
  onCreateAndLink,
  isPending,
}) {
  const [isAdding, setIsAdding] = useState(false);
  const [mode, setMode] = useState('existing'); // 'existing' | 'new'
  const [selectedPlantId, setSelectedPlantId] = useState('');
  const [newPlantName, setNewPlantName] = useState('');
  const [error, setError] = useState(null);

  // Filter out plants that are already offspring
  const offspringPlantIds = new Set(offspring.map(o => o.plant?.id).filter(Boolean));
  const availablePlants = plants.filter(p => !offspringPlantIds.has(p.id));

  const handleAddExisting = async (e) => {
    e.preventDefault();
    if (!selectedPlantId) return;
    try {
      await onAddOffspring({ cross_id: crossId, plant_id: selectedPlantId });
      setSelectedPlantId('');
      setIsAdding(false);
      setError(null);
    } catch {
      setError('Failed to link plant');
    }
  };

  const handleCreateNew = async (e) => {
    e.preventDefault();
    if (!newPlantName.trim()) return;
    try {
      await onCreateAndLink(crossId, newPlantName.trim());
      setNewPlantName('');
      setIsAdding(false);
      setError(null);
    } catch {
      setError('Failed to create and link plant');
    }
  };

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sprout size={18} style={{ color: 'var(--color-success)' }} />
          <h2 className="heading heading-md">Offspring</h2>
          {offspring.length > 0 && (
            <span className="text-small text-muted">({offspring.length})</span>
          )}
        </div>
        {!isAdding && (
          <button className="btn btn-primary btn-small" onClick={() => setIsAdding(true)}>
            <Plus size={14} /> Add
          </button>
        )}
      </div>

      {/* Add form */}
      {isAdding && (
        <div className="mb-4 p-4 rounded-lg" style={{ background: 'var(--sage-50)' }}>
          {/* Mode tabs */}
          <div className="flex gap-1 mb-3">
            <button
              className={`btn btn-small ${mode === 'existing' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setMode('existing')}
            >
              From Library
            </button>
            <button
              className={`btn btn-small ${mode === 'new' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setMode('new')}
            >
              Create New
            </button>
          </div>

          {mode === 'existing' ? (
            <form onSubmit={handleAddExisting} className="space-y-3">
              <select
                className="input w-full"
                value={selectedPlantId}
                onChange={(e) => setSelectedPlantId(e.target.value)}
              >
                <option value="">Select a plant...</option>
                {availablePlants.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.cultivar_name}{p.nickname ? ` (${p.nickname})` : ''}
                  </option>
                ))}
              </select>
              <div className="flex items-center gap-2">
                <button type="submit" className="btn btn-primary btn-small" disabled={isPending || !selectedPlantId}>
                  {isPending ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                  Link Plant
                </button>
                <button type="button" className="btn btn-secondary btn-small" onClick={() => setIsAdding(false)}>
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleCreateNew} className="space-y-3">
              <input
                type="text"
                className="input w-full"
                placeholder="Name for the new hybrid..."
                value={newPlantName}
                onChange={(e) => setNewPlantName(e.target.value)}
                autoFocus
              />
              <div className="flex items-center gap-2">
                <button type="submit" className="btn btn-primary btn-small" disabled={isPending || !newPlantName.trim()}>
                  {isPending ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                  Create & Link
                </button>
                <button type="button" className="btn btn-secondary btn-small" onClick={() => setIsAdding(false)}>
                  Cancel
                </button>
              </div>
            </form>
          )}

          {error && (
            <p className="text-small mt-2" style={{ color: 'var(--color-error)' }}>{error}</p>
          )}
        </div>
      )}

      {/* Offspring list */}
      {offspring.length > 0 ? (
        <div className="space-y-2">
          {offspring.map(o => (
            <div
              key={o.id}
              className="group flex items-center justify-between gap-2 p-3 rounded-lg"
              style={{ background: 'var(--sage-50)' }}
            >
              <div className="flex items-center gap-2 min-w-0">
                <Leaf size={16} style={{ color: 'var(--color-success)' }} />
                {o.plant ? (
                  <Link
                    to={`/plants/${o.plant.id}`}
                    className="text-body font-medium hover:underline truncate"
                    style={{ color: 'var(--sage-800)' }}
                  >
                    {o.plant.cultivar_name || o.plant.nickname || 'Unnamed'}
                  </Link>
                ) : (
                  <span className="text-body text-muted">Plant removed</span>
                )}
                {o.notes && (
                  <span className="text-small text-muted truncate">{o.notes}</span>
                )}
              </div>
              <button
                className="icon-container flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ width: 28, height: 28 }}
                onClick={() => onRemoveOffspring(o.id)}
                disabled={isPending}
                title="Remove offspring"
              >
                <X size={14} style={{ color: 'var(--sage-500)' }} />
              </button>
            </div>
          ))}
        </div>
      ) : !isAdding ? (
        <p className="text-small text-muted text-center py-4">
          No offspring linked yet. Add plants from your library or create new ones.
        </p>
      ) : null}
    </div>
  );
}
