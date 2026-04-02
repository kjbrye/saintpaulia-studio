/**
 * PropagationForm - Form to create a new propagation project
 */

import { useState } from 'react';
import { Loader2, Plus } from 'lucide-react';
import FormField from '../ui/FormField';
import { METHOD_LABELS } from './PropagationCard';

export default function PropagationForm({ plants = [], onSubmit, onCancel, isPending }) {
  const [formData, setFormData] = useState({
    parent_plant_id: '',
    cutting_date: new Date().toISOString().split('T')[0],
    method: 'water',
    notes: '',
  });
  const [errors, setErrors] = useState({});

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.parent_plant_id) {
      newErrors.parent_plant_id = 'Please select a parent plant';
    }
    if (!formData.cutting_date) {
      newErrors.cutting_date = 'Cutting date is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const selectedPlant = plants.find((p) => p.id === formData.parent_plant_id);
    try {
      await onSubmit({
        parent_plant_id: formData.parent_plant_id,
        parent_plant_name: selectedPlant?.cultivar_name || selectedPlant?.nickname || 'Unknown',
        cutting_date: formData.cutting_date,
        method: formData.method,
        notes: formData.notes.trim() || null,
      });
    } catch {
      setErrors({ submit: 'Failed to create propagation. Please try again.' });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <FormField label="Parent Plant" required error={errors.parent_plant_id}>
        <select
          className={`input w-full ${errors.parent_plant_id ? 'input-error' : ''}`}
          value={formData.parent_plant_id}
          onChange={(e) => updateField('parent_plant_id', e.target.value)}
        >
          <option value="">Select a plant...</option>
          {plants.map((plant) => (
            <option key={plant.id} value={plant.id}>
              {plant.cultivar_name}
              {plant.nickname ? ` (${plant.nickname})` : ''}
            </option>
          ))}
        </select>
      </FormField>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField label="Cutting Date" required error={errors.cutting_date}>
          <input
            type="date"
            className={`input w-full ${errors.cutting_date ? 'input-error' : ''}`}
            value={formData.cutting_date}
            onChange={(e) => updateField('cutting_date', e.target.value)}
          />
        </FormField>

        <FormField label="Rooting Method">
          <select
            className="input w-full"
            value={formData.method}
            onChange={(e) => updateField('method', e.target.value)}
          >
            {Object.entries(METHOD_LABELS).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </FormField>
      </div>

      <FormField label="Notes">
        <textarea
          className="input w-full"
          style={{ minHeight: 80, resize: 'vertical' }}
          placeholder="Any notes about this cutting..."
          value={formData.notes}
          onChange={(e) => updateField('notes', e.target.value)}
        />
      </FormField>

      {errors.submit && (
        <p className="text-small text-center" style={{ color: 'var(--color-error)' }}>
          {errors.submit}
        </p>
      )}

      <div
        className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4"
        style={{ borderTop: '1px solid var(--sage-200)' }}
      >
        <button type="button" className="btn btn-secondary" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={isPending}>
          {isPending ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Creating...
            </>
          ) : (
            <>
              <Plus size={18} />
              Start Propagation
            </>
          )}
        </button>
      </div>
    </form>
  );
}
