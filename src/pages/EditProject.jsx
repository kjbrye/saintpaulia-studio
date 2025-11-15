
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Target, Sparkles, Plus, X } from "lucide-react";
import { createPageUrl } from "@/utils";
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
  "Strong stems",
  "Unusual color"
];

export default function EditProject() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const projectId = urlParams.get('id');
  const [customTrait, setCustomTrait] = useState("");

  const { data: project, isLoading } = useQuery({
    queryKey: ['hybridizationProject', projectId],
    queryFn: () => base44.entities.HybridizationProject.filter({ id: projectId }).then(projects => projects[0]),
    enabled: !!projectId
  });

  const { data: plants = [] } = useQuery({
    queryKey: ['plants'],
    queryFn: () => base44.entities.Plant.list(),
    initialData: [],
  });

  const [formData, setFormData] = useState({
    project_name: "",
    project_type: "goal-oriented",
    goal_description: "",
    seed_parent_id: "",
    pollen_parent_id: "",
    cross_date: "",
    expected_traits: [],
    growing_conditions: "",
    notes: "",
    status: "planning"
  });

  useEffect(() => {
    if (project) {
      setFormData({
        project_name: project.project_name || "",
        project_type: project.project_type || "goal-oriented",
        goal_description: project.goal_description || "",
        seed_parent_id: project.seed_parent_id || "",
        pollen_parent_id: project.pollen_parent_id || "",
        cross_date: project.cross_date || "",
        expected_traits: project.expected_traits || [],
        growing_conditions: project.growing_conditions || "",
        notes: project.notes || "",
        status: project.status || "planning"
      });
    }
  }, [project]);

  const updateMutation = useMutation({
    mutationFn: (projectData) => base44.entities.HybridizationProject.update(projectId, projectData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hybridizationProjects'] });
      queryClient.invalidateQueries({ queryKey: ['hybridizationProject', projectId] });
      toast.success("Project updated!", {
        description: "Your changes have been saved successfully."
      });
      setTimeout(() => {
        navigate(createPageUrl(`ProjectDetail?id=${projectId}`));
      }, 500);
    },
    onError: (error) => {
      toast.error("Failed to update project", {
        description: error.message || "Please try again."
      });
    }
  });

  const toggleTrait = (trait) => {
    setFormData(prev => ({
      ...prev,
      expected_traits: prev.expected_traits.includes(trait)
        ? prev.expected_traits.filter(t => t !== trait)
        : [...prev.expected_traits, trait]
    }));
  };

  const addCustomTrait = () => {
    if (customTrait.trim() && !formData.expected_traits.includes(customTrait.trim())) {
      setFormData(prev => ({
        ...prev,
        expected_traits: [...prev.expected_traits, customTrait.trim()]
      }));
      setCustomTrait("");
    }
  };

  const removeTrait = (trait) => {
    setFormData(prev => ({
      ...prev,
      expected_traits: prev.expected_traits.filter(t => t !== trait)
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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate(createPageUrl(`ProjectDetail?id=${projectId}`))}
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
            Edit Project
          </h1>
          <p style={{ color: "var(--text-secondary)" }}>Update {project?.project_name}</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="glass-card rounded-3xl p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
              Project Name *
            </label>
            <input
              type="text"
              required
              value={formData.project_name}
              onChange={(e) => setFormData(prev => ({ ...prev, project_name: e.target.value }))}
              placeholder="e.g., Purple Dream Cross, Variegated Experiment"
              className="glass-input w-full px-4 py-3 rounded-2xl"
              style={{ color: "var(--text-primary)" }}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
              Project Type *
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, project_type: "goal-oriented" }))}
                className={`px-4 py-3 rounded-2xl font-semibold transition-all flex items-center gap-2 justify-center ${
                  formData.project_type === "goal-oriented" ? "glass-accent-lavender" : "glass-button"
                }`}
                style={{ color: formData.project_type === "goal-oriented" ? "var(--text-accent-lavender)" : "var(--text-secondary)" }}
              >
                <Target className="w-5 h-5" />
                Goal-Oriented
              </button>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, project_type: "experimental" }))}
                className={`px-4 py-3 rounded-2xl font-semibold transition-all flex items-center gap-2 justify-center ${
                  formData.project_type === "experimental" ? "glass-accent-moss" : "glass-button"
                }`}
                style={{ color: formData.project_type === "experimental" ? "var(--text-accent-moss)" : "var(--text-secondary)" }}
              >
                <Sparkles className="w-5 h-5" />
                Experimental
              </button>
            </div>
          </div>

          {formData.project_type === "goal-oriented" && (
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
                Goal Description
              </label>
              <textarea
                value={formData.goal_description}
                onChange={(e) => setFormData(prev => ({ ...prev, goal_description: e.target.value }))}
                placeholder="Describe what you're hoping to achieve with this cross..."
                rows={3}
                className="glass-input w-full px-4 py-3 rounded-2xl resize-none"
                style={{ color: "var(--text-primary)" }}
              />
            </div>
          )}
        </div>

        {/* Parents Selection */}
        <div className="glass-card rounded-3xl p-6 space-y-4">
          <h3 className="text-lg font-bold" style={{ 
            color: "var(--text-primary)",
            textShadow: "var(--heading-shadow)",
            fontFamily: "'Playfair Display', Georgia, serif"
          }}>
            Parent Plants
          </h3>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
                Seed Parent (Mother)
              </label>
              <select
                value={formData.seed_parent_id}
                onChange={(e) => setFormData(prev => ({ ...prev, seed_parent_id: e.target.value }))}
                className="glass-input w-full px-4 py-3 rounded-2xl"
                style={{ color: "var(--text-primary)" }}
              >
                <option value="">Select plant...</option>
                {plants.map(plant => (
                  <option key={plant.id} value={plant.id}>{plant.cultivar_name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
                Pollen Parent (Father)
              </label>
              <select
                value={formData.pollen_parent_id}
                onChange={(e) => setFormData(prev => ({ ...prev, pollen_parent_id: e.target.value }))}
                className="glass-input w-full px-4 py-3 rounded-2xl"
                style={{ color: "var(--text-primary)" }}
              >
                <option value="">Select plant...</option>
                {plants.map(plant => (
                  <option key={plant.id} value={plant.id}>{plant.cultivar_name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
              Cross Date
            </label>
            <input
              type="date"
              value={formData.cross_date}
              onChange={(e) => setFormData(prev => ({ ...prev, cross_date: e.target.value }))}
              className="glass-input w-full px-4 py-3 rounded-2xl"
              style={{ color: "var(--text-primary)" }}
            />
          </div>
        </div>

        {/* Expected Traits */}
        <div className="glass-card rounded-3xl p-6 space-y-4">
          <h3 className="text-lg font-bold" style={{ 
            color: "var(--text-primary)",
            textShadow: "var(--heading-shadow)",
            fontFamily: "'Playfair Display', Georgia, serif"
          }}>
            Expected Traits
          </h3>

          {formData.expected_traits.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {formData.expected_traits.map(trait => (
                <button
                  key={trait}
                  type="button"
                  onClick={() => removeTrait(trait)}
                  className="glass-accent-moss px-3 py-1.5 rounded-xl text-sm font-medium flex items-center gap-1.5 hover:opacity-80 transition-opacity"
                  style={{ color: "var(--text-accent-moss)" }}
                >
                  {trait}
                  <X className="w-3 h-3" />
                </button>
              ))}
            </div>
          )}

          <div>
            <p className="text-sm font-semibold mb-2" style={{ color: "var(--text-secondary)" }}>Common Traits:</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {COMMON_TRAITS.map(trait => (
                <button
                  key={trait}
                  type="button"
                  onClick={() => toggleTrait(trait)}
                  className={`px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                    formData.expected_traits.includes(trait) ? "glass-accent-lavender" : "glass-button"
                  }`}
                  style={{ color: formData.expected_traits.includes(trait) ? "var(--text-accent-lavender)" : "var(--text-secondary)" }}
                >
                  {trait}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={customTrait}
              onChange={(e) => setCustomTrait(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomTrait())}
              placeholder="Add custom trait..."
              className="glass-input flex-1 px-4 py-2 rounded-2xl text-sm"
              style={{ color: "var(--text-primary)" }}
            />
            <button
              type="button"
              onClick={addCustomTrait}
              className="glass-button px-4 py-2 rounded-2xl flex items-center gap-2"
              style={{ color: "var(--text-secondary)" }}
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Additional Details */}
        <div className="glass-card rounded-3xl p-6 space-y-4">
          <h3 className="text-lg font-bold" style={{ 
            color: "var(--text-primary)",
            textShadow: "var(--heading-shadow)",
            fontFamily: "'Playfair Display', Georgia, serif"
          }}>
            Additional Details
          </h3>

          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
              Growing Conditions
            </label>
            <textarea
              value={formData.growing_conditions}
              onChange={(e) => setFormData(prev => ({ ...prev, growing_conditions: e.target.value }))}
              placeholder="Describe special growing conditions, techniques, or variables you're testing..."
              rows={3}
              className="glass-input w-full px-4 py-3 rounded-2xl resize-none"
              style={{ color: "var(--text-primary)" }}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
              Project Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Any other notes about this project..."
              rows={3}
              className="glass-input w-full px-4 py-3 rounded-2xl resize-none"
              style={{ color: "var(--text-primary)" }}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
              Project Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
              className="glass-input w-full px-4 py-3 rounded-2xl"
              style={{ color: "var(--text-primary)" }}
            >
              <option value="planning">Planning</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => navigate(createPageUrl(`ProjectDetail?id=${projectId}`))}
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
