/**
 * PhotoUpload - Image upload component with drag & drop
 */

import { useState, useRef } from 'react';
import { Camera, X, ImageIcon } from 'lucide-react';

export default function PhotoUpload({ value, onChange }) {
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef(null);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      handleFile(file);
    }
  };

  const handleFile = (file) => {
    // For now, create a local preview URL
    // In production, this would upload to Supabase Storage
    const previewUrl = URL.createObjectURL(file);
    onChange(previewUrl);
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    onChange(null);
  };

  return (
    <div
      className={`
        w-48 h-48 rounded-2xl border-2 border-dashed
        flex flex-col items-center justify-center gap-3 cursor-pointer
        transition-all overflow-hidden
      `}
      style={{
        borderColor: dragOver ? 'var(--sage-500)' : 'var(--sage-300)',
        background: dragOver ? 'var(--sage-100)' : 'var(--cream-100)',
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
        accept="image/*"
        className="hidden"
        onChange={handleFileSelect}
      />
    </div>
  );
}
