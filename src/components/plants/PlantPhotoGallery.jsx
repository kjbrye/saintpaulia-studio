import { useRef, useState } from 'react';
import { Camera, Loader2, X } from 'lucide-react';
import { uploadPlantPhoto, deletePlantPhoto } from '../../services/storage';
import { MAX_ADDITIONAL_PLANT_PHOTOS } from '../../constants/plans';

export default function PlantPhotoGallery({ value = [], onChange, max = MAX_ADDITIONAL_PLANT_PHOTOS }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const remaining = Math.max(0, max - value.length);
  const canAdd = remaining > 0 && !uploading;

  const handleFiles = async (files) => {
    const list = [...files].filter((f) => f.type.startsWith('image/')).slice(0, remaining);
    if (list.length === 0) return;

    setError(null);
    setUploading(true);
    try {
      const uploaded = [];
      for (const file of list) {
        const url = await uploadPlantPhoto(file);
        uploaded.push(url);
      }
      onChange([...value, ...uploaded]);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = async (url) => {
    onChange(value.filter((u) => u !== url));
    try {
      await deletePlantPhoto(url);
    } catch {
      // Best-effort cleanup; the row no longer references it.
    }
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {value.map((url) => (
          <div
            key={url}
            className="relative w-20 h-20 rounded-lg overflow-hidden"
            style={{ background: 'var(--cream-100)' }}
          >
            <img src={url} alt="Plant" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => handleRemove(url)}
              className="absolute top-1 right-1 rounded-full flex items-center justify-center"
              style={{
                width: 20,
                height: 20,
                background: 'rgba(0,0,0,0.5)',
                color: 'white',
              }}
              title="Remove photo"
            >
              <X size={12} />
            </button>
          </div>
        ))}
        {remaining > 0 && (
          <button
            type="button"
            onClick={() => canAdd && inputRef.current?.click()}
            disabled={!canAdd}
            className="w-20 h-20 rounded-lg border-2 border-dashed flex flex-col items-center justify-center gap-1 transition-colors"
            style={{
              borderColor: 'var(--sage-300)',
              background: 'var(--cream-100)',
              opacity: uploading ? 0.6 : 1,
            }}
          >
            {uploading ? (
              <Loader2 size={18} className="animate-spin" style={{ color: 'var(--sage-500)' }} />
            ) : (
              <>
                <Camera size={18} style={{ color: 'var(--sage-500)' }} />
                <span className="text-small" style={{ color: 'var(--sage-500)', fontSize: 10 }}>
                  Add
                </span>
              </>
            )}
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="hidden"
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = '';
        }}
      />
      <div className="flex items-center justify-between mt-2">
        <span className="text-small text-muted" style={{ fontSize: 11 }}>
          {value.length} / {max} additional
        </span>
        {error && (
          <p className="text-small" style={{ color: 'var(--color-error)' }}>
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
