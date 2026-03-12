/**
 * PhotoUpload - Image upload component with drag & drop
 */

import { useState, useRef } from 'react';
import { Camera, X, Loader2 } from 'lucide-react';
import { uploadPlantPhoto } from '../../services/storage';

export default function PhotoUpload({ value, onChange }) {
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
    // Reset so the same file can be re-selected
    e.target.value = '';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      handleFile(file);
    }
  };

  const handleFile = async (file) => {
    setError(null);
    setUploading(true);

    try {
      const publicUrl = await uploadPlantPhoto(file);
      onChange(publicUrl);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    setError(null);
    onChange(null);
  };

  return (
    <div>
      <div
        className={`
          w-48 h-48 rounded-2xl border-2 border-dashed
          flex flex-col items-center justify-center gap-3 cursor-pointer
          transition-all overflow-hidden
        `}
        style={{
          borderColor: error
            ? 'var(--color-error)'
            : dragOver
              ? 'var(--sage-500)'
              : 'var(--sage-300)',
          background: dragOver ? 'var(--sage-100)' : 'var(--cream-100)',
          opacity: uploading ? 0.7 : 1,
          pointerEvents: uploading ? 'none' : 'auto',
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        {value ? (
          <div className="relative w-full h-full">
            <img
              src={value}
              alt="Plant"
              className="w-full h-full object-cover"
            />
            <button
              type="button"
              onClick={handleRemove}
              className="absolute top-2 right-2 icon-container"
              style={{ width: 32, height: 32 }}
            >
              <X size={16} style={{ color: 'var(--sage-600)' }} />
            </button>
          </div>
        ) : uploading ? (
          <>
            <Loader2 size={24} className="animate-spin" style={{ color: 'var(--sage-500)' }} />
            <span className="text-small text-muted">Uploading...</span>
          </>
        ) : (
          <>
            <div className="icon-container">
              <Camera size={24} style={{ color: 'var(--sage-500)' }} />
            </div>
            <span className="text-small text-muted text-center px-4">
              Add Photo
            </span>
            <span
              className="text-small text-center px-4"
              style={{ color: 'var(--sage-400)', fontSize: 11 }}
            >
              Click or drag
            </span>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleFileSelect}
        />
      </div>
      {error && (
        <p className="text-small mt-2" style={{ color: 'var(--color-error)' }}>
          {error}
        </p>
      )}
    </div>
  );
}
