/**
 * CrossForm - Form to create a new breeding cross
 */

import { useState, useMemo } from 'react';
import { Loader2, Plus } from 'lucide-react';
import FormField from '../ui/FormField';
import {
  describeRelationship,
  calculateInbreedingCoefficient,
  getCoiRisk,
} from '../../utils/lineage';

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
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
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

    const podPlant = plants.find((p) => p.id === formData.pod_parent_id);
    const pollenPlant = plants.find((p) => p.id === formData.pollen_parent_id);

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
            {plants.map((plant) => (
              <option key={plant.id} value={plant.id}>
                {plant.cultivar_name}
                {plant.nickname ? ` (${plant.nickname})` : ''}
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
            {plants.map((plant) => (
              <option key={plant.id} value={plant.id}>
                {plant.cultivar_name}
                {plant.nickname ? ` (${plant.nickname})` : ''}
              </option>
            ))}
          </select>
        </FormField>
      </div>

      <RelationshipWarning
        podParentId={formData.pod_parent_id}
        pollenParentId={formData.pollen_parent_id}
        plants={plants}
      />

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
              Start Cross
            </>
          )}
        </button>
      </div>
    </form>
  );
}

function RelationshipWarning({ podParentId, pollenParentId, plants }) {
  const result = useMemo(() => {
    if (!podParentId || !pollenParentId || podParentId === pollenParentId) return null;

    const plantMap = new Map();
    for (const p of plants) plantMap.set(p.id, p);

    const relationship = describeRelationship(podParentId, pollenParentId, plantMap);
    const coi = calculateInbreedingCoefficient(podParentId, pollenParentId, plantMap);
    const coiRisk = getCoiRisk(coi);

    // Only show if there's a meaningful relationship
    if (relationship === 'No known relationship' && coi === 0) return null;

    return { relationship, coi, coiRisk };
  }, [podParentId, pollenParentId, plants]);

  if (!result) return null;

  return (
    <div
      className="rounded-lg p-3 flex items-center gap-3"
      style={{
        background: result.coi >= 0.125 ? 'var(--copper-100, #fef3c7)' : 'var(--sage-50)',
        border: `1px solid ${result.coi >= 0.125 ? 'var(--copper-300, #fcd34d)' : 'var(--sage-200)'}`,
      }}
    >
      <div className="flex-1 min-w-0">
        <p className="text-small font-medium" style={{ color: 'var(--sage-800)' }}>
          {result.relationship}
        </p>
        {result.coi > 0 && (
          <p className="text-small" style={{ color: result.coiRisk.color }}>
            Inbreeding coefficient: {(result.coi * 100).toFixed(1)}% ({result.coiRisk.label})
          </p>
        )}
      </div>
    </div>
  );
}
