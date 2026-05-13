/**
 * PlantDetail Page - Individual plant view.
 *
 * View mode renders the revamped layout (hero / care / bloom history /
 * activity / notes / details / lineage). Edit mode reuses the existing
 * EditableField grid in-place.
 */

import { useState, useEffect, useMemo } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Pencil, Trash2, Check, Loader2, Archive, RotateCcw } from 'lucide-react';
import { usePlant, useUpdatePlant, useDeletePlant } from '../hooks/usePlants';
import { useCareLogs, useLogCare } from '../hooks/useCare';
import {
  useBloomLogs,
  useCreateBloomLog,
  useEndBloom,
  useUpdateBloomLog,
  useDeleteBloomLog,
} from '../hooks/useBlooms';
import { useHealthLogs, useCreateHealthLog } from '../hooks/useHealth';
import {
  usePlantJournal,
  useCreateJournalEntry,
  useDeleteJournalEntry,
  journalKeys,
} from '../hooks/useJournal';
import { useToast } from '../hooks/useToast';
import { useSettings } from '../hooks/useSettings.jsx';
import { getPlantCareStatuses } from '../utils/careStatus';
import {
  PlantHero,
  CareSection,
  BloomHistorySection,
  ActivityLog,
  DetailsSection,
} from '../components/detail';
import EditableField from '../components/ui/EditableField';
import PhotoUpload from '../components/plants/PhotoUpload';
import { BloomColorPicker, PlantPhotoGallery } from '../components/plants';
import { useSubscription } from '../hooks/useSubscription';
import { Sparkles } from 'lucide-react';
import NotesLog from '../components/ui/NotesLog';
import { MiniPedigree } from '../components/lineage';
import { usePageTitle } from '../hooks/usePageTitle';
import { useSuppressNavShortcuts } from '../hooks/useKeyboardShortcuts';
import {
  STATUS_LABELS,
  STATUS_OPTIONS,
  ARCHIVE_OPTIONS,
  isArchived,
} from '../constants/plantStatus';
import {
  BLOOM_TYPE_OPTIONS,
  BLOOM_TYPE_LABELS,
  SIZE_CLASS_OPTIONS,
  SIZE_CLASS_LABELS,
  EXTRA_BLOOM_COLORS,
  COMPOUND_BLOOM_COLORS,
  BI_MULTI_COLOR_OPTIONS,
  LEAF_TYPE_OPTIONS,
  LEAF_TYPE_LABELS,
  LEAF_COLOR_OPTIONS,
  LEAF_COLOR_LABELS,
} from '../constants/plantOptions';

const LOCATION_OPTIONS = [
  { value: '', label: 'Select location...' },
  { value: 'windowsill', label: 'Windowsill' },
  { value: 'shelf', label: 'Plant Shelf' },
  { value: 'light_stand', label: 'Light Stand' },
  { value: 'greenhouse', label: 'Greenhouse' },
  { value: 'other', label: 'Other' },
];

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
  ...EXTRA_BLOOM_COLORS,
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
  chimera: 'Chimera',
  fantasy: 'Fantasy',
};

const BI_MULTI_COLOR_LABELS = BI_MULTI_COLOR_OPTIONS.reduce((acc, o) => {
  acc[o.value] = o.label;
  return acc;
}, {});

