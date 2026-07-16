/**
 * CareSection - Merged care status + actions card.
 *
 * Three primary care rows (water/fertilize/groom) with inline Log buttons,
 * plus a secondary row for repot/treat/observation. The secondary actions
 * open a small inline panel for the parameters they need.
 */

import { useState, useMemo } from 'react';
import { Droplets, Sparkles, Scissors, Flower2, Bug, Stethoscope, Loader2 } from 'lucide-react';
import { useSettings } from '../../hooks/useSettings.jsx';

const PRIMARY_CARE = [
  { type: 'watering', label: 'Watering', icon: Droplets, tile: 'var(--sage-100)', color: 'var(--sage-600)' },
  { type: 'fertilizing', label: 'Fertilizing', icon: Sparkles, tile: 'var(--sage-100)', color: 'var(--sage-600)' },
  { type: 'grooming', label: 'Grooming', icon: Scissors, tile: 'var(--sage-100)', color: 'var(--sage-600)' },
];

const FIELD_BY_TYPE = {
  watering: 'last_watered',
  fertilizing: 'last_fertilized',
  grooming: 'last_groomed',
};

const FERTILIZER_OPTIONS = [
  { value: 'balanced', label: 'Balanced (20-20-20)' },
  { value: 'bloom', label: 'Bloom Booster' },
  { value: 'foliage', label: 'Foliage/Growth' },
  { value: 'organic', label: 'Organic' },
  { value: 'slow_release', label: 'Slow Release' },
  { value: 'other', label: 'Other' },
];

const TREATMENT_OPTIONS = [
  { value: 'neem_oil', label: 'Neem Oil' },
  { value: 'mosquito_bits', label: 'Mosquito Bits' },
  { value: 'hydrogen_peroxide', label: 'Hydrogen Peroxide' },
  { value: 'alcohol', label: 'Rubbing Alcohol' },
  { value: 'insecticidal_soap', label: 'Insecticidal Soap' },
  { value: 'other', label: 'Other' },
];

const POT_SIZE_OPTIONS = [
  '2"', '2.5"', '3"', '3.5"', '4"', '4.5"', '5"', '6"', '6"+',
];

const HEALTH_STATUSES = [
  { value: 'healthy', label: 'Healthy' },
  { value: 'recovering', label: 'Recovering' },
  { value: 'struggling', label: 'Struggling' },
  { value: 'dormant', label: 'Dormant' },
];

function daysAgoLabel(dateStr) {
  if (!dateStr) return 'Never';
  const days = Math.floor((new Date() - new Date(dateStr)) / (1000 * 60 * 60 * 24));
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  return `${days} days ago`;
}

function PrimaryRow({ entry, status, lastDate, onLog, isPending }) {
  const Icon = entry.icon;
  const overdue = status?.status === 'overdue';
  return (
    <div className="flex items-center gap-3 py-2">
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ background: entry.tile }}
      >
        <Icon size={18} style={{ color: entry.color }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-body font-medium">{entry.label}</p>
        <p className="text-small text-muted">
          {daysAgoLabel(lastDate)}
          {' · '}
          <span style={{ color: overdue ? 'var(--copper-600)' : 'var(--sage-600)' }}>
            {overdue ? 'overdue' : 'on track'}
          </span>
        </p>
      </div>
      <button
        type="button"
        onClick={onLog}
        disabled={isPending}
        className="btn btn-primary btn-small"
      >
        {isPending ? <Loader2 size={14} className="animate-spin" /> : 'Log'}
      </button>
    </div>
  );
}

function SecondaryButton({ icon: Icon, label, onClick, active, overdue }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center justify-center gap-2 py-2.5 rounded-lg text-small font-medium transition-colors relative"
      style={{
        background: active ? 'var(--sage-100)' : 'var(--cream-100)',
        border: `1px solid ${overdue ? 'var(--copper-500)' : 'var(--sage-200)'}`,
        color: overdue ? 'var(--copper-600)' : 'var(--sage-700)',
      }}
    >
      <Icon size={16} />
      {label}
    </button>
  );
}

