/**
 * HealthHistory - Health observation log for plant detail page
 *
 * Shows health observations with the ability to log new ones.
 */

import { useState } from 'react';
import { Activity, Plus, Clock, X, Check, Trash2 } from 'lucide-react';

const STATUS_OPTIONS = [
  { value: '', label: 'Select status...' },
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

const STATUS_COLORS = {
  healthy: { bg: 'var(--sage-100)', text: 'var(--sage-700)' },
  recovering: { bg: 'var(--purple-100)', text: 'var(--purple-600)' },
  struggling: { bg: '#fef3c7', text: '#92400e' },
  dormant: { bg: 'var(--cream-200)', text: 'var(--copper-600)' },
};

const SYMPTOM_SUGGESTIONS = [
  'Yellowing leaves',
  'Brown spots',
  'Wilting',
  'Root rot',
  'Mealybugs',
  'Spider mites',
  'Crown rot',
  'Powdery mildew',
  'Leaf curl',
  'Leggy growth',
  'No blooms',
  'Dropping leaves',
];

function formatDate(dateStr) {
  if (!dateStr) return null;
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function HealthLogItem({ log, onDelete, isDeleting }) {
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const statusStyle = STATUS_COLORS[log.health_status] || STATUS_COLORS.healthy;

  return (
    <div className="flex items-start gap-4 py-3">
      <div className="icon-container icon-container-sm">
        <Activity size={14} style={{ color: 'var(--sage-600)' }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-small text-muted">
            {formatDate(log.observation_date)}
          </span>
          {log.health_status && (
            <span
              className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
              style={{ background: statusStyle.bg, color: statusStyle.text }}
            >
              {STATUS_LABELS[log.health_status] || log.health_status}
            </span>
          )}
        </div>
        {log.symptoms && (
          <p className="text-body font-medium">{log.symptoms}</p>
        )}
        {log.notes && (
          <p className="text-small text-muted mt-0.5">{log.notes}</p>
        )}
      </div>
      <div className="flex-shrink-0">
        {showConfirmDelete ? (
          <div className="flex items-center gap-1">
            <button
              onClick={() => { onDelete(log.id); setShowConfirmDelete(false); }}
              disabled={isDeleting}
              className="icon-container icon-container-sm"
              title="Confirm delete"
            >
              <Check size={12} style={{ color: 'var(--color-error)' }} />
            </button>
            <button
              onClick={() => setShowConfirmDelete(false)}
              className="icon-container icon-container-sm"
              title="Cancel"
            >
              <X size={12} style={{ color: 'var(--sage-500)' }} />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowConfirmDelete(true)}
            className="icon-container icon-container-sm"
            title="Delete health log"
          >
            <Trash2 size={12} style={{ color: 'var(--sage-400)' }} />
          </button>
        )}
      </div>
    </div>
  );
}

function NewHealthForm({ onSubmit, onCancel, isPending }) {
  const today = new Date().toISOString().split('T')[0];
  const [observationDate, setObservationDate] = useState(today);
  const [healthStatus, setHealthStatus] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [notes, setNotes] = useState('');

  const addSymptom = (symptom) => {
    const current = symptoms ? symptoms.split(', ') : [];
    if (!current.includes(symptom)) {
      setSymptoms([...current, symptom].join(', '));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      observation_date: new Date(observationDate).toISOString(),
      health_status: healthStatus || null,
      symptoms: symptoms || null,
      notes: notes || null,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="card-inset p-4 space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block mb-1 text-small font-medium" style={{ color: 'var(--sage-600)' }}>
            Observation Date
          </label>
          <input
            type="date"
            value={observationDate}
            onChange={(e) => setObservationDate(e.target.value)}
            className="input w-full py-1.5 text-small"
            required
          />
        </div>
        <div>
          <label className="block mb-1 text-small font-medium" style={{ color: 'var(--sage-600)' }}>
            Health Status
          </label>
          <select
            value={healthStatus}
            onChange={(e) => setHealthStatus(e.target.value)}
            className="input w-full py-1.5 text-small"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block mb-1 text-small font-medium" style={{ color: 'var(--sage-600)' }}>
          Symptoms
        </label>
        <input
          type="text"
          value={symptoms}
          onChange={(e) => setSymptoms(e.target.value)}
          className="input w-full py-1.5 text-small"
          placeholder="e.g., Yellowing leaves, brown spots"
        />
        <div className="flex flex-wrap gap-1.5 mt-2">
          {SYMPTOM_SUGGESTIONS.map((symptom) => (
            <button
              key={symptom}
              type="button"
              onClick={() => addSymptom(symptom)}
              className="px-2 py-0.5 rounded-md text-xs transition-all"
              style={{ background: 'var(--sage-100)', color: 'var(--sage-600)' }}
            >
              {symptom}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block mb-1 text-small font-medium" style={{ color: 'var(--sage-600)' }}>
          Notes
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="input w-full py-1.5 text-small"
          rows={2}
          placeholder="Additional observations or treatment notes..."
        />
      </div>

      <div className="flex justify-end gap-2">
        <button type="button" onClick={onCancel} className="btn btn-secondary btn-sm">
          Cancel
        </button>
        <button type="submit" disabled={isPending} className="btn btn-primary btn-sm">
          {isPending ? 'Saving...' : 'Log Observation'}
        </button>
      </div>
    </form>
  );
}

export default function HealthHistory({
  logs = [],
  isLoading,
  onCreateLog,
  onDeleteLog,
  isCreating,
  isDeleting,
}) {
  const [showForm, setShowForm] = useState(false);

  const handleCreate = async (data) => {
    await onCreateLog(data);
    setShowForm(false);
  };

  if (isLoading) {
    return (
      <div className="card p-6">
        <h2 className="heading heading-md mb-4">Health Log</h2>
        <p className="text-muted">Loading health observations...</p>
      </div>
    );
  }

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="heading heading-md">Health Log</h2>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="btn btn-secondary btn-sm"
          >
            <Plus size={16} />
            Log Observation
          </button>
        )}
      </div>

      {showForm && (
        <div className="mb-4">
          <NewHealthForm
            onSubmit={handleCreate}
            onCancel={() => setShowForm(false)}
            isPending={isCreating}
          />
        </div>
      )}

      {logs.length === 0 && !showForm ? (
        <div className="card-inset p-6 text-center">
          <Activity size={24} style={{ color: 'var(--sage-400)' }} className="mx-auto mb-2" />
          <p className="text-muted">No health observations recorded yet</p>
        </div>
      ) : logs.length > 0 && (
        <div className="card-inset p-4">
          <div className="divide-y divide-[var(--sage-200)]">
            {logs.map((log) => (
              <HealthLogItem
                key={log.id}
                log={log}
                onDelete={onDeleteLog}
                isDeleting={isDeleting}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
