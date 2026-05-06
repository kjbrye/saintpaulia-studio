import { useState } from 'react';
import { Camera, Loader2, Sparkles } from 'lucide-react';
import { useSubscription } from '../../hooks/useSubscription';
import { STRIPE_PRICES } from '../../constants/plans';
import { createCheckoutSession } from '../../services/subscription';
import NotePhotoUploader from './NotePhotoUploader';

function parseTags(input) {
  return input
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);
}

export default function NoteForm({ initialValues, onSubmit, onCancel, isPending, submitLabel = 'Save Note' }) {
  const { canUseFeature } = useSubscription();
  const canAttachPhotos = canUseFeature('note_attachments');

  const [title, setTitle] = useState(initialValues?.title ?? '');
  const [body, setBody] = useState(initialValues?.body ?? '');
  const [tagsInput, setTagsInput] = useState((initialValues?.tags ?? []).join(', '));
  const [photos, setPhotos] = useState(initialValues?.photos ?? []);
  const [upgradeLoading, setUpgradeLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!body.trim()) return;
    try {
      await onSubmit({
        title: title.trim() || null,
        body: body.trim(),
        tags: parseTags(tagsInput),
        photos,
      });
    } catch {
      // error handled by parent
    }
  };

  const handleUpgrade = async () => {
    if (!STRIPE_PRICES.monthly) return;
    setUpgradeLoading(true);
    try {
      const { url } = await createCheckoutSession(STRIPE_PRICES.monthly);
      window.location.href = url;
    } catch {
      setUpgradeLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <input
        type="text"
        className="input w-full"
        placeholder="Title (optional)"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <textarea
        className="input w-full"
        style={{ minHeight: 120, resize: 'vertical' }}
        placeholder="Write a note..."
        value={body}
        onChange={(e) => setBody(e.target.value)}
        autoFocus={!initialValues}
      />
      <input
        type="text"
        className="input w-full"
        placeholder="Tags (comma separated, e.g. soil-recipe, shop-link)"
        value={tagsInput}
        onChange={(e) => setTagsInput(e.target.value)}
      />

      {canAttachPhotos ? (
        <div>
          <label className="text-small text-muted block mb-2">Photos (optional)</label>
          <NotePhotoUploader value={photos} onChange={setPhotos} />
        </div>
      ) : (
        <div
          className="flex items-center justify-between gap-3 p-3 rounded-lg flex-wrap"
          style={{ background: 'var(--cream-100)', border: '1px dashed var(--sage-300)' }}
        >
          <div className="flex items-center gap-2">
            <Camera size={16} style={{ color: 'var(--sage-500)' }} />
            <p className="text-small" style={{ color: 'var(--text-muted)' }}>
              Attach photos to your notes — Premium feature
            </p>
          </div>
          <button
            type="button"
            className="btn btn-primary btn-small"
            disabled={upgradeLoading}
            onClick={handleUpgrade}
          >
            {upgradeLoading ? (
              <>
                <Loader2 size={12} className="animate-spin" /> Redirecting...
              </>
            ) : (
              <>
                <Sparkles size={12} /> Upgrade
              </>
            )}
          </button>
        </div>
      )}

      <div className="flex items-center gap-2">
        <button
          type="submit"
          className="btn btn-primary btn-small"
          disabled={isPending || !body.trim()}
        >
          {isPending ? (
            <>
              <Loader2 size={14} className="animate-spin" /> Saving...
            </>
          ) : (
            submitLabel
          )}
        </button>
        <button type="button" className="btn btn-secondary btn-small" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}
