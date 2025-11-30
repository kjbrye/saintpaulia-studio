import React, { useState } from "react";
import { X, Upload, Loader2, Plus } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { BloomLog } from "@/api/entities";
import { UploadFile } from "@/api/integrations";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import DatePicker from "../ui/DatePicker";

export default function BloomLogForm({ plantId, bloomLog, onClose }) {
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState(bloomLog || {
    bloom_start_date: new Date().toISOString().split('T')[0],
    bloom_end_date: "",
    flower_count: "",
    bloom_quality: "good",
    notes: "",
    photos: []
  });

  const mutation = useMutation({
    mutationFn: async (logData) => {
      const user = await base44.auth.me();
      if (!user) {
        throw new Error("You must be signed in to log blooms.");
      }

      if (bloomLog) {
        // Update existing bloom log
        await BloomLog.update(bloomLog.id, logData);
        return;
      }

      // Create new bloom log with user context
      await BloomLog.create({
        ...logData,
        plant_id: plantId,
        user_id: user.id,
        created_by: user.email
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bloomLogs', plantId] });
      onClose();
    }
  });

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const { file_url } = await UploadFile({ file });
      setFormData(prev => ({ ...prev, photos: [...prev.photos, file_url] }));
    } catch {
      alert("Failed to upload photo. Please try again.");
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
    const cleanedData = Object.fromEntries(
      Object.entries(formData).filter(([key, value]) => {
        if (key === 'flower_count') return value !== "";
        return value !== "" && !(Array.isArray(value) && value.length === 0);
      }).map(([key, value]) => [key, key === 'flower_count' && value !== "" ? Number(value) : value])
    );
    mutation.mutate(cleanedData);
  };

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass-card rounded-[32px] w-full max-w-2xl max-h-[90vh] overflow-y-auto">
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
            {bloomLog ? "Edit Bloom Cycle" : "Log Bloom Cycle"}
          </h2>
          <button
            onClick={onClose}
            className="glass-button w-10 h-10 rounded-2xl flex items-center justify-center"
            style={{ color: "#FCA5A5" }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <DatePicker
              label="Bloom Start Date"
              value={formData.bloom_start_date}
              onChange={(date) => setFormData(prev => ({ ...prev, bloom_start_date: date }))}
              placeholder="Select start date"
              required
            />

            <DatePicker
              label="Bloom End Date"
              value={formData.bloom_end_date}
              onChange={(date) => setFormData(prev => ({ ...prev, bloom_end_date: date }))}
              placeholder="Select end date (optional)"
              minDate={formData.bloom_start_date || undefined}
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: "#F5F3FF" }}>
                Approximate Flower Count
              </label>
              <input
                type="number"
                value={formData.flower_count}
                onChange={(e) => setFormData(prev => ({ ...prev, flower_count: e.target.value }))}
                placeholder="e.g., 8"
                className="glass-input w-full px-4 py-3 rounded-2xl"
                style={{ color: "#F5F3FF" }}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: "#F5F3FF" }}>
                Bloom Quality
              </label>
              <select
                value={formData.bloom_quality}
                onChange={(e) => setFormData(prev => ({ ...prev, bloom_quality: e.target.value }))}
                className="glass-input w-full px-4 py-3 rounded-2xl"
                style={{ color: "#F5F3FF" }}
              >
                <option value="poor">Poor</option>
                <option value="fair">Fair</option>
                <option value="good">Good</option>
                <option value="excellent">Excellent</option>
                <option value="exceptional">Exceptional</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: "#F5F3FF" }}>
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Observations about this bloom cycle..."
              rows={4}
              className="glass-input w-full px-4 py-3 rounded-2xl resize-none"
              style={{ color: "#F5F3FF" }}
            />
          </div>

          {/* Photos */}
          <div>
            <label className="block text-sm font-semibold mb-3" style={{ color: "#F5F3FF" }}>
              Bloom Photos
            </label>
            <div className="flex flex-wrap gap-3">
              {formData.photos.map((photo, index) => (
                <div key={index} className="relative group">
                  <div className="glass-card rounded-2xl overflow-hidden w-24 h-24"
                    style={{
                      boxShadow: "inset 0 2px 8px rgba(32, 24, 51, 0.4)"
                    }}>
                    <img src={photo} alt={`Bloom ${index + 1}`} className="w-full h-full object-cover" />
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
                  id="bloom-photo-upload"
                  disabled={uploading}
                />
                <label
                  htmlFor="bloom-photo-upload"
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
              className="glass-accent-moss flex-1 px-6 py-3 rounded-2xl font-semibold disabled:opacity-50"
              style={{ color: "#A7F3D0" }}
            >
              {mutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 inline mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 inline mr-2" />
                  {bloomLog ? "Update Bloom Log" : "Log Bloom Cycle"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}