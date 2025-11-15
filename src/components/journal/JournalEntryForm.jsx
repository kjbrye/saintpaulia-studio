import React, { useState } from "react";
import { X, Upload, Loader2, Plus, Tag, Image as ImageIcon, FileText, Sprout, Bug, Scissors, TrendingUp, AlertTriangle, Eye, Beaker, Sparkles } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import DatePicker from "../ui/DatePicker";

const ENTRY_TYPES = [
  { value: "general", label: "General", icon: FileText, color: "#C4B5FD" },
  { value: "repotting", label: "Repotting", icon: Sprout, color: "#A7F3D0" },
  { value: "pest_treatment", label: "Pest Treatment", icon: Bug, color: "#FCA5A5" },
  { value: "propagation", label: "Propagation", icon: Scissors, color: "#9AE2D3" },
  { value: "milestone", label: "Milestone", icon: TrendingUp, color: "#FCD34D" },
  { value: "care_change", label: "Care Change", icon: Sparkles, color: "#E9D5FF" },
  { value: "problem", label: "Problem", icon: AlertTriangle, color: "#FB923C" },
  { value: "observation", label: "Observation", icon: Eye, color: "#7DD3FC" },
  { value: "experiment", label: "Experiment", icon: Beaker, color: "#C084FC" },
  { value: "custom", label: "Custom", icon: Plus, color: "#DDD6FE" }
];

const COMMON_TAGS = [
  "New Growth",
  "Blooming",
  "Progress",
  "Milestone",
  "Observation",
  "Experiment",
  "Problem Solved",
  "Tips & Tricks",
  "Before & After",
  "Seasonal Change"
];

