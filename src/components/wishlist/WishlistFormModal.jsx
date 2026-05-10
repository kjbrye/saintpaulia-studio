/**
 * WishlistFormModal — used for both adding and editing wishlist items.
 */

import { useEffect, useState } from 'react';
import { Loader2, X } from 'lucide-react';
import FormField from '../ui/FormField';
import { PRIORITY_OPTIONS, WISHLIST_COPY } from '../../constants/wishlistOptions';

const TONE_BORDER = {
  copper: 'var(--copper-500)',
  purple: 'var(--purple-400)',
  sage: 'var(--sage-500)',
};

const TONE_BG = {
  copper: 'var(--gradient-copper-card)',
  purple: 'var(--gradient-purple-card)',
  sage: 'var(--gradient-sage-card)',
};

const TONE_TEXT = {
  copper: 'var(--copper-700)',
  purple: 'var(--purple-500)',
  sage: 'var(--sage-700)',
};

const EMPTY_FORM = {
  cultivar_name: '',
  hybridizer: '',
  source: '',
  priority: 'medium',
  notes: '',
};

export default function WishlistFormModal({
  open,
  onClose,
  onSubmit,
  initialValues = null,
  isSubmitting = false,
}) {
  const isEdit = !!initialValues;
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!open) return;
    setForm(
      initialValues
        ? {
            cultivar_name: initialValues.cultivar_name ?? '',
            hybridizer: initialValues.hybridizer ?? '',
            source: initialValues.source ?? '',
            priority: initialValues.priority ?? 'medium',
            notes: initialValues.notes ?? '',
          }
        : EMPTY_FORM,
    );
    setErrors({});
  }, [open, initialValues]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const update = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: null }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.cultivar_name.trim()) {
      setErrors({ cultivar_name: 'Cultivar name is required' });
      return;
    }
    onSubmit({
      cultivar_name: form.cultivar_name.trim(),
      hybridizer: form.hybridizer.trim() || null,
      source: form.source.trim() || null,
      priority: form.priority,
      notes: form.notes.trim() || null,
    });
  };

  return (
    <div
      className="fixed inset-0 flex items-end sm:items-center justify-center z-50 sm:p-4"
      style={{ background: 'rgba(0, 0, 0, 0.5)' }}
      onClick={(e) => e.target === e.currentTarget && onClose?.()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="wishlist-modal-title"
    >
      <div
        className="card w-full sm:max-w-lg p-6 sm:p-8"
        style={{
          borderColor: 'var(--sage-300)',
          maxHeight: '92vh',
          overflowY: 'auto',
          borderRadius: 'var(--radius-xl) var(--radius-xl) 0 0',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 mb-1">
          <h2 id="wishlist-modal-title" className="heading heading-lg">
            {isEdit ? WISHLIST_COPY.modalEditTitle : WISHLIST_COPY.modalAddTitle}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="icon-container icon-container-sm"
            aria-label="Close"
          >
            <X size={16} style={{ color: 'var(--sage-600)' }} />
          </button>
        </div>
        <p
          style={{
            fontFamily: 'var(--font-heading)',
            fontStyle: 'italic',
            fontSize: 15,
            color: 'var(--purple-500)',
            marginBottom: 20,
          }}
        >
          {WISHLIST_COPY.modalSubtitle}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField
            label={
              <span>
                Cultivar name{' '}
                <span style={{ color: 'var(--copper-500)' }}>*</span>
              </span>
            }
            error={errors.cultivar_name}
          >
            <input
              type="text"
              autoFocus
              className={`input w-full ${errors.cultivar_name ? 'input-error' : ''}`}
              placeholder="e.g., Optimara EverGrace"
              value={form.cultivar_name}
              onChange={(e) => update('cultivar_name', e.target.value)}
            />
          </FormField>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Hybridizer">
              <input
                type="text"
                className="input w-full"
                placeholder="e.g., Holtkamp"
                value={form.hybridizer}
                onChange={(e) => update('hybridizer', e.target.value)}
              />
            </FormField>
            <FormField label="Source">
              <input
                type="text"
                className="input w-full"
                placeholder="seller, show, friend…"
                value={form.source}
                onChange={(e) => update('source', e.target.value)}
              />
            </FormField>
          </div>

          <FormField label="Priority">
            <div className="grid grid-cols-3 gap-2">
              {PRIORITY_OPTIONS.map((p) => {
                const Icon = p.icon;
                const selected = form.priority === p.value;
                return (
                  <button
                    type="button"
                    key={p.value}
                    onClick={() => update('priority', p.value)}
                    className="flex items-center justify-center gap-1.5 py-2 px-2 transition-all"
                    style={{
                      borderRadius: 'var(--radius-md)',
                      background: selected ? TONE_BG[p.tone] : 'var(--gradient-sage-inset)',
                      border: selected
                        ? `2px solid ${TONE_BORDER[p.tone]}`
                        : '2px solid transparent',
                      color: selected ? TONE_TEXT[p.tone] : 'var(--text-muted)',
                      fontSize: 13,
                      fontWeight: 600,
                    }}
                    aria-pressed={selected}
                  >
                    <Icon size={14} />
                    {p.shortLabel}
                  </button>
                );
              })}
            </div>
          </FormField>

          <FormField label="Notes">
            <textarea
              className="input w-full"
              style={{ minHeight: 84, resize: 'vertical' }}
              placeholder="Why this one? Anything to remember…"
              value={form.notes}
              onChange={(e) => update('notes', e.target.value)}
            />
          </FormField>

          <div
            className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4"
            style={{ borderTop: '1px solid var(--sage-200)' }}
          >
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting || !form.cultivar_name.trim()}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Saving…
                </>
              ) : isEdit ? (
                'Save changes'
              ) : (
                'Add to wishlist'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
