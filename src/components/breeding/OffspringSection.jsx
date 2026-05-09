/**
 * OffspringSection — sage card with title, summary, "+ Add offspring" button,
 * and a 3/2/1-column grid of offspring cards. Each offspring card shows the
 * plant photo, an F1 eyebrow, plant name, and a status pill.
 *
 * Adding offspring opens a small flow with two modes: pick from library,
 * or create new (which links the cross's parents into the new plant).
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Loader2, Flower2, X } from 'lucide-react';
import { isComplete } from '../../utils/breedingStages';

const STATUS_STYLES = {
  blooming: { label: 'Blooming', bg: 'var(--purple-400)', color: '#fff' },
  growing: { label: 'Growing', bg: 'var(--sage-500)', color: '#fff' },
  archived: { label: 'Archived', bg: 'var(--sage-200)', color: 'var(--sage-700)' },
  active: { label: 'Active', bg: 'var(--sage-500)', color: '#fff' },
};

function statusBadge(status) {
  if (!status) return STATUS_STYLES.active;
  const key = String(status).toLowerCase();
  return STATUS_STYLES[key] || { label: status, bg: 'var(--sage-200)', color: 'var(--sage-700)' };
}

export default function OffspringSection({
  cross,
  plants = [],
  onAddOffspring,
  onCreateAndLink,
  onRemoveOffspring,
  isPending,
}) {
  const [mode, setMode] = useState(null); // null | 'existing' | 'new'
  const [selectedPlantId, setSelectedPlantId] = useState('');
  const [newPlantName, setNewPlantName] = useState('');
  const [error, setError] = useState(null);

  const offspring = cross?.offspring || [];
  const offspringPlantIds = new Set(offspring.map((o) => o.plant?.id).filter(Boolean));
  const availablePlants = plants.filter((p) => !offspringPlantIds.has(p.id));

  const bloomingCount = offspring.filter(
    (o) => String(o.plant?.status || '').toLowerCase() === 'blooming',
  ).length;

  const closeAdd = () => {
    setMode(null);
    setSelectedPlantId('');
    setNewPlantName('');
    setError(null);
  };

  const handleAddExisting = async (e) => {
    e.preventDefault();
    if (!selectedPlantId) return;
    try {
      await onAddOffspring({ cross_id: cross.id, plant_id: selectedPlantId });
      closeAdd();
    } catch (err) {
      setError(err?.message || 'Failed to link plant');
    }
  };

  const handleCreateNew = async (e) => {
    e.preventDefault();
    if (!newPlantName.trim()) return;
    try {
      await onCreateAndLink(cross.id, newPlantName.trim());
      closeAdd();
    } catch (err) {
      setError(err?.message || 'Failed to create and link plant');
    }
  };

  return (
    <div className="card p-6 mb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="heading heading-md">Offspring</h2>
          {offspring.length > 0 && (
            <p
              className="mt-0.5"
              style={{
                fontFamily: 'var(--font-heading)',
                fontStyle: 'italic',
                fontSize: 14,
                color: 'var(--purple-500)',
              }}
            >
              {offspring.length} {offspring.length === 1 ? 'seedling' : 'seedlings'}
              {bloomingCount > 0 && ` · ${bloomingCount} blooming`}
            </p>
          )}
        </div>
        {mode == null && (
          <button className="btn btn-primary btn-small" onClick={() => setMode('existing')}>
            <Plus size={14} /> Add offspring
          </button>
        )}
      </div>

      {/* Add flow */}
      {mode != null && (
        <div className="mb-5 p-4 rounded-lg" style={{ background: 'var(--sage-50)' }}>
          <div className="flex gap-1 mb-3">
            <button
              className={`btn btn-small ${mode === 'existing' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setMode('existing')}
            >
              Pick from library
            </button>
            <button
              className={`btn btn-small ${mode === 'new' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setMode('new')}
            >
              Create new
            </button>
            <div className="flex-1" />
            <button className="btn btn-secondary btn-small" onClick={closeAdd}>
              Cancel
            </button>
          </div>

          {mode === 'existing' ? (
            <form onSubmit={handleAddExisting} className="flex gap-2">
              <select
                className="input flex-1"
                value={selectedPlantId}
                onChange={(e) => setSelectedPlantId(e.target.value)}
              >
                <option value="">Select a plant...</option>
                {availablePlants.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.cultivar_name}
                    {p.nickname ? ` (${p.nickname})` : ''}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                className="btn btn-primary btn-small"
                disabled={isPending || !selectedPlantId}
              >
                {isPending ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                Link
              </button>
            </form>
          ) : (
            <form onSubmit={handleCreateNew} className="flex gap-2">
              <input
                type="text"
                className="input flex-1"
                placeholder="Name for the new seedling..."
                value={newPlantName}
                onChange={(e) => setNewPlantName(e.target.value)}
                autoFocus
              />
              <button
                type="submit"
                className="btn btn-primary btn-small"
                disabled={isPending || !newPlantName.trim()}
              >
                {isPending ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                Create
              </button>
            </form>
          )}

          {error && (
            <p className="text-small mt-2" style={{ color: 'var(--color-error)' }}>
              {error}
            </p>
          )}
        </div>
      )}

      {/* Grid */}
      {offspring.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {offspring.map((o) => (
            <OffspringCard
              key={o.id}
              offspring={o}
              onRemove={() => onRemoveOffspring(o.id)}
              isPending={isPending}
            />
          ))}
        </div>
      ) : (
        <p
          className="text-center py-6"
          style={{
            fontFamily: 'var(--font-heading)',
            fontStyle: 'italic',
            fontSize: 16,
            color: 'var(--purple-500)',
          }}
        >
          {isComplete(cross)
            ? 'No offspring yet. Add seedlings as they sprout — each becomes a new plant in your library.'
            : 'No offspring yet. Add seedlings as they sprout — each becomes a new plant in your library.'}
        </p>
      )}
    </div>
  );
}

