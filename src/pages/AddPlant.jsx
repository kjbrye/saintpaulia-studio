
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { ArrowLeft, Upload, Loader2, AlertTriangle, MapPin } from "lucide-react";
import { createPageUrl } from "@/utils";
import CollectionSelector from "../components/collections/CollectionSelector";
import LocationManager from "../components/locations/LocationManager";
import DatePicker from "../components/ui/DatePicker";
import { toast } from "sonner";

const getSmartWateringInterval = (potSize, soilMix) => {
  if (!potSize) return 7;
  
  const soilLower = soilMix?.toLowerCase() || "";
  const hasPerlite = soilLower.includes("perlite");
  const hasPeat = soilLower.includes("peat") || soilLower.includes("sphagnum");
  
  let baseInterval = 7;
  
  if (potSize <= 2) baseInterval = 3;
  else if (potSize <= 4) baseInterval = 5;
  else if (potSize <= 6) baseInterval = 7;
  else baseInterval = 10;
  
  if (hasPerlite) baseInterval -= 1;
  if (hasPeat) baseInterval += 1;
  
  return Math.max(2, baseInterval);
};

export default function AddPlant() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);
  const [selectedCollections, setSelectedCollections] = useState([]);
  const [showLocationManager, setShowLocationManager] = useState(false);

  const { data: collections = [] } = useQuery({
    queryKey: ['plantCollections'],
    queryFn: () => base44.entities.PlantCollection.list(),
    initialData: []
  });

  const { data: locations = [] } = useQuery({
    queryKey: ['locations'],
    queryFn: () => base44.entities.Location.list('-updated_date'),
    initialData: []
  });

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me().catch(() => null),
  });

  const currentTheme = currentUser?.theme || "glassmorphism";

  const [formData, setFormData] = useState({
    cultivar_name: "",
    nickname: "",
    avsa_number: "",
    hybridizer: "",
    year: "",
    blossom_type: "",
    blossom_color: "",
    leaf_types: [],
    variegation: "",
    acquisition_date: new Date().toISOString().split('T')[0],
    source: "",
    photo_url: "",
    location_id: "", // Changed from 'location' to 'location_id'
    pot_size: "",
    soil_mix: "",
    watering_interval: "",
    fertilizer_interval: "",
    fertilizer_npk: "",
    fertilizer_method: "",
    notes: ""
  });

  const createMutation = useMutation({
    mutationFn: async (plantData) => {
      // Create the plant
      const plant = await base44.entities.Plant.create(plantData);
      
      // Update collections to include this plant
      if (selectedCollections.length > 0) {
        await Promise.all(
          selectedCollections.map(async collectionId => {
            const collection = collections.find(c => c.id === collectionId);
            if (collection) {
              // Ensure plant_ids is always an array and append the new plant ID
              const currentPlantIds = Array.isArray(collection.plant_ids) ? collection.plant_ids : [];
              const updatedPlantIds = [...currentPlantIds, plant.id];
              return base44.entities.PlantCollection.update(collectionId, {
                plant_ids: updatedPlantIds
              });
            }
            return null; // Return null for collections not found or not updated
          }).filter(Boolean) // Filter out null values
        );
      }
      
      return plant;
    },
    onSuccess: (plant) => {
      queryClient.invalidateQueries({ queryKey: ['plants'] });
      queryClient.invalidateQueries({ queryKey: ['plantCollections'] });
      queryClient.invalidateQueries({ queryKey: ['locations'] }); // Invalidate locations to ensure manager update is reflected
      toast.success("Plant added to collection!", {
        description: `${plant.cultivar_name} has been successfully added.`
      });
      setTimeout(() => {
        navigate(createPageUrl("Collection"));
      }, 500);
    },
    onError: (error) => {
      toast.error("Failed to add plant", {
        description: error.message || "Please try again."
      });
    }
  });

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setFormData(prev => ({ ...prev, photo_url: file_url }));
    setUploading(false);
  };

  const handlePotSizeChange = (value) => {
    setFormData(prev => {
      const newData = { ...prev, pot_size: value };
      if (!prev.watering_interval || value === '') { // Recalculate if watering_interval is empty or pot_size changed
        newData.watering_interval = getSmartWateringInterval(parseFloat(value), prev.soil_mix);
      }
      return newData;
    });
  };

  const handleSoilMixChange = (value) => {
    setFormData(prev => {
      const newData = { ...prev, soil_mix: value };
      if (!prev.watering_interval || value === '') { // Recalculate if watering_interval is empty or soil_mix changed
        newData.watering_interval = getSmartWateringInterval(prev.pot_size, value);
      }
      return newData;
    });
  };

  const getWateringWarning = () => {
    const interval = parseInt(formData.watering_interval);
    if (isNaN(interval) || interval === 0) return null; // Only show warning for valid, non-zero numbers
    if (interval > 21) return "Warning: Very long watering interval - check if this is correct";
    if (interval < 2) return "Warning: Very frequent watering - this may be too often";
    return null;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const cleanedData = Object.fromEntries(
      Object.entries(formData)
        .filter(([key, value]) => {
          // If value is an empty array, we still want to include it.
          // If value is an empty string, we filter it out, unless it's location_id which can be empty.
          // `location_id` can be an empty string if no location is selected, which is a valid state for the model.
          return Array.isArray(value) || (value !== "" && value !== null) || (key === "location_id" && value === "");
        }) 
        .map(([key, value]) => [key, ["pot_size", "watering_interval", "fertilizer_interval"].includes(key) ? Number(value) : value])
    );
    createMutation.mutate(cleanedData);
  };

  const wateringWarning = getWateringWarning();

  const leafTypeOptions = [
    { value: "standard", label: "Standard", category: "Size" },
    { value: "miniature", label: "Miniature", category: "Size" },
    { value: "semi-miniature", label: "Semi-Miniature", category: "Size" },
    { value: "trailing", label: "Trailing", category: "Growth" },
    { value: "boy", label: "Boy", category: "Type" },
    { value: "girl", label: "Girl", category: "Type" },
    { value: "variegated", label: "Variegated", category: "Pattern" },
    { value: "plain", label: "Plain", category: "Pattern" },
    { value: "serrated", label: "Serrated", category: "Edge" },
    { value: "ruffled", label: "Ruffled", category: "Edge" },
    { value: "wavy", label: "Wavy", category: "Edge" },
    { value: "quilted", label: "Quilted", category: "Texture" },
    { value: "spoon", label: "Spoon", category: "Shape" },
    { value: "heart-shaped", label: "Heart-Shaped", category: "Shape" },
    { value: "rounded", label: "Rounded", category: "Shape" },
    { value: "pointed", label: "Pointed", category: "Shape" },
    { value: "lance", label: "Lance", category: "Shape" },
    { value: "holly", label: "Holly", category: "Shape" },
    { value: "longifolia", label: "Longifolia", category: "Special" },
    { value: "supreme", label: "Supreme", category: "Special" },
    { value: "crown", label: "Crown", category: "Special" },
    { value: "other", label: "Other", category: "Other" }
  ];

  const toggleLeafType = (value) => {
    setFormData(prev => ({
      ...prev,
      leaf_types: prev.leaf_types.includes(value)
        ? prev.leaf_types.filter(t => t !== value)
        : [...prev.leaf_types, value]
    }));
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate(createPageUrl("Collection"))}
          className="glass-button w-12 h-12 rounded-2xl flex items-center justify-center"
          style={{ color: (currentTheme === 'light' || currentTheme === 'minimal') ? "#7C3AED" : "#E3C9FF" }}
        >
          <ArrowLeft className="w-5 h-5" style={{ strokeWidth: 2 }} />
        </button>
        <div>
          <h1 className="text-3xl font-bold" style={{ 
            color: "var(--text-primary)",
            textShadow: "0 2px 4px rgba(32, 24, 51, 0.4)",
            fontFamily: "'Playfair Display', Georgia, serif"
          }}>
            Add New Plant
          </h1>
          <p style={{ color: (currentTheme === 'light' || currentTheme === 'minimal') ? 'var(--text-secondary)' : "#DDD6FE" }}>Welcome a new violet to your collection</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Photo Upload */}
        <div className="glass-card rounded-3xl p-6">
          <label className="block text-sm font-semibold mb-3" style={{ color: (currentTheme === 'light' || currentTheme === 'minimal') ? 'var(--text-primary)' : "#F5F3FF" }}>Plant Photo</label>
          <div className="flex items-start gap-4 flex-col sm:flex-row">
            <div className="glass-card rounded-2xl overflow-hidden w-32 h-32 flex-shrink-0"
              style={{
                boxShadow: "inset 0 2px 8px rgba(32, 24, 51, 0.4), 0 4px 16px rgba(32, 24, 51, 0.3)"
              }}>
              {formData.photo_url ? (
                <img 
                  src={formData.photo_url} 
                  alt="Plant preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center"
                  style={{
                    background: "linear-gradient(135deg, rgba(168, 159, 239, 0.15) 0%, rgba(154, 226, 211, 0.12) 100%)"
                  }}>
                  <Upload className="w-8 h-8" style={{ color: "#C4B5FD", opacity: 0.5 }} />
                </div>
              )}
            </div>
            <div className="flex-1">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="photo-upload"
                disabled={uploading}
              />
              <label
                htmlFor="photo-upload"
                className="glass-button inline-flex items-center gap-2 px-6 py-3 rounded-2xl font-medium cursor-pointer hover:opacity-90 transition-opacity"
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
                    Choose Photo
                  </>
                )}
              </label>
              <p className="text-xs mt-2" style={{ color: (currentTheme === 'light' || currentTheme === 'minimal') ? 'var(--text-secondary)' : "#DDD6FE", opacity: 0.7 }}>
                Optional: Upload a photo of your African violet
              </p>
            </div>
          </div>
        </div>

        {/* Identity Section */}
        <div className="glass-card rounded-3xl p-6 space-y-4">
          <h3 className="text-lg font-bold mb-4" style={{ 
            color: "var(--text-primary)",
            textShadow: "0 1px 3px rgba(32, 24, 51, 0.4)",
            fontFamily: "'Playfair Display', Georgia, serif"
          }}>
            Identity
          </h3>

          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: (currentTheme === 'light' || currentTheme === 'minimal') ? 'var(--text-primary)' : "#F5F3FF" }}>
              Cultivar/Variety Name *
            </label>
            <input
              type="text"
              required
              value={formData.cultivar_name}
              onChange={(e) => setFormData(prev => ({ ...prev, cultivar_name: e.target.value }))}
              placeholder="e.g., Midnight Rose, Optimara"
              className="glass-input w-full px-4 py-3 rounded-2xl"
              style={{ color: "var(--text-primary)" }}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: (currentTheme === 'light' || currentTheme === 'minimal') ? 'var(--text-primary)' : "#F5F3FF" }}>
              Nickname (optional)
            </label>
            <input
              type="text"
              value={formData.nickname}
              onChange={(e) => setFormData(prev => ({ ...prev, nickname: e.target.value }))}
              placeholder="e.g., My Pretty Purple"
              className="glass-input w-full px-4 py-3 rounded-2xl"
              style={{ color: "var(--text-primary)" }}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: (currentTheme === 'light' || currentTheme === 'minimal') ? 'var(--text-primary)' : "#F5F3FF" }}>
              AVSA Number (optional)
            </label>
            <input
              type="text"
              value={formData.avsa_number}
              onChange={(e) => setFormData(prev => ({ ...prev, avsa_number: e.target.value }))}
              placeholder="e.g., 10245"
              className="glass-input w-full px-4 py-3 rounded-2xl"
              style={{ color: "var(--text-primary)" }}
            />
            <p className="text-xs mt-1" style={{ color: "var(--text-muted)", opacity: 0.7 }}>
              African Violet Society of America registration number
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: (currentTheme === 'light' || currentTheme === 'minimal') ? 'var(--text-primary)' : "#F5F3FF" }}>
                Hybridizer
              </label>
              <input
                type="text"
                value={formData.hybridizer}
                onChange={(e) => setFormData(prev => ({ ...prev, hybridizer: e.target.value }))}
                placeholder="e.g., Lyndon Lyon"
                className="glass-input w-full px-4 py-3 rounded-2xl"
                style={{ color: "var(--text-primary)" }}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: (currentTheme === 'light' || currentTheme === 'minimal') ? 'var(--text-primary)' : "#F5F3FF" }}>
                Year
              </label>
              <input
                type="text"
                value={formData.year}
                onChange={(e) => setFormData(prev => ({ ...prev, year: e.target.value }))}
                placeholder="e.g., 2020"
                className="glass-input w-full px-4 py-3 rounded-2xl"
                style={{ color: "var(--text-primary)" }}
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: (currentTheme === 'light' || currentTheme === 'minimal') ? 'var(--text-primary)' : "#F5F3FF" }}>
                Blossom Type
              </label>
              <select
                value={formData.blossom_type}
                onChange={(e) => setFormData(prev => ({ ...prev, blossom_type: e.target.value }))}
                className="glass-input w-full px-4 py-3 rounded-2xl"
                style={{ color: "var(--text-primary)" }}
              >
                <option value="">Select...</option>
                <option value="single">Single</option>
                <option value="double">Double</option>
                <option value="semi-double">Semi-Double</option>
                <option value="star">Star</option>
                <option value="frilled">Frilled</option>
                <option value="fantasy">Fantasy</option>
                <option value="chimera">Chimera</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: (currentTheme === 'light' || currentTheme === 'minimal') ? 'var(--text-primary)' : "#F5F3FF" }}>
                Blossom Color
              </label>
              <input
                type="text"
                value={formData.blossom_color}
                onChange={(e) => setFormData(prev => ({ ...prev, blossom_color: e.target.value }))}
                placeholder="e.g., Purple, Pink"
                className="glass-input w-full px-4 py-3 rounded-2xl"
                style={{ color: "var(--text-primary)" }}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-3" style={{ color: (currentTheme === 'light' || currentTheme === 'minimal') ? 'var(--text-primary)' : "#F5F3FF" }}>
              Leaf Types & Characteristics
            </label>
            <p className="text-xs mb-3" style={{ color: "var(--text-muted)", opacity: 0.8 }}>
              Select all that apply
            </p>
            <div className="space-y-3">
              {["Size", "Growth", "Type", "Pattern", "Edge", "Texture", "Shape", "Special", "Other"].map(category => {
                const categoryOptions = leafTypeOptions.filter(opt => opt.category === category);
                if (categoryOptions.length === 0) return null;
                
                return (
                  <div key={category}>
                    <p className="text-xs font-semibold mb-2" style={{ color: "var(--text-muted)", opacity: 0.9 }}>
                      {category}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {categoryOptions.map(option => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => toggleLeafType(option.value)}
                          className={`px-3 py-2 rounded-xl text-sm font-medium transition-all backdrop-blur-xl ${
                            formData.leaf_types.includes(option.value)
                              ? "glass-accent-lavender"
                              : "glass-button"
                          }`}
                          style={{
                            color: formData.leaf_types.includes(option.value) 
                              ? ((currentTheme === 'light' || currentTheme === 'minimal') ? "#FFFFFF" : "#F0EBFF")
                              : "var(--text-secondary)",
                            border: formData.leaf_types.includes(option.value) 
                              ? "1px solid rgba(227, 201, 255, 0.5)" 
                              : undefined
                          }}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: (currentTheme === 'light' || currentTheme === 'minimal') ? 'var(--text-primary)' : "#F5F3FF" }}>
              Variegation
            </label>
            <input
              type="text"
              value={formData.variegation}
              onChange={(e) => setFormData(prev => ({ ...prev, variegation: e.target.value }))}
              placeholder="e.g., Champion variegation"
              className="glass-input w-full px-4 py-3 rounded-2xl"
              style={{ color: "var(--text-primary)" }}
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <DatePicker
              label="Date Acquired"
              value={formData.acquisition_date}
              onChange={(date) => setFormData(prev => ({ ...prev, acquisition_date: date }))}
              placeholder="Select date"
            />

            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: (currentTheme === 'light' || currentTheme === 'minimal') ? 'var(--text-primary)' : "#F5F3FF" }}>
                Source
              </label>
              <input
                type="text"
                value={formData.source}
                onChange={(e) => setFormData(prev => ({ ...prev, source: e.target.value }))}
                placeholder="e.g., Local nursery, Online shop"
                className="glass-input w-full px-4 py-3 rounded-2xl"
                style={{ color: "var(--text-primary)" }}
              />
            </div>
          </div>
        </div>

        {/* Location & Care Section */}
        <div className="glass-card rounded-3xl p-6 space-y-4">
          <h3 className="text-lg font-bold mb-4" style={{ 
            color: "var(--text-primary)",
            textShadow: "0 1px 3px rgba(32, 24, 51, 0.4)",
            fontFamily: "'Playfair Display', Georgia, serif"
          }}>
            Location & Care
          </h3>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-semibold" style={{ color: (currentTheme === 'light' || currentTheme === 'minimal') ? 'var(--text-primary)' : "#F5F3FF" }}>
                Location
              </label>
              <button
                type="button"
                onClick={() => setShowLocationManager(true)}
                className="glass-button px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1"
                style={{ color: "var(--text-secondary)" }}
              >
                <MapPin className="w-3 h-3" />
                Manage Locations
              </button>
            </div>
            <select
              value={formData.location_id}
              onChange={(e) => setFormData(prev => ({ ...prev, location_id: e.target.value }))}
              className="glass-input w-full px-4 py-3 rounded-2xl"
              style={{ color: "var(--text-primary)" }}
            >
              <option value="">No location assigned</option>
              {locations.map(location => (
                <option key={location.id} value={location.id}>{location.name}</option>
              ))}
            </select>
            {locations.length === 0 && (
              <p className="text-xs mt-2" style={{ color: (currentTheme === 'light' || currentTheme === 'minimal') ? 'var(--text-secondary)' : "#DDD6FE", opacity: 0.7 }}>
                No locations yet. Click "Manage Locations" to create one.
              </p>
            )}
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: (currentTheme === 'light' || currentTheme === 'minimal') ? 'var(--text-primary)' : "#F5F3FF" }}>
                Pot Size (inches)
              </label>
              <input
                type="number"
                step="0.5"
                value={formData.pot_size}
                onChange={(e) => handlePotSizeChange(e.target.value)}
                placeholder="e.g., 3, 4.5"
                className="glass-input w-full px-4 py-3 rounded-2xl"
                style={{ color: "var(--text-primary)" }}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: (currentTheme === 'light' || currentTheme === 'minimal') ? 'var(--text-primary)' : "#F5F3FF" }}>
                Soil Mix
              </label>
              <input
                type="text"
                value={formData.soil_mix}
                onChange={(e) => handleSoilMixChange(e.target.value)}
                placeholder="e.g., Peat/Perlite mix"
                className="glass-input w-full px-4 py-3 rounded-2xl"
                style={{ color: "var(--text-primary)" }}
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: (currentTheme === 'light' || currentTheme === 'minimal') ? 'var(--text-primary)' : "#F5F3FF" }}>
                Watering Interval (days)
              </label>
              <input
                type="number"
                value={formData.watering_interval}
                onChange={(e) => setFormData(prev => ({ ...prev, watering_interval: e.target.value }))}
                placeholder="Auto-suggested"
                className="glass-input w-full px-4 py-3 rounded-2xl"
                style={{ color: "var(--text-primary)" }}
              />
              {wateringWarning && (
                <div className="flex items-center gap-2 mt-2 text-xs" style={{ color: "#FCD34D" }}>
                  <AlertTriangle className="w-4 h-4" />
                  {wateringWarning}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: (currentTheme === 'light' || currentTheme === 'minimal') ? 'var(--text-primary)' : "#F5F3FF" }}>
                Fertilizer Interval (days)
              </label>
              <input
                type="number"
                value={formData.fertilizer_interval}
                onChange={(e) => setFormData(prev => ({ ...prev, fertilizer_interval: e.target.value }))}
                placeholder="e.g., 14"
                className="glass-input w-full px-4 py-3 rounded-2xl"
                style={{ color: "var(--text-primary)" }}
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: (currentTheme === 'light' || currentTheme === 'minimal') ? 'var(--text-primary)' : "#F5F3FF" }}>
                Fertilizer NPK
              </label>
              <input
                type="text"
                value={formData.fertilizer_npk}
                onChange={(e) => setFormData(prev => ({ ...prev, fertilizer_npk: e.target.value }))}
                placeholder="e.g., 20-20-20"
                className="glass-input w-full px-4 py-3 rounded-2xl"
                style={{ color: "var(--text-primary)" }}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: (currentTheme === 'light' || currentTheme === 'minimal') ? 'var(--text-primary)' : "#F5F3FF" }}>
                Fertilizer Method
              </label>
              <input
                type="text"
                value={formData.fertilizer_method}
                onChange={(e) => setFormData(prev => ({ ...prev, fertilizer_method: e.target.value }))}
                placeholder="e.g., Top watering, Wick"
                className="glass-input w-full px-4 py-3 rounded-2xl"
                style={{ color: "var(--text-primary)" }}
              />
            </div>
          </div>
        </div>

        {/* Collections Section */}
        <div className="glass-card rounded-3xl p-6">
          <h3 className="text-lg font-bold mb-4" style={{ 
            color: "var(--text-primary)",
            textShadow: "0 1px 3px rgba(32, 24, 51, 0.4)",
            fontFamily: "'Playfair Display', Georgia, serif"
          }}>
            Collections
          </h3>
          <CollectionSelector
            plantId={null}
            selectedCollections={selectedCollections}
            onChange={setSelectedCollections}
          />
        </div>

        {/* Notes */}
        <div className="glass-card rounded-3xl p-6">
          <label className="block text-sm font-semibold mb-2" style={{ color: (currentTheme === 'light' || currentTheme === 'minimal') ? 'var(--text-primary)' : "#F5F3FF" }}>
            Notes
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            placeholder="Any special observations or care notes..."
            rows={3}
            className="glass-input w-full px-4 py-3 rounded-2xl resize-none"
            style={{ color: "var(--text-primary)" }}
          />
        </div>

        {/* Submit Button */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => navigate(createPageUrl("Collection"))}
            className="glass-button px-8 py-4 rounded-2xl font-semibold"
            style={{ color: "var(--text-secondary)" }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={createMutation.isPending}
            className="glass-accent-moss flex-1 px-8 py-4 rounded-2xl font-semibold disabled:opacity-50"
            style={{ color: (currentTheme === 'light' || currentTheme === 'minimal') ? "#FFFFFF" : "#A7F3D0" }}
          >
            {createMutation.isPending ? "Adding..." : "Add to Collection"}
          </button>
        </div>
      </form>

      {showLocationManager && (
        <LocationManager onClose={() => setShowLocationManager(false)} />
      )}
    </div>
  );
}
