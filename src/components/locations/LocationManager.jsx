import React, { useState } from "react";
import { X, Plus, Edit, Trash2, MapPin, Thermometer, Droplets, Sun, Wind, Loader2, Upload } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const COLOR_OPTIONS = [
  { value: "lavender", label: "Lavender", color: "#E3C9FF" },
  { value: "moss", label: "Moss", color: "#A7F3D0" },
  { value: "mint", label: "Mint", color: "#9AE2D3" },
  { value: "rose", label: "Rose", color: "#FCA5A5" },
  { value: "amber", label: "Amber", color: "#FCD34D" },
  { value: "sky", label: "Sky", color: "#7DD3FC" }
];

export default function LocationManager({ onClose }) {
  const queryClient = useQueryClient();
  const [editingLocation, setEditingLocation] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [uploading, setUploading] = useState(false);

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

  const { data: locations = [] } = useQuery({
    queryKey: ['locations'],
    queryFn: () => base44.entities.Location.list('-updated_date'),
    initialData: [],
  });

  const { data: plants = [] } = useQuery({
    queryKey: ['plants'],
    queryFn: () => base44.entities.Plant.list(),
    initialData: [],
  });

  const createMutation = useMutation({
    mutationFn: (locationData) => base44.entities.Location.create(locationData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] });
      resetForm();
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Location.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] });
      resetForm();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (locationId) => {
      // Update all plants with this location to have no location
      const plantsInLocation = plants.filter(p => p.location_id === locationId);
      await Promise.all(
        plantsInLocation.map(plant => 
          base44.entities.Plant.update(plant.id, { location_id: null })
        )
      );
      // Delete the location
      await base44.entities.Location.delete(locationId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] });
      queryClient.invalidateQueries({ queryKey: ['plants'] });
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

  const resetForm = () => {
    setFormData({
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
    setEditingLocation(null);
    setShowForm(false);
  };

  const handleEdit = (location) => {
    setEditingLocation(location);
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
    setShowForm(true);
  };

  const handleDelete = (location) => {
    const plantCount = plants.filter(p => p.location_id === location.id).length;
    if (window.confirm(
      `Delete "${location.name}"? ${plantCount > 0 ? `${plantCount} ${plantCount === 1 ? 'plant' : 'plants'} will be unassigned.` : ''}`
    )) {
      deleteMutation.mutate(location.id);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const cleanedData = Object.fromEntries(
      Object.entries(formData)
        .filter(([, value]) => value !== "")
        .map(([key, value]) => [
          key, 
          ["light_hours", "temperature_min", "temperature_max", "humidity_min", "humidity_max"].includes(key) 
            ? Number(value) 
            : value
        ])
    );

    if (editingLocation) {
      updateMutation.mutate({ id: editingLocation.id, data: cleanedData });
    } else {
      createMutation.mutate(cleanedData);
    }
  };

  const getPlantCount = (locationId) => {
    return plants.filter(p => p.location_id === locationId).length;
  };

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass-card rounded-[32px] w-full max-w-5xl max-h-[90vh] overflow-y-auto">
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
            Manage Locations
          </h2>
          <button
            onClick={onClose}
            className="glass-button w-10 h-10 rounded-2xl flex items-center justify-center"
            style={{ color: "#FCA5A5" }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {!showForm ? (
            <>
              <button
                onClick={() => setShowForm(true)}
                className="glass-accent-lavender w-full px-6 py-4 rounded-3xl font-semibold flex items-center justify-center gap-2 mb-6"
                style={{ color: "#F0EBFF" }}
              >
                <Plus className="w-5 h-5" />
                Create New Location
              </button>

              {locations.length === 0 ? (
                <div className="glass-card rounded-3xl p-12 text-center">
                  <MapPin className="w-16 h-16 mx-auto mb-4" style={{ color: "#C4B5FD", opacity: 0.5 }} />
                  <p style={{ color: "#DDD6FE" }}>
                    No locations yet. Create your first location to organize your plants!
                  </p>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-4">
                  {locations.map(location => {
                    const plantCount = getPlantCount(location.id);
                    const colorOption = COLOR_OPTIONS.find(c => c.value === location.color);

                    return (
                      <div key={location.id} className="glass-card rounded-3xl p-5">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div 
                              className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                              style={{
                                background: `${colorOption?.color}30`,
                                border: `1px solid ${colorOption?.color}60`
                              }}>
                              <MapPin className="w-6 h-6" style={{ color: colorOption?.color }} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-bold text-lg truncate" style={{ color: "#F5F3FF" }}>
                                {location.name}
                              </h3>
                              <p className="text-sm" style={{ color: "#DDD6FE", opacity: 0.8 }}>
                                {plantCount} {plantCount === 1 ? 'plant' : 'plants'}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEdit(location)}
                              className="glass-button w-9 h-9 rounded-xl flex items-center justify-center"
                              style={{ color: "#C4B5FD" }}
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(location)}
                              className="glass-button w-9 h-9 rounded-xl flex items-center justify-center"
                              style={{ color: "#FCA5A5" }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {location.description && (
                          <p className="text-sm mb-3" style={{ color: "#DDD6FE" }}>
                            {location.description}
                          </p>
                        )}

                        {/* Environmental Info */}
                        <div className="grid grid-cols-2 gap-2">
                          {location.light_type && (
                            <div className="flex items-center gap-2 text-xs" style={{ color: "#DDD6FE" }}>
                              <Sun className="w-3 h-3" style={{ color: "#FCD34D" }} />
                              <span className="capitalize">{location.light_type.replace(/_/g, ' ')}</span>
                            </div>
                          )}
                          {location.temperature_min && location.temperature_max && (
                            <div className="flex items-center gap-2 text-xs" style={{ color: "#DDD6FE" }}>
                              <Thermometer className="w-3 h-3" style={{ color: "#FCA5A5" }} />
                              <span>{location.temperature_min}-{location.temperature_max}°F</span>
                            </div>
                          )}
                          {location.humidity_min && location.humidity_max && (
                            <div className="flex items-center gap-2 text-xs" style={{ color: "#DDD6FE" }}>
                              <Droplets className="w-3 h-3" style={{ color: "#7DD3FC" }} />
                              <span>{location.humidity_min}-{location.humidity_max}%</span>
                            </div>
                          )}
                          {location.air_circulation && (
                            <div className="flex items-center gap-2 text-xs" style={{ color: "#DDD6FE" }}>
                              <Wind className="w-3 h-3" style={{ color: "#A7F3D0" }} />
                              <span className="capitalize">{location.air_circulation}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: "#F5F3FF" }}>
                  Location Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., East Windowsill, Light Shelf B"
                  className="glass-input w-full px-4 py-3 rounded-2xl"
                  style={{ color: "#F5F3FF" }}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: "#F5F3FF" }}>
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe this location..."
                  rows={2}
                  className="glass-input w-full px-4 py-3 rounded-2xl resize-none"
                  style={{ color: "#F5F3FF" }}
                />
              </div>

              {/* Photo Upload */}
              <div>
                <label className="block text-sm font-semibold mb-3" style={{ color: "#F5F3FF" }}>
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
                          {formData.photo ? 'Change Photo' : 'Upload Photo'}
                        </>
                      )}
                    </label>
                  </div>
                </div>
              </div>

              {/* Light Settings */}
              <div className="glass-card rounded-3xl p-5">
                <h3 className="text-sm font-bold mb-4 flex items-center gap-2" style={{ color: "#F5F3FF" }}>
                  <Sun className="w-4 h-4" style={{ color: "#FCD34D" }} />
                  Light Conditions
                </h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: "#F5F3FF" }}>
                      Light Type
                    </label>
                    <select
                      value={formData.light_type}
                      onChange={(e) => setFormData(prev => ({ ...prev, light_type: e.target.value }))}
                      className="glass-input w-full px-4 py-3 rounded-2xl"
                      style={{ color: "#F5F3FF" }}
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
                    <label className="block text-sm font-semibold mb-2" style={{ color: "#F5F3FF" }}>
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
                      style={{ color: "#F5F3FF" }}
                    />
                  </div>
                </div>
              </div>

              {/* Temperature Range */}
              <div className="glass-card rounded-3xl p-5">
                <h3 className="text-sm font-bold mb-4 flex items-center gap-2" style={{ color: "#F5F3FF" }}>
                  <Thermometer className="w-4 h-4" style={{ color: "#FCA5A5" }} />
                  Temperature Range (°F)
                </h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: "#F5F3FF" }}>
                      Minimum
                    </label>
                    <input
                      type="number"
                      value={formData.temperature_min}
                      onChange={(e) => setFormData(prev => ({ ...prev, temperature_min: e.target.value }))}
                      placeholder="e.g., 65"
                      className="glass-input w-full px-4 py-3 rounded-2xl"
                      style={{ color: "#F5F3FF" }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: "#F5F3FF" }}>
                      Maximum
                    </label>
                    <input
                      type="number"
                      value={formData.temperature_max}
                      onChange={(e) => setFormData(prev => ({ ...prev, temperature_max: e.target.value }))}
                      placeholder="e.g., 75"
                      className="glass-input w-full px-4 py-3 rounded-2xl"
                      style={{ color: "#F5F3FF" }}
                    />
                  </div>
                </div>
              </div>

              {/* Humidity Range */}
              <div className="glass-card rounded-3xl p-5">
                <h3 className="text-sm font-bold mb-4 flex items-center gap-2" style={{ color: "#F5F3FF" }}>
                  <Droplets className="w-4 h-4" style={{ color: "#7DD3FC" }} />
                  Humidity Range (%)
                </h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: "#F5F3FF" }}>
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
                      style={{ color: "#F5F3FF" }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: "#F5F3FF" }}>
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
                      style={{ color: "#F5F3FF" }}
                    />
                  </div>
                </div>
              </div>

              {/* Air Circulation */}
              <div>
                <label className="block text-sm font-semibold mb-2 flex items-center gap-2" style={{ color: "#F5F3FF" }}>
                  <Wind className="w-4 h-4" style={{ color: "#A7F3D0" }} />
                  Air Circulation
                </label>
                <select
                  value={formData.air_circulation}
                  onChange={(e) => setFormData(prev => ({ ...prev, air_circulation: e.target.value }))}
                  className="glass-input w-full px-4 py-3 rounded-2xl"
                  style={{ color: "#F5F3FF" }}
                >
                  <option value="">Select...</option>
                  <option value="excellent">Excellent</option>
                  <option value="good">Good</option>
                  <option value="moderate">Moderate</option>
                  <option value="poor">Poor</option>
                </select>
              </div>

              {/* Color Theme */}
              <div>
                <label className="block text-sm font-semibold mb-3" style={{ color: "#F5F3FF" }}>
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

              {/* Notes */}
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: "#F5F3FF" }}>
                  Additional Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Any other details about this location..."
                  rows={3}
                  className="glass-input w-full px-4 py-3 rounded-2xl resize-none"
                  style={{ color: "#F5F3FF" }}
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={resetForm}
                  className="glass-button px-6 py-3 rounded-2xl font-semibold"
                  style={{ color: "#DDD6FE" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="glass-accent-lavender flex-1 px-6 py-3 rounded-2xl font-semibold disabled:opacity-50"
                  style={{ color: "#F0EBFF" }}
                >
                  {createMutation.isPending || updateMutation.isPending ? "Saving..." : editingLocation ? "Update Location" : "Create Location"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}