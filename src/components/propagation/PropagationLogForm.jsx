import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { X, Upload, Loader2, Trash2, Droplets, Leaf, Thermometer } from "lucide-react";
import { toast } from "sonner";

export default function PropagationLogForm({ projectId, log, onClose }) {
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);

  const { data: batches = [] } = useQuery({
    queryKey: ['propagationBatches', projectId],
    queryFn: () => base44.entities.PropagationBatch.filter({ project_id: projectId }),
    enabled: !!projectId,
    initialData: []
  });

  const [formData, setFormData] = useState({
    project_id: projectId,
    batch_id: "",
    log_date: new Date().toISOString().split('T')[0],
    milestone: "",
    observation: "",
    photos: [],
    measurements: "",
    temperature: "",
    humidity: "",
    light_intensity: "",
    watered: false,
    water_amount_ml: "",
    nutrient_applied: false,
    nutrient_type: "",
    nutrient_concentration: "",
    health_status: "",
    issues_observed: []
  });

  useEffect(() => {
    if (log) {
      setFormData({
        project_id: log.project_id,
        batch_id: log.batch_id || "",
        log_date: log.log_date,
        milestone: log.milestone || "",
        observation: log.observation || "",
        photos: log.photos || [],
        measurements: log.measurements || "",
        temperature: log.temperature || "",
        humidity: log.humidity || "",
        light_intensity: log.light_intensity || "",
        watered: log.watered || false,
        water_amount_ml: log.water_amount_ml || "",
        nutrient_applied: log.nutrient_applied || false,
        nutrient_type: log.nutrient_type || "",
        nutrient_concentration: log.nutrient_concentration || "",
        health_status: log.health_status || "",
        issues_observed: log.issues_observed || []
      });
    }
  }, [log]);

  const saveMutation = useMutation({
    mutationFn: (data) => {
      // Clean and convert empty strings to null for optional fields
      const cleanedData = Object.fromEntries(
        Object.entries(data)
          .map(([key, value]) => {
            // Convert empty strings to null for optional fields
            if (value === "" && key !== 'observation') {
              return [key, null];
            }
            return [key, value];
          })
          .filter(([key, value]) => {
            // Always include boolean fields
            if (key === 'watered' || key === 'nutrient_applied') return true;
            // Include arrays only if they have items
            if (Array.isArray(value)) return value.length > 0;
            // Exclude null and undefined values
            return value !== null && value !== undefined;
          })
      );

      if (log) {
        return base44.entities.PropagationLog.update(log.id, cleanedData);
      }
      return base44.entities.PropagationLog.create(cleanedData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['propagationLogs', projectId] });
      toast.success(log ? "Log updated!" : "Progress logged!");
      onClose();
    },
    onError: (error) => {
      toast.error("Failed to save log", {
        description: error.message || "Please try again."
      });
    }
  });

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploading(true);
    try {
      const uploadPromises = files.map(file => 
        base44.integrations.Core.UploadFile({ file })
      );
      const results = await Promise.all(uploadPromises);
      const urls = results.map(r => r.file_url);
      setFormData(prev => ({ ...prev, photos: [...prev.photos, ...urls] }));
    } catch {
      toast.error("Upload failed", {
        description: "Could not upload images."
      });
    } finally {
      setUploading(false);
    }
  };

  const removePhoto = (index) => {
    setFormData(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    saveMutation.mutate(formData);
  };

  const [customIssue, setCustomIssue] = useState("");

  const addIssue = () => {
    if (customIssue.trim()) {
      setFormData(prev => ({
        ...prev,
        issues_observed: [...prev.issues_observed, customIssue.trim()]
      }));
      setCustomIssue("");
    }
  };

  const removeIssue = (index) => {
    setFormData(prev => ({
      ...prev,
      issues_observed: prev.issues_observed.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="glass-card rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: "rgba(227, 201, 255, 0.2)" }}>
          <h2 className="text-2xl font-bold" style={{ 
            color: "#F5F3FF",
            textShadow: "0 1px 3px rgba(32, 24, 51, 0.4)",
            fontFamily: "'Playfair Display', Georgia, serif"
          }}>
            {log ? "Edit Progress Log" : "Log Progress"}
          </h2>
          <button
            onClick={onClose}
            className="glass-button w-10 h-10 rounded-2xl flex items-center justify-center"
            style={{ color: "#DDD6FE" }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Basic Info */}
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
                <option value="">None</option>
                <option value="started">Started</option>
                <option value="roots_visible">Roots Visible</option>
                <option value="new_growth">New Growth</option>
                <option value="transplanted">Transplanted</option>
                <option value="established">Established</option>
                <option value="first_bloom">First Bloom</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          {/* Batch Selection */}
          {batches.length > 0 && (
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: "#F5F3FF" }}>
                Batch (optional)
              </label>
              <select
                value={formData.batch_id}
                onChange={(e) => setFormData(prev => ({ ...prev, batch_id: e.target.value }))}
                className="glass-input w-full px-4 py-3 rounded-2xl"
                style={{ color: "#F5F3FF" }}
              >
                <option value="">All batches / General</option>
                {batches.map(batch => (
                  <option key={batch.id} value={batch.id}>
                    {batch.batch_name} (Batch #{batch.batch_number})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Environmental Conditions */}
          <div className="glass-card rounded-2xl p-4">
            <h3 className="text-sm font-bold mb-3 flex items-center gap-2" style={{ color: "#F5F3FF" }}>
              <Thermometer className="w-4 h-4" style={{ color: "#A7F3D0" }} />
              Environmental Conditions
            </h3>
            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold mb-2" style={{ color: "#DDD6FE" }}>
                  Temperature (°F)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.temperature}
                  onChange={(e) => setFormData(prev => ({ ...prev, temperature: e.target.value }))}
                  placeholder="72.5"
                  className="glass-input w-full px-3 py-2 rounded-xl text-sm"
                  style={{ color: "#F5F3FF" }}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-2" style={{ color: "#DDD6FE" }}>
                  Humidity (%)
                </label>
                <input
                  type="number"
                  step="1"
                  value={formData.humidity}
                  onChange={(e) => setFormData(prev => ({ ...prev, humidity: e.target.value }))}
                  placeholder="65"
                  className="glass-input w-full px-3 py-2 rounded-xl text-sm"
                  style={{ color: "#F5F3FF" }}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-2" style={{ color: "#DDD6FE" }}>
                  Light Intensity
                </label>
                <select
                  value={formData.light_intensity}
                  onChange={(e) => setFormData(prev => ({ ...prev, light_intensity: e.target.value }))}
                  className="glass-input w-full px-3 py-2 rounded-xl text-sm"
                  style={{ color: "#F5F3FF" }}
                >
                  <option value="">Not recorded</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="bright_indirect">Bright Indirect</option>
                </select>
              </div>
            </div>
          </div>

          {/* Watering */}
          <div className="glass-card rounded-2xl p-4">
            <div className="flex items-center gap-3 mb-3">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.watered}
                  onChange={(e) => setFormData(prev => ({ ...prev, watered: e.target.checked }))}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"
                  style={{
                    background: formData.watered 
                      ? "linear-gradient(135deg, rgba(154, 226, 211, 0.4) 0%, rgba(154, 226, 211, 0.3) 100%)"
                      : "rgba(107, 114, 128, 0.3)",
                    border: formData.watered 
                      ? "1px solid rgba(154, 226, 211, 0.6)"
                      : "1px solid rgba(107, 114, 128, 0.4)"
                  }}
                />
              </label>
              <div className="flex items-center gap-2">
                <Droplets className="w-4 h-4" style={{ color: "#7DD3FC" }} />
                <span className="text-sm font-bold" style={{ color: "#F5F3FF" }}>
                  Watering Performed
                </span>
              </div>
            </div>
            {formData.watered && (
              <div>
                <label className="block text-xs font-semibold mb-2" style={{ color: "#DDD6FE" }}>
                  Amount (ml)
                </label>
                <input
                  type="number"
                  value={formData.water_amount_ml}
                  onChange={(e) => setFormData(prev => ({ ...prev, water_amount_ml: e.target.value }))}
                  placeholder="50"
                  className="glass-input w-full px-3 py-2 rounded-xl text-sm"
                  style={{ color: "#F5F3FF" }}
                />
              </div>
            )}
          </div>

          {/* Nutrients */}
          <div className="glass-card rounded-2xl p-4">
            <div className="flex items-center gap-3 mb-3">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.nutrient_applied}
                  onChange={(e) => setFormData(prev => ({ ...prev, nutrient_applied: e.target.checked }))}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"
                  style={{
                    background: formData.nutrient_applied 
                      ? "linear-gradient(135deg, rgba(154, 226, 211, 0.4) 0%, rgba(154, 226, 211, 0.3) 100%)"
                      : "rgba(107, 114, 128, 0.3)",
                    border: formData.nutrient_applied 
                      ? "1px solid rgba(154, 226, 211, 0.6)"
                      : "1px solid rgba(107, 114, 128, 0.4)"
                  }}
                />
              </label>
              <div className="flex items-center gap-2">
                <Leaf className="w-4 h-4" style={{ color: "#A7F3D0" }} />
                <span className="text-sm font-bold" style={{ color: "#F5F3FF" }}>
                  Nutrients Applied
                </span>
              </div>
            </div>
            {formData.nutrient_applied && (
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-2" style={{ color: "#DDD6FE" }}>
                    Nutrient Type
                  </label>
                  <input
                    type="text"
                    value={formData.nutrient_type}
                    onChange={(e) => setFormData(prev => ({ ...prev, nutrient_type: e.target.value }))}
                    placeholder="e.g., 20-20-20"
                    className="glass-input w-full px-3 py-2 rounded-xl text-sm"
                    style={{ color: "#F5F3FF" }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-2" style={{ color: "#DDD6FE" }}>
                    Concentration
                  </label>
                  <input
                    type="text"
                    value={formData.nutrient_concentration}
                    onChange={(e) => setFormData(prev => ({ ...prev, nutrient_concentration: e.target.value }))}
                    placeholder="e.g., 1/4 strength, 100ppm"
                    className="glass-input w-full px-3 py-2 rounded-xl text-sm"
                    style={{ color: "#F5F3FF" }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Health Status */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: "#F5F3FF" }}>
                Health Status
              </label>
              <select
                value={formData.health_status}
                onChange={(e) => setFormData(prev => ({ ...prev, health_status: e.target.value }))}
                className="glass-input w-full px-4 py-3 rounded-2xl"
                style={{ color: "#F5F3FF" }}
              >
                <option value="">Not assessed</option>
                <option value="excellent">Excellent</option>
                <option value="good">Good</option>
                <option value="fair">Fair</option>
                <option value="concerning">Concerning</option>
                <option value="critical">Critical</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: "#F5F3FF" }}>
                Measurements
              </label>
              <input
                type="text"
                value={formData.measurements}
                onChange={(e) => setFormData(prev => ({ ...prev, measurements: e.target.value }))}
                placeholder="e.g., Root length: 2cm"
                className="glass-input w-full px-4 py-3 rounded-2xl"
                style={{ color: "#F5F3FF" }}
              />
            </div>
          </div>

          {/* Issues Observed */}
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: "#F5F3FF" }}>
              Issues Observed
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={customIssue}
                onChange={(e) => setCustomIssue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addIssue())}
                placeholder="Add an issue..."
                className="glass-input flex-1 px-4 py-2 rounded-2xl text-sm"
                style={{ color: "#F5F3FF" }}
              />
              <button
                type="button"
                onClick={addIssue}
                className="glass-accent-moss px-4 py-2 rounded-2xl text-sm font-semibold"
                style={{ color: "#A7F3D0" }}
              >
                Add
              </button>
            </div>
            {formData.issues_observed.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.issues_observed.map((issue, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 rounded-xl text-xs font-medium backdrop-blur-xl flex items-center gap-2"
                    style={{
                      background: "rgba(239, 68, 68, 0.2)",
                      border: "1px solid rgba(239, 68, 68, 0.4)",
                      color: "#FCA5A5"
                    }}
                  >
                    {issue}
                    <button
                      type="button"
                      onClick={() => removeIssue(idx)}
                      className="hover:opacity-70"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Observation */}
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: "#F5F3FF" }}>
              Observation Notes *
            </label>
            <textarea
              required
              value={formData.observation}
              onChange={(e) => setFormData(prev => ({ ...prev, observation: e.target.value }))}
              placeholder="Detailed observations about progress..."
              rows={4}
              className="glass-input w-full px-4 py-3 rounded-2xl resize-none"
              style={{ color: "#F5F3FF" }}
            />
          </div>

          {/* Photos */}
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: "#F5F3FF" }}>
              Photos
            </label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              className="hidden"
              id="log-photo-upload"
              disabled={uploading}
            />
            <label
              htmlFor="log-photo-upload"
              className="glass-button inline-flex items-center gap-2 px-6 py-3 rounded-2xl font-medium cursor-pointer"
              style={{ color: "#DDD6FE" }}
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Upload Photos
                </>
              )}
            </label>
            {formData.photos.length > 0 && (
              <div className="grid grid-cols-3 gap-3 mt-3">
                {formData.photos.map((url, idx) => (
                  <div key={idx} className="relative group">
                    <img 
                      src={url} 
                      alt={`Progress ${idx + 1}`}
                      className="w-full h-24 object-cover rounded-xl"
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(idx)}
                      className="absolute top-1 right-1 glass-button w-6 h-6 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ color: "#FCA5A5" }}
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </form>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t" style={{ borderColor: "rgba(227, 201, 255, 0.2)" }}>
          <button
            type="button"
            onClick={onClose}
            className="glass-button px-6 py-3 rounded-2xl font-semibold"
            style={{ color: "#DDD6FE" }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saveMutation.isPending}
            className="glass-accent-moss flex-1 px-6 py-3 rounded-2xl font-semibold disabled:opacity-50"
            style={{ color: "#A7F3D0" }}
          >
            {saveMutation.isPending ? "Saving..." : log ? "Update Log" : "Save Log"}
          </button>
        </div>
      </div>
    </div>
  );
}