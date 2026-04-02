/**
 * LineageEditor - Edit plant parentage and lineage info.
 */

import { useState } from 'react';
import { Loader2, Save, X } from 'lucide-react';

export default function LineageEditor({ plant, plants = [], onSave, isPending, onCancel }) {
  const [formData, setFormData] = useState({
    pod_parent_id: plant.pod_parent_id || '',
    pollen_parent_id: plant.pollen_parent_id || '',
    pod_parent_name: plant.pod_parent_name || '',
    pollen_parent_name: plant.pollen_parent_name || '',
    generation: plant.generation ?? '',
    hybridizer: plant.hybridizer || '',
    lineage_notes: plant.lineage_notes || '',
  });

  const update = (field, value) => setFormData((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      pod_parent_id: formData.pod_parent_id || null,
      pollen_parent_id: formData.pollen_parent_id || null,
      pod_parent_name: formData.pod_parent_name || null,
      pollen_parent_name: formData.pollen_parent_name || null,
      generation: formData.generation !== '' ? parseInt(formData.generation) : null,
      hybridizer: formData.hybridizer || null,
      lineage_notes: formData.lineage_notes || null,
    });
  };

  // Available parents — exclude the plant itself
  const parentOptions = plants.filter((p) => p.id !== plant.id);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Pod Parent */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-label text-muted block mb-1">Pod Parent (from library)</label>
          <select
            className="input w-full"
            value={formData.pod_parent_id}
            onChange={(e) => {
              update('pod_parent_id', e.target.value);
              if (e.target.value) {
                const p = plants.find((pl) => pl.id === e.target.value);
                if (p) update('pod_parent_name', p.cultivar_name || p.nickname || '');
              }
            }}
          >
            <option value="">— Select from library —</option>
            {parentOptions.map((p) => (
              <option key={p.id} value={p.id}>
                {p.cultivar_name || p.nickname || 'Unnamed'}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-label text-muted block mb-1">Pod Parent Name (external)</label>
          <input
            className="input w-full"
            value={formData.pod_parent_name}
            onChange={(e) => update('pod_parent_name', e.target.value)}
            placeholder="e.g., Rob's Vanilla Trail"
          />
        </div>
      </div>

      {/* Pollen Parent */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-label text-muted block mb-1">Pollen Parent (from library)</label>
          <select
            className="input w-full"
            value={formData.pollen_parent_id}
            onChange={(e) => {
              update('pollen_parent_id', e.target.value);
              if (e.target.value) {
                const p = plants.find((pl) => pl.id === e.target.value);
                if (p) update('pollen_parent_name', p.cultivar_name || p.nickname || '');
              }
            }}
          >
            <option value="">— Select from library —</option>
            {parentOptions.map((p) => (
              <option key={p.id} value={p.id}>
                {p.cultivar_name || p.nickname || 'Unnamed'}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-label text-muted block mb-1">Pollen Parent Name (external)</label>
          <input
            className="input w-full"
            value={formData.pollen_parent_name}
            onChange={(e) => update('pollen_parent_name', e.target.value)}
            placeholder="e.g., Buckeye Seductress"
          />
        </div>
      </div>

      {/* Generation and Hybridizer */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-label text-muted block mb-1">Generation</label>
          <input
            className="input w-full"
            type="number"
            min={1}
            value={formData.generation}
            onChange={(e) => update('generation', e.target.value)}
            placeholder="e.g., 2 for F2"
          />
        </div>
        <div>
          <label className="text-label text-muted block mb-1">Hybridizer</label>
          <input
            className="input w-full"
            value={formData.hybridizer}
            onChange={(e) => update('hybridizer', e.target.value)}
            placeholder="e.g., LLG Greenhouses"
          />
        </div>
      </div>

      {/* Lineage Notes */}
      <div>
        <label className="text-label text-muted block mb-1">Lineage Notes</label>
        <textarea
          className="input w-full"
          style={{ minHeight: 60, resize: 'vertical' }}
          value={formData.lineage_notes}
          onChange={(e) => update('lineage_notes', e.target.value)}
          placeholder="Origin story, breeder info, import history..."
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button type="submit" className="btn btn-primary btn-small" disabled={isPending}>
          {isPending ? (
            <>
              <Loader2 size={14} className="animate-spin" /> Saving...
            </>
          ) : (
            <>
              <Save size={14} /> Save Lineage
            </>
          )}
        </button>
        {onCancel && (
          <button type="button" className="btn btn-secondary btn-small" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
