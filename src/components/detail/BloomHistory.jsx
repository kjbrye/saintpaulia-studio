/**
 * BloomHistory - Bloom log section for plant detail page
 *
 * Shows active and past blooms with the ability to log new blooms and end active ones.
 */

import { useState } from 'react';
import { Flower2, Plus, Clock, X, Check, Trash2 } from 'lucide-react';

const QUALITY_OPTIONS = [
  { value: '', label: 'Select quality...' },
  { value: 'excellent', label: 'Excellent' },
  { value: 'good', label: 'Good' },
  { value: 'fair', label: 'Fair' },
  { value: 'poor', label: 'Poor' },
];

const QUALITY_LABELS = {
  excellent: 'Excellent',
  good: 'Good',
  fair: 'Fair',
  poor: 'Poor',
};

function formatDate(dateStr) {
  if (!dateStr) return null;
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function BloomLogItem({ log, onEnd, onDelete, isEnding, isDeleting }) {
  const isActive = !log.bloom_end_date;
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  return (
    <div className="flex items-start gap-4 py-3">
      <div className="icon-container icon-container-sm" style={{
        background: isActive ? 'var(--purple-100)' : 'var(--sage-100)',
      }}>
        <Flower2 size={14} style={{ color: isActive ? 'var(--purple-400)' : 'var(--sage-500)' }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-body font-medium">
            {formatDate(log.bloom_start_date)}
            {log.bloom_end_date && (
              <span style={{ color: 'var(--text-secondary)' }}> — {formatDate(log.bloom_end_date)}</span>
            )}
          </p>
          {isActive && (
            <span
              className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
              style={{ background: 'var(--purple-100)', color: 'var(--purple-600)' }}
            >
              Active
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 mt-0.5">
          {log.flower_count && (
            <span className="text-small text-muted">{log.flower_count} flower{log.flower_count !== 1 ? 's' : ''}</span>
          )}
          {log.bloom_quality && (
            <span className="text-small text-muted">{QUALITY_LABELS[log.bloom_quality] || log.bloom_quality}</span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-1 flex-shrink-0">
        {isActive && (
          <button
            onClick={() => onEnd(log.id)}
            disabled={isEnding}
            className="px-2.5 py-1 rounded-lg text-small font-medium transition-all"
            style={{ background: 'var(--sage-100)', color: 'var(--sage-600)' }}
            title="End bloom"
          >
            {isEnding ? '...' : 'End'}
          </button>
        )}
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
            title="Delete bloom log"
          >
            <Trash2 size={12} style={{ color: 'var(--sage-400)' }} />
          </button>
        )}
      </div>
    </div>
  );
}

function NewBloomForm({ onSubmit, onCancel, isPending }) {
  const today = new Date().toISOString().split('T')[0];
  const [startDate, setStartDate] = useState(today);
  const [flowerCount, setFlowerCount] = useState('');
  const [quality, setQuality] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      bloom_start_date: new Date(startDate).toISOString(),
      flower_count: flowerCount ? parseInt(flowerCount, 10) : null,
      bloom_quality: quality || null,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="card-inset p-4 space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="block mb-1 text-small font-medium" style={{ color: 'var(--sage-600)' }}>
            Start Date
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="input w-full py-1.5 text-small"
            required
          />
        </div>
        <div>
          <label className="block mb-1 text-small font-medium" style={{ color: 'var(--sage-600)' }}>
            Flower Count
          </label>
          <input
            type="number"
            min="1"
            value={flowerCount}
            onChange={(e) => setFlowerCount(e.target.value)}
            className="input w-full py-1.5 text-small"
            placeholder="Optional"
          />
        </div>
        <div>
          <label className="block mb-1 text-small font-medium" style={{ color: 'var(--sage-600)' }}>
            Quality
          </label>
          <select
            value={quality}
            onChange={(e) => setQuality(e.target.value)}
            className="input w-full py-1.5 text-small"
          >
            {QUALITY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <button type="button" onClick={onCancel} className="btn btn-secondary btn-sm">
          Cancel
        </button>
        <button type="submit" disabled={isPending} className="btn btn-primary btn-sm">
          {isPending ? 'Saving...' : 'Log Bloom'}
        </button>
      </div>
    </form>
  );
}

export default function BloomHistory({
  logs = [],
  isLoading,
  onCreateBloom,
  onEndBloom,
  onDeleteBloom,
  isCreating,
  isEnding,
  isDeleting,
}) {
  const [showForm, setShowForm] = useState(false);

  const activeBlooms = logs.filter((log) => !log.bloom_end_date);
  const pastBlooms = logs.filter((log) => log.bloom_end_date);

  const handleCreate = async (data) => {
    await onCreateBloom(data);
    setShowForm(false);
  };

  if (isLoading) {
    return (
      <div className="card p-6">
        <h2 className="heading heading-md mb-4">Bloom History</h2>
        <p className="text-muted">Loading blooms...</p>
      </div>
    );
  }

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="heading heading-md">Bloom History</h2>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="btn btn-secondary btn-sm"
          >
            <Plus size={16} />
            Log Bloom
          </button>
        )}
      </div>

      {showForm && (
        <div className="mb-4">
          <NewBloomForm
            onSubmit={handleCreate}
            onCancel={() => setShowForm(false)}
            isPending={isCreating}
          />
        </div>
      )}

      {logs.length === 0 && !showForm ? (
        <div className="card-inset p-6 text-center">
          <Flower2 size={24} style={{ color: 'var(--sage-400)' }} className="mx-auto mb-2" />
          <p className="text-muted">No blooms recorded yet</p>
        </div>
      ) : (
        <>
          {activeBlooms.length > 0 && (
            <div className="card-inset p-4 mb-3">
              <p className="text-small font-medium mb-1" style={{ color: 'var(--purple-500)' }}>
                Currently Blooming
              </p>
              <div className="divide-y divide-[var(--sage-200)]">
                {activeBlooms.map((log) => (
                  <BloomLogItem
                    key={log.id}
                    log={log}
                    onEnd={onEndBloom}
                    onDelete={onDeleteBloom}
                    isEnding={isEnding}
                    isDeleting={isDeleting}
                  />
                ))}
              </div>
            </div>
          )}

          {pastBlooms.length > 0 && (
            <div className="card-inset p-4">
              <p className="text-small font-medium mb-1" style={{ color: 'var(--sage-500)' }}>
                Past Blooms
              </p>
              <div className="divide-y divide-[var(--sage-200)]">
                {pastBlooms.map((log) => (
                  <BloomLogItem
                    key={log.id}
                    log={log}
                    onEnd={onEndBloom}
                    onDelete={onDeleteBloom}
                    isEnding={isEnding}
                    isDeleting={isDeleting}
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
