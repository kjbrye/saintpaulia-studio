import React, { useState } from "react";
import { X, Upload, Loader2, Trash2, Image as ImageIcon } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export default function PlantPhotoGallery({ plant, onClose }) {
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  const updateMutation = useMutation({
    mutationFn: (photos) => base44.entities.Plant.update(plant.id, { photos }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plant', plant.id] });
    }
  });

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    const updatedPhotos = [...(plant.photos || []), file_url];
    updateMutation.mutate(updatedPhotos);
    setUploading(false);
  };

  const handleDeletePhoto = (photoUrl) => {
    if (window.confirm("Delete this photo?")) {
      const updatedPhotos = (plant.photos || []).filter(url => url !== photoUrl);
      updateMutation.mutate(updatedPhotos);
      setSelectedPhoto(null);
    }
  };

  const handleSetPrimary = (photoUrl) => {
    // Move selected photo to the front of the array
    const otherPhotos = (plant.photos || []).filter(url => url !== photoUrl);
    const updatedPhotos = [photoUrl, ...otherPhotos];
    updateMutation.mutate(updatedPhotos);
  };

  const photos = plant.photos || [];

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass-card rounded-[32px] w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="backdrop-blur-2xl rounded-t-[32px] p-6 flex items-center justify-between"
          style={{
            background: "linear-gradient(135deg, rgba(227, 201, 255, 0.2) 0%, rgba(168, 159, 239, 0.15) 100%)",
            borderBottom: "1px solid rgba(227, 201, 255, 0.2)"
          }}>
          <h2 className="text-2xl font-bold" style={{ 
            color: "#F5F3FF",
            textShadow: "0 2px 4px rgba(32, 24, 51, 0.4)",
            fontFamily: "'Playfair Display', Georgia, serif"
          }}>
            Photo Gallery - {plant.cultivar_name}
          </h2>
          <button
            onClick={onClose}
            className="glass-button w-10 h-10 rounded-2xl flex items-center justify-center"
            style={{ color: "#FCA5A5" }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 flex-1 overflow-y-auto">
          {/* Upload Button */}
          <div className="mb-6">
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
              id="gallery-photo-upload"
              disabled={uploading}
            />
            <label
              htmlFor="gallery-photo-upload"
              className="glass-accent-lavender w-full px-6 py-4 rounded-2xl font-semibold flex items-center justify-center gap-2 cursor-pointer hover:opacity-90 transition-opacity"
              style={{ color: "#F0EBFF" }}
            >
              {uploading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5" />
                  Add Photo
                </>
              )}
            </label>
          </div>

          {/* Photo Grid */}
          {photos.length === 0 ? (
            <div className="text-center py-12">
              <div className="glass-accent-lavender w-20 h-20 rounded-[28px] flex items-center justify-center mx-auto mb-6 glow-violet p-3">
                <ImageIcon className="w-10 h-10" style={{ color: "#F0EBFF", strokeWidth: 1.5 }} />
              </div>
              <h3 className="text-xl font-bold mb-2" style={{ 
                color: '#F5F3FF',
                fontFamily: "'Playfair Display', Georgia, serif"
              }}>
                No Photos Yet
              </h3>
              <p style={{ color: '#DDD6FE' }}>
                Upload photos to document your plant's journey
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {photos.map((photo, index) => (
                <div key={index} className="relative group">
                  <div
                    onClick={() => setSelectedPhoto(photo)}
                    className="glass-card rounded-2xl overflow-hidden aspect-square cursor-pointer hover:ring-2 hover:ring-offset-0 transition-all"
                    style={{
                      ringColor: "rgba(168, 159, 239, 0.5)",
                      boxShadow: "inset 0 2px 8px rgba(32, 24, 51, 0.4)"
                    }}
                  >
                    <img 
                      src={photo} 
                      alt={`Plant photo ${index + 1}`} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    {index === 0 && (
                      <div className="absolute top-2 left-2 px-2 py-1 rounded-lg text-xs font-semibold backdrop-blur-xl"
                        style={{
                          background: "rgba(168, 159, 239, 0.9)",
                          border: "1px solid rgba(227, 201, 255, 0.5)",
                          color: "#FFF"
                        }}>
                        Primary
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Photo Viewer Modal */}
      {selectedPhoto && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-md z-60 flex items-center justify-center p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <div 
            className="relative max-w-5xl max-h-[90vh] w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <img 
              src={selectedPhoto} 
              alt="Full size" 
              className="w-full h-full object-contain rounded-3xl"
              style={{
                boxShadow: "0 20px 60px rgba(0, 0, 0, 0.5)"
              }}
            />
            <div className="absolute top-4 right-4 flex gap-2">
              {photos.indexOf(selectedPhoto) !== 0 && (
                <button
                  onClick={() => handleSetPrimary(selectedPhoto)}
                  className="glass-accent-lavender px-4 py-2 rounded-2xl text-sm font-semibold"
                  style={{ color: "#F0EBFF" }}
                >
                  Set as Primary
                </button>
              )}
              <button
                onClick={() => handleDeletePhoto(selectedPhoto)}
                className="w-10 h-10 rounded-2xl flex items-center justify-center backdrop-blur-xl"
                style={{
                  background: "linear-gradient(135deg, rgba(239, 68, 68, 0.9) 0%, rgba(220, 38, 38, 0.85) 100%)",
                  border: "1px solid rgba(255, 255, 255, 0.3)",
                  color: "#FFF"
                }}
              >
                <Trash2 className="w-5 h-5" />
              </button>
              <button
                onClick={() => setSelectedPhoto(null)}
                className="glass-button w-10 h-10 rounded-2xl flex items-center justify-center"
                style={{ color: "#FFF" }}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}