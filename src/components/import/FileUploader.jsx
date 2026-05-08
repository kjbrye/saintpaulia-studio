/**
 * FileUploader
 *
 * Drag-and-drop file zone with click-to-browse fallback.
 * Validates type/size on the client before handing off.
 */

import { useRef, useState } from 'react';
import { Upload, FileSpreadsheet, X, AlertCircle } from 'lucide-react';

const MAX_FILE_SIZE_MB = 10;
const ACCEPTED = ['.csv', '.xlsx', '.xlsm'];

function isAccepted(name) {
  const lower = name.toLowerCase();
  return ACCEPTED.some((ext) => lower.endsWith(ext));
}

export default function FileUploader({ file, onFileSelected, onClear, disabled }) {
  const inputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState(null);

  function handleFile(f) {
    setError(null);
    if (!f) return;
    if (!isAccepted(f.name)) {
      setError('Please upload a .csv or .xlsx file.');
      return;
    }
    const sizeMb = f.size / (1024 * 1024);
    if (sizeMb > MAX_FILE_SIZE_MB) {
      setError(`That file is ${sizeMb.toFixed(1)} MB. Please keep it under ${MAX_FILE_SIZE_MB} MB.`);
      return;
    }
    onFileSelected(f);
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragActive(false);
    if (disabled) return;
    handleFile(e.dataTransfer.files?.[0]);
  }

  if (file) {
    const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
    return (
      <div className="card p-6 flex items-center gap-4">
        <div className="icon-container-cream">
          <FileSpreadsheet size={24} style={{ color: 'var(--sage-700)' }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
            {file.name}
          </p>
          <p className="text-small" style={{ color: 'var(--text-muted)' }}>
            {sizeMb} MB
          </p>
        </div>
        <button
          type="button"
          onClick={onClear}
          className="icon-container"
          aria-label="Change file"
          disabled={disabled}
        >
          <X size={18} style={{ color: 'var(--sage-600)' }} />
        </button>
      </div>
    );
  }

  return (
    <div>
      <div
        role="button"
        tabIndex={0}
        onClick={() => !disabled && inputRef.current?.click()}
        onKeyDown={(e) => {
          if ((e.key === 'Enter' || e.key === ' ') && !disabled) {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        className="card p-10 text-center cursor-pointer transition-all"
        style={{
          borderStyle: 'dashed',
          borderColor: dragActive ? 'var(--copper-500)' : 'var(--sage-300)',
          borderWidth: '2px',
          background: dragActive ? 'var(--gradient-copper-card)' : 'var(--gradient-sage-card)',
          opacity: disabled ? 0.6 : 1,
          pointerEvents: disabled ? 'none' : 'auto',
        }}
      >
        <Upload
          size={36}
          className="mx-auto mb-4"
          style={{ color: dragActive ? 'var(--copper-500)' : 'var(--sage-500)' }}
        />
        <p className="heading heading-sm mb-2">Drop your spreadsheet here</p>
        <p className="text-small mb-4" style={{ color: 'var(--text-muted)' }}>
          or click to browse — .csv or .xlsx, up to {MAX_FILE_SIZE_MB} MB
        </p>
        <input
          ref={inputRef}
          type="file"
          accept=".csv,.xlsx,.xlsm,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          className="sr-only"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
      </div>

      {error && (
        <div
          className="mt-3 flex items-center gap-2 text-small"
          style={{ color: 'var(--color-error)' }}
        >
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
