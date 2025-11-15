
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Upload, Loader2, Sun, Thermometer, Droplets, Wind } from "lucide-react";
import { createPageUrl } from "@/utils";

const LOGO_URL = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/690e3cd78523fb5fba0a8466/632f6e485_PlantLogos.png";

const COLOR_OPTIONS = [
  { value: "lavender", label: "Lavender", color: "#E3C9FF" },
  { value: "moss", label: "Moss", color: "#A7F3D0" },
  { value: "mint", label: "Mint", color: "#9AE2D3" },
  { value: "rose", label: "Rose", color: "#FCA5A5" },
  { value: "amber", label: "Amber", color: "#FCD34D" },
  { value: "sky", label: "Sky", color: "#7DD3FC" }
];

export default function EditLocation() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const locationId = urlParams.get('id');
  const [uploading, setUploading] = useState(false);

  const { data: location, isLoading } = useQuery({
    queryKey: ['location', locationId],
    queryFn: () => base44.entities.Location.filter({ id: locationId }).then(locations => locations[0]),
    enabled: !!locationId
  });

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    light_type: "",
    light_hours: "",
    temperature_min: "",
    temperature_max: "",
    humidity_min: "",
    humidity_max: "",
    air_circulation: "",
    notes: "",
    photo: "",
    color: "lavender"
  });

  useEffect(() => {
    if (location) {
      setFormData({
        name: location.name || "",
        description: location.description || "",
        light_type: location.light_type || "",
        light_hours: location.light_hours || "",
        temperature_min: location.temperature_min || "",
        temperature_max: location.temperature_max || "",
        humidity_min: location.humidity_min || "",
        humidity_max: location.humidity_max || "",
        air_circulation: location.air_circulation || "",
        notes: location.notes || "",
        photo: location.photo || "",
        color: location.color || "lavender"
      });
    }
  }, [location]);

  const updateMutation = useMutation({
    mutationFn: (locationData) => base44.entities.Location.update(locationId, locationData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] });
      queryClient.invalidateQueries({ queryKey: ['location', locationId] });
      navigate(createPageUrl(`LocationDetail?id=${locationId}`));
    }
  });

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setFormData(prev => ({ ...prev, photo: file_url }));
    setUploading(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const cleanedData = Object.fromEntries(
      Object.entries(formData)
        .map(([key, value]) => [
          key, 
          ["light_hours", "temperature_min", "temperature_max", "humidity_min", "humidity_max"].includes(key) && value !== ""
            ? Number(value) 
            : value
        ])
    );
    updateMutation.mutate(cleanedData);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="glass-card w-16 h-16 rounded-2xl flex items-center justify-center animate-pulse glow-violet p-2">
          <img 
            src={LOGO_URL} 
            alt="Loading" 
            className="w-full h-full object-contain"
            style={{ opacity: 0.6 }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate(createPageUrl(`LocationDetail?id=${locationId}`))}
          className="glass-button w-12 h-12 rounded-2xl flex items-center justify-center"
          style={{ color: "var(--accent)" }}
        >
          <ArrowLeft className="w-5 h-5" style={{ strokeWidth: 2 }} />
        </button>
        <div>
          <h1 className="text-3xl font-bold" style={{ 
            color: "var(--text-primary)",
            textShadow: "var(--heading-shadow)",
            fontFamily: "'Playfair Display', Georgia, serif"
          }}>
            Edit Location
          </h1>
          <p style={{ color: "var(--text-secondary)" }}>Update {location?.name}'s details</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="glass-card rounded-3xl p-6 space-y-4">
          <h3 className="text-lg font-bold mb-4" style={{ 
            color: "var(--text-primary)",
            textShadow: "var(--heading-shadow)",
            fontFamily: "'Playfair Display', Georgia, serif"
          }}>
            Basic Information
          </h3>

          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
              Location Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., East Windowsill"
              className="glass-input w-full px-4 py-3 rounded-2xl"
              style={{ color: "var(--text-primary)" }}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe this location..."
              rows={2}
              className="glass-input w-full px-4 py-3 rounded-2xl resize-none"
              style={{ color: "var(--text-primary)" }}
            />
          </div>

          {/* Photo Upload */}
          <div>
            <label className="block text-sm font-semibold mb-3" style={{ color: "var(--text-primary)" }}>
              Location Photo
            </label>
            <div className="flex items-start gap-4">
              {formData.photo && (
                <div className="glass-card rounded-2xl overflow-hidden w-24 h-24"
                  style={{
                    boxShadow: "inset 0 2px 8px rgba(32, 24, 51, 0.4)"
                  }}>
                  <img src={formData.photo} alt="Location" className="w-full h-full object-cover" />
                </div>
              )}
              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                  id="location-photo-upload"
                  disabled={uploading}
                />
                <label
                  htmlFor="location-photo-upload"
                  className="glass-button inline-flex items-center gap-2 px-4 py-2 rounded-2xl cursor-pointer"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {uploading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      {formData.photo ? 'Change Photo' : 'Upload Photo'}
                    </>
                  )}
                </label>
              </div>
            </div>
          </div>

          {/* Color Theme */}
          <div>
            <label className="block text-sm font-semibold mb-3" style={{ color: "var(--text-primary)" }}>
              Color Theme
            </label>
            <div className="flex gap-3">
              {COLOR_OPTIONS.map(option => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, color: option.value }))}
                  className={`w-12 h-12 rounded-2xl transition-all ${
                    formData.color === option.value ? 'ring-2 ring-offset-2' : ''
                  }`}
                  style={{
                    background: option.color,
                    ringColor: option.color,
                    ringOffsetColor: "rgba(32, 24, 51, 0.8)"
                  }}
                  title={option.label}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Light Settings */}
        <div className="glass-card rounded-3xl p-6">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ 
            color: "var(--text-primary)",
            textShadow: "var(--heading-shadow)",
            fontFamily: "'Playfair Display', Georgia, serif"
          }}>
            <Sun className="w-5 h-5" style={{ color: "#FCD34D" }} />
            Light Conditions
          </h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
                Light Type
              </label>
              <select
                value={formData.light_type}
                onChange={(e) => setFormData(prev => ({ ...prev, light_type: e.target.value }))}
                className="glass-input w-full px-4 py-3 rounded-2xl"
                style={{ color: "var(--text-primary)" }}
              >
                <option value="">Select...</option>
                <option value="natural_bright">Natural - Bright</option>
                <option value="natural_medium">Natural - Medium</option>
                <option value="natural_low">Natural - Low</option>
                <option value="artificial_led">Artificial - LED</option>
                <option value="artificial_fluorescent">Artificial - Fluorescent</option>
                <option value="mixed">Mixed (Natural + Artificial)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
                Hours of Light/Day
              </label>
              <input
                type="number"
                step="0.5"
                min="0"
                max="24"
                value={formData.light_hours}
                onChange={(e) => setFormData(prev => ({ ...prev, light_hours: e.target.value }))}
                placeholder="e.g., 14"
                className="glass-input w-full px-4 py-3 rounded-2xl"
                style={{ color: "var(--text-primary)" }}
              />
            </div>
          </div>
        </div>

        {/* Temperature Range */}
        <div className="glass-card rounded-3xl p-6">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ 
            color: "var(--text-primary)",
            textShadow: "var(--heading-shadow)",
            fontFamily: "'Playfair Display', Georgia, serif"
          }}>
            <Thermometer className="w-5 h-5" style={{ color: "#FCA5A5" }} />
            Temperature Range (°F)
          </h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
                Minimum
              </label>
              <input
                type="number"
                value={formData.temperature_min}
                onChange={(e) => setFormData(prev => ({ ...prev, temperature_min: e.target.value }))}
                placeholder="e.g., 65"
                className="glass-input w-full px-4 py-3 rounded-2xl"
                style={{ color: "var(--text-primary)" }}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
                Maximum
              </label>
              <input
                type="number"
                value={formData.temperature_max}
                onChange={(e) => setFormData(prev => ({ ...prev, temperature_max: e.target.value }))}
                placeholder="e.g., 75"
                className="glass-input w-full px-4 py-3 rounded-2xl"
                style={{ color: "var(--text-primary)" }}
              />
            </div>
          </div>
        </div>

        {/* Humidity Range */}
        <div className="glass-card rounded-3xl p-6">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ 
            color: "var(--text-primary)",
            textShadow: "var(--heading-shadow)",
            fontFamily: "'Playfair Display', Georgia, serif"
          }}>
            <Droplets className="w-5 h-5" style={{ color: "#7DD3FC" }} />
            Humidity Range (%)
          </h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
                Minimum
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.humidity_min}
                onChange={(e) => setFormData(prev => ({ ...prev, humidity_min: e.target.value }))}
                placeholder="e.g., 40"
                className="glass-input w-full px-4 py-3 rounded-2xl"
                style={{ color: "var(--text-primary)" }}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
                Maximum
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.humidity_max}
                onChange={(e) => setFormData(prev => ({ ...prev, humidity_max: e.target.value }))}
                placeholder="e.g., 60"
                className="glass-input w-full px-4 py-3 rounded-2xl"
                style={{ color: "var(--text-primary)" }}
              />
            </div>
          </div>
        </div>

        {/* Air Circulation */}
        <div className="glass-card rounded-3xl p-6">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ 
            color: "var(--text-primary)",
            textShadow: "var(--heading-shadow)",
            fontFamily: "'Playfair Display', Georgia, serif"
          }}>
            <Wind className="w-5 h-5" style={{ color: "#A7F3D0" }} />
            Air Circulation
          </h3>
          <select
            value={formData.air_circulation}
            onChange={(e) => setFormData(prev => ({ ...prev, air_circulation: e.target.value }))}
            className="glass-input w-full px-4 py-3 rounded-2xl"
            style={{ color: "var(--text-primary)" }}
          >
            <option value="">Select...</option>
            <option value="excellent">Excellent</option>
            <option value="good">Good</option>
            <option value="moderate">Moderate</option>
            <option value="poor">Poor</option>
          </select>
        </div>

        {/* Notes */}
        <div className="glass-card rounded-3xl p-6">
          <label className="block text-sm font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
            Additional Notes
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            placeholder="Any other details about this location..."
            rows={3}
            className="glass-input w-full px-4 py-3 rounded-2xl resize-none"
            style={{ color: "var(--text-primary)" }}
          />
        </div>

        {/* Submit Buttons */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => navigate(createPageUrl(`LocationDetail?id=${locationId}`))}
            className="glass-button px-6 py-3 rounded-2xl font-semibold"
            style={{ color: "var(--text-secondary)" }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={updateMutation.isPending}
            className="glass-accent-moss flex-1 px-6 py-3 rounded-2xl font-semibold disabled:opacity-50"
            style={{ color: "#A7F3D0" }}
          >
            {updateMutation.isPending ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
