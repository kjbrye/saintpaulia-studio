
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Upload, Loader2, AlertTriangle, MapPin } from "lucide-react";
import { createPageUrl } from "@/utils";
import CollectionSelector from "../components/collections/CollectionSelector";
import LocationManager from "../components/locations/LocationManager";
import DatePicker from "../components/ui/DatePicker";
import { toast } from "sonner";

const LOGO_URL = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/690e3cd78523fb5fba0a8466/632f6e485_PlantLogos.png";

export default function EditPlant() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const plantId = urlParams.get('id');
  const [uploading, setUploading] = useState(false);
  const [selectedCollections, setSelectedCollections] = useState([]);
  const [showLocationManager, setShowLocationManager] = useState(false);

  const { data: plant, isLoading } = useQuery({
    queryKey: ['plant', plantId],
    queryFn: () => base44.entities.Plant.filter({ id: plantId }).then(plants => plants[0]),
    enabled: !!plantId
  });

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

  const [formData, setFormData] = useState({
    cultivar_name: "",
    nickname: "",
    avsa_number: "",
    hybridizer: "",
    year: "",
    blossom_type: "",
    blossom_color: "",
    leaf_types: [], // Changed from leaf_type: "standard" to leaf_types: []
    variegation: "",
    acquisition_date: "",
    source: "",
    photo_url: "",
    location_id: "",
    pot_size: "",
    soil_mix: "",
    watering_interval: "",
    fertilizer_interval: "",
    fertilizer_npk: "",
    fertilizer_method: "",
    notes: ""
  });

  useEffect(() => {
    if (plant) {
      setFormData({
        cultivar_name: plant.cultivar_name || "",
        nickname: plant.nickname || "",
        avsa_number: plant.avsa_number || "",
        hybridizer: plant.hybridizer || "",
        year: plant.year || "",
        blossom_type: plant.blossom_type || "",
        blossom_color: plant.blossom_color || "",
        leaf_types: plant.leaf_types || [], // Changed from plant.leaf_type || "standard" to plant.leaf_types || []
        variegation: plant.variegation || "",
        acquisition_date: plant.acquisition_date || "",
        source: plant.source || "",
        photo_url: plant.photo_url || "",
        location_id: plant.location_id || "",
        pot_size: plant.pot_size || "",
        soil_mix: plant.soil_mix || "",
        watering_interval: plant.watering_interval || "",
        fertilizer_interval: plant.fertilizer_interval || "",
        fertilizer_npk: plant.fertilizer_npk || "",
        fertilizer_method: plant.fertilizer_method || "",
        notes: plant.notes || ""
      });
      
      // Set selected collections based on which collections contain this plant
      const plantCollectionIds = collections
        .filter(c => c.plant_ids && c.plant_ids.includes(plantId))
        .map(c => c.id);
      setSelectedCollections(plantCollectionIds);
    }
  }, [plant, collections, plantId]);

  const updateMutation = useMutation({
    mutationFn: async (plantData) => {
      // Update the plant
      await base44.entities.Plant.update(plantId, plantData);
      
      // Update collections
      // Remove plant from collections it's no longer in
      const removedCollections = collections.filter(c => 
        c.plant_ids && c.plant_ids.includes(plantId) && !selectedCollections.includes(c.id)
      );
      
      // Add plant to new collections
      const addedCollections = collections.filter(c => 
        selectedCollections.includes(c.id) && (!c.plant_ids || !c.plant_ids.includes(plantId))
      );
      
      await Promise.all([
        ...removedCollections.map(c => 
          base44.entities.PlantCollection.update(c.id, {
            plant_ids: c.plant_ids.filter(id => id !== plantId)
          })
        ),
        ...addedCollections.map(c =>
          base44.entities.PlantCollection.update(c.id, {
            plant_ids: [...(c.plant_ids || []), plantId]
          })
        )
      ]);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plants'] });
      queryClient.invalidateQueries({ queryKey: ['plant', plantId] });
      queryClient.invalidateQueries({ queryKey: ['plantCollections'] });
      queryClient.invalidateQueries({ queryKey: ['locations'] }); // Invalidate locations to ensure freshest data if any were managed
      toast.success("Plant updated!", {
        description: "Your changes have been saved successfully."
      });
      setTimeout(() => {
        navigate(createPageUrl(`PlantDetail?id=${plantId}`));
      }, 500);
    },
    onError: (error) => {
      toast.error("Failed to update plant", {
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

  const getWateringWarning = () => {
    const interval = parseInt(formData.watering_interval);
    if (!interval) return null;
    if (interval === 0) return "Watering interval cannot be zero";
    if (interval > 21) return "Warning: Very long watering interval - check if this is correct";
    if (interval < 2) return "Warning: Very frequent watering - this may be too often";
    return null;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const cleanedData = Object.fromEntries(
      Object.entries(formData)
        .map(([key, value]) => [key, ["pot_size", "watering_interval", "fertilizer_interval"].includes(key) && value !== "" ? Number(value) : value])
    );
    updateMutation.mutate(cleanedData);
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
          onClick={() => navigate(createPageUrl(`PlantDetail?id=${plantId}`))}
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
            Edit Plant
          </h1>
          <p style={{ color: "var(--text-secondary)" }}>Update {plant?.cultivar_name}'s information</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Photo Upload */}
        <div className="glass-card rounded-3xl p-6">
          <label className="block text-sm font-semibold mb-3" style={{ color: "var(--text-primary)" }}>Plant Photo</label>
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
                  <Upload className="w-8 h-8" style={{ color: "var(--accent)", opacity: 0.5 }} />
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
                    Change Photo
                  </>
                )}
              </label>
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
            <label className="block text-sm font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
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
            <label className="block text-sm font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
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

          {/* New AVSA Number field */}
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
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
          {/* End new AVSA Number field */}

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
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
              <label className="block text-sm font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
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
              <label className="block text-sm font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
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
              <label className="block text-sm font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
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
            <label className="block text-sm font-semibold mb-3" style={{ color: "var(--text-primary)" }}>
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
                            color: formData.leaf_types.includes(option.value) ? "var(--text-primary)" : "var(--text-secondary)",
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
            <label className="block text-sm font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
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
              <label className="block text-sm font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
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
              <label className="block text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
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
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
                Pot Size (inches)
              </label>
              <input
                type="number"
                step="0.5"
                value={formData.pot_size}
                onChange={(e) => setFormData(prev => ({ ...prev, pot_size: e.target.value }))}
                placeholder="e.g., 3, 4.5"
                className="glass-input w-full px-4 py-3 rounded-2xl"
                style={{ color: "var(--text-primary)" }}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
                Soil Mix
              </label>
              <input
                type="text"
                value={formData.soil_mix}
                onChange={(e) => setFormData(prev => ({ ...prev, soil_mix: e.target.value }))}
                placeholder="e.g., Peat/Perlite mix"
                className="glass-input w-full px-4 py-3 rounded-2xl"
                style={{ color: "var(--text-primary)" }}
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
                Watering Interval (days)
              </label>
              <input
                type="number"
                value={formData.watering_interval}
                onChange={(e) => setFormData(prev => ({ ...prev, watering_interval: e.target.value }))}
                placeholder="e.g., 7"
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
              <label className="block text-sm font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
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
              <label className="block text-sm font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
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
              <label className="block text-sm font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
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
            plantId={plantId}
            selectedCollections={selectedCollections}
            onChange={setSelectedCollections}
          />
        </div>

        {/* Notes */}
        <div className="glass-card rounded-3xl p-6">
          <label className="block text-sm font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
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
            onClick={() => navigate(createPageUrl(`PlantDetail?id=${plantId}`))}
            className="glass-button px-8 py-4 rounded-2xl font-semibold"
            style={{ color: "var(--text-secondary)" }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={updateMutation.isPending}
            className="glass-accent-moss flex-1 px-8 py-4 rounded-2xl font-semibold disabled:opacity-50"
            style={{ color: "var(--accent-moss)" }}
          >
            {updateMutation.isPending ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>

      {showLocationManager && (
        <LocationManager onClose={() => setShowLocationManager(false)} />
      )}
    </div>
  );
}
