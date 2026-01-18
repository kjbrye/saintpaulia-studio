/**
 * PlantDetail Page - Individual plant view with care management and edit functionality
 */

import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Pencil, Trash2, Check, Loader2, Flower2 } from 'lucide-react';
import { usePlant, useUpdatePlant, useDeletePlant } from '../hooks/usePlants';
import { useCareLogs, useLogCare } from '../hooks/useCare';
import { useSettings } from '../hooks/useSettings.jsx';
import { getPlantCareStatuses } from '../utils/careStatus';
import {
  CareStatusCard,
  QuickCareActions,
  CareHistory,
} from '../components/detail';
import EditableField from '../components/ui/EditableField';
import PhotoUpload from '../components/plants/PhotoUpload';

// Status options for select dropdown
const STATUS_OPTIONS = [
  { value: 'healthy', label: 'Healthy' },
  { value: 'recovering', label: 'Recovering' },
  { value: 'struggling', label: 'Struggling' },
  { value: 'dormant', label: 'Dormant' },
];

const STATUS_LABELS = {
  healthy: 'Healthy',
  recovering: 'Recovering',
  struggling: 'Struggling',
  dormant: 'Dormant',
};

// Location options for select dropdown
const LOCATION_OPTIONS = [
  { value: '', label: 'Select location...' },
  { value: 'windowsill', label: 'Windowsill' },
  { value: 'shelf', label: 'Plant Shelf' },
  { value: 'light_stand', label: 'Light Stand' },
  { value: 'greenhouse', label: 'Greenhouse' },
  { value: 'other', label: 'Other' },
];

// Pot size options for select dropdown
const POT_SIZE_OPTIONS = [
  { value: '', label: 'Select size...' },
  { value: '2"', label: '2" (Mini/Starter)' },
  { value: '2.5"', label: '2.5"' },
  { value: '3"', label: '3" (Semi-mini)' },
  { value: '3.5"', label: '3.5"' },
  { value: '4"', label: '4" (Standard)' },
  { value: '4.5"', label: '4.5"' },
  { value: '5"', label: '5" (Large)' },
  { value: '6"', label: '6"' },
  { value: '6"+', label: '6"+ (Extra Large)' },
];

// Bloom color options for select dropdown
const BLOOM_COLOR_OPTIONS = [
  { value: '', label: 'Select color...' },
  { value: 'pink', label: 'Pink' },
  { value: 'purple', label: 'Purple' },
  { value: 'blue', label: 'Blue' },
  { value: 'white', label: 'White' },
  { value: 'red', label: 'Red' },
  { value: 'lavender', label: 'Lavender' },
  { value: 'coral', label: 'Coral' },
  { value: 'bi-color', label: 'Bi-color' },
  { value: 'multi', label: 'Multi-color' },
];

const BLOOM_COLOR_LABELS = {
  pink: 'Pink',
  purple: 'Purple',
  blue: 'Blue',
  white: 'White',
  red: 'Red',
  lavender: 'Lavender',
  coral: 'Coral',
  'bi-color': 'Bi-color',
  multi: 'Multi-color',
};

const LOCATION_LABELS = {
  windowsill: 'Windowsill',
  shelf: 'Plant Shelf',
  light_stand: 'Light Stand',
  greenhouse: 'Greenhouse',
  other: 'Other',
};

