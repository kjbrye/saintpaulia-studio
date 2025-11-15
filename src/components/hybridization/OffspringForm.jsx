import React, { useState } from "react";
import { X, Upload, Loader2, Plus } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const COMMON_TRAITS = [
  "Double blooms",
  "Variegated foliage",
  "Compact growth",
  "Large flowers",
  "Ruffled petals",
  "Chimera pattern",
  "Picotee edge",
  "Star pattern",
  "Award Winner",
  "Prolific bloomer"
];

export default function OffspringForm({ projectId, offspring, onClose }) {
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState(offspring || {
    offspring_number: "",
    germination_date: "",
    photos: [],
    observed_traits: [],
    bloom_date: "",
    flower_color: "",
    leaf_type: "",
    notes: "",
    status: "germinated"
  });

  const mutation = useMutation({
    mutationFn: (offspringData) => {
      if (offspring) {
        return base44.entities.Offspring.update(offspring.id, offspringData);
      }
      return base44.entities.Offspring.create({
        ...offspringData,
        project_id: projectId
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['offspring', projectId] });
      onClose();
    }
  });

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setFormData(prev => ({ ...prev, photos: [...prev.photos, file_url] }));
    setUploading(false);
  };

  const removePhoto = (index) => {
    setFormData(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index)
    }));
  };

  const toggleTrait = (trait) => {
    setFormData(prev => ({
      ...prev,
      observed_traits: prev.observed_traits.includes(trait)
        ? prev.observed_traits.filter(t => t !== trait)
        : [...prev.observed_traits, trait]
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass-card rounded-[32px] w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 backdrop-blur-2xl rounded-t-[32px] p-6 flex items-center justify-between"
          style={{
            background: "linear-gradient(135deg, rgba(227, 201, 255, 0.2) 0%, rgba(168, 159, 239, 0.15) 100%)",
            borderBottom: "1px solid rgba(227, 201, 255, 0.2)"
          }}>
          <h2 className="text-2xl font-bold" style={{ 
            color: "#F5F3FF",
            textShadow: "0 2px 4px rgba(32, 24, 51, 0.4)",
            fontFamily: "'Playfair Display', Georgia, serif"
          }}>
            {offspring ? "Edit Offspring" : "Add New Seedling"}
          </h2>
          <button
            onClick={onClose}
            className="glass-button w-10 h-10 rounded-2xl flex items-center justify-center"
            style={{ color: "#FCA5A5" }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: "#F5F3FF" }}>
                Seedling Number *
              </label>
              <input
                type="text"
                required
                value={formData.offspring_number}
                onChange={(e) => setFormData(prev => ({ ...prev, offspring_number: e.target.value }))}
                placeholder="e.g., 1-A, 2-B, etc."
                className="glass-input w-full px-4 py-3 rounded-2xl"
                style={{ color: "#F5F3FF" }}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: "#F5F3FF" }}>
                Germination Date
              </label>
              <input
                type="date"
                value={formData.germination_date}
                onChange={(e) => setFormData(prev => ({ ...prev, germination_date: e.target.value }))}
                className="glass-input w-full px-4 py-3 rounded-2xl"
                style={{ color: "#F5F3FF" }}
              />
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: "#F5F3FF" }}>
              Current Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
              className="glass-input w-full px-4 py-3 rounded-2xl"
              style={{ color: "#F5F3FF" }}
            >
              <option value="germinated">Germinated</option>
              <option value="growing">Growing</option>
              <option value="bloomed">Bloomed</option>
              <option value="selected">Selected - Promising</option>
              <option value="discarded">Discarded</option>
            </select>
          </div>

          {/* Bloom Info */}
          {(formData.status === "bloomed" || formData.status === "selected") && (
            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: "#F5F3FF" }}>
                  First Bloom Date
                </label>
                <input
                  type="date"
                  value={formData.bloom_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, bloom_date: e.target.value }))}
                  className="glass-input w-full px-4 py-3 rounded-2xl"
                  style={{ color: "#F5F3FF" }}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: "#F5F3FF" }}>
                  Flower Color
                </label>
                <input
                  type="text"
                  value={formData.flower_color}
                  onChange={(e) => setFormData(prev => ({ ...prev, flower_color: e.target.value }))}
                  placeholder="e.g., Purple"
                  className="glass-input w-full px-4 py-3 rounded-2xl"
                  style={{ color: "#F5F3FF" }}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: "#F5F3FF" }}>
                  Leaf Type
                </label>
                <input
                  type="text"
                  value={formData.leaf_type}
                  onChange={(e) => setFormData(prev => ({ ...prev, leaf_type: e.target.value }))}
                  placeholder="e.g., Variegated"
                  className="glass-input w-full px-4 py-3 rounded-2xl"
                  style={{ color: "#F5F3FF" }}
                />
              </div>
            </div>
          )}

          {/* Observed Traits */}
          <div>
            <label className="block text-sm font-semibold mb-3" style={{ color: "#F5F3FF" }}>
              Observed Traits
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {COMMON_TRAITS.map(trait => (
                <button
                  key={trait}
                  type="button"
                  onClick={() => toggleTrait(trait)}
                  className={`px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                    formData.observed_traits.includes(trait) ? "glass-accent-moss" : "glass-button"
                  }`}
                  style={{ color: formData.observed_traits.includes(trait) ? "#A7F3D0" : "#DDD6FE" }}
                >
                  {trait}
                </button>
              ))}
            </div>
          </div>

          {/* Photos */}
          <div>
            <label className="block text-sm font-semibold mb-3" style={{ color: "#F5F3FF" }}>
              Photos
            </label>
            <div className="flex flex-wrap gap-3">
              {formData.photos.map((photo, index) => (
                <div key={index} className="relative group">
                  <div className="glass-card rounded-2xl overflow-hidden w-24 h-24"
                    style={{
                      boxShadow: "inset 0 2px 8px rgba(32, 24, 51, 0.4), 0 4px 16px rgba(32, 24, 51, 0.3)"
                    }}>
                    <img src={photo} alt={`Offspring ${index + 1}`} className="w-full h-full object-cover" />
                  </div>
                  <button
                    type="button"
                    onClick={() => removePhoto(index)}
                    className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-xl"
                    style={{
                      background: "linear-gradient(135deg, rgba(239, 68, 68, 0.9) 0%, rgba(220, 38, 38, 0.85) 100%)",
                      border: "1px solid rgba(255, 255, 255, 0.3)",
                      color: "#FFF"
                    }}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              
              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                  id="offspring-photo-upload"
                  disabled={uploading}
                />
                <label
                  htmlFor="offspring-photo-upload"
                  className="glass-accent-lavender w-24 h-24 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:opacity-90 transition-all"
                  style={{ color: "#F0EBFF" }}
                >
                  {uploading ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <>
                      <Upload className="w-6 h-6 mb-1" />
                      <span className="text-xs font-medium">Add Photo</span>
                    </>
                  )}
                </label>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: "#F5F3FF" }}>
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Observations, unique characteristics, etc..."
              rows={4}
              className="glass-input w-full px-4 py-3 rounded-2xl resize-none"
              style={{ color: "#F5F3FF" }}
            />
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="glass-button px-6 py-3 rounded-2xl font-semibold"
              style={{ color: "#DDD6FE" }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="glass-accent-lavender flex-1 px-6 py-3 rounded-2xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
              style={{ color: "#F0EBFF" }}
            >
              {mutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  {offspring ? "Update Seedling" : "Add Seedling"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}