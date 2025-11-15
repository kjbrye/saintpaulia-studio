import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Upload, Loader2, Plus, X, Calendar } from "lucide-react";
import { createPageUrl } from "@/utils";
import DatePicker from "../components/ui/DatePicker";
import { toast } from "sonner";

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

export default function AddWishlistItem() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);
  const [customTrait, setCustomTrait] = useState("");
  const [customSource, setCustomSource] = useState("");

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
    date_added: new Date().toISOString().split('T')[0],
    desired_purchase_date: ""
  });

  const createMutation = useMutation({
    mutationFn: (wishlistData) => base44.entities.Wishlist.create(wishlistData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      toast.success("Added to wishlist!", {
        description: "Your desired plant has been saved."
      });
      setTimeout(() => {
        navigate(createPageUrl("Wishlist"));
      }, 500);
    },
    onError: (error) => {
      toast.error("Failed to add to wishlist", {
        description: error.message || "Please try again."
      });
    }
  });

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData(prev => ({ ...prev, photo_url: file_url }));
    } catch (error) {
      alert('Failed to upload image');
    } finally {
      setUploading(false);
    }
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
    if (customTrait.trim()) {
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
    if (customSource.trim()) {
      setFormData(prev => ({
        ...prev,
        sources: [...prev.sources, customSource.trim()]
      }));
      setCustomSource("");
    }
  };

  const removeSource = (index) => {
    setFormData(prev => ({
      ...prev,
      sources: prev.sources.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Clean up empty fields
    const cleanData = Object.fromEntries(
      Object.entries(formData).filter(([_, v]) => {
        if (Array.isArray(v)) return v.length > 0;
        return v !== "" && v !== null && v !== undefined;
      })
    );
    createMutation.mutate(cleanData);
  };

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
              Add to Wishlist
            </h1>
            <p style={{ color: "#DDD6FE" }}>Save plants you'd like to add to your collection</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Photo Upload */}
          <div className="glass-card rounded-3xl p-6">
            <label className="block text-sm font-semibold mb-3" style={{ color: "#F5F3FF" }}>
              Reference Photo
            </label>
            <div className="flex items-start gap-4 flex-col sm:flex-row">
              {formData.photo_url ? (
                <div className="relative glass-card rounded-2xl overflow-hidden w-32 h-32"
                  style={{ boxShadow: "inset 0 2px 8px rgba(32, 24, 51, 0.4)" }}>
                  <img 
                    src={formData.photo_url} 
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, photo_url: "" }))}
                    className="absolute top-2 right-2 glass-button w-7 h-7 rounded-lg flex items-center justify-center"
                    style={{ color: "#FCA5A5" }}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : null}
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
                      Upload Photo
                    </>
                  )}
                </label>
                <p className="text-xs mt-2" style={{ color: "#DDD6FE", opacity: 0.7 }}>
                  Optional: Add a reference photo of the cultivar
                </p>
              </div>
            </div>
          </div>

          {/* Basic Information */}
          <div className="glass-card rounded-3xl p-6 space-y-4">
            <h3 className="text-lg font-bold" style={{ 
              color: "#F5F3FF",
              fontFamily: "'Playfair Display', Georgia, serif"
            }}>
              Basic Information
            </h3>

            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: "#F5F3FF" }}>
                Cultivar Name *
              </label>
              <input
                type="text"
                value={formData.cultivar_name}
                onChange={(e) => setFormData(prev => ({ ...prev, cultivar_name: e.target.value }))}
                placeholder="e.g., Rob's Boolaroo"
                className="glass-input w-full px-4 py-3 rounded-2xl"
                style={{ color: "#F5F3FF" }}
                required
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
                  placeholder="e.g., Rob's Violets"
                  className="glass-input w-full px-4 py-3 rounded-2xl"
                  style={{ color: "#F5F3FF" }}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: "#F5F3FF" }}>
                  Priority
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                  className="glass-input w-full px-4 py-3 rounded-2xl"
                  style={{ color: "#F5F3FF" }}
                >
                  <option value="">Not specified</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>
          </div>

          {/* Desired Characteristics */}
          <div className="glass-card rounded-3xl p-6 space-y-4">
            <h3 className="text-lg font-bold" style={{ 
              color: "#F5F3FF",
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
                  <option value="">Not specified</option>
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
                  placeholder="e.g., Deep purple"
                  className="glass-input w-full px-4 py-3 rounded-2xl"
                  style={{ color: "#F5F3FF" }}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: "#F5F3FF" }}>
                  Leaf Type
                </label>
                <select
                  value={formData.leaf_type}
                  onChange={(e) => setFormData(prev => ({ ...prev, leaf_type: e.target.value }))}
                  className="glass-input w-full px-4 py-3 rounded-2xl"
                  style={{ color: "#F5F3FF" }}
                >
                  <option value="">Not specified</option>
                  <option value="standard">Standard</option>
                  <option value="boy">Boy</option>
                  <option value="girl">Girl</option>
                  <option value="variegated">Variegated</option>
                  <option value="serrated">Serrated</option>
                  <option value="quilted">Quilted</option>
                </select>
              </div>
            </div>

            {/* Desired Traits */}
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: "#F5F3FF" }}>
                Desired Traits
              </label>
              <div className="flex flex-wrap gap-2 mb-3">
                {COMMON_TRAITS.map(trait => (
                  <button
                    key={trait}
                    type="button"
                    onClick={() => toggleTrait(trait)}
                    className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-all ${
                      formData.desired_traits.includes(trait)
                        ? "glass-accent-moss"
                        : "glass-button"
                    }`}
                    style={{ 
                      color: formData.desired_traits.includes(trait) ? "#A7F3D0" : "#DDD6FE"
                    }}
                  >
                    {trait}
                  </button>
                ))}
              </div>

              {/* Custom Traits */}
              {formData.desired_traits.filter(t => !COMMON_TRAITS.includes(t)).length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {formData.desired_traits.filter(t => !COMMON_TRAITS.includes(t)).map((trait, idx) => (
                    <div
                      key={idx}
                      className="glass-accent-lavender px-3 py-1.5 rounded-xl text-sm font-medium flex items-center gap-2"
                      style={{ color: "#F0EBFF" }}
                    >
                      {trait}
                      <button
                        type="button"
                        onClick={() => removeTrait(trait)}
                        className="hover:opacity-70"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

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
                  className="glass-button px-4 py-2 rounded-2xl"
                  style={{ color: "#C4B5FD" }}
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

          {/* Sources / Where to Buy */}
          <div className="glass-card rounded-3xl p-6 space-y-4">
            <h3 className="text-lg font-bold" style={{ 
              color: "#F5F3FF",
              fontFamily: "'Playfair Display', Georgia, serif"
            }}>
              Where to Buy
            </h3>

            {formData.sources.length > 0 && (
              <div className="space-y-2">
                {formData.sources.map((source, index) => (
                  <div
                    key={index}
                    className="glass-button rounded-2xl px-4 py-3 flex items-center justify-between"
                  >
                    <span className="text-sm" style={{ color: "#F5F3FF" }}>{source}</span>
                    <button
                      type="button"
                      onClick={() => removeSource(index)}
                      className="hover:opacity-70"
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
                placeholder="Add vendor, website, or nursery..."
                className="glass-input flex-1 px-4 py-3 rounded-2xl"
                style={{ color: "#F5F3FF" }}
              />
              <button
                type="button"
                onClick={addSource}
                className="glass-button px-4 py-3 rounded-2xl"
                style={{ color: "#C4B5FD" }}
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs" style={{ color: "#DDD6FE", opacity: 0.7 }}>
              Add URLs, shop names, or any sources where this plant might be available
            </p>
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

          {/* Buttons */}
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
              disabled={createMutation.isPending}
              className="glass-accent-lavender flex-1 px-8 py-4 rounded-2xl font-semibold disabled:opacity-50"
              style={{ color: "#F0EBFF" }}
            >
              {createMutation.isPending ? "Adding..." : "Add to Wishlist"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}