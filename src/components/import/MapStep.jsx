/**
 * MapStep
 *
 * Adjust column-to-field mapping and preview the result before reviewing
 * the full row list. Cultivar Name is the only required mapping.
 */

import { useMemo } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import ColumnMapper from './ColumnMapper';
import MappingPreview from './MappingPreview';

export default function MapStep({ columns, rows, mapping, onChange, onBack, onContinue }) {
  const hasRequired = useMemo(
    () => Object.values(mapping).includes('cultivar_name'),
    [mapping],
  );

  return (
    <div className="space-y-5">
      <ColumnMapper columns={columns} mapping={mapping} onChange={onChange} />
      <MappingPreview rows={rows} mapping={mapping} />

      {!hasRequired && (
        <p className="text-small" style={{ color: 'var(--color-error)' }}>
          Please map a column to <strong>Cultivar Name</strong> — it&rsquo;s the only required field.
        </p>
      )}

      <div className="flex justify-between">
        <button type="button" className="btn btn-secondary" onClick={onBack}>
          <ArrowLeft size={18} /> Back
        </button>
        <button
          type="button"
          className="btn btn-primary"
          disabled={!hasRequired}
          onClick={onContinue}
        >
          Continue <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}