function OffspringCard({ offspring: o, onRemove, isPending }) {
  const plant = o.plant;
  if (!plant) {
    return (
      <div
        className="rounded-xl p-4 group relative"
        style={{ background: 'var(--cream-100)', border: '1px solid var(--sage-200)' }}
      >
        <p className="text-muted text-small">Plant removed</p>
        <RemoveButton onClick={onRemove} isPending={isPending} />
      </div>
    );
  }
  const badge = statusBadge(plant.status);
  const photo = plant.photo_url;
  const eyebrowParts = ['F1'];
  if (plant.variety_class) eyebrowParts.push(plant.variety_class);

  return (
    <div
      className="rounded-xl overflow-hidden group relative flex flex-col"
      style={{ background: 'var(--cream-100)', border: '1px solid var(--sage-200)' }}
    >
      <Link to={`/plants/${plant.id}`} className="block">
        <div
          className="w-full flex items-center justify-center"
          style={{
            aspectRatio: '4 / 3',
            background: 'var(--sage-100)',
          }}
        >
          {photo ? (
            <img
              src={photo}
              alt={plant.cultivar_name || plant.nickname || ''}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <Flower2 size={36} style={{ color: 'var(--sage-400)' }} />
          )}
        </div>
      </Link>
      <div className="p-3 flex-1 flex flex-col gap-1">
        <p
          style={{
            fontSize: 10,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: 'var(--purple-400)',
            fontWeight: 700,
          }}
        >
          {eyebrowParts.join(' · ')}
        </p>
        <Link
          to={`/plants/${plant.id}`}
          className="heading hover:underline truncate"
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 17,
            color: 'var(--sage-800)',
          }}
        >
          {plant.cultivar_name || plant.nickname || 'Unnamed'}
        </Link>
        <span
          className="self-start px-2 py-0.5 rounded-full mt-1"
          style={{
            background: badge.bg,
            color: badge.color,
            fontSize: 10,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
          }}
        >
          {badge.label}
        </span>
      </div>
      <RemoveButton onClick={onRemove} isPending={isPending} />
    </div>
  );
}

function RemoveButton({ onClick, isPending }) {
  return (
    <button
      type="button"
      className="absolute top-2 right-2 icon-container opacity-0 group-hover:opacity-100 transition-opacity"
      style={{ width: 28, height: 28, background: 'rgba(255,255,255,0.85)' }}
      onClick={onClick}
      disabled={isPending}
      title="Remove offspring"
    >
      <X size={14} style={{ color: 'var(--copper-500)' }} />
    </button>
  );
}
