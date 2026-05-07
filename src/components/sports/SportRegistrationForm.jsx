/**
 * SportRegistrationForm - Full registration flow for a new sport.
 *
 * Used as the page at /sports/new. Renders its own HeaderBar + PremiumGate so it
 * can stand alone behind a route. Layout is single-column, vertically scrollable
 * for the mobile-first registration flow.
 *
 * The live description preview pins to the bottom on mobile, sits inline on
 * larger screens.
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Loader2, Sparkles } from 'lucide-react';
import { usePlants, useCreatePlant } from '../../hooks/usePlants';
import { useCreateSport } from '../../hooks/useSports';
import { useToast } from '../../hooks/useToast';
import { useAuth } from '../../hooks/useAuth';
import { isArchived } from '../../constants/plantStatus';
import HeaderBar from '../ui/HeaderBar';
import PremiumGate from '../ui/PremiumGate';
import FormField from '../ui/FormField';
import { usePageTitle } from '../../hooks/usePageTitle';
import SportDescriptionBuilder from './SportDescriptionBuilder';
import SportDescriptionPreview from './SportDescriptionPreview';

const PARENT_MODE = { COLLECTION: 'collection', FREE_TEXT: 'free_text' };

export default function SportRegistrationForm() {
  usePageTitle('Register a sport');
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useAuth();
  const { data: allPlants = [] } = usePlants();
  const createSport = useCreateSport();
  const createPlant = useCreatePlant();

  const plants = useMemo(() => allPlants.filter((p) => !isArchived(p.status)), [allPlants]);

  const previewRef = useRef(null);
  const [previewHeight, setPreviewHeight] = useState(140);

  const [parentMode, setParentMode] = useState(PARENT_MODE.COLLECTION);
  const [addToLibrary, setAddToLibrary] = useState(false);
  const [formData, setFormData] = useState({
    parent_plant_id: '',
    parent_cultivar_name: '',
    working_name: '',
    discovered_date: new Date().toISOString().split('T')[0],
    discovered_by: user?.user_metadata?.full_name || user?.email?.split('@')[0] || '',
    description: {},
    notes: '',
  });
  const [errors, setErrors] = useState({});

  const update = (patch) => setFormData((prev) => ({ ...prev, ...patch }));

  const validate = () => {
    const next = {};
    if (parentMode === PARENT_MODE.COLLECTION && !formData.parent_plant_id) {
      next.parent_plant_id = 'Please select a parent plant or switch to free-text';
    }
    if (parentMode === PARENT_MODE.FREE_TEXT && !formData.parent_cultivar_name.trim()) {
      next.parent_cultivar_name = 'Please enter a parent cultivar name';
    }
    if (!formData.discovered_date) next.discovered_date = 'Discovery date is required';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      parent_plant_id:
        parentMode === PARENT_MODE.COLLECTION ? formData.parent_plant_id : null,
      parent_cultivar_name:
        parentMode === PARENT_MODE.FREE_TEXT
          ? formData.parent_cultivar_name.trim()
          : null,
      working_name: formData.working_name.trim() || null,
      discovered_date: formData.discovered_date,
      discovered_by: formData.discovered_by.trim() || null,
      notes: formData.notes.trim() || null,
      ...formData.description,
    };

    try {
      const sport = await createSport.mutateAsync(payload);

      if (addToLibrary) {
        const parentPlant =
          parentMode === PARENT_MODE.COLLECTION
            ? plants.find((p) => p.id === formData.parent_plant_id)
            : null;
        const parentLabel =
          parentPlant?.cultivar_name ||
          parentPlant?.nickname ||
          formData.parent_cultivar_name.trim() ||
          'unknown parent';

        try {
          await createPlant.mutateAsync(buildPlantFromSport(payload, parentLabel));
          toast.success('Sport recorded and added to library');
        } catch (err) {
          // Sport was saved; surface the plant-creation failure separately so the
          // user knows what to retry.
          toast.success('Sport recorded');
          toast.error(`Could not add to library: ${err.message || 'unknown error'}`);
        }
      } else {
        toast.success('Sport recorded');
      }

      navigate(`/sports/${sport.id}`);
    } catch (err) {
      toast.error(err.message || 'Failed to save sport');
    }
  };

  const previewSport = {
    ...formData.description,
  };

  useEffect(() => {
    const el = previewRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver((entries) => {
      const h = entries[0]?.contentRect?.height;
      if (h) setPreviewHeight(Math.ceil(h));
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen">
      <HeaderBar />
      <PremiumGate feature="sports">
        <main
          className="p-4 md:p-6 lg:p-8"
          style={{ paddingBottom: previewHeight + 32 }}
        >
          <div className="max-w-3xl mx-auto">
            <header className="flex items-center gap-4 mb-6">
              <Link to="/sports">
                <button type="button" className="icon-container">
                  <ArrowLeft size={20} style={{ color: 'var(--sage-600)' }} />
                </button>
              </Link>
              <div className="flex-1">
                <h1 className="heading heading-xl">Register a sport</h1>
                <p className="text-body text-muted">
                  Record a bloom or foliage variation you've observed.
                </p>
              </div>
            </header>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Parent reference */}
              <section className="card p-5 space-y-4">
                <h2 className="heading heading-md">Parent</h2>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className={`btn btn-small ${
                      parentMode === PARENT_MODE.COLLECTION ? 'btn-primary' : 'btn-secondary'
                    }`}
                    onClick={() => setParentMode(PARENT_MODE.COLLECTION)}
                  >
                    From my collection
                  </button>
                  <button
                    type="button"
                    className={`btn btn-small ${
                      parentMode === PARENT_MODE.FREE_TEXT ? 'btn-primary' : 'btn-secondary'
                    }`}
                    onClick={() => setParentMode(PARENT_MODE.FREE_TEXT)}
                  >
                    Cultivar name
                  </button>
                </div>

                {parentMode === PARENT_MODE.COLLECTION ? (
                  <FormField label="Parent plant" required error={errors.parent_plant_id}>
                    <select
                      className={`input w-full ${errors.parent_plant_id ? 'input-error' : ''}`}
                      value={formData.parent_plant_id}
                      onChange={(e) => update({ parent_plant_id: e.target.value })}
                    >
                      <option value="">Select parent plant…</option>
                      {plants.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.cultivar_name}
                          {p.nickname ? ` (${p.nickname})` : ''}
                        </option>
                      ))}
                    </select>
                  </FormField>
                ) : (
                  <FormField
                    label="Parent cultivar name"
                    required
                    error={errors.parent_cultivar_name}
                  >
                    <input
                      type="text"
                      className={`input w-full ${
                        errors.parent_cultivar_name ? 'input-error' : ''
                      }`}
                      placeholder='e.g., "Optimara Little Crystal"'
                      value={formData.parent_cultivar_name}
                      onChange={(e) => update({ parent_cultivar_name: e.target.value })}
                    />
                  </FormField>
                )}
              </section>

              {/* Identity */}
              <section className="card p-5 space-y-4">
                <h2 className="heading heading-md">Sport identity</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField label="Working name">
                    <input
                      type="text"
                      className="input w-full"
                      placeholder={`e.g., "Katrina's Pink Sport"`}
                      value={formData.working_name}
                      onChange={(e) => update({ working_name: e.target.value })}
                    />
                  </FormField>
                  <FormField
                    label="Discovered date"
                    required
                    error={errors.discovered_date}
                  >
                    <input
                      type="date"
                      className={`input w-full ${errors.discovered_date ? 'input-error' : ''}`}
                      value={formData.discovered_date}
                      onChange={(e) => update({ discovered_date: e.target.value })}
                    />
                  </FormField>
                  <FormField label="Discovered by" className="sm:col-span-2">
                    <input
                      type="text"
                      className="input w-full"
                      value={formData.discovered_by}
                      onChange={(e) => update({ discovered_by: e.target.value })}
                    />
                  </FormField>
                </div>
              </section>

              {/* Description */}
              <section className="card p-5 space-y-4">
                <h2 className="heading heading-md">Description</h2>
                <p className="text-small text-muted">
                  Fields follow AVSA registry conventions. Fill in what you can — the canonical
                  description below updates as you go.
                </p>
                <SportDescriptionBuilder
                  value={formData.description}
                  onChange={(description) => update({ description })}
                />
              </section>

              {/* Notes */}
              <section className="card p-5 space-y-4">
                <h2 className="heading heading-md">Notes</h2>
                <FormField label="Notes">
                  <textarea
                    className="input w-full"
                    style={{ minHeight: 100, resize: 'vertical' }}
                    placeholder="Anything else worth remembering — context, conditions, source plant history…"
                    value={formData.notes}
                    onChange={(e) => update({ notes: e.target.value })}
                  />
                </FormField>
              </section>

              {/* Add to library */}
              <section className="card p-5">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={addToLibrary}
                    onChange={(e) => setAddToLibrary(e.target.checked)}
                    className="mt-1"
                    style={{ accentColor: 'var(--purple-500)', width: 18, height: 18 }}
                  />
                  <span className="flex-1">
                    <span
                      className="text-small font-semibold"
                      style={{ color: 'var(--sage-700)' }}
                    >
                      Also add this sport as a plant in my library
                    </span>
                    <span
                      className="block text-small text-muted"
                      style={{ marginTop: 2 }}
                    >
                      Creates a new library entry so you can log care, propagate it, or
                      photograph it. The sport record stays linked to its parent.
                    </span>
                  </span>
                </label>
              </section>

              {/* Actions */}
              <div
                className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-2"
                style={{ borderTop: '1px solid var(--sage-200)' }}
              >
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => navigate('/sports')}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={createSport.isPending || createPlant.isPending}
                >
                  {createSport.isPending || createPlant.isPending ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Saving…
                    </>
                  ) : (
                    <>
                      <Sparkles size={18} />
                      {addToLibrary ? 'Register sport & add plant' : 'Register sport'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </main>

        {/* Sticky live preview */}
        <div
          ref={previewRef}
          className="fixed bottom-0 left-0 right-0 border-t"
          style={{
            background: 'var(--gradient-purple-card)',
            borderTop: 'var(--border-purple)',
            boxShadow: '0 -4px 12px rgba(74, 88, 66, 0.08)',
            padding: '14px 20px',
            zIndex: 50,
            maxHeight: '40vh',
            overflowY: 'auto',
          }}
        >
          <div className="max-w-3xl mx-auto">
            <p className="text-label" style={{ color: 'var(--purple-500)' }}>
              Canonical description
            </p>
            <div style={{ marginTop: 4 }}>
              <SportDescriptionPreview
                sport={previewSport}
                placeholder="Fill in the description fields to preview the canonical AVSA-style string."
              />
            </div>
          </div>
        </div>
      </PremiumGate>
    </div>
  );
}

