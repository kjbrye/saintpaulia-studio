import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate, Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ArrowLeft, Plus, X } from "lucide-react";

const LOGO_URL = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/690e3cd78523fb5fba0a8466/632f6e485_PlantLogos.png";

const CATEGORIES = {
  care_and_growing: { label: "Care & Growing", icon: "🌱", description: "Tips and advice for African violet care" },
  pests_and_diseases: { label: "Pests & Diseases", icon: "🐛", description: "Identify and treat common issues" },
  hybridizing_and_propagation: { label: "Hybridizing & Propagation", icon: "🧪", description: "Breeding and propagation techniques" },
  cultivar_discussion: { label: "Cultivar Discussion", icon: "🌸", description: "Discuss specific cultivars" },
  show_and_tell: { label: "Show & Tell", icon: "📸", description: "Share your beautiful violets" },
  equipment_and_supplies: { label: "Equipment & Supplies", icon: "🛠️", description: "Tools and supplies discussion" },
  general_discussion: { label: "General Discussion", icon: "💬", description: "Everything else about African violets" }
};

export default function CreateForumTopic() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    category: "general_discussion",
    content: "",
    tags: []
  });
  const [tagInput, setTagInput] = useState("");

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me().catch(() => null)
  });

  const createTopicMutation = useMutation({
    mutationFn: (data) => base44.entities.ForumTopic.create({
      ...data,
      last_activity_date: new Date().toISOString(),
      view_count: 0,
      reply_count: 0
    }),
    onSuccess: (newTopic) => {
      navigate(createPageUrl(`ForumTopic?id=${newTopic.id}`));
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.title.trim() && formData.content.trim()) {
      createTopicMutation.mutate(formData);
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({ ...formData, tags: [...formData.tags, tagInput.trim()] });
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData({ ...formData, tags: formData.tags.filter(tag => tag !== tagToRemove) });
  };

  const currentTheme = currentUser?.theme || "glassmorphism";

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link to={createPageUrl("Forum")}>
            <button className="neuro-button w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{ color: (currentTheme === 'light' || currentTheme === 'minimal') ? "#7C3AED" : "#E3C9FF" }}>
              <ArrowLeft className="w-5 h-5" style={{ strokeWidth: 2 }} />
            </button>
          </Link>
          <div className="flex items-center gap-4">
            <div className="neuro-icon-well w-16 h-16 rounded-3xl flex items-center justify-center p-2">
              <img src={LOGO_URL} alt="Create Topic" className="w-full h-full object-contain" />
            </div>
            <div>
              <h1 className="text-4xl font-bold" style={{
                color: 'var(--text-primary)',
                textShadow: 'var(--heading-shadow)',
                fontFamily: "'Playfair Display', Georgia, serif"
              }}>
                Start a Discussion
              </h1>
              <p className="text-muted" style={{ color: 'var(--text-secondary)' }}>
                Ask questions or share knowledge with the community
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div className="neuro-card rounded-3xl p-6">
            <label className="block text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
              Topic Title <span style={{ color: "#FCA5A5" }}>*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., How to prevent crown rot in African violets?"
              className="neuro-input w-full px-4 py-3 rounded-2xl"
              style={{ color: 'var(--text-primary)' }}
              maxLength={200}
              required
            />
            <p className="text-xs mt-2" style={{ color: 'var(--text-secondary)', opacity: 0.7 }}>
              Be specific and descriptive. Good titles get more responses!
            </p>
          </div>

          {/* Category */}
          <div className="neuro-card rounded-3xl p-6">
            <label className="block text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
              Category <span style={{ color: "#FCA5A5" }}>*</span>
            </label>
            <div className="grid sm:grid-cols-2 gap-3">
              {Object.entries(CATEGORIES).map(([key, cat]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setFormData({ ...formData, category: key })}
                  className={`neuro-button rounded-2xl p-4 text-left ${
                    formData.category === key ? "neuro-accent-raised" : ""
                  }`}
                  style={{ 
                    color: formData.category === key 
                      ? ((currentTheme === 'light' || currentTheme === 'minimal') ? "#FFFFFF" : "#F0EBFF")
                      : "var(--text-secondary)" 
                  }}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{cat.icon}</span>
                    <div>
                      <p className="font-semibold text-sm">{cat.label}</p>
                      <p className="text-xs opacity-80">{cat.description}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="neuro-card rounded-3xl p-6">
            <label className="block text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
              Description <span style={{ color: "#FCA5A5" }}>*</span>
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="Provide details about your question or topic. Include relevant information like plant symptoms, growing conditions, or what you've already tried..."
              className="neuro-input w-full px-4 py-3 rounded-2xl min-h-[200px]"
              style={{ color: 'var(--text-primary)' }}
              required
            />
            <p className="text-xs mt-2" style={{ color: 'var(--text-secondary)', opacity: 0.7 }}>
              Supports Markdown formatting. Be detailed to get better responses!
            </p>
          </div>

          {/* Tags */}
          <div className="neuro-card rounded-3xl p-6">
            <label className="block text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
              Tags (Optional)
            </label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                placeholder="Add a tag..."
                className="neuro-input flex-1 px-4 py-2 rounded-2xl"
                style={{ color: 'var(--text-primary)' }}
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="neuro-button px-4 py-2 rounded-2xl font-semibold flex items-center gap-1"
                style={{ color: "var(--text-secondary)" }}
              >
                <Plus className="w-4 h-4" />
                Add
              </button>
            </div>
            {formData.tags.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                {formData.tags.map((tag, idx) => (
                  <span key={idx} className="neuro-button px-3 py-1.5 rounded-xl text-sm flex items-center gap-2">
                    <span style={{ color: "var(--text-primary)" }}>#{tag}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:opacity-70"
                    >
                      <X className="w-3 h-3" style={{ color: "#FCA5A5" }} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end">
            <Link to={createPageUrl("Forum")}>
              <button type="button" className="neuro-button px-6 py-3 rounded-2xl font-semibold"
                style={{ color: "var(--text-secondary)" }}>
                Cancel
              </button>
            </Link>
            <button
              type="submit"
              disabled={!formData.title.trim() || !formData.content.trim() || createTopicMutation.isLoading}
              className="neuro-accent-raised px-6 py-3 rounded-2xl font-semibold"
              style={{ color: (currentTheme === 'light' || currentTheme === 'minimal') ? '#FFFFFF' : '#F0EBFF' }}
            >
              {createTopicMutation.isLoading ? 'Creating...' : 'Create Topic'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}