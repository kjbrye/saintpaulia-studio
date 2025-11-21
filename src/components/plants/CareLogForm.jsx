import React, { useState } from "react";
import ReactDOM from "react-dom";
import { ArrowLeft, Plus, Loader2, AlertTriangle, Package, X, Upload } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import DateTimePicker from "../ui/DateTimePicker";

export default function CareLogForm({ plantId, plant, careType, onClose }) {
  const queryClient = useQueryClient();
  
  // Format current date and time for datetime-local input
  const now = new Date();
  const defaultDateTime = format(now, "yyyy-MM-dd'T'HH:mm");

  const { data: supplies = [] } = useQuery({
    queryKey: ['supplies'],
    queryFn: () => base44.entities.Supply.list(),
    initialData: []
  });

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me().catch(() => null),
  });

  const currentTheme = currentUser?.theme || "glassmorphism";

  const [formData, setFormData] = useState({
    care_type: careType || "watering",
    care_date: defaultDateTime,
    watering_method: "",
    fertilizer_type: "",
    new_pot_size: plant?.pot_size || "",
    new_soil_mix: plant?.soil_mix || "",
    notes: "",
    photos: [],
    supplies_used: []
  });

  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const createMutation = useMutation({
    mutationFn: async (careData) => {
      const user = currentUser ?? await base44.auth.me();
      if (!user?.id || !user?.email) {
        throw new Error("You must be signed in to log care.");
      }

      // Create care log
      const handleCreateCareLog = async () => {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error("User not logged in.");
    return;
  }

  const { data, error } = await supabase
    .from('care_log')
    .insert({
      user_id: user.id,       // <-- MUST MATCH YOUR RLS POLICY
      plant_id: plantId,      // <-- Value from your UI
      date_observed,          // <-- Form state variable
      care_type,              // <-- Form field
      notes,                  // <-- Form field
    })
    .select()
    .maybeSingle();

  if (error) {
    console.error("Failed to insert care log:", error);
  } else {
    console.log("Care log created:", data);
  }
};

      // Update plant's last care date
      const updateData = {};
      if (careData.care_type === "watering") {
        updateData.last_watered = careData.care_date.split('T')[0];
      } else if (careData.care_type === "fertilizing") {
        updateData.last_fertilized = careData.care_date.split('T')[0];
      } else if (careData.care_type === "repotting") {
        updateData.last_repotted = careData.care_date.split('T')[0];
        if (careData.new_pot_size) updateData.pot_size = careData.new_pot_size;
        if (careData.new_soil_mix) updateData.soil_mix = careData.new_soil_mix;
      } else if (careData.care_type === "grooming") {
        updateData.last_groomed = careData.care_date.split('T')[0];
      }

      await base44.entities.Plant.update(plantId, updateData);

      // Log supply usage and update quantities
      if (careData.supplies_used && careData.supplies_used.length > 0) {
        await Promise.all(
          careData.supplies_used.map(async ({ supply_id, quantity_used }) => {
            const supply = supplies.find(s => s.id === supply_id);
            if (!supply) return;

            // Create usage log
            await base44.entities.SupplyUsageLog.create({
              supply_id: supply_id,
              quantity_used: parseFloat(quantity_used),
              usage_date: new Date(careData.care_date).toISOString(),
              plant_id: plantId,
              purpose: `${careData.care_type} - ${plant?.cultivar_name || 'Plant'}`,
              notes: careData.notes || undefined
            });

            // Update supply quantity
            const newQuantity = Math.max(0, supply.quantity - parseFloat(quantity_used));
            await base44.entities.Supply.update(supply_id, {
              quantity: newQuantity
            });
          })
        );
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['careLogs', plantId] });
      queryClient.invalidateQueries({ queryKey: ['plant', plantId] });
      queryClient.invalidateQueries({ queryKey: ['plants'] });
      queryClient.invalidateQueries({ queryKey: ['supplies'] });
      queryClient.invalidateQueries({ queryKey: ['supplyUsage'] });
      queryClient.invalidateQueries({ queryKey: ['allSupplyUsage'] });
      onClose();
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Clean data - remove empty fields based on care type
    const cleanedData = {
      care_type: formData.care_type,
      care_date: formData.care_date,
      notes: formData.notes || undefined,
      photos: formData.photos,
      supplies_used: formData.supplies_used.filter(s => s.quantity_used > 0)
    };

    if (formData.care_type === "watering" && formData.watering_method) {
      cleanedData.watering_method = formData.watering_method;
    }

    if (formData.care_type === "fertilizing" && formData.fertilizer_type) {
      cleanedData.fertilizer_type = formData.fertilizer_type;
    }

    if (formData.care_type === "repotting") {
      if (formData.new_pot_size) cleanedData.new_pot_size = Number(formData.new_pot_size);
      if (formData.new_soil_mix) cleanedData.new_soil_mix = formData.new_soil_mix;
    }

    createMutation.mutate(cleanedData);
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingPhoto(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData(prev => ({
        ...prev,
        photos: [...prev.photos, file_url]
      }));
    } catch {
      alert("Failed to upload photo. Please try again.");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const removePhoto = (index) => {
    setFormData(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index)
    }));
  };

  const getPotSizeWarning = () => {
    if (!formData.new_pot_size || !plant?.pot_size) return null;
    const newSize = parseFloat(formData.new_pot_size);
    const oldSize = parseFloat(plant.pot_size);
    if (newSize < oldSize) return "New pot size is smaller than current size";
    if (newSize > oldSize + 2) return "Pot size increase is quite large - make sure this is correct";
    return null;
  };

  const addSupplyUsage = () => {
    setFormData(prev => ({
      ...prev,
      supplies_used: [...prev.supplies_used, { supply_id: "", quantity_used: "" }]
    }));
  };

  const removeSupplyUsage = (index) => {
    setFormData(prev => ({
      ...prev,
      supplies_used: prev.supplies_used.filter((_, i) => i !== index)
    }));
  };

  const updateSupplyUsage = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      supplies_used: prev.supplies_used.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const potSizeWarning = getPotSizeWarning();

  // Filter supplies based on care type
  const relevantSupplies = supplies.filter(supply => {
    if (formData.care_type === "watering") return supply.category === "supplement" || supply.category === "fertilizer";
    if (formData.care_type === "fertilizing") return supply.category === "fertilizer";
    if (formData.care_type === "repotting") return supply.category === "soil" || supply.category === "pot";
    if (formData.care_type === "grooming") return supply.category === "tool" || supply.category === "pesticide";
    return true;
  });

  const modalContent = (
    <div style={{ 
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 99999,
        background: 'linear-gradient(135deg, #201833 0%, #3C2E5A 50%, #4F3F73 100%)',
        overflowY: 'auto'
      }}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            type="button"
            onClick={onClose}
            className="glass-button w-12 h-12 rounded-2xl flex items-center justify-center"
            style={{ color: (currentTheme === 'light' || currentTheme === 'minimal') ? "#7C3AED" : "#E3C9FF" }}
          >
            <ArrowLeft className="w-5 h-5" style={{ strokeWidth: 2 }} />
          </button>
          <div>
            <h1 className="text-3xl font-bold" style={{ 
              color: (currentTheme === 'light' || currentTheme === 'minimal') ? 'var(--text-primary)' : "#F5F3FF",
              textShadow: "0 2px 4px rgba(32, 24, 51, 0.4)",
              fontFamily: "'Playfair Display', Georgia, serif"
            }}>
              Log Care Action
            </h1>
            <p style={{ color: (currentTheme === 'light' || currentTheme === 'minimal') ? 'var(--text-secondary)' : "#DDD6FE" }}>
              Record care for {plant?.nickname || plant?.cultivar_name || 'your plant'}
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Care Type & Date/Time */}
          <div className="glass-card rounded-3xl p-6 space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: (currentTheme === 'light' || currentTheme === 'minimal') ? 'var(--text-primary)' : "#F5F3FF" }}>
                Care Type *
              </label>
              <select
                value={formData.care_type}
                onChange={(e) => setFormData(prev => ({ ...prev, care_type: e.target.value }))}
                className="glass-input w-full px-4 py-3 rounded-2xl"
                style={{ color: (currentTheme === 'light' || currentTheme === 'minimal') ? 'var(--text-primary)' : "#F5F3FF" }}
              >
                <option value="watering">Watering</option>
                <option value="fertilizing">Fertilizing</option>
                <option value="repotting">Repotting</option>
                <option value="grooming">Grooming</option>
              </select>
            </div>

            <DateTimePicker
              label="Date & Time"
              value={formData.care_date}
              onChange={(datetime) => setFormData(prev => ({ ...prev, care_date: datetime }))}
              placeholder="Select date and time"
              required
            />
            </div>

            {/* Conditional Fields Based on Care Type */}
            {formData.care_type === "watering" && (
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: (currentTheme === 'light' || currentTheme === 'minimal') ? 'var(--text-primary)' : "#F5F3FF" }}>
                Watering Method
              </label>
              <select
                value={formData.watering_method}
                onChange={(e) => setFormData(prev => ({ ...prev, watering_method: e.target.value }))}
                className="glass-input w-full px-4 py-3 rounded-2xl"
                style={{ color: (currentTheme === 'light' || currentTheme === 'minimal') ? 'var(--text-primary)' : "#F5F3FF" }}
              >
                <option value="">Select method...</option>
                <option value="top">Top Watering</option>
                <option value="bottom">Bottom Watering</option>
                <option value="wick">Wick Watering</option>
                <option value="self-watering">Self-Watering Pot</option>
                <option value="mist">Misting</option>
              </select>
            </div>
          )}

          {formData.care_type === "fertilizing" && (
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: (currentTheme === 'light' || currentTheme === 'minimal') ? 'var(--text-primary)' : "#F5F3FF" }}>
                Fertilizer Type / NPK
              </label>
              <input
                type="text"
                value={formData.fertilizer_type}
                onChange={(e) => setFormData(prev => ({ ...prev, fertilizer_type: e.target.value }))}
                placeholder="e.g., 20-20-20, Jack's Classic"
                className="glass-input w-full px-4 py-3 rounded-2xl"
                style={{ color: (currentTheme === 'light' || currentTheme === 'minimal') ? 'var(--text-primary)' : "#F5F3FF" }}
              />
            </div>
          )}

          {formData.care_type === "repotting" && (
            <>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: (currentTheme === 'light' || currentTheme === 'minimal') ? 'var(--text-primary)' : "#F5F3FF" }}>
                    New Pot Size (inches)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={formData.new_pot_size}
                    onChange={(e) => setFormData(prev => ({ ...prev, new_pot_size: e.target.value }))}
                    placeholder={plant?.pot_size ? `Current: ${plant.pot_size}"` : "e.g., 4"}
                    className="glass-input w-full px-4 py-3 rounded-2xl"
                    style={{ color: (currentTheme === 'light' || currentTheme === 'minimal') ? 'var(--text-primary)' : "#F5F3FF" }}
                  />
                  {potSizeWarning && (
                    <div className="flex items-center gap-2 mt-2 text-xs" style={{ color: "#FCD34D" }}>
                      <AlertTriangle className="w-4 h-4" />
                      {potSizeWarning}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: (currentTheme === 'light' || currentTheme === 'minimal') ? 'var(--text-primary)' : "#F5F3FF" }}>
                    New Soil Mix
                  </label>
                  <input
                    type="text"
                    value={formData.new_soil_mix}
                    onChange={(e) => setFormData(prev => ({ ...prev, new_soil_mix: e.target.value }))}
                    placeholder={plant?.soil_mix || "e.g., Peat/Perlite mix"}
                    className="glass-input w-full px-4 py-3 rounded-2xl"
                    style={{ color: (currentTheme === 'light' || currentTheme === 'minimal') ? 'var(--text-primary)' : "#F5F3FF" }}
                  />
                </div>
              </div>
            </>
          )}
          </div>

          {/* Photos */}
          <div className="glass-card rounded-3xl p-6">
            <label className="block text-sm font-semibold mb-3" style={{ color: (currentTheme === 'light' || currentTheme === 'minimal') ? 'var(--text-primary)' : "#F5F3FF" }}>
              Photos (optional)
            </label>
            
            <div className="flex flex-wrap gap-3 mb-3">
              {formData.photos.map((photo, index) => (
                <div key={index} className="relative group">
                  <img
                    src={photo}
                    alt={`Care photo ${index + 1}`}
                    className="w-24 h-24 object-cover rounded-2xl glass-card"
                  />
                  <button
                    type="button"
                    onClick={() => removePhoto(index)}
                    className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{
                      background: "linear-gradient(135deg, rgba(239, 68, 68, 0.9) 0%, rgba(220, 38, 38, 0.9) 100%)",
                      border: "1px solid rgba(255, 255, 255, 0.3)"
                    }}
                  >
                    <X className="w-4 h-4" style={{ color: "#FFF" }} />
                  </button>
                </div>
              ))}
              
              <label className="w-24 h-24 rounded-2xl glass-button flex flex-col items-center justify-center cursor-pointer hover:opacity-80 transition-opacity">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                  disabled={uploadingPhoto}
                />
                {uploadingPhoto ? (
                  <Loader2 className="w-6 h-6 animate-spin" style={{ color: "#C4B5FD" }} />
                ) : (
                  <>
                    <Upload className="w-6 h-6 mb-1" style={{ color: "#C4B5FD" }} />
                    <span className="text-xs" style={{ color: "var(--text-secondary)" }}>Add Photo</span>
                  </>
                )}
              </label>
            </div>
            <p className="text-xs" style={{ color: (currentTheme === 'light' || currentTheme === 'minimal') ? 'var(--text-secondary)' : "#DDD6FE", opacity: 0.7 }}>
              Document plant condition or care details with photos
            </p>
          </div>

          {/* Supplies Used Section */}
          {relevantSupplies.length > 0 && (
            <div className="glass-card rounded-3xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold flex items-center gap-2" style={{ color: (currentTheme === 'light' || currentTheme === 'minimal') ? 'var(--text-primary)' : "#F5F3FF" }}>
                    <Package className="w-4 h-4" style={{ color: "#C4B5FD" }} />
                    Supplies Used (optional)
                  </h3>
                  <p className="text-xs mt-1" style={{ color: (currentTheme === 'light' || currentTheme === 'minimal') ? 'var(--text-secondary)' : "#DDD6FE", opacity: 0.8 }}>
                    Track which supplies you used for this care action
                  </p>
                </div>
                <button
                  type="button"
                  onClick={addSupplyUsage}
                  className="glass-button px-3 py-2 rounded-xl text-sm font-semibold flex items-center gap-1"
                  style={{ color: (currentTheme === 'light' || currentTheme === 'minimal') ? 'var(--text-secondary)' : "#DDD6FE" }}
                >
                  <Plus className="w-4 h-4" />
                  Add
                </button>
              </div>

              {formData.supplies_used.length === 0 ? (
                <p className="text-xs text-center py-3" style={{ color: (currentTheme === 'light' || currentTheme === 'minimal') ? 'var(--text-secondary)' : "#DDD6FE", opacity: 0.7 }}>
                  No supplies tracked for this action
                </p>
              ) : (
                <div className="space-y-3">
                  {formData.supplies_used.map((supplyUsage, index) => {
                    const selectedSupply = supplies.find(s => s.id === supplyUsage.supply_id);
                    return (
                      <div key={index} className="glass-button rounded-xl p-3 flex items-center gap-3">
                        <select
                          value={supplyUsage.supply_id}
                          onChange={(e) => updateSupplyUsage(index, 'supply_id', e.target.value)}
                          className="glass-input flex-1 px-3 py-2 rounded-xl text-sm"
                          style={{ color: (currentTheme === 'light' || currentTheme === 'minimal') ? 'var(--text-primary)' : "#F5F3FF" }}
                        >
                          <option value="">Select supply...</option>
                          {relevantSupplies.map(supply => (
                            <option key={supply.id} value={supply.id}>
                              {supply.name} ({supply.quantity} {supply.unit} available)
                            </option>
                          ))}
                        </select>
                        <input
                          type="number"
                          step="0.1"
                          min="0.1"
                          max={selectedSupply?.quantity || 999}
                          value={supplyUsage.quantity_used}
                          onChange={(e) => updateSupplyUsage(index, 'quantity_used', e.target.value)}
                          placeholder="Qty"
                          className="glass-input w-24 px-3 py-2 rounded-xl text-sm"
                          style={{ color: (currentTheme === 'light' || currentTheme === 'minimal') ? 'var(--text-primary)' : "#F5F3FF" }}
                        />
                        {selectedSupply && (
                          <span className="text-xs font-medium" style={{ color: (currentTheme === 'light' || currentTheme === 'minimal') ? 'var(--text-secondary)' : "#DDD6FE" }}>
                            {selectedSupply.unit}
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => removeSupplyUsage(index)}
                          className="glass-button w-8 h-8 rounded-lg flex items-center justify-center"
                          style={{ color: "#FCA5A5" }}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Notes */}
          <div className="glass-card rounded-3xl p-6">
            <label className="block text-sm font-semibold mb-2" style={{ color: (currentTheme === 'light' || currentTheme === 'minimal') ? 'var(--text-primary)' : "#F5F3FF" }}>
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Add any observations or details..."
              rows={3}
              className="glass-input w-full px-4 py-3 rounded-2xl resize-none"
              style={{ color: (currentTheme === 'light' || currentTheme === 'minimal') ? 'var(--text-primary)' : "#F5F3FF" }}
            />
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="glass-button px-8 py-4 rounded-2xl font-semibold"
              style={{ color: (currentTheme === 'light' || currentTheme === 'minimal') ? 'var(--text-secondary)' : "#DDD6FE" }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="glass-accent-moss flex-1 px-8 py-4 rounded-2xl font-semibold disabled:opacity-50"
              style={{ color: (currentTheme === 'light' || currentTheme === 'minimal') ? "#FFFFFF" : "#A7F3D0" }}
            >
              {createMutation.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 inline mr-2 animate-spin" />
                  Logging...
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5 inline mr-2" />
                  Log Care Action
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return typeof document !== 'undefined' 
    ? ReactDOM.createPortal(modalContent, document.body)
    : null;
}
