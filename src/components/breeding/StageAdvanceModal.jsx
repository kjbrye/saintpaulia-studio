/**
 * StageAdvanceModal - Modal for advancing a cross to the next stage.
 * Captures stage-specific data and notes.
 */

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { BREEDING_STAGES } from './CrossCard';

// Stage-specific fields to capture
const STAGE_FIELDS = {
  pod_forming: [
    { key: 'pod_size', label: 'Pod Size', type: 'select', options: ['small', 'medium', 'large'] },
  ],
  harvested: [
    { key: 'seed_count', label: 'Seed Count', type: 'number', min: 0 },
    { key: 'pod_condition', label: 'Pod Condition', type: 'select', options: ['green', 'brown', 'split'] },
  ],
  sown: [
    { key: 'sowing_method', label: 'Sowing Method', type: 'select', options: ['surface sow', 'covered', 'baggie method'] },
  ],
  sprouted: [
    { key: 'germination_count', label: 'Germination Count', type: 'number', min: 0 },
    { key: 'days_to_germinate', label: 'Days to Germinate', type: 'number', min: 0 },
  ],
  blooming: [],
  failed: [
    { key: 'failure_reason', label: 'Reason for Failure', type: 'select', options: ['no pod formed', 'pod dropped', 'no germination', 'seedlings died', 'contamination', 'other'] },
  ],
};

export default function StageAdvanceModal({ cross, targetStage, onConfirm, onCancel, isPending }) {
  const [notes, setNotes] = useState('');
  const [stageData, setStageData] = useState({});

  const stageInfo = BREEDING_STAGES.find(s => s.key === targetStage.key) || targetStage;
  const Icon = stageInfo.icon;
  const fields = STAGE_FIELDS[targetStage.key] || [];
  const isFailing = targetStage.key === 'failed';

  const updateField = (key, value) => {
    setStageData(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = Object.keys(stageData).length > 0 ? stageData : undefined;
    onConfirm({
      stage: targetStage.key,
      notes: notes.trim() || undefined,
      data,
    });
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{ background: 'rgba(0, 0, 0, 0.5)' }}
      onClick={(e) => e.target === e.currentTarget && onCancel()}
    >
      <div className="card p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div
            className="flex items-center justify-center w-10 h-10 rounded-full"
            style={{ background: isFailing ? 'var(--color-error)' : 'var(--purple-100)' }}
          >
            <Icon size={20} style={{ color: isFailing ? 'white' : 'var(--purple-500)' }} />
          </div>
          <div>
            <h2 className="heading heading-md">
              {isFailing ? 'Mark as Failed' : `Advance to ${stageInfo.label}`}
            </h2>
            <p className="text-small text-muted">
              {cross.pod_parent_name || 'Unknown'} × {cross.pollen_parent_name || 'Unknown'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Stage-specific fields */}
          {fields.map(field => (
            <div key={field.key}>
              <label className="text-label text-muted block mb-1">{field.label}</label>
              {field.type === 'number' ? (
                <input
                  type="number"
                  className="input w-full"
                  min={field.min}
                  value={stageData[field.key] ?? ''}
                  onChange={(e) => updateField(field.key, e.target.value ? Number(e.target.value) : undefined)}
                />
              ) : field.type === 'select' ? (
                <select
                  className="input w-full"
                  value={stageData[field.key] || ''}
                  onChange={(e) => updateField(field.key, e.target.value || undefined)}
                >
                  <option value="">Select...</option>
                  {field.options.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  className="input w-full"
                  value={stageData[field.key] || ''}
                  onChange={(e) => updateField(field.key, e.target.value || undefined)}
                />
              )}
            </div>
          ))}

          {/* Notes */}
          <div>
            <label className="text-label text-muted block mb-1">Notes (optional)</label>
            <textarea
              className="input w-full"
              style={{ minHeight: 80, resize: 'vertical' }}
              placeholder={isFailing ? 'What happened...' : 'Any observations for this stage...'}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              autoFocus={fields.length === 0}
            />
          </div>

          {/* Actions */}
          <div
            className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4"
            style={{ borderTop: '1px solid var(--sage-200)' }}
          >
            <button type="button" className="btn btn-secondary" onClick={onCancel}>
              Cancel
            </button>
            <button
              type="submit"
              className={`btn ${isFailing ? 'btn-danger' : 'btn-primary'}`}
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  {isFailing ? 'Marking...' : 'Advancing...'}
                </>
              ) : (
                isFailing ? 'Mark Failed' : `Advance to ${stageInfo.label}`
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