export default function PlantDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { careThresholds } = useSettings();

  // Data fetching
  const { data: plant, isLoading, error } = usePlant(id);
  const { data: careLogs = [], isLoading: logsLoading } = useCareLogs({
    plantId: id,
    limit: 10,
  });
  const { mutateAsync: logCare, isPending } = useLogCare();
  const updatePlant = useUpdatePlant();
  const deletePlant = useDeletePlant();

  // Edit mode state
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Initialize form data when entering edit mode
  useEffect(() => {
    if (plant && isEditing && !formData) {
      setFormData({
        cultivar_name: plant.cultivar_name || '',
        nickname: plant.nickname || '',
        photo_url: plant.photo_url || '',
        acquisition_date: plant.acquisition_date || '',
        source: plant.source || '',
        location: plant.location || '',
        status: plant.status || 'healthy',
        pot_size: plant.pot_size || '',
        bloom_color: plant.bloom_color || '',
        notes: plant.notes || '',
      });
    }
  }, [plant, isEditing, formData]);

  // Warn on navigation with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasChanges]);

  // Update a form field
  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  // Handle save
  const handleSave = async () => {
    if (!formData.cultivar_name.trim()) {
      alert('Cultivar name is required');
      return;
    }

    try {
      await updatePlant.mutateAsync({
        id: plant.id,
        updates: {
          ...formData,
          // Clean empty strings to null
          nickname: formData.nickname || null,
          acquisition_date: formData.acquisition_date || null,
          source: formData.source || null,
          location: formData.location || null,
          pot_size: formData.pot_size || null,
          bloom_color: formData.bloom_color || null,
          notes: formData.notes || null,
        },
      });

      setIsEditing(false);
      setFormData(null);
      setHasChanges(false);
    } catch (err) {
      console.error('Failed to update plant:', err);
      alert('Failed to save changes. Please try again.');
    }
  };

  // Handle cancel
  const handleCancel = () => {
    if (hasChanges) {
      if (window.confirm('You have unsaved changes. Are you sure you want to cancel?')) {
        setIsEditing(false);
        setFormData(null);
        setHasChanges(false);
      }
    } else {
      setIsEditing(false);
      setFormData(null);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    try {
      await deletePlant.mutateAsync(plant.id);
      navigate('/library');
    } catch (err) {
      console.error('Failed to delete plant:', err);
      alert('Failed to delete plant. Please try again.');
    }
  };

  // Format date for display
  const formatDate = (dateStr) => {
    if (!dateStr) return null;
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted">Loading plant details...</p>
      </div>
    );
  }

  if (error || !plant) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="card p-8 text-center max-w-md">
          <p className="heading heading-lg mb-2">Plant not found</p>
          <p className="text-muted mb-4">
            {error?.message || "This plant doesn't exist or was deleted."}
          </p>
          <Link to="/library">
            <button className="btn btn-primary">Back to Library</button>
          </Link>
        </div>
      </div>
    );
  }

  const careStatuses = getPlantCareStatuses(plant, careThresholds);
  const displayName = plant.nickname || plant.cultivar_name || 'Unnamed Plant';

  return (
    <div className="min-h-screen p-6 md:p-10">
      <div className="max-w-4xl mx-auto">
        {/* Header Navigation */}
        <header className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="icon-container">
              <ArrowLeft size={20} style={{ color: 'var(--sage-600)' }} />
            </button>
            {isEditing && (
              <h1 className="heading heading-lg">Edit Plant</h1>
            )}
          </div>

          <div className="flex items-center gap-3">
            {isEditing ? (
              <>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleCancel}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-primary"
                  onClick={handleSave}
                  disabled={updatePlant.isPending}
                >
                  {updatePlant.isPending ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check size={18} />
                      Save Changes
                    </>
                  )}
                </button>
              </>
            ) : (
              <>
                <button
                  className="btn btn-secondary"
                  onClick={() => setIsEditing(true)}
                >
                  <Pencil size={18} />
                  Edit
                </button>
                <button
                  className="icon-container"
                  onClick={() => setShowDeleteConfirm(true)}
                  title="Delete plant"
                >
                  <Trash2 size={18} style={{ color: 'var(--color-error)' }} />
                </button>
              </>
            )}
          </div>
        </header>

        {/* Plant Info Card (View/Edit Mode) */}
        <div className="card p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Plant Image */}
            <div className="flex-shrink-0">
              {isEditing ? (
                <PhotoUpload
                  value={formData?.photo_url}
                  onChange={(url) => updateField('photo_url', url)}
                />
              ) : (
                <div
                  className="w-48 h-48 rounded-xl overflow-hidden flex items-center justify-center"
                  style={{ background: 'var(--cream-200)' }}
                >
                  {plant.photo_url ? (
                    <img
                      src={plant.photo_url}
                      alt={displayName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Flower2 size={64} style={{ color: 'var(--sage-400)' }} />
                  )}
                </div>
              )}
            </div>

            {/* Primary Info */}
            <div className="flex-1 min-w-0 space-y-5">
              <EditableField
                label="Cultivar Name"
                value={isEditing ? formData?.cultivar_name : plant.cultivar_name}
                isEditing={isEditing}
                onChange={(v) => updateField('cultivar_name', v)}
                placeholder="e.g., Optimara EverGrace"
                required
              />

              <EditableField
                label="Nickname"
                value={isEditing ? formData?.nickname : plant.nickname}
                isEditing={isEditing}
                onChange={(v) => updateField('nickname', v)}
                placeholder="e.g., Grace"
              />
            </div>
          </div>

          <div
            className="my-6"
            style={{ borderTop: '1px solid var(--sage-200)' }}
          />

          {/* Detail Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <EditableField
              label="Acquired Date"
              value={isEditing ? formData?.acquisition_date : plant.acquisition_date}
              displayValue={formatDate(plant.acquisition_date)}
              isEditing={isEditing}
              onChange={(v) => updateField('acquisition_date', v)}
              type="date"
            />

            <EditableField
              label="Source"
              value={isEditing ? formData?.source : plant.source}
              isEditing={isEditing}
              onChange={(v) => updateField('source', v)}
              placeholder="e.g., Local nursery"
            />

            <EditableField
              label="Location"
              value={isEditing ? formData?.location : plant.location}
              displayValue={LOCATION_LABELS[plant.location]}
              isEditing={isEditing}
              onChange={(v) => updateField('location', v)}
              options={LOCATION_OPTIONS}
            />

            <EditableField
              label="Status"
              value={isEditing ? formData?.status : plant.status}
              displayValue={STATUS_LABELS[plant.status]}
              isEditing={isEditing}
              onChange={(v) => updateField('status', v)}
              options={STATUS_OPTIONS}
            />

            <EditableField
              label="Pot Size"
              value={isEditing ? formData?.pot_size : plant.pot_size}
              displayValue={plant.pot_size || 'Not set'}
              isEditing={isEditing}
              onChange={(v) => updateField('pot_size', v)}
              options={POT_SIZE_OPTIONS}
            />

            <EditableField
              label="Bloom Color"
              value={isEditing ? formData?.bloom_color : plant.bloom_color}
              displayValue={BLOOM_COLOR_LABELS[plant.bloom_color] || 'Not set'}
              isEditing={isEditing}
              onChange={(v) => updateField('bloom_color', v)}
              options={BLOOM_COLOR_OPTIONS}
            />
          </div>

          <div
            className="my-6"
            style={{ borderTop: '1px solid var(--sage-200)' }}
          />

          {/* Notes */}
          <EditableField
            label="Notes"
            value={isEditing ? formData?.notes : plant.notes}
            isEditing={isEditing}
            onChange={(v) => updateField('notes', v)}
            multiline
            placeholder="Any notes about this plant..."
          />
        </div>

        {/* Care Status Grid (only in view mode) */}
        {!isEditing && (
          <>
            <section className="mb-6">
              <h2 className="heading heading-md mb-4">Care Status</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <CareStatusCard
                  careType="watering"
                  status={careStatuses.watering}
                  lastDate={plant.last_watered}
                />
                <CareStatusCard
                  careType="fertilizing"
                  status={careStatuses.fertilizing}
                  lastDate={plant.last_fertilized}
                />
                <CareStatusCard
                  careType="grooming"
                  status={careStatuses.grooming}
                  lastDate={plant.last_groomed}
                />
              </div>
            </section>

            {/* Quick Care Actions */}
            <QuickCareActions
              plantId={id}
              onLogCare={logCare}
              isPending={isPending}
              currentPotSize={plant.pot_size}
            />

            {/* Care History */}
            <CareHistory logs={careLogs} isLoading={logsLoading} />
          </>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50 p-4"
          style={{ background: 'rgba(0, 0, 0, 0.5)' }}
        >
          <div className="card p-8 max-w-md w-full">
            <h2 className="heading heading-lg mb-2">Delete Plant?</h2>
            <p className="text-muted mb-6">
              Are you sure you want to delete "{displayName}"? This will also
              delete all care logs and cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                className="btn btn-secondary"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </button>
              <button
                className="btn btn-danger"
                onClick={handleDelete}
                disabled={deletePlant.isPending}
              >
                {deletePlant.isPending ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
