/**
 * UploadStep
 *
 * First step of the import flow: pick a file, see remaining capacity,
 * surface "no slots" gating before mapping is shown.
 */

import { ArrowRight, Sprout } from 'lucide-react';
import FileUploader from './FileUploader';
import CapacityIndicator from './CapacityIndicator';

export default function UploadStep({
  file,
  capacity,
  currentPlantCount,
  onFileSelected,
  onClear,
  parseError,
  blockedNoCapacity,
  canContinue,
  onContinue,
}) {
  return (
    <div className="space-y-5">
      <CapacityIndicator capacity={capacity} />

      <FileUploader file={file} onFileSelected={onFileSelected} onClear={onClear} />

      {parseError && (
        <div
          className="card p-4 text-small"
          style={{ borderColor: 'var(--color-error)', color: 'var(--color-error)' }}
        >
          {parseError}
        </div>
      )}

      {currentPlantCount > 0 && (
        <p className="text-small flex items-start gap-2" style={{ color: 'var(--text-muted)' }}>
          <Sprout size={14} className="flex-shrink-0 mt-0.5" style={{ color: 'var(--sage-500)' }} />
          <span>
            Imported plants will be added to your existing collection of {currentPlantCount}{' '}
            {currentPlantCount === 1 ? 'plant' : 'plants'} — they won&rsquo;t replace anything.
          </span>
        </p>
      )}

      {blockedNoCapacity && (
        <div
          className="card p-4 text-small"
          style={{
            background: 'var(--gradient-copper-card)',
            borderColor: 'var(--copper-400)',
            borderWidth: 1,
            borderStyle: 'solid',
          }}
        >
          <p className="font-semibold mb-1" style={{ color: 'var(--copper-700)' }}>
            You&rsquo;ve reached your plan&rsquo;s plant limit
          </p>
          <p style={{ color: 'var(--copper-600)' }}>
            Free plans support up to {capacity?.maxPlants} plants. Upgrade to import more.
          </p>
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="button"
          className="btn btn-primary"
          disabled={!canContinue}
          onClick={onContinue}
        >
          Continue <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}
