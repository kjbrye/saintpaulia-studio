import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { X, Upload, Loader2, Trash2, Bug, AlertOctagon } from "lucide-react";
import DatePicker from "../ui/DatePicker";
import { toast } from "sonner";

export default function PestDiseaseLogForm({ plantId, log, onClose }) {
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    plant_id: plantId,
    issue_type: "pest",
    name: "",
    date_observed: new Date().toISOString().split('T')[0],
    severity: "moderate",
    symptoms: [],
    treatment_applied: "",
    treatment_date: "",
    resolution_date: "",
    notes: "",
    photos: [],
    status: "active"
  });

  useEffect(() => {
    if (log) {
      setFormData({
        plant_id: log.plant_id,
        issue_type: log.issue_type || "pest",
        name: log.name || "",
        date_observed: log.date_observed,
        severity: log.severity || "moderate",
        symptoms: log.symptoms || [],
        treatment_applied: log.treatment_applied || "",
        treatment_date: log.treatment_date || "",
        resolution_date: log.resolution_date || "",
        notes: log.notes || "",
        photos: log.photos || [],
        status: log.status || "active"
      });
    }
  }, [log]);

  const saveMutation = useMutation({
    mutationFn: (data) => {
      const cleanedData = Object.fromEntries(
        Object.entries(data).filter(([, value]) => {
          if (Array.isArray(value)) return value.length > 0;
          return value !== "" && value !== null && value !== undefined;
        })
      );

      if (log) {
        return base44.entities.PestDiseaseLog.update(log.id, cleanedData);
      }
      return base44.entities.PestDiseaseLog.create(cleanedData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pestDiseaseLogs', plantId] });
      queryClient.invalidateQueries({ queryKey: ['plants'] });
      toast.success(log ? "Issue updated!" : "Issue logged!", {
        description: log ? "Issue details have been updated." : "The pest/disease issue has been logged."
      });
      onClose();
    },
    onError: (error) => {
      toast.error("Failed to save", {
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
    } catch (error) {
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

  const [customSymptom, setCustomSymptom] = useState("");

  const addSymptom = () => {
    if (customSymptom.trim()) {
      setFormData(prev => ({
        ...prev,
        symptoms: [...prev.symptoms, customSymptom.trim()]
      }));
      setCustomSymptom("");
    }
  };

  const removeSymptom = (index) => {
    setFormData(prev => ({
      ...prev,
      symptoms: prev.symptoms.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    saveMutation.mutate(formData);
  };

  // Common pests and diseases for quick selection
  const commonPests = [
    "Aphids", "Spider Mites", "Mealybugs", "Thrips", "Fungus Gnats", 
    "Scale Insects", "Whiteflies", "Cyclamen Mites"
  ];

  const commonDiseases = [
    "Powdery Mildew", "Botrytis (Gray Mold)", "Crown Rot", "Root Rot",
    "Leaf Spot", "Pythium", "Bacterial Blight", "Ring Spot Virus"
  ];

  const suggestionList = formData.issue_type === "pest" ? commonPests : 
                         formData.issue_type === "disease" ? commonDiseases : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="glass-card rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: "rgba(227, 201, 255, 0.2)" }}>
          <h2 className="text-2xl font-bold" style={{ 
            color: "#F5F3FF",
            textShadow: "0 1px 3px rgba(32, 24, 51, 0.4)",
            fontFamily: "'Playfair Display', Georgia, serif"
          }}>
            {log ? "Update Issue" : "Log Pest/Disease Issue"}
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
          {/* Issue Type & Name */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: "#F5F3FF" }}>
                Issue Type *
              </label>
              <select
                required
                value={formData.issue_type}
                onChange={(e) => setFormData(prev => ({ ...prev, issue_type: e.target.value, name: "" }))}
                className="glass-input w-full px-4 py-3 rounded-2xl"
                style={{ color: "#F5F3FF" }}
              >
                <option value="pest">Pest</option>
                <option value="disease">Disease</option>
                <option value="other">Other</option>
              </select>
            </div>

            <DatePicker
              label="Date Observed"
              value={formData.date_observed}
              onChange={(date) => setFormData(prev => ({ ...prev, date_observed: date }))}
              placeholder="Select date"
              required
            />
          </div>

          {/* Name with suggestions */}
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: "#F5F3FF" }}>
              {formData.issue_type === "pest" ? "Pest" : formData.issue_type === "disease" ? "Disease" : "Issue"} Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder={`e.g., ${suggestionList[0] || "Enter name"}`}
              className="glass-input w-full px-4 py-3 rounded-2xl"
              style={{ color: "#F5F3FF" }}
            />
            {suggestionList.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {suggestionList.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, name: item }))}
                    className="px-3 py-1 rounded-xl text-xs font-medium backdrop-blur-xl hover:opacity-80 transition-opacity"
                    style={{
                      background: "rgba(168, 159, 239, 0.15)",
                      border: "1px solid rgba(168, 159, 239, 0.3)",
                      color: "#C4B5FD"
                    }}
                  >
                    {item}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Severity & Status */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: "#F5F3FF" }}>
                Severity *
              </label>
              <select
                required
                value={formData.severity}
                onChange={(e) => setFormData(prev => ({ ...prev, severity: e.target.value }))}
                className="glass-input w-full px-4 py-3 rounded-2xl"
                style={{ color: "#F5F3FF" }}
              >
                <option value="minor">Minor</option>
                <option value="moderate">Moderate</option>
                <option value="severe">Severe</option>
                <option value="critical">Critical</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: "#F5F3FF" }}>
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                className="glass-input w-full px-4 py-3 rounded-2xl"
                style={{ color: "#F5F3FF" }}
              >
                <option value="active">Active</option>
                <option value="treating">Treating</option>
                <option value="monitoring">Monitoring</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>
          </div>

          {/* Symptoms */}
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: "#F5F3FF" }}>
              Symptoms Observed
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={customSymptom}
                onChange={(e) => setCustomSymptom(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSymptom())}
                placeholder="Add a symptom..."
                className="glass-input flex-1 px-4 py-2 rounded-2xl text-sm"
                style={{ color: "#F5F3FF" }}
              />
              <button
                type="button"
                onClick={addSymptom}
                className="glass-accent-moss px-4 py-2 rounded-2xl text-sm font-semibold"
                style={{ color: "#A7F3D0" }}
              >
                Add
              </button>
            </div>
            {formData.symptoms.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.symptoms.map((symptom, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 rounded-xl text-xs font-medium backdrop-blur-xl flex items-center gap-2"
                    style={{
                      background: "rgba(239, 68, 68, 0.2)",
                      border: "1px solid rgba(239, 68, 68, 0.4)",
                      color: "#FCA5A5"
                    }}
                  >
                    {symptom}
                    <button
                      type="button"
                      onClick={() => removeSymptom(idx)}
                      className="hover:opacity-70"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Treatment */}
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: "#F5F3FF" }}>
              Treatment Applied
            </label>
            <textarea
              value={formData.treatment_applied}
              onChange={(e) => setFormData(prev => ({ ...prev, treatment_applied: e.target.value }))}
              placeholder="Describe the treatment, products used, application method..."
              rows={3}
              className="glass-input w-full px-4 py-3 rounded-2xl resize-none"
              style={{ color: "#F5F3FF" }}
            />
          </div>

          {/* Treatment & Resolution Dates */}
          <div className="grid sm:grid-cols-2 gap-4">
            <DatePicker
              label="Treatment Date"
              value={formData.treatment_date}
              onChange={(date) => setFormData(prev => ({ ...prev, treatment_date: date }))}
              placeholder="Select date (optional)"
              minDate={formData.date_observed || undefined}
            />

            <DatePicker
              label="Resolution Date"
              value={formData.resolution_date}
              onChange={(date) => setFormData(prev => ({ ...prev, resolution_date: date }))}
              placeholder="Select date (optional)"
              minDate={formData.treatment_date || formData.date_observed || undefined}
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: "#F5F3FF" }}>
              Additional Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Any additional observations or information..."
              rows={3}
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
              id="pest-photo-upload"
              disabled={uploading}
            />
            <label
              htmlFor="pest-photo-upload"
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
                      alt={`Issue ${idx + 1}`}
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
            {saveMutation.isPending ? "Saving..." : log ? "Update Issue" : "Log Issue"}
          </button>
        </div>
      </div>
    </div>
  );
}