export default function JournalEntryForm({ plantId, entry, onClose }) {
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);
  const [customTag, setCustomTag] = useState("");
  const [uploadingFiles, setUploadingFiles] = useState([]);

  const [formData, setFormData] = useState(entry || {
    entry_date: new Date().toISOString().split('T')[0],
    entry_type: "general",
    custom_type: "",
    title: "",
    content: "",
    photos: [],
    tags: []
  });

  const mutation = useMutation({
    mutationFn: (entryData) => {
      if (entry) {
        return base44.entities.JournalEntry.update(entry.id, entryData);
      }
      return base44.entities.JournalEntry.create({
        ...entryData,
        plant_id: plantId
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journalEntries', plantId] });
      onClose();
    }
  });

  const handlePhotoUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploading(true);
    const uploadPromises = files.map(async (file, index) => {
      const uploadId = `${Date.now()}-${index}`;
      setUploadingFiles(prev => [...prev, uploadId]);
      
      try {
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        setFormData(prev => ({ ...prev, photos: [...prev.photos, file_url] }));
        setUploadingFiles(prev => prev.filter(id => id !== uploadId));
        return file_url;
      } catch (error) {
        setUploadingFiles(prev => prev.filter(id => id !== uploadId));
        throw error;
      }
    });

    await Promise.all(uploadPromises);
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

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  const selectedType = ENTRY_TYPES.find(t => t.value === formData.entry_type);

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass-card rounded-[32px] w-full max-w-3xl max-h-[90vh] overflow-y-auto">
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
            {entry ? "Edit Journal Entry" : "New Journal Entry"}
          </h2>
          <button
            onClick={onClose}
            className="glass-button w-10 h-10 rounded-2xl flex items-center justify-center"
            style={{ color: "#FCA5A5" }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Entry Type Selection */}
          <div>
            <label className="block text-sm font-semibold mb-3" style={{ color: "#F5F3FF" }}>
              Entry Type
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {ENTRY_TYPES.map(type => {
                const Icon = type.icon;
                const isSelected = formData.entry_type === type.value;
                return (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, entry_type: type.value }))}
                    className={`p-3 rounded-2xl flex flex-col items-center gap-2 transition-all ${
                      isSelected ? "glass-accent-lavender" : "glass-button"
                    }`}
                    style={{ 
                      color: isSelected ? type.color : "#DDD6FE",
                      border: isSelected ? `1px solid ${type.color}40` : undefined
                    }}
                  >
                    <Icon className="w-5 h-5" style={{ strokeWidth: 1.8 }} />
                    <span className="text-xs font-medium text-center leading-tight">
                      {type.label}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Custom Type Input */}
            {formData.entry_type === "custom" && (
              <div className="mt-3">
                <input
                  type="text"
                  value={formData.custom_type}
                  onChange={(e) => setFormData(prev => ({ ...prev, custom_type: e.target.value }))}
                  placeholder="Enter custom type name..."
                  className="glass-input w-full px-4 py-3 rounded-2xl"
                  style={{ color: "#F5F3FF" }}
                />
              </div>
            )}
          </div>

          {/* Date and Title */}
          <div className="grid sm:grid-cols-2 gap-4">
            <DatePicker
              label="Entry Date"
              value={formData.entry_date}
              onChange={(date) => setFormData(prev => ({ ...prev, entry_date: date }))}
              placeholder="Select date"
              required
            />

            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: "#F5F3FF" }}>
                Title (optional)
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g., First bloom!"
                className="glass-input w-full px-4 py-3 rounded-2xl"
                style={{ color: "#F5F3FF" }}
              />
            </div>
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: "#F5F3FF" }}>
              Your Thoughts *
            </label>
            <textarea
              required
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              placeholder="Write about what you observed, changes you noticed, or just your thoughts about your plant..."
              rows={6}
              className="glass-input w-full px-4 py-3 rounded-2xl resize-none"
              style={{ color: "#F5F3FF" }}
            />
          </div>

          {/* Photos - Enhanced for Multiple Uploads */}
          <div>
            <label className="block text-sm font-semibold mb-3" style={{ color: "#F5F3FF" }}>
              Photos {formData.photos.length > 0 && `(${formData.photos.length})`}
            </label>
            <p className="text-xs mb-3" style={{ color: "#DDD6FE", opacity: 0.8 }}>
              Select multiple photos at once to upload
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {formData.photos.map((photo, index) => (
                <div key={index} className="relative group">
                  <div className="glass-card rounded-2xl overflow-hidden aspect-square"
                    style={{
                      boxShadow: "inset 0 2px 8px rgba(32, 24, 51, 0.4), 0 4px 16px rgba(32, 24, 51, 0.3)"
                    }}>
                    <img src={photo} alt={`Entry photo ${index + 1}`} className="w-full h-full object-cover" />
                  </div>
                  <button
                    type="button"
                    onClick={() => removePhoto(index)}
                    className="absolute -top-2 -right-2 w-7 h-7 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-xl"
                    style={{
                      background: "linear-gradient(135deg, rgba(239, 68, 68, 0.9) 0%, rgba(220, 38, 38, 0.85) 100%)",
                      border: "1px solid rgba(255, 255, 255, 0.3)",
                      color: "#FFF"
                    }}
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-lg text-xs font-bold backdrop-blur-xl"
                    style={{
                      background: "rgba(0, 0, 0, 0.6)",
                      color: "#FFF"
                    }}>
                    {index + 1}
                  </div>
                </div>
              ))}

              {/* Upload Placeholders */}
              {uploadingFiles.map((id, index) => (
                <div key={id} className="glass-card rounded-2xl aspect-square flex items-center justify-center"
                  style={{
                    background: "linear-gradient(135deg, rgba(168, 159, 239, 0.15) 0%, rgba(154, 226, 211, 0.12) 100%)"
                  }}>
                  <Loader2 className="w-8 h-8 animate-spin" style={{ color: "#C4B5FD" }} />
                </div>
              ))}
              
              {/* Upload Button */}
              <div>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handlePhotoUpload}
                  className="hidden"
                  id="journal-photo-upload"
                  disabled={uploading}
                />
                <label
                  htmlFor="journal-photo-upload"
                  className="glass-accent-lavender aspect-square rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:opacity-90 transition-all"
                  style={{ color: "#F0EBFF" }}
                >
                  {uploading && uploadingFiles.length === 0 ? (
                    <Loader2 className="w-8 h-8 animate-spin" />
                  ) : (
                    <>
                      <ImageIcon className="w-8 h-8 mb-2" />
                      <span className="text-xs font-medium px-2 text-center">
                        Add Photos
                      </span>
                    </>
                  )}
                </label>
              </div>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-semibold mb-3" style={{ color: "#F5F3FF" }}>
              Tags
            </label>
            
            {/* Selected Tags */}
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
                    <Tag className="w-3 h-3" />
                    {tag}
                    <X className="w-3 h-3" />
                  </button>
                ))}
              </div>
            )}

            {/* Common Tags */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3">
              {COMMON_TAGS.map(tag => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                    formData.tags.includes(tag)
                      ? "glass-accent-lavender"
                      : "glass-button"
                  }`}
                  style={{ color: formData.tags.includes(tag) ? "#F0EBFF" : "#DDD6FE" }}
                >
                  {tag}
                </button>
              ))}
            </div>

            {/* Custom Tag Input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={customTag}
                onChange={(e) => setCustomTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomTag())}
                placeholder="Custom tag..."
                className="glass-input flex-1 px-4 py-2 rounded-2xl text-sm"
                style={{ color: "#F5F3FF" }}
              />
              <button
                type="button"
                onClick={addCustomTag}
                className="glass-button px-4 py-2 rounded-2xl flex items-center gap-2"
                style={{ color: "#DDD6FE" }}
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Submit Buttons */}
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
              disabled={mutation.isPending || uploading}
              className="glass-accent-lavender flex-1 px-6 py-3 rounded-2xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
              style={{ color: "#F0EBFF" }}
            >
              {mutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : uploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Uploading Photos...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  {entry ? "Update Entry" : "Add Entry"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}