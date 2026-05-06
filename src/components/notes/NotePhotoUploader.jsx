import { useRef, useState } from 'react';
import { Camera, Loader2, X } from 'lucide-react';
import { uploadNotePhoto } from '../../services/storage';

export default function NotePhotoUploader({ value = [], onChange }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const handleFiles = async (files) => {
    if (!files || files.length === 0) return;
    setError(null);
    setUploading(true);
    try {
      const uploaded = [];
      for (const file of files) {
        if (!file.type.startsWith('image/')) continue;
        const url = await uploadNotePhoto(file);
        uploaded.push(url);
      }
      onChange([...value, ...uploaded]);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = (url) => {
    onChange(value.filter((u) => u !== url));
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
            <img src={url} alt="Attachment" className="w-full h-full object-cover" />
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
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
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
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="hidden"
        onChange={(e) => {
          handleFiles([...e.target.files]);
          e.target.value = '';
        }}
      />
      {error && (
        <p className="text-small mt-2" style={{ color: 'var(--color-error)' }}>
          {error}
        </p>
      )}
    </div>
  );
}