// Maps the sport payload to the plant fields the library page expects. Bloom
// color combines primary + secondary; lineage is recorded textually because
// pod_parent_id has breeding semantics that don't apply to sports.
function buildPlantFromSport(sport, parentLabel) {
  const cultivarName =
    sport.registered_name?.trim() ||
    sport.working_name?.trim() ||
    `Sport of ${parentLabel}`;

  const bloomColor = [sport.primary_color, sport.secondary_color]
    .filter(Boolean)
    .join(' & ') || null;

  const sourceText = `Sport of ${parentLabel}`;
  const lineageNotes =
    sport.discovered_date && sport.discovered_by
      ? `Sport discovered ${sport.discovered_date} by ${sport.discovered_by}.`
      : sport.discovered_date
        ? `Sport discovered ${sport.discovered_date}.`
        : null;

  return {
    cultivar_name: cultivarName,
    avsa_number: sport.avsa_registration_number || null,
    hybridizer: sport.discovered_by || null,
    acquisition_date: sport.discovered_date || null,
    source: sourceText,
    status: 'healthy',
    bloom_color: bloomColor,
    bloom_type: sport.bloom_type || null,
    size_class: sport.size_class || null,
    leaf_color: sport.foliage_color || null,
    lineage_notes: lineageNotes,
    notes: sport.notes || null,
  };
}
