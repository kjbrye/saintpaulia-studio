import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Upload, Loader2, Plus, X, Calendar } from "lucide-react";
import { createPageUrl } from "@/utils";
import DatePicker from "../components/ui/DatePicker";
import { toast } from "sonner";

const LOGO_URL = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/690e3cd78523fb5fba0a8466/632f6e485_PlantLogos.png";

const COMMON_TRAITS = [
  "Double blooms",
  "Variegated foliage",
  "Compact growth",
  "Large flowers",
  "Ruffled petals",
  "Chimera pattern",
  "Picotee edge",
  "Star pattern",
  "Prolific blooming",
  "Unusual color",
  "Award winner"
];

export default function EditWishlistItem() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const itemId = urlParams.get('id');
  const [uploading, setUploading] = useState(false);
  const [customTrait, setCustomTrait] = useState("");
  const [customSource, setCustomSource] = useState("");

  const { data: item, isLoading } = useQuery({
    queryKey: ['wishlistItem', itemId],
    queryFn: () => base44.entities.Wishlist.filter({ id: itemId }).then(items => items[0]),
    enabled: !!itemId
  });

  const [formData, setFormData] = useState({
    cultivar_name: "",
    hybridizer: "",
    priority: "medium",
    desired_traits: [],
    blossom_type: "",
    blossom_color: "",
    leaf_type: "",
    photo_url: "",
    price_range: "",
    sources: [],
    notes: "",
    date_added: ""
  });

  useEffect(() => {
    if (item) {
      setFormData({
        cultivar_name: item.cultivar_name || "",
        hybridizer: item.hybridizer || "",
        priority: item.priority || "medium",
        desired_traits: item.desired_traits || [],
        blossom_type: item.blossom_type || "",
        blossom_color: item.blossom_color || "",
        leaf_type: item.leaf_type || "",
        photo_url: item.photo_url || "",
        price_range: item.price_range || "",
        sources: item.sources || [],
        notes: item.notes || "",
        date_added: item.date_added || new Date().toISOString().split('T')[0],
        desired_purchase_date: item.desired_purchase_date || "",
        acquired: item.acquired || false,
        acquired_date: item.acquired_date || "",
        acquired_plant_id: item.acquired_plant_id || ""
      });
    }
  }, [item]);

  const updateMutation = useMutation({
    mutationFn: (data) => base44.entities.Wishlist.update(itemId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      queryClient.invalidateQueries({ queryKey: ['wishlistItem', itemId] });
      toast.success("Wishlist item updated!", {
        description: "Your changes have been saved."
      });
      setTimeout(() => {
        navigate(createPageUrl("Wishlist"));
      }, 500);
    },
    onError: (error) => {
      toast.error("Failed to update item", {
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

  const toggleTrait = (trait) => {
    setFormData(prev => ({
      ...prev,
      desired_traits: prev.desired_traits.includes(trait)
        ? prev.desired_traits.filter(t => t !== trait)
        : [...prev.desired_traits, trait]
    }));
  };

  const addCustomTrait = () => {
    if (customTrait.trim() && !formData.desired_traits.includes(customTrait.trim())) {
      setFormData(prev => ({
        ...prev,
        desired_traits: [...prev.desired_traits, customTrait.trim()]
      }));
      setCustomTrait("");
    }
  };

  const removeTrait = (trait) => {
    setFormData(prev => ({
      ...prev,
      desired_traits: prev.desired_traits.filter(t => t !== trait)
    }));
  };

  const addSource = () => {
    if (customSource.trim() && !formData.sources.includes(customSource.trim())) {
      setFormData(prev => ({
        ...prev,
        sources: [...prev.sources, customSource.trim()]
      }));
      setCustomSource("");
    }
  };

  const removeSource = (source) => {
    setFormData(prev => ({
      ...prev,
      sources: prev.sources.filter(s => s !== source)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateMutation.mutate(formData);
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
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate(createPageUrl("Wishlist"))}
          className="glass-button w-12 h-12 rounded-2xl flex items-center justify-center"
          style={{ color: "#E3C9FF" }}
        >
          <ArrowLeft className="w-5 h-5" style={{ strokeWidth: 2 }} />
        </button>
        <div>
          <h1 className="text-3xl font-bold" style={{ 
            color: "#F5F3FF",
            textShadow: "0 2px 4px rgba(32, 24, 51, 0.4)",
            fontFamily: "'Playfair Display', Georgia, serif"
          }}>
            Edit Wishlist Item
          </h1>
          <p style={{ color: "#DDD6FE" }}>Update {item?.cultivar_name}</p>
        </div>
      </div>

      {/* Form - same structure as AddWishlistItem */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Photo Upload */}
        <div className="glass-card rounded-3xl p-6">
          <label className="block text-sm font-semibold mb-3" style={{ color: "#F5F3FF" }}>Reference Photo</label>
          <div className="flex items-start gap-4 flex-col sm:flex-row">
            <div className="glass-card rounded-2xl overflow-hidden w-32 h-32 flex-shrink-0"
              style={{
                boxShadow: "inset 0 2px 8px rgba(32, 24, 51, 0.4)"
              }}>
              {formData.photo_url ? (
                <img 
                  src={formData.photo_url} 
                  alt="Preview"
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
                className="glass-button inline-flex items-center gap-2 px-6 py-3 rounded-2xl font-medium cursor:pointer hover:opacity-90 transition-opacity"
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
                    Change Photo
                  </>
                )}
              </label>
            </div>
          </div>
        </div>

        {/* Basic Info */}
        <div className="glass-card rounded-3xl p-6 space-y-4">
          <h3 className="text-lg font-bold mb-4" style={{ 
            color: "#F5F3FF",
            textShadow: "0 1px 3px rgba(32, 24, 51, 0.4)",
            fontFamily: "'Playfair Display', Georgia, serif"
          }}>
            Basic Information
          </h3>

          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: "#F5F3FF" }}>
              Cultivar/Variety Name *
            </label>
            <input
              type="text"
              required
              value={formData.cultivar_name}
              onChange={(e) => setFormData(prev => ({ ...prev, cultivar_name: e.target.value }))}
              placeholder="e.g., Midnight Rose"
              className="glass-input w-full px-4 py-3 rounded-2xl"
              style={{ color: "#F5F3FF" }}
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: "#F5F3FF" }}>
                Hybridizer
              </label>
              <input
                type="text"
                value={formData.hybridizer}
                onChange={(e) => setFormData(prev => ({ ...prev, hybridizer: e.target.value }))}
                placeholder="e.g., Lyndon Lyon"
                className="glass-input w-full px-4 py-3 rounded-2xl"
                style={{ color: "#F5F3FF" }}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: "#F5F3FF" }}>
                Priority *
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                className="glass-input w-full px-4 py-3 rounded-2xl"
                style={{ color: "#F5F3FF" }}
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
                <option value="urgent">Urgent Priority</option>
              </select>
            </div>
          </div>
        </div>

        {/* Desired Characteristics - same as AddWishlistItem */}
        <div className="glass-card rounded-3xl p-6 space-y-4">
          <h3 className="text-lg font-bold mb-4" style={{ 
            color: "#F5F3FF",
            textShadow: "0 1px 3px rgba(32, 24, 51, 0.4)",
            fontFamily: "'Playfair Display', Georgia, serif"
          }}>
            Desired Characteristics
          </h3>

          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: "#F5F3FF" }}>
                Blossom Type
              </label>
              <select
                value={formData.blossom_type}
                onChange={(e) => setFormData(prev => ({ ...prev, blossom_type: e.target.value }))}
                className="glass-input w-full px-4 py-3 rounded-2xl"
                style={{ color: "#F5F3FF" }}
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
              <label className="block text-sm font-semibold mb-2" style={{ color: "#F5F3FF" }}>
                Blossom Color
              </label>
              <input
                type="text"
                value={formData.blossom_color}
                onChange={(e) => setFormData(prev => ({ ...prev, blossom_color: e.target.value }))}
                placeholder="e.g., Deep Purple"
                className="glass-input w-full px-4 py-3 rounded-2xl"
                style={{ color: "#F5F3FF" }}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: "#F5F3FF" }}>
                Leaf Type
              </label>
              <input
                type="text"
                value={formData.leaf_type}
                onChange={(e) => setFormData(prev => ({ ...prev, leaf_type: e.target.value }))}
                placeholder="e.g., Variegated"
                className="glass-input w-full px-4 py-3 rounded-2xl"
                style={{ color: "#F5F3FF" }}
              />
            </div>
          </div>

          {/* Desired Traits */}
          <div>
            <label className="block text-sm font-semibold mb-3" style={{ color: "#F5F3FF" }}>
              Desired Traits
            </label>
            
            {formData.desired_traits.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {formData.desired_traits.map(trait => (
                  <button
                    key={trait}
                    type="button"
                    onClick={() => removeTrait(trait)}
                    className="glass-accent-moss px-3 py-1.5 rounded-xl text-sm font-medium flex items-center gap-1.5 hover:opacity-80 transition-opacity"
                    style={{ color: "#A7F3D0" }}
                  >
                    {trait}
                    <X className="w-3 h-3" />
                  </button>
                ))}
              </div>
            )}

            <p className="text-sm font-semibold mb-2" style={{ color: "#DDD6FE" }}>Common Traits:</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3">
              {COMMON_TRAITS.map(trait => (
                <button
                  key={trait}
                  type="button"
                  onClick={() => toggleTrait(trait)}
                  className={`px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                    formData.desired_traits.includes(trait) ? "glass-accent-lavender" : "glass-button"
                  }`}
                  style={{ color: formData.desired_traits.includes(trait) ? "#F0EBFF" : "#DDD6FE" }}
                >
                  {trait}
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={customTrait}
                onChange={(e) => setCustomTrait(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomTrait())}
                placeholder="Add custom trait..."
                className="glass-input flex-1 px-4 py-2 rounded-2xl text-sm"
                style={{ color: "#F5F3FF" }}
              />
              <button
                type="button"
                onClick={addCustomTrait}
                className="glass-button px-4 py-2 rounded-2xl flex items-center gap-2"
                style={{ color: "#DDD6FE" }}
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Purchase Planning */}
        <div className="glass-card rounded-3xl p-6 space-y-4">
          <h3 className="text-lg font-bold flex items-center gap-2" style={{ 
            color: "#F5F3FF",
            fontFamily: "'Playfair Display', Georgia, serif"
          }}>
            <Calendar className="w-5 h-5" style={{ color: "#C4B5FD" }} />
            Purchase Planning
          </h3>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: "#F5F3FF" }}>
                Price Range
              </label>
              <input
                type="text"
                value={formData.price_range}
                onChange={(e) => setFormData(prev => ({ ...prev, price_range: e.target.value }))}
                placeholder="e.g., $15-25"
                className="glass-input w-full px-4 py-3 rounded-2xl"
                style={{ color: "#F5F3FF" }}
              />
            </div>

            <div>
              <DatePicker
                label="Target Purchase Date"
                value={formData.desired_purchase_date}
                onChange={(date) => setFormData(prev => ({ ...prev, desired_purchase_date: date }))}
                placeholder="Select date (optional)"
                minDate={new Date().toISOString().split('T')[0]}
              />
              <p className="text-xs mt-1" style={{ color: "#DDD6FE", opacity: 0.7 }}>
                Optional: Set a goal date for purchasing this plant
              </p>
            </div>
          </div>
        </div>

        {/* Potential Sources - Extracted from old 'Sources & Budget' and made its own section */}
        <div className="glass-card rounded-3xl p-6 space-y-4">
          <h3 className="text-lg font-bold mb-4" style={{ 
            color: "#F5F3FF",
            textShadow: "0 1px 3px rgba(32, 24, 51, 0.4)",
            fontFamily: "'Playfair Display', Georgia, serif"
          }}>
            Potential Sources
          </h3>
          <div>
            <label className="block text-sm font-semibold mb-3" style={{ color: "#F5F3FF" }}>
              Potential Sources
            </label>
            
            {formData.sources.length > 0 && (
              <div className="space-y-2 mb-3">
                {formData.sources.map((source, idx) => (
                  <div
                    key={idx}
                    className="glass-button rounded-2xl p-3 flex items-center justify-between"
                  >
                    <span className="text-sm flex-1 min-w-0 truncate" style={{ color: "#F5F3FF" }}>
                      {source}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeSource(source)}
                      className="ml-2 w-6 h-6 rounded-lg flex items-center justify-center hover:opacity-80"
                      style={{ color: "#FCA5A5" }}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-2">
              <input
                type="text"
                value={customSource}
                onChange={(e) => setCustomSource(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSource())}
                placeholder="Add vendor name, website, or link..."
                className="glass-input flex-1 px-4 py-3 rounded-2xl"
                style={{ color: "#F5F3FF" }}
              />
              <button
                type="button"
                onClick={addSource}
                className="glass-button px-4 py-3 rounded-2xl flex items-center gap-2"
                style={{ color: "#DDD6FE" }}
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>


        {/* Notes */}
        <div className="glass-card rounded-3xl p-6">
          <label className="block text-sm font-semibold mb-2" style={{ color: "#F5F3FF" }}>
            Notes
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            placeholder="Why do you want this plant? Any special observations or requirements..."
            rows={4}
            className="glass-input w-full px-4 py-3 rounded-2xl resize-none"
            style={{ color: "#F5F3FF" }}
          />
        </div>

        {/* Submit Buttons */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => navigate(createPageUrl("Wishlist"))}
            className="glass-button px-8 py-4 rounded-2xl font-semibold"
            style={{ color: "#DDD6FE" }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={updateMutation.isPending}
            className="glass-accent-moss flex-1 px-8 py-4 rounded-2xl font-semibold disabled:opacity-50"
            style={{ color: "#A7F3D0" }}
          >
            {updateMutation.isPending ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  </div>
  );
}