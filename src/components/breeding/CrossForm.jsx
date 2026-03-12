/**
 * CrossForm - Form to create a new breeding cross
 */

import { useState } from 'react';
import { Loader2, Plus } from 'lucide-react';
import FormField from '../ui/FormField';

export default function CrossForm({ plants = [], onSubmit, onCancel, isPending }) {
  const [formData, setFormData] = useState({
    pod_parent_id: '',
    pollen_parent_id: '',
    cross_date: new Date().toISOString().split('T')[0],
    goals: '',
    notes: '',
  });
  const [errors, setErrors] = useState({});

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.pod_parent_id) {
      newErrors.pod_parent_id = 'Please select a pod parent';
    }
    if (!formData.pollen_parent_id) {
      newErrors.pollen_parent_id = 'Please select a pollen parent';
    }
    if (formData.pod_parent_id && formData.pod_parent_id === formData.pollen_parent_id) {
      newErrors.pollen_parent_id = 'Parents must be different plants';
    }
    if (!formData.cross_date) {
      newErrors.cross_date = 'Cross date is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const podPlant = plants.find(p => p.id === formData.pod_parent_id);
    const pollenPlant = plants.find(p => p.id === formData.pollen_parent_id);

    try {
      await onSubmit({
        pod_parent_id: formData.pod_parent_id,
        pod_parent_name: podPlant?.cultivar_name || podPlant?.nickname || 'Unknown',
        pollen_parent_id: formData.pollen_parent_id,
        pollen_parent_name: pollenPlant?.cultivar_name || pollenPlant?.nickname || 'Unknown',
        cross_date: formData.cross_date,
        goals: formData.goals.trim() || null,
        notes: formData.notes.trim() || null,
      });
    } catch {
      setErrors({ submit: 'Failed to create cross. Please try again.' });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField label="Pod Parent (♀)" required error={errors.pod_parent_id}>
          <select
            className={`input w-full ${errors.pod_parent_id ? 'input-error' : ''}`}
            value={formData.pod_parent_id}
            onChange={(e) => updateField('pod_parent_id', e.target.value)}
          >
            <option value="">Select pod parent...</option>
            {plants.map(plant => (
              <option key={plant.id} value={plant.id}>
                {plant.cultivar_name}{plant.nickname ? ` (${plant.nickname})` : ''}
              </option>
            ))}
          </select>
        </FormField>

        <FormField label="Pollen Parent (♂)" required error={errors.pollen_parent_id}>
          <select
            className={`input w-full ${errors.pollen_parent_id ? 'input-error' : ''}`}
            value={formData.pollen_parent_id}
            onChange={(e) => updateField('pollen_parent_id', e.target.value)}
          >
            <option value="">Select pollen parent...</option>
            {plants.map(plant => (
              <option key={plant.id} value={plant.id}>
                {plant.cultivar_name}{plant.nickname ? ` (${plant.nickname})` : ''}
              </option>
            ))}
          </select>
        </FormField>
      </div>

      <FormField label="Cross Date" required error={errors.cross_date}>
        <input
          type="date"
          className={`input w-full ${errors.cross_date ? 'input-error' : ''}`}
          value={formData.cross_date}
          onChange={(e) => updateField('cross_date', e.target.value)}
        />
      </FormField>

      <FormField label="Goals">
        <input
          type="text"
          className="input w-full"
          placeholder="e.g., Pink trailer with dark leaves"
          value={formData.goals}
          onChange={(e) => updateField('goals', e.target.value)}
        />
      </FormField>

      <FormField label="Notes">
        <textarea
          className="input w-full"
          style={{ minHeight: 80, resize: 'vertical' }}
          placeholder="Any notes about this cross..."
          value={formData.notes}
          onChange={(e) => updateField('notes', e.target.value)}
        />
      </FormField>

      {errors.submit && (
        <p className="text-small text-center" style={{ color: 'var(--color-error)' }}>
          {errors.submit}
        </p>
      )}

      <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4"
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
              Start Cross
            </>
          )}
        </button>
      </div>
    </form>
  );
}
