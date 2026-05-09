/**
 * BloomHistorySection - Photo-free bloom history with peak count metrics.
 *
 * Renders an active cycle card (when one exists) with peak-count update,
 * compact past-cycle rows, and a header summary line.
 */

import { useState } from 'react';
import { Flower2, Plus, ChevronRight, ChevronDown, Trash2 } from 'lucide-react';

const QUALITY_LABELS = {
  excellent: 'Excellent',
  good: 'Good',
  fair: 'Fair',
  poor: 'Poor',
};

function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function daysBetween(start, end) {
  if (!start) return 0;
  const a = new Date(start);
  const b = end ? new Date(end) : new Date();
  return Math.max(0, Math.floor((b - a) / (1000 * 60 * 60 * 24)));
}

function NewBloomForm({ onSubmit, onCancel, isPending }) {
  const today = new Date().toISOString().split('T')[0];
  const [startDate, setStartDate] = useState(today);
  const [peakCount, setPeakCount] = useState(1);
  const [quality, setQuality] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      bloom_start_date: new Date(startDate).toISOString(),
      peak_bloom_count: peakCount ? parseInt(peakCount, 10) : 1,
      flower_count: peakCount ? parseInt(peakCount, 10) : null,
      bloom_quality: quality || null,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="card-inset p-4 mb-4 space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="block mb-1 text-small font-medium" style={{ color: 'var(--sage-600)' }}>
            Start date
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
            Peak count
          </label>
          <input
            type="number"
            min="1"
            value={peakCount}
            onChange={(e) => setPeakCount(e.target.value)}
            className="input w-full py-1.5 text-small"
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
            <option value="">Select...</option>
            <option value="excellent">Excellent</option>
            <option value="good">Good</option>
            <option value="fair">Fair</option>
            <option value="poor">Poor</option>
          </select>
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <button type="button" onClick={onCancel} className="btn btn-secondary btn-small">Cancel</button>
        <button type="submit" disabled={isPending} className="btn btn-primary btn-small">
          {isPending ? 'Saving...' : 'Log bloom'}
        </button>
      </div>
    </form>
  );
}