function formatBloomColorDisplay(plant) {
  const base = BLOOM_COLOR_LABELS[plant.bloom_color];
  if (!base) return 'Not set';
  if (!COMPOUND_BLOOM_COLORS.has(plant.bloom_color)) return base;
  const detail = (plant.bloom_colors || [])
    .map((c) => BI_MULTI_COLOR_LABELS[c] || c)
    .join(' & ');
  return detail ? `${base} (${detail})` : base;
}

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
  const toast = useToast();
  const { careThresholds, settings } = useSettings();

  const allLocationOptions = useMemo(() => {
    const custom = (settings.customLocations || []).map((loc) => ({
      value: `custom:${loc}`,
      label: loc,
    }));
    if (custom.length === 0) return LOCATION_OPTIONS;
    return [...LOCATION_OPTIONS, ...custom];
  }, [settings.customLocations]);

  const { data: plant, isLoading, error } = usePlant(id);
  usePageTitle(plant?.nickname || plant?.cultivar_name || 'Plant Detail');
  const { data: careLogs = [], isLoading: logsLoading } = useCareLogs({ plantId: id, limit: 50 });
  const { mutateAsync: logCare, isPending: isLoggingCare } = useLogCare();
  const updatePlant = useUpdatePlant();
  const deletePlant = useDeletePlant();

  const { data: bloomLogs = [], isLoading: bloomsLoading } = useBloomLogs({ plantId: id });
  const createBloomLog = useCreateBloomLog();
  const endBloom = useEndBloom();
  const updateBloomLog = useUpdateBloomLog();
  const deleteBloomLog = useDeleteBloomLog();

  const { data: healthLogs = [], isLoading: healthLoading } = useHealthLogs({ plantId: id });
  const createHealthLog = useCreateHealthLog();

  const { data: journalEntries = [], isLoading: journalLoading } = usePlantJournal(id);
  const createJournalEntry = useCreateJournalEntry();
  const deleteJournalEntry = useDeleteJournalEntry();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showArchiveMenu, setShowArchiveMenu] = useState(false);

  useSuppressNavShortcuts(isEditing);

  const { canUseFeature } = useSubscription();
  const canAddMultiPhotos = canUseFeature('multi_photos');

  useEffect(() => {
    if (plant && isEditing && !formData) {
      setFormData({
        cultivar_name: plant.cultivar_name || '',
        nickname: plant.nickname || '',
        photo_url: plant.photo_url || '',
        photo_urls: plant.photo_urls || [],
        acquisition_date: plant.acquisition_date || '',
        source: plant.source || '',
        location: plant.location || '',
        status: plant.status || 'healthy',
        pot_size: plant.pot_size || '',
        bloom_color: plant.bloom_color || '',
        bloom_colors: plant.bloom_colors || [],
        bloom_type: plant.bloom_type || '',
        size_class: plant.size_class || '',
        leaf_type: plant.leaf_type || '',
        leaf_color: plant.leaf_color || '',
        avsa_number: plant.avsa_number || '',
        hybridizer: plant.hybridizer || '',
        lineage_notes: plant.lineage_notes || '',
        notes: plant.notes || '',
      });
    }
  }, [plant, isEditing, formData]);

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

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!formData.cultivar_name?.trim()) {
      toast.error('Cultivar name is required');
      return;
    }
    try {
      await updatePlant.mutateAsync({
        id: plant.id,
        updates: {
          ...formData,
          nickname: formData.nickname || null,
          acquisition_date: formData.acquisition_date || null,
          source: formData.source || null,
          location: formData.location || null,
          pot_size: formData.pot_size || null,
          bloom_color: formData.bloom_color || null,
          bloom_colors:
            COMPOUND_BLOOM_COLORS.has(formData.bloom_color) && formData.bloom_colors?.length
              ? formData.bloom_colors
              : null,
          bloom_type: formData.bloom_type || null,
          size_class: formData.size_class || null,
          leaf_type: formData.leaf_type || null,
          leaf_color: formData.leaf_color || null,
          avsa_number: formData.avsa_number || null,
          hybridizer: formData.hybridizer || null,
          lineage_notes: formData.lineage_notes || null,
          notes: formData.notes || null,
          photo_urls: canAddMultiPhotos ? (formData.photo_urls || []) : (plant.photo_urls || []),
        },
      });
      setIsEditing(false);
      setFormData(null);
      setHasChanges(false);
    } catch (err) {
      toast.error('Failed to save changes. Please try again.');
    }
  };

  const handleCancel = () => {
    if (hasChanges && !window.confirm('You have unsaved changes. Cancel anyway?')) return;
    setIsEditing(false);
    setFormData(null);
    setHasChanges(false);
  };

  const handleDelete = async () => {
    try {
      await deletePlant.mutateAsync(plant.id);
      navigate('/library');
    } catch {
      toast.error('Failed to delete plant. Please try again.');
    }
  };

  const handleArchive = async (archiveStatus) => {
    try {
      await updatePlant.mutateAsync({ id: plant.id, updates: { status: archiveStatus } });
      setShowArchiveMenu(false);
      toast.success(`Plant marked as ${STATUS_LABELS[archiveStatus].toLowerCase()}`);
    } catch {
      toast.error('Failed to archive plant. Please try again.');
    }
  };

  const handleRestore = async () => {
    try {
      await updatePlant.mutateAsync({ id: plant.id, updates: { status: 'healthy' } });
      toast.success('Plant restored to active collection');
    } catch {
      toast.error('Failed to restore plant. Please try again.');
    }
  };

  const handlePhotoUrlsChange = async (urls) => {
    try {
      await updatePlant.mutateAsync({ id: plant.id, updates: { photo_urls: urls } });
    } catch {
      toast.error('Failed to update photos.');
    }
  };

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
  const plantIsArchived = isArchived(plant.status);
  const activeBloom = bloomLogs.find((l) => !l.bloom_end_date);

  return (
    <div className="min-h-screen p-6 md:p-10">
      <div className="max-w-4xl mx-auto">
        {/* Toolbar */}
        <header className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="icon-container">
              <ArrowLeft size={20} style={{ color: 'var(--sage-600)' }} />
            </button>
            {isEditing && <h1 className="heading heading-lg">Edit Plant</h1>}
          </div>
          <div className="flex items-center gap-3">
            {isEditing ? (
              <>
                <button type="button" className="btn btn-secondary" onClick={handleCancel}>
                  Cancel
                </button>
                <button
                  className="btn btn-primary"
                  onClick={handleSave}
                  disabled={updatePlant.isPending}
                >
                  {updatePlant.isPending ? (
                    <><Loader2 size={18} className="animate-spin" /> Saving...</>
                  ) : (
                    <><Check size={18} /> Save Changes</>
                  )}
                </button>
              </>
            ) : (
              <>
                {plantIsArchived ? (
                  <button className="btn btn-secondary" onClick={handleRestore}>
                    <RotateCcw size={18} /> Restore
                  </button>
                ) : (
                  <div className="relative">
                    <button
                      className="btn btn-secondary"
                      onClick={() => setShowArchiveMenu(!showArchiveMenu)}
                    >
                      <Archive size={18} /> Archive
                    </button>
                    {showArchiveMenu && (
                      <div className="absolute right-0 top-full mt-2 z-10 card p-2 shadow-lg min-w-[180px]">
                        <p className="text-xs text-muted px-3 py-1 mb-1">Mark plant as...</p>
                        {ARCHIVE_OPTIONS.map((opt) => (
                          <button
                            key={opt.value}
                            onClick={() => handleArchive(opt.value)}
                            className="w-full text-left px-3 py-2 text-small rounded-lg transition-colors"
                            onMouseEnter={(e) => (e.target.style.background = 'var(--sage-100)')}
                            onMouseLeave={(e) => (e.target.style.background = 'transparent')}
                          >
                            <span className="font-medium">{opt.label}</span>
                            <span className="block text-xs text-muted">{opt.description}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                <button className="btn btn-secondary" onClick={() => setIsEditing(true)}>
                  <Pencil size={18} /> Edit
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

        {plantIsArchived && !isEditing && (
          <div
            className="card p-4 mb-6 flex items-center justify-between"
            style={{ background: 'var(--sage-100)', borderLeft: '4px solid var(--sage-500)' }}
          >
            <div>
              <p className="text-body font-semibold" style={{ color: 'var(--sage-700)' }}>
                {STATUS_LABELS[plant.status]}
              </p>
              <p className="text-small text-muted">
                This plant has been archived. Its data is preserved for reference.
              </p>
            </div>
            <button className="btn btn-secondary btn-small" onClick={handleRestore}>
              <RotateCcw size={16} /> Restore
            </button>
          </div>
        )}

        {isEditing ? (
          <EditFormCard
            formData={formData}
            updateField={updateField}
            allLocationOptions={allLocationOptions}
            canAddMultiPhotos={canAddMultiPhotos}
            formatDate={formatDate}
          />
        ) : (
          <>
            <PlantHero
              plant={plant}
              displayName={displayName}
              careStatuses={careStatuses}
              activeBloom={activeBloom}
              canAddMultiPhotos={canAddMultiPhotos}
              photoUrls={plant.photo_urls || []}
              onPhotoUrlsChange={handlePhotoUrlsChange}
            />

            {!plantIsArchived && (
              <CareSection
                plant={plant}
                careStatuses={careStatuses}
                onLogCare={async ({ careType, fertilizerType, potSize, treatmentType }) => {
                  await logCare({
                    plantId: id,
                    careType,
                    notes: '',
                    fertilizerType: fertilizerType || null,
                    potSize: potSize || null,
                    treatmentType: treatmentType || null,
                  });
                }}
                isLoggingCare={isLoggingCare}
                onCreateHealthLog={async (data) => {
                  await createHealthLog.mutateAsync({ ...data, plant_id: id });
                }}
                isCreatingHealth={createHealthLog.isPending}
              />
            )}

            <BloomHistorySection
              logs={bloomLogs}
              isLoading={bloomsLoading}
              onCreateBloom={(data) => createBloomLog.mutateAsync({ ...data, plant_id: id })}
              onEndBloom={(logId) =>
                endBloom.mutateAsync({
                  id: logId,
                  plantId: id,
                  endDate: new Date().toISOString().split('T')[0],
                })
              }
              onUpdatePeak={(logId, peak) =>
                updateBloomLog.mutateAsync({
                  id: logId,
                  updates: { peak_bloom_count: peak, flower_count: peak },
                })
              }
              onUpdateBloom={(logId, updates) =>
                updateBloomLog.mutateAsync({ id: logId, updates })
              }
              onDeleteBloom={(logId) => deleteBloomLog.mutateAsync(logId)}
              isCreating={createBloomLog.isPending}
              isEnding={endBloom.isPending}
              isUpdating={updateBloomLog.isPending}
              isDeleting={deleteBloomLog.isPending}
            />

            <ActivityLog
              careLogs={careLogs}
              healthLogs={healthLogs}
              isLoading={logsLoading || healthLoading}
            />

            <NotesLog
              entries={journalEntries}
              onAdd={async (content) => {
                await createJournalEntry.mutateAsync({ plant_id: id, content });
              }}
              onDelete={(entryId) => {
                deleteJournalEntry.mutate({ id: entryId, parentKey: journalKeys.forPlant(id) });
              }}
              isLoading={journalLoading}
              isPending={createJournalEntry.isPending || deleteJournalEntry.isPending}
            />

            <div className="mb-6" />

            <DetailsSection plant={plant} onEdit={() => setIsEditing(true)} />

            <section className="mb-6">
              <MiniPedigree plant={plant} />
            </section>
          </>
        )}
      </div>

      {showDeleteConfirm && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50 p-4"
          style={{ background: 'rgba(0, 0, 0, 0.5)' }}
        >
          <div className="card p-8 max-w-md w-full">
            <h2 className="heading heading-lg mb-2">Delete Plant?</h2>
            <p className="text-muted mb-6">
              Are you sure you want to delete "{displayName}"? All associated care logs, bloom logs,
              health logs, and journal entries will also be removed. This cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button className="btn btn-secondary" onClick={() => setShowDeleteConfirm(false)}>
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

  function EditFormCard({ formData, updateField, allLocationOptions, canAddMultiPhotos, formatDate }) {
    if (!formData) return null;
    return (
      <div className="card p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-shrink-0 space-y-3">
            <PhotoUpload
              value={formData.photo_url}
              onChange={(url) => updateField('photo_url', url)}
            />
            {canAddMultiPhotos ? (
              <div className="w-48">
                <label className="text-small text-muted block mb-2">More photos</label>
                <PlantPhotoGallery
                  value={formData.photo_urls || []}
                  onChange={(urls) => updateField('photo_urls', urls)}
                />
              </div>
            ) : (
              <div
                className="w-48 flex items-center gap-2 px-2 py-1.5 rounded-lg"
                style={{ background: 'var(--cream-100)', border: '1px dashed var(--sage-300)' }}
              >
                <Sparkles size={12} style={{ color: 'var(--copper-500)' }} />
                <span className="text-small" style={{ color: 'var(--text-muted)', fontSize: 11 }}>
                  Add up to 5 photos with Premium
                </span>
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0 space-y-5">
            <EditableField
              label="Cultivar Name"
              value={formData.cultivar_name}
              isEditing
              onChange={(v) => updateField('cultivar_name', v)}
              placeholder="e.g., Optimara EverGrace"
              required
            />
            <EditableField
              label="Nickname"
              value={formData.nickname}
              isEditing
              onChange={(v) => updateField('nickname', v)}
              placeholder="e.g., Grace"
            />
          </div>
        </div>

        <div className="my-6" style={{ borderTop: '1px solid var(--sage-200)' }} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <EditableField
            label="Acquired Date"
            value={formData.acquisition_date}
            isEditing
            onChange={(v) => updateField('acquisition_date', v)}
            type="date"
          />
          <EditableField
            label="Source"
            value={formData.source}
            isEditing
            onChange={(v) => updateField('source', v)}
            placeholder="e.g., Local nursery"
          />
          <EditableField
            label="Location"
            value={formData.location}
            isEditing
            onChange={(v) => updateField('location', v)}
            options={allLocationOptions}
          />
          <EditableField
            label="Status"
            value={formData.status}
            isEditing
            onChange={(v) => updateField('status', v)}
            options={STATUS_OPTIONS}
          />
          <EditableField
            label="Pot Size"
            value={formData.pot_size}
            isEditing
            onChange={(v) => updateField('pot_size', v)}
            options={POT_SIZE_OPTIONS}
          />
          <EditableField
            label="Size Class"
            value={formData.size_class}
            isEditing
            onChange={(v) => updateField('size_class', v)}
            options={SIZE_CLASS_OPTIONS}
          />

          <div>
            <EditableField
              label="Bloom Color"
              value={formData.bloom_color}
              isEditing
              onChange={(v) => {
                updateField('bloom_color', v);
                if (!COMPOUND_BLOOM_COLORS.has(v)) updateField('bloom_colors', []);
              }}
              options={BLOOM_COLOR_OPTIONS}
            />
            {COMPOUND_BLOOM_COLORS.has(formData.bloom_color) && (
              <div style={{ marginTop: 12 }}>
                <BloomColorPicker
                  value={formData.bloom_colors || []}
                  onChange={(colors) => updateField('bloom_colors', colors)}
                  hint={
                    formData.bloom_color === 'bi-color'
                      ? 'Pick the two colors that make up this bloom.'
                      : 'Pick all colors present in this bloom.'
                  }
                />
              </div>
            )}
          </div>

          <EditableField
            label="Bloom Type"
            value={formData.bloom_type}
            isEditing
            onChange={(v) => updateField('bloom_type', v)}
            options={BLOOM_TYPE_OPTIONS}
          />
          <EditableField
            label="Leaf Type"
            value={formData.leaf_type}
            isEditing
            onChange={(v) => updateField('leaf_type', v)}
            options={LEAF_TYPE_OPTIONS}
          />
          <EditableField
            label="Leaf Color"
            value={formData.leaf_color}
            isEditing
            onChange={(v) => updateField('leaf_color', v)}
            options={LEAF_COLOR_OPTIONS}
          />
          <EditableField
            label="AVSA Number"
            value={formData.avsa_number}
            isEditing
            onChange={(v) => updateField('avsa_number', v)}
            placeholder="e.g., 10822"
          />
          <EditableField
            label="Hybridizer"
            value={formData.hybridizer}
            isEditing
            onChange={(v) => updateField('hybridizer', v)}
            placeholder="e.g., LLG Greenhouses"
          />
        </div>

        <div className="my-6" style={{ borderTop: '1px solid var(--sage-200)' }} />

        <EditableField
          label="Notes"
          value={formData.notes}
          isEditing
          onChange={(v) => updateField('notes', v)}
          multiline
          placeholder="Any notes about this plant..."
        />
      </div>
    );
  }
}
