/**
 * AddPlant Page - Form to add a new plant to the collection
 */

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Loader2 } from 'lucide-react';
import { useCreatePlant } from '../hooks/usePlants';
import FormField from '../components/ui/FormField';
import { PhotoUpload } from '../components/plants';

export default function AddPlant() {
  const navigate = useNavigate();
  const createPlant = useCreatePlant();

  const [formData, setFormData] = useState({
    cultivar_name: '',
    nickname: '',
    photo_url: null,
    acquisition_date: '',
    source: '',
    location: '',
    status: 'healthy',
    pot_size: '',
    notes: '',
  });

  const [errors, setErrors] = useState({});

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when field is updated
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.cultivar_name.trim()) {
      newErrors.cultivar_name = 'Cultivar name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      const plant = await createPlant.mutateAsync({
        cultivar_name: formData.cultivar_name.trim(),
        nickname: formData.nickname.trim() || null,
        photo_url: formData.photo_url || null,
        acquisition_date: formData.acquisition_date || null,
        source: formData.source.trim() || null,
        location: formData.location || null,
        status: formData.status,
        pot_size: formData.pot_size || null,
        notes: formData.notes.trim() || null,
      });

      navigate(`/plants/${plant.id}`);
    } catch (error) {
      console.error('Failed to create plant:', error);
      setErrors({ submit: 'Failed to create plant. Please try again.' });
    }
  };

  const isSubmitting = createPlant.isPending;

  return (
    <div className="min-h-screen p-6 md:p-10">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <header className="flex items-center gap-4 mb-8">
          <Link to="/library">
            <button type="button" className="icon-container">
              <ArrowLeft size={20} style={{ color: 'var(--sage-600)' }} />
            </button>
          </Link>
          <h1 className="heading heading-xl">Add New Plant</h1>
        </header>

        {/* Form Card */}
        <form onSubmit={handleSubmit} className="card p-8">
          {/* Photo + Primary Fields */}
          <div className="flex flex-col md:flex-row gap-8 mb-8">
            {/* Photo Upload */}
            <div className="flex-shrink-0 mx-auto md:mx-0">
              <PhotoUpload
                value={formData.photo_url}
                onChange={(url) => updateField('photo_url', url)}
              />
            </div>

            {/* Primary Fields */}
            <div className="flex-1 space-y-5">
              <FormField
                label="Cultivar Name"
                required
                error={errors.cultivar_name}
              >
                <input
                  type="text"
                  className={`input w-full ${errors.cultivar_name ? 'input-error' : ''}`}
                  placeholder="e.g., Optimara EverGrace"
                  value={formData.cultivar_name}
                  onChange={(e) => updateField('cultivar_name', e.target.value)}
                />
              </FormField>

              <FormField label="Nickname">
                <input
                  type="text"
                  className="input w-full"
                  placeholder="e.g., Grace"
                  value={formData.nickname}
                  onChange={(e) => updateField('nickname', e.target.value)}
                />
              </FormField>
            </div>
          </div>

          {/* Divider with label */}
          <div className="flex items-center gap-4 my-8">
            <div
              className="flex-1"
              style={{ borderTop: '1px solid var(--sage-200)' }}
            />
            <span className="text-label text-muted">Details</span>
            <div
              className="flex-1"
              style={{ borderTop: '1px solid var(--sage-200)' }}
            />
          </div>

          {/* Detail Fields - 2 column grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
            <FormField label="Acquired Date">
              <input
                type="date"
                className="input w-full"
                value={formData.acquisition_date}
                onChange={(e) => updateField('acquisition_date', e.target.value)}
              />
            </FormField>

            <FormField label="Source">
              <input
                type="text"
                className="input w-full"
                placeholder="e.g., Local nursery, Trade"
                value={formData.source}
                onChange={(e) => updateField('source', e.target.value)}
              />
            </FormField>

            <FormField label="Location">
              <select
                className="input w-full"
                value={formData.location}
                onChange={(e) => updateField('location', e.target.value)}
              >
                <option value="">Select location...</option>
                <option value="windowsill">Windowsill</option>
                <option value="shelf">Plant Shelf</option>
                <option value="light_stand">Light Stand</option>
                <option value="greenhouse">Greenhouse</option>
                <option value="other">Other</option>
              </select>
            </FormField>

            <FormField label="Status">
              <select
                className="input w-full"
                value={formData.status}
                onChange={(e) => updateField('status', e.target.value)}
              >
                <option value="healthy">Healthy</option>
                <option value="recovering">Recovering</option>
                <option value="struggling">Struggling</option>
                <option value="dormant">Dormant</option>
              </select>
            </FormField>

            <FormField label="Pot Size">
              <select
                className="input w-full"
                value={formData.pot_size}
                onChange={(e) => updateField('pot_size', e.target.value)}
              >
                <option value="">Select size...</option>
                <option value='2"'>2" (Mini/Starter)</option>
                <option value='2.5"'>2.5"</option>
                <option value='3"'>3" (Semi-mini)</option>
                <option value='3.5"'>3.5"</option>
                <option value='4"'>4" (Standard)</option>
                <option value='4.5"'>4.5"</option>
                <option value='5"'>5" (Large)</option>
                <option value='6"'>6"</option>
                <option value='6"+'>6"+ (Extra Large)</option>
              </select>
            </FormField>
          </div>

          {/* Notes */}
          <FormField label="Notes" className="mb-8">
            <textarea
              className="input w-full"
              style={{ minHeight: 120, resize: 'vertical' }}
              placeholder="Any notes about this plant..."
              value={formData.notes}
              onChange={(e) => updateField('notes', e.target.value)}
            />
          </FormField>

          {/* Submit Error */}
          {errors.submit && (
            <p
              className="text-small mb-4 text-center"
              style={{ color: 'var(--color-error)' }}
            >
              {errors.submit}
            </p>
          )}

          {/* Form Actions */}
          <div
            className="flex flex-col-reverse sm:flex-row justify-end gap-4 pt-6"
            style={{ borderTop: '1px solid var(--sage-200)' }}
          >
            <Link to="/library">
              <button type="button" className="btn btn-secondary w-full sm:w-auto">
                Cancel
              </button>
            </Link>
            <button
              type="submit"
              className="btn btn-primary w-full sm:w-auto"
              disabled={isSubmitting || !formData.cultivar_name.trim()}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus size={20} />
                  Add Plant
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