export default function CareSection({
  plant,
  careStatuses,
  onLogCare,
  isLoggingCare,
  onCreateHealthLog,
  isCreatingHealth,
}) {
  const { settings } = useSettings();
  const [openAction, setOpenAction] = useState(null); // 'fertilize' | 'repot' | 'treat' | 'observation' | null
  const [potSize, setPotSize] = useState(plant.pot_size || '');
  const [fertilizerType, setFertilizerType] = useState('');
  const [treatmentType, setTreatmentType] = useState('');
  const [obsStatus, setObsStatus] = useState('');
  const [obsSymptoms, setObsSymptoms] = useState('');
  const [obsNotes, setObsNotes] = useState('');

  const fertilizerOptions = useMemo(() => {
    const custom = (settings.customFertilizers || []).map((name) => ({
      value: `custom:${name}`,
      label: name,
    }));
    return [...FERTILIZER_OPTIONS, ...custom];
  }, [settings.customFertilizers]);

  const treatmentOptions = useMemo(() => {
    const custom = (settings.customTreatments || []).map((name) => ({
      value: `custom:${name}`,
      label: name,
    }));
    return [...TREATMENT_OPTIONS, ...custom];
  }, [settings.customTreatments]);

  const overdueCount = Object.values(careStatuses).filter((s) => s.status === 'overdue').length;
  const summary = overdueCount === 0
    ? 'All on track'
    : `${overdueCount} ${overdueCount === 1 ? 'type' : 'types'} overdue`;

  const handlePrimaryLog = (careType) => {
    if (careType === 'fertilizing') {
      setOpenAction(openAction === 'fertilize' ? null : 'fertilize');
      return;
    }
    onLogCare({ careType });
  };

  const handleFertilize = async () => {
    if (!fertilizerType) return;
    await onLogCare({ careType: 'fertilizing', fertilizerType });
    setFertilizerType('');
    setOpenAction(null);
  };

  const handleRepot = async () => {
    if (!potSize) return;
    await onLogCare({ careType: 'repotting', potSize });
    setOpenAction(null);
  };

  const handleTreat = async () => {
    if (!treatmentType) return;
    await onLogCare({ careType: 'treatment', treatmentType });
    setTreatmentType('');
    setOpenAction(null);
  };

  const handleObservation = async () => {
    await onCreateHealthLog({
      observation_date: new Date().toISOString(),
      health_status: obsStatus || null,
      symptoms: obsSymptoms || null,
      notes: obsNotes || null,
    });
    setObsStatus('');
    setObsSymptoms('');
    setObsNotes('');
    setOpenAction(null);
  };

  return (
    <div className="card p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="heading heading-md">Care</h2>
        <p
          className="text-small"
          style={{ fontStyle: 'italic', color: overdueCount > 0 ? 'var(--copper-600)' : 'var(--purple-500)' }}
        >
          {summary}
        </p>
      </div>

      <div className="divide-y divide-[var(--sage-200)]">
        {PRIMARY_CARE.map((entry) => (
          <PrimaryRow
            key={entry.type}
            entry={entry}
            status={careStatuses[entry.type]}
            lastDate={plant[FIELD_BY_TYPE[entry.type]]}
            onLog={() => handlePrimaryLog(entry.type)}
            isPending={isLoggingCare}
          />
        ))}
      </div>

      <div
        className="grid grid-cols-3 gap-2 mt-4 pt-4"
        style={{ borderTop: '1px solid var(--sage-200)' }}
      >
        <SecondaryButton
          icon={Flower2}
          label={careStatuses?.repotting?.status === 'overdue' ? 'Repot · overdue' : 'Repot'}
          onClick={() => setOpenAction(openAction === 'repot' ? null : 'repot')}
          active={openAction === 'repot'}
          overdue={careStatuses?.repotting?.status === 'overdue'}
        />
        <SecondaryButton
          icon={Bug}
          label="Treat"
          onClick={() => setOpenAction(openAction === 'treat' ? null : 'treat')}
          active={openAction === 'treat'}
        />
        <SecondaryButton
          icon={Stethoscope}
          label="Observation"
          onClick={() => setOpenAction(openAction === 'observation' ? null : 'observation')}
          active={openAction === 'observation'}
        />
      </div>

      {openAction === 'fertilize' && (
        <div className="card-inset p-4 mt-3 space-y-3">
          <label className="text-small font-medium" style={{ color: 'var(--sage-700)' }}>
            Fertilizer
          </label>
          <select
            value={fertilizerType}
            onChange={(e) => setFertilizerType(e.target.value)}
            className="input w-full py-1.5 text-small"
          >
            <option value="">Select fertilizer...</option>
            {fertilizerOptions.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <div className="flex justify-end gap-2">
            <button className="btn btn-secondary btn-small" onClick={() => setOpenAction(null)}>Cancel</button>
            <button className="btn btn-primary btn-small" disabled={!fertilizerType || isLoggingCare} onClick={handleFertilize}>
              Log fertilizing
            </button>
          </div>
        </div>
      )}

      {openAction === 'repot' && (
        <div className="card-inset p-4 mt-3 space-y-3">
          <label className="text-small font-medium" style={{ color: 'var(--sage-700)' }}>
            New pot size {plant.pot_size && <span className="text-muted">(currently {plant.pot_size})</span>}
          </label>
          <div className="flex flex-wrap gap-2">
            {POT_SIZE_OPTIONS.map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => setPotSize(size)}
                className="px-3 py-1.5 rounded-lg text-small transition-colors"
                style={{
                  background: potSize === size ? 'var(--sage-600)' : 'var(--sage-100)',
                  color: potSize === size ? 'white' : 'var(--sage-700)',
                }}
              >
                {size}
              </button>
            ))}
          </div>
          <div className="flex justify-end gap-2">
            <button className="btn btn-secondary btn-small" onClick={() => setOpenAction(null)}>Cancel</button>
            <button className="btn btn-primary btn-small" disabled={!potSize || isLoggingCare} onClick={handleRepot}>
              Log repot
            </button>
          </div>
        </div>
      )}

      {openAction === 'treat' && (
        <div className="card-inset p-4 mt-3 space-y-3">
          <label className="text-small font-medium" style={{ color: 'var(--sage-700)' }}>
            Treatment
          </label>
          <select
            value={treatmentType}
            onChange={(e) => setTreatmentType(e.target.value)}
            className="input w-full py-1.5 text-small"
          >
            <option value="">Select treatment...</option>
            {treatmentOptions.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <div className="flex justify-end gap-2">
            <button className="btn btn-secondary btn-small" onClick={() => setOpenAction(null)}>Cancel</button>
            <button className="btn btn-primary btn-small" disabled={!treatmentType || isLoggingCare} onClick={handleTreat}>
              Log treatment
            </button>
          </div>
        </div>
      )}

      {openAction === 'observation' && (
        <div className="card-inset p-4 mt-3 space-y-3">
          <div>
            <label className="text-small font-medium block mb-1" style={{ color: 'var(--sage-700)' }}>
              Status
            </label>
            <div className="flex flex-wrap gap-2">
              {HEALTH_STATUSES.map((s) => (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => setObsStatus(s.value)}
                  className="px-3 py-1.5 rounded-lg text-small transition-colors"
                  style={{
                    background: obsStatus === s.value ? 'var(--sage-600)' : 'var(--sage-100)',
                    color: obsStatus === s.value ? 'white' : 'var(--sage-700)',
                  }}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-small font-medium block mb-1" style={{ color: 'var(--sage-700)' }}>
              Symptoms
            </label>
            <input
              type="text"
              value={obsSymptoms}
              onChange={(e) => setObsSymptoms(e.target.value)}
              className="input w-full py-1.5 text-small"
              placeholder="e.g., Yellowing leaves"
            />
          </div>
          <div>
            <label className="text-small font-medium block mb-1" style={{ color: 'var(--sage-700)' }}>
              Notes
            </label>
            <textarea
              value={obsNotes}
              onChange={(e) => setObsNotes(e.target.value)}
              className="input w-full py-1.5 text-small"
              rows={2}
            />
          </div>
          <div className="flex justify-end gap-2">
            <button className="btn btn-secondary btn-small" onClick={() => setOpenAction(null)}>Cancel</button>
            <button className="btn btn-primary btn-small" disabled={isCreatingHealth} onClick={handleObservation}>
              Log observation
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
