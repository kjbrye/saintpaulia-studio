import React, { useState } from "react";
import { X, Upload, Loader2, Plus } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";

const COMMON_TRAITS = [
  "Double blooms",
  "Variegated foliage",
  "Compact growth",
  "Large flowers",
  "Ruffled petals",
  "Chimera pattern",
  "Picotee edge",
  "Star pattern",
  "Strong stems",
  "Vigorous growth",
  "Good root system",
  "Symmetrical rosette"
];

export default function HybridizationLogForm({ projectId, log, onClose }) {
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);

  const { data: offspring = [] } = useQuery({
    queryKey: ['offspring', projectId],
    queryFn: () => base44.entities.Offspring.filter({ project_id: projectId }),
    enabled: !!projectId,
    initialData: []
  });

  const [formData, setFormData] = useState(log || {
    log_date: new Date().toISOString().split('T')[0],
    title: "",
    offspring_id: "",
    observation: "",
    traits_observed: [],
    photos: [],
    milestone: ""
  });

  const mutation = useMutation({
    mutationFn: (logData) => {
      if (log) {
        return base44.entities.HybridizationLog.update(log.id, logData);
      }
      return base44.entities.HybridizationLog.create({
        ...logData,
        project_id: projectId
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hybridizationLogs', projectId] });
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
      traits_observed: prev.traits_observed.includes(trait)
        ? prev.traits_observed.filter(t => t !== trait)
        : [...prev.traits_observed, trait]
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const cleanedData = Object.fromEntries(
      Object.entries(formData).filter(([_, value]) => 
        value !== "" && !(Array.isArray(value) && value.length === 0)
      )
    );
    mutation.mutate(cleanedData);
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
            {log ? "Edit Log Entry" : "New Log Entry"}
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
          {/* Date, Title, and Offspring Selection */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: "#F5F3FF" }}>
                Date *
              </label>
              <input
                type="date"
                required
                value={formData.log_date}
                onChange={(e) => setFormData(prev => ({ ...prev, log_date: e.target.value }))}
                className="glass-input w-full px-4 py-3 rounded-2xl"
                style={{ color: "#F5F3FF" }}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: "#F5F3FF" }}>
                Milestone
              </label>
              <select
                value={formData.milestone}
                onChange={(e) => setFormData(prev => ({ ...prev, milestone: e.target.value }))}
                className="glass-input w-full px-4 py-3 rounded-2xl"
                style={{ color: "#F5F3FF" }}
              >
                <option value="">General observation</option>
                <option value="germination">Germination</option>
                <option value="first_leaf">First True Leaf</option>
                <option value="transplant">Transplant</option>
                <option value="first_bloom">First Bloom</option>
                <option value="selection">Selection Decision</option>
                <option value="other">Other Milestone</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: "#F5F3FF" }}>
              Title (optional)
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="e.g., First blooms showing color"
              className="glass-input w-full px-4 py-3 rounded-2xl"
              style={{ color: "#F5F3FF" }}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: "#F5F3FF" }}>
              Specific Offspring (optional)
            </label>
            <select
              value={formData.offspring_id}
              onChange={(e) => setFormData(prev => ({ ...prev, offspring_id: e.target.value }))}
              className="glass-input w-full px-4 py-3 rounded-2xl"
              style={{ color: "#F5F3FF" }}
            >
              <option value="">General project log</option>
              {offspring.map(o => (
                <option key={o.id} value={o.id}>{o.offspring_number}</option>
              ))}
            </select>
            <p className="text-xs mt-1" style={{ color: "#DDD6FE", opacity: 0.7 }}>
              Leave blank for general project observations, or select a specific seedling
            </p>
          </div>

          {/* Observation */}
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: "#F5F3FF" }}>
              Observation *
            </label>
            <textarea
              required
              value={formData.observation}
              onChange={(e) => setFormData(prev => ({ ...prev, observation: e.target.value }))}
              placeholder="Detailed observations about growth, trait development, health, etc..."
              rows={6}
              className="glass-input w-full px-4 py-3 rounded-2xl resize-none"
              style={{ color: "#F5F3FF" }}
            />
          </div>

          {/* Traits Observed */}
          <div>
            <label className="block text-sm font-semibold mb-3" style={{ color: "#F5F3FF" }}>
              Traits Observed
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {COMMON_TRAITS.map(trait => (
                <button
                  key={trait}
                  type="button"
                  onClick={() => toggleTrait(trait)}
                  className={`px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                    formData.traits_observed.includes(trait) ? "glass-accent-moss" : "glass-button"
                  }`}
                  style={{ color: formData.traits_observed.includes(trait) ? "#A7F3D0" : "#DDD6FE" }}
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
                    <img src={photo} alt={`Log photo ${index + 1}`} className="w-full h-full object-cover" />
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
                  id="log-photo-upload"
                  disabled={uploading}
                />
                <label
                  htmlFor="log-photo-upload"
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
                  {log ? "Update Entry" : "Add Entry"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}