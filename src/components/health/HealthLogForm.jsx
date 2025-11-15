import React, { useState } from "react";
import { X, Upload, Loader2, Sparkles, Plus } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import HealthStatusBadge from "./HealthStatusBadge";
import DatePicker from "../ui/DatePicker";

const commonSymptoms = [
  "Yellowing leaves",
  "Brown leaf tips",
  "Wilting",
  "Drooping leaves",
  "Leaf spots",
  "Pests detected",
  "Mold/fungus",
  "New growth",
  "Blooming",
  "Root rot suspected",
  "Pale leaves",
  "Stunted growth"
];

export default function HealthLogForm({ plantId, onClose }) {
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);
  const [analyzingWithAI, setAnalyzingWithAI] = useState(false);

  const [formData, setFormData] = useState({
    observation_date: new Date().toISOString().split('T')[0],
    health_status: "good",
    symptoms: [],
    notes: "",
    photos: []
  });

  const createMutation = useMutation({
    mutationFn: async (logData) => {
      let aiAnalysis = null;
      
      // Get AI analysis if there are symptoms or concerning status
      if (logData.symptoms.length > 0 || ["concerning", "critical"].includes(logData.health_status)) {
        setAnalyzingWithAI(true);
        
        const prompt = `As an African violet plant care expert, analyze these symptoms and provide helpful advice:
        
Health Status: ${logData.health_status}
Symptoms: ${logData.symptoms.join(", ")}
Additional Notes: ${logData.notes || "None"}

Please provide:
1. Likely causes of these symptoms
2. Recommended immediate actions
3. Long-term care suggestions
4. When to be concerned

Keep your response practical and concise.`;

        try {
          const response = await base44.integrations.Core.InvokeLLM({
            prompt,
            add_context_from_internet: false
          });
          aiAnalysis = response;
        } catch (error) {
          console.error("AI analysis failed:", error);
        }
        
        setAnalyzingWithAI(false);
      }

      return base44.entities.HealthLog.create({
        ...logData,
        plant_id: plantId,
        ai_analysis: aiAnalysis
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['healthLogs', plantId] });
      queryClient.invalidateQueries({ queryKey: ['latestHealthStatus', plantId] });
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

  const toggleSymptom = (symptom) => {
    setFormData(prev => ({
      ...prev,
      symptoms: prev.symptoms.includes(symptom)
        ? prev.symptoms.filter(s => s !== symptom)
        : [...prev.symptoms, symptom]
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="clay-card rounded-[24px] bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white rounded-t-[24px] p-6 border-b border-purple-100 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-purple-900">Log Health Observation</h2>
          <button
            onClick={onClose}
            className="clay-button w-10 h-10 rounded-[12px] bg-white/70 hover:bg-rose-100 flex items-center justify-center text-purple-700 hover:text-rose-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Date and Status */}
          <div className="grid sm:grid-cols-2 gap-4">
            <DatePicker
              label="Observation Date"
              value={formData.observation_date}
              onChange={(date) => setFormData(prev => ({ ...prev, observation_date: date }))}
              placeholder="Select date"
              required
            />

            <div>
              <label className="block text-sm font-semibold text-purple-900 mb-2">
                Health Status *
              </label>
              <select
                required
                value={formData.health_status}
                onChange={(e) => setFormData(prev => ({ ...prev, health_status: e.target.value }))}
                className="clay-input w-full px-4 py-3 rounded-[14px] bg-purple-50/50 border-0 text-purple-900 focus:outline-none focus:ring-0"
              >
                <option value="excellent">Excellent - Thriving</option>
                <option value="good">Good - Healthy</option>
                <option value="concerning">Concerning - Needs Attention</option>
                <option value="critical">Critical - Urgent Care</option>
              </select>
            </div>
          </div>

          {/* Symptoms */}
          <div>
            <label className="block text-sm font-semibold text-purple-900 mb-3">
              Symptoms (select all that apply)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {commonSymptoms.map(symptom => (
                <button
                  key={symptom}
                  type="button"
                  onClick={() => toggleSymptom(symptom)}
                  className={`clay-button px-3 py-2 rounded-[12px] text-sm font-medium transition-all ${
                    formData.symptoms.includes(symptom)
                      ? "bg-gradient-to-br from-purple-300 to-purple-400 text-purple-900"
                      : "bg-white/70 text-purple-700"
                  }`}
                >
                  {symptom}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-semibold text-purple-900 mb-2">
              Additional Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Describe what you observed in detail..."
              rows={4}
              className="clay-input w-full px-4 py-3 rounded-[14px] bg-purple-50/50 border-0 text-purple-900 placeholder-purple-400 focus:outline-none focus:ring-0 resize-none"
            />
          </div>

          {/* Photos */}
          <div>
            <label className="block text-sm font-semibold text-purple-900 mb-3">
              Photos (optional)
            </label>
            <div className="flex flex-wrap gap-3">
              {formData.photos.map((photo, index) => (
                <div key={index} className="clay-card rounded-[12px] overflow-hidden w-20 h-20">
                  <img src={photo} alt={`Observation ${index + 1}`} className="w-full h-full object-cover" />
                </div>
              ))}
              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                  id="health-photo-upload"
                  disabled={uploading}
                />
                <label
                  htmlFor="health-photo-upload"
                  className="clay-button w-20 h-20 rounded-[12px] bg-gradient-to-br from-purple-100 to-purple-200 flex flex-col items-center justify-center cursor-pointer hover:from-purple-200 hover:to-purple-300 text-purple-700"
                >
                  {uploading ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <>
                      <Upload className="w-5 h-5 mb-1" />
                      <span className="text-xs">Add</span>
                    </>
                  )}
                </label>
              </div>
            </div>
          </div>

          {/* AI Analysis Notice */}
          {(formData.symptoms.length > 0 || ["concerning", "critical"].includes(formData.health_status)) && (
            <div className="clay-card rounded-[14px] bg-gradient-to-br from-purple-100 to-pink-100 p-4 flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-purple-700 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-purple-900 mb-1">AI Analysis Included</p>
                <p className="text-xs text-purple-700">
                  We'll analyze your observations and provide personalized care suggestions
                </p>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="clay-button px-6 py-3 rounded-[16px] bg-white/70 hover:bg-white text-purple-700 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending || analyzingWithAI}
              className="clay-button flex-1 px-6 py-3 rounded-[16px] bg-gradient-to-br from-purple-300 to-purple-400 hover:from-purple-400 hover:to-purple-500 text-purple-900 font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {analyzingWithAI ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Analyzing with AI...
                </>
              ) : createMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Log Observation
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}