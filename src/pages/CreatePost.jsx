
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Loader2, Plus, X, Image as ImageIcon } from "lucide-react";
import { createPageUrl } from "@/utils";
import { toast } from "sonner";

const COMMON_TAGS = [
  "Blooming",
  "Variegated",
  "Miniature",
  "Trailing",
  "Double flowers",
  "Rare cultivar",
  "Award winner",
  "Beginner friendly",
  "Fast grower",
  "Compact",
  "Fragrant",
  "New acquisition"
];

export default function CreatePost() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);
  const [customTag, setCustomTag] = useState("");

  const { data: myPlants = [] } = useQuery({
    queryKey: ['myPlants'],
    queryFn: () => base44.entities.Plant.list(),
    initialData: []
  });

  const [formData, setFormData] = useState({
    plant_id: "",
    cultivar_name: "",
    title: "",
    description: "",
    photos: [],
    tags: [],
    hybridizer: "",
    blossom_type: "",
    blossom_color: "",
    leaf_type: "",
    care_tips: ""
  });

  const createMutation = useMutation({
    mutationFn: (postData) => base44.entities.CommunityPost.create({
      ...postData,
      like_count: 0,
      comment_count: 0
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communityPosts'] });
      toast.success("Post published!", {
        description: "Your plant has been shared with the community."
      });
      setTimeout(() => {
        navigate(createPageUrl("CommunityFeed"));
      }, 500);
    },
    onError: (error) => {
      toast.error("Failed to publish post", {
        description: error.message || "Please try again."
      });
    }
  });

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploading(true);
    const uploadedUrls = [];
    
    for (const file of files) {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      uploadedUrls.push(file_url);
    }
    
    setFormData(prev => ({ 
      ...prev, 
      photos: [...prev.photos, ...uploadedUrls] 
    }));
    setUploading(false);
  };

  const removePhoto = (index) => {
    setFormData(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index)
    }));
  };

  const toggleTag = (tag) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  };

  const addCustomTag = () => {
    if (customTag.trim() && !formData.tags.includes(customTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, customTag.trim()]
      }));
      setCustomTag("");
    }
  };

  const removeTag = (tag) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  const handlePlantSelect = (plantId) => {
    const plant = myPlants.find(p => p.id === plantId);
    if (plant) {
      setFormData(prev => ({
        ...prev,
        plant_id: plantId,
        cultivar_name: plant.cultivar_name,
        hybridizer: plant.hybridizer || "",
        blossom_type: plant.blossom_type || "",
        blossom_color: plant.blossom_color || "",
        leaf_type: plant.leaf_type || "",
        photos: plant.photos || []
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        plant_id: "",
        cultivar_name: "",
        hybridizer: "",
        blossom_type: "",
        blossom_color: "",
        leaf_type: "",
        photos: []
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Allow submission even without photos
    const cleanedData = {
      ...formData,
      plant_id: formData.plant_id || undefined,
      photos: formData.photos.length > 0 ? formData.photos : []
    };
    createMutation.mutate(cleanedData);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate(createPageUrl("CommunityFeed"))}
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
            Share Your Plant
          </h1>
          <p style={{ color: "var(--text-secondary)" }}>Show off your beautiful African violet</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Select from My Plants */}
        {myPlants.length > 0 && (
          <div className="glass-card rounded-3xl p-6">
            <label className="block text-sm font-semibold mb-3" style={{ color: "var(--text-primary)" }}>
              Share from My Collection (Optional)
            </label>
            <select
              value={formData.plant_id}
              onChange={(e) => handlePlantSelect(e.target.value)}
              className="glass-input w-full px-4 py-3 rounded-2xl"
              style={{ color: "var(--text-primary)" }}
            >
              <option value="">Or enter details manually...</option>
              {myPlants.map(plant => (
                <option key={plant.id} value={plant.id}>
                  {plant.nickname || plant.cultivar_name}
                </option>
              ))}
            </select>
            <p className="text-xs mt-2" style={{ color: "var(--text-secondary)", opacity: 0.7 }}>
              Select a plant from your collection to auto-fill details
            </p>
          </div>
        )}

        {/* Photos */}
        <div className="glass-card rounded-3xl p-6">
          <label className="block text-sm font-semibold mb-3" style={{ color: "var(--text-primary)" }}>
            Photos (Optional)
          </label>

          {formData.photos.length > 0 && (
            <div className="grid grid-cols-3 gap-3 mb-4">
              {formData.photos.map((photo, index) => (
                <div key={index} className="relative aspect-square rounded-2xl overflow-hidden glass-card group">
                  <img src={photo} alt={`Photo ${index + 1}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removePhoto(index)}
                    className="absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-xl"
                    style={{
                      background: "rgba(239, 68, 68, 0.9)",
                      color: "#FFF"
                    }}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <input
            type="file"
            accept="image/*"
            multiple
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
                <ImageIcon className="w-4 h-4" />
                {formData.photos.length === 0 ? "Upload Photos" : "Add More Photos"}
              </>
            )}
          </label>
          <p className="text-xs mt-2" style={{ color: "var(--text-secondary)", opacity: 0.7 }}>
            You can share photos or create a text-only post
          </p>
        </div>

        {/* Basic Info */}
        <div className="glass-card rounded-3xl p-6 space-y-4">
          <h3 className="text-lg font-bold mb-4" style={{ 
            color: "var(--text-primary)",
            textShadow: "var(--heading-shadow)",
            fontFamily: "'Playfair Display', Georgia, serif"
          }}>
            Post Details
          </h3>

          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
              Post Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="e.g., Look at these beautiful blooms!"
              className="glass-input w-full px-4 py-3 rounded-2xl"
              style={{ color: "var(--text-primary)" }}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
              Cultivar Name *
            </label>
            <input
              type="text"
              required
              value={formData.cultivar_name}
              onChange={(e) => setFormData(prev => ({ ...prev, cultivar_name: e.target.value }))}
              placeholder="e.g., Midnight Rose"
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
              placeholder="Share your thoughts, care journey, or any interesting details..."
              rows={4}
              className="glass-input w-full px-4 py-3 rounded-2xl resize-none"
              style={{ color: "var(--text-primary)" }}
            />
          </div>
        </div>

        {/* Plant Details */}
        <div className="glass-card rounded-3xl p-6 space-y-4">
          <h3 className="text-lg font-bold mb-4" style={{ 
            color: "var(--text-primary)",
            textShadow: "var(--heading-shadow)",
            fontFamily: "'Playfair Display', Georgia, serif"
          }}>
            Plant Details (Optional)
          </h3>

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
                placeholder="e.g., Deep Purple"
                className="glass-input w-full px-4 py-3 rounded-2xl"
                style={{ color: "var(--text-primary)" }}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
                Leaf Type
              </label>
              <input
                type="text"
                value={formData.leaf_type}
                onChange={(e) => setFormData(prev => ({ ...prev, leaf_type: e.target.value }))}
                placeholder="e.g., Variegated"
                className="glass-input w-full px-4 py-3 rounded-2xl"
                style={{ color: "var(--text-primary)" }}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
              Care Tips
            </label>
            <textarea
              value={formData.care_tips}
              onChange={(e) => setFormData(prev => ({ ...prev, care_tips: e.target.value }))}
              placeholder="Share any care tips or special techniques..."
              rows={3}
              className="glass-input w-full px-4 py-3 rounded-2xl resize-none"
              style={{ color: "var(--text-primary)" }}
            />
          </div>
        </div>

        {/* Tags */}
        <div className="glass-card rounded-3xl p-6 space-y-4">
          <h3 className="text-lg font-bold mb-4" style={{ 
            color: "var(--text-primary)",
            textShadow: "var(--heading-shadow)",
            fontFamily: "'Playfair Display', Georgia, serif"
          }}>
            Tags
          </h3>

          {formData.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {formData.tags.map(tag => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="glass-accent-moss px-3 py-1.5 rounded-xl text-sm font-medium flex items-center gap-1.5 hover:opacity-80 transition-opacity"
                  style={{ color: "#A7F3D0" }}
                >
                  {tag}
                  <X className="w-3 h-3" />
                </button>
              ))}
            </div>
          )}

          <p className="text-sm font-semibold mb-2" style={{ color: "var(--text-secondary)" }}>Common Tags:</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3">
            {COMMON_TAGS.map(tag => (
              <button
                key={tag}
                type="button"
                onClick={() => toggleTag(tag)}
                className={`px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                  formData.tags.includes(tag) ? "glass-accent-lavender" : "glass-button"
                }`}
                style={{ color: formData.tags.includes(tag) ? "#F0EBFF" : "var(--text-secondary)" }}
              >
                {tag}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={customTag}
              onChange={(e) => setCustomTag(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomTag())}
              placeholder="Add custom tag..."
              className="glass-input flex-1 px-4 py-2 rounded-2xl text-sm"
              style={{ color: "var(--text-primary)" }}
            />
            <button
              type="button"
              onClick={addCustomTag}
              className="glass-button px-4 py-2 rounded-2xl flex items-center gap-2"
              style={{ color: "var(--text-secondary)" }}
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => navigate(createPageUrl("CommunityFeed"))}
            className="glass-button px-8 py-4 rounded-2xl font-semibold"
            style={{ color: "var(--text-secondary)" }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={createMutation.isPending} // Removed || formData.photos.length === 0
            className="glass-accent-lavender flex-1 px-8 py-4 rounded-2xl font-semibold disabled:opacity-50"
            style={{ color: "#F0EBFF" }}
          >
            {createMutation.isPending ? "Sharing..." : "Share with Community"}
          </button>
        </div>
      </form>
    </div>
  );
}