function ActiveCycleCard({ log, onEnd, onUpdatePeak, isEnding, isUpdating }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(log.peak_bloom_count ?? log.flower_count ?? 1);
  const days = daysBetween(log.bloom_start_date);
  const peak = log.peak_bloom_count ?? log.flower_count ?? '—';

  const save = async () => {
    const n = parseInt(value, 10);
    if (Number.isFinite(n) && n > 0) {
      await onUpdatePeak(log.id, n);
    }
    setEditing(false);
  };

  return (
    <div
      className="rounded-xl p-5 mb-4"
      style={{ background: 'var(--gradient-purple-card, var(--purple-100))', border: '1px solid var(--purple-200, var(--purple-100))' }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span
            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold"
            style={{ background: 'var(--purple-100)', color: 'var(--purple-600)' }}
          >
            Active
          </span>
          <span className="text-small text-muted">started {formatDate(log.bloom_start_date)}</span>
        </div>
        <button
          onClick={() => onEnd(log.id)}
          disabled={isEnding}
          className="btn btn-secondary btn-small"
        >
          {isEnding ? '...' : 'End cycle'}
        </button>
      </div>

      <h3 className="heading" style={{ fontSize: 26, color: 'var(--purple-600)', marginBottom: 14 }}>
        Day {days} of bloom
      </h3>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-lg p-3" style={{ background: 'rgba(255,255,255,0.6)' }}>
          <p className="text-label text-muted">Peak bloom count</p>
          <div className="flex items-baseline gap-2 mt-1">
            {editing ? (
              <input
                type="number"
                min="1"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onBlur={save}
                onKeyDown={(e) => e.key === 'Enter' && save()}
                autoFocus
                className="input py-1 text-small"
                style={{ width: 70 }}
              />
            ) : (
              <span className="heading" style={{ fontSize: 28, color: 'var(--purple-600)' }}>{peak}</span>
            )}
            {!editing && (
              <button
                type="button"
                onClick={() => setEditing(true)}
                disabled={isUpdating}
                className="text-small font-medium"
                style={{ color: 'var(--sage-600)' }}
              >
                Update
              </button>
            )}
          </div>
        </div>
        <div className="rounded-lg p-3" style={{ background: 'rgba(255,255,255,0.6)' }}>
          <p className="text-label text-muted">Quality</p>
          <p
            className="heading"
            style={{ fontSize: 22, fontStyle: 'italic', color: 'var(--purple-600)', marginTop: 4 }}
          >
            {QUALITY_LABELS[log.bloom_quality] || '—'}
          </p>
        </div>
      </div>
    </div>
  );
}

function PastCycleRow({ log, onUpdate, onDelete, isUpdating, isDeleting }) {
  const [expanded, setExpanded] = useState(false);
  const [startDate, setStartDate] = useState(log.bloom_start_date?.split('T')[0] || '');
  const [endDate, setEndDate] = useState(log.bloom_end_date?.split('T')[0] || '');
  const [peak, setPeak] = useState(log.peak_bloom_count ?? log.flower_count ?? '');
  const [quality, setQuality] = useState(log.bloom_quality || '');
  const [confirmDelete, setConfirmDelete] = useState(false);

  const days = daysBetween(log.bloom_start_date, log.bloom_end_date);
  const summaryPeak = log.peak_bloom_count ?? log.flower_count;

  const handleSave = async () => {
    const peakNum = peak === '' ? null : parseInt(peak, 10);
    await onUpdate(log.id, {
      bloom_start_date: startDate ? new Date(startDate).toISOString() : log.bloom_start_date,
      bloom_end_date: endDate ? new Date(endDate).toISOString() : log.bloom_end_date,
      peak_bloom_count: peakNum,
      flower_count: peakNum,
      bloom_quality: quality || null,
    });
    setExpanded(false);
  };

  return (
    <div className="rounded-lg mb-2" style={{ background: 'var(--cream-100)' }}>
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 py-3 px-4 text-left"
      >
        <div className="flex-1 min-w-0">
          <p className="text-body font-semibold">
            {formatDate(log.bloom_start_date)} – {formatDate(log.bloom_end_date)}
          </p>
          <p className="text-small text-muted">
            {days} days
            {summaryPeak != null && (
              <>
                {' · peak '}
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{summaryPeak}</span>
                {' blooms'}
              </>
            )}
            {log.bloom_quality && ` · ${QUALITY_LABELS[log.bloom_quality]}`}
          </p>
        </div>
        {expanded ? (
          <ChevronDown size={16} style={{ color: 'var(--sage-400)' }} />
        ) : (
          <ChevronRight size={16} style={{ color: 'var(--sage-400)' }} />
        )}
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-3" style={{ borderTop: '1px solid var(--sage-200)' }}>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3">
            <div>
              <label className="block mb-1 text-small font-medium" style={{ color: 'var(--sage-600)' }}>
                Start
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="input w-full py-1.5 text-small"
              />
            </div>
            <div>
              <label className="block mb-1 text-small font-medium" style={{ color: 'var(--sage-600)' }}>
                End
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="input w-full py-1.5 text-small"
              />
            </div>
            <div>
              <label className="block mb-1 text-small font-medium" style={{ color: 'var(--sage-600)' }}>
                Peak count
              </label>
              <input
                type="number"
                min="0"
                value={peak}
                onChange={(e) => setPeak(e.target.value)}
                className="input w-full py-1.5 text-small"
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
                <option value="">—</option>
                <option value="excellent">Excellent</option>
                <option value="good">Good</option>
                <option value="fair">Fair</option>
                <option value="poor">Poor</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between">
            {confirmDelete ? (
              <div className="flex items-center gap-2">
                <span className="text-small" style={{ color: 'var(--color-error)' }}>Delete this cycle?</span>
                <button
                  type="button"
                  className="btn btn-danger btn-small"
                  onClick={() => onDelete(log.id)}
                  disabled={isDeleting}
                >
                  {isDeleting ? '...' : 'Delete'}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary btn-small"
                  onClick={() => setConfirmDelete(false)}
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="inline-flex items-center gap-1 text-small"
                style={{ color: 'var(--sage-500)' }}
              >
                <Trash2 size={12} />
                Delete
              </button>
            )}
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="btn btn-secondary btn-small"
                onClick={() => setExpanded(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary btn-small"
                onClick={handleSave}
                disabled={isUpdating}
              >
                {isUpdating ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function BloomHistorySection({
  logs = [],
  isLoading,
  onCreateBloom,
  onEndBloom,
  onUpdatePeak,
  onUpdateBloom,
  onDeleteBloom,
  isCreating,
  isEnding,
  isUpdating,
  isDeleting,
}) {
  const [showForm, setShowForm] = useState(false);
  const active = logs.find((l) => !l.bloom_end_date);
  const past = logs.filter((l) => l.bloom_end_date);

  const cycleCount = past.length;
  const avgDays = cycleCount
    ? Math.round(
        past.reduce((sum, l) => sum + daysBetween(l.bloom_start_date, l.bloom_end_date), 0) / cycleCount,
      )
    : 0;
  const maxPeak = logs.reduce((max, l) => {
    const v = l.peak_bloom_count ?? l.flower_count ?? 0;
    return v > max ? v : max;
  }, 0);

  if (isLoading) {
    return (
      <div className="card p-6 mb-6">
        <h2 className="heading heading-md">Bloom history</h2>
        <p className="text-muted mt-2">Loading...</p>
      </div>
    );
  }

  return (
    <div className="card p-6 mb-6">
      <div className="flex items-center justify-between mb-2">
        <h2 className="heading heading-md">Bloom history</h2>
        {!showForm && !active && (
          <button onClick={() => setShowForm(true)} className="btn btn-primary btn-small">
            <Plus size={14} />
            Log bloom
          </button>
        )}
      </div>

      {cycleCount > 0 && (
        <p
          className="text-small mb-4"
          style={{ fontStyle: 'italic', color: 'var(--purple-500)' }}
        >
          {cycleCount} {cycleCount === 1 ? 'cycle' : 'cycles'} · avg duration {avgDays} days
          {maxPeak > 0 && ` · best peak ${maxPeak} blooms`}
        </p>
      )}

      {showForm && (
        <NewBloomForm
          onSubmit={async (data) => {
            await onCreateBloom(data);
            setShowForm(false);
          }}
          onCancel={() => setShowForm(false)}
          isPending={isCreating}
        />
      )}

      {active && (
        <ActiveCycleCard
          log={active}
          onEnd={onEndBloom}
          onUpdatePeak={onUpdatePeak}
          isEnding={isEnding}
          isUpdating={isUpdating}
        />
      )}

      {past.length > 0 ? (
        <div>
          {past.map((log) => (
            <PastCycleRow
              key={log.id}
              log={log}
              onUpdate={onUpdateBloom}
              onDelete={onDeleteBloom}
              isUpdating={isUpdating}
              isDeleting={isDeleting}
            />
          ))}
        </div>
      ) : !active && !showForm ? (
        <div className="card-inset p-6 text-center">
          <Flower2 size={24} style={{ color: 'var(--sage-400)' }} className="mx-auto mb-2" />
          <p className="text-muted">No blooms recorded yet</p>
        </div>
      ) : null}
    </div>
  );
}
