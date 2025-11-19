import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Target, Sparkles, Plus, X } from "lucide-react";
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
  "Strong stems",
  "Unusual color"
];

export default function AddProject() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [customTrait, setCustomTrait] = useState("");

  const [formData, setFormData] = useState({
    project_name: "",
    project_type: "goal-oriented",
    goal_description: "",
    seed_parent_id: "",
    pollen_parent_id: "",
    cross_date: new Date().toISOString().split('T')[0],
    expected_traits: [],
    growing_conditions: "",
    notes: "",
    status: "planning"
  });

  const { data: plants = [] } = useQuery({
    queryKey: ['plants'],
    queryFn: () => base44.entities.Plant.list(),
    initialData: [],
  });

  const createMutation = useMutation({
    mutationFn: (projectData) => base44.entities.HybridizationProject.create(projectData),
    onSuccess: (project) => {
      queryClient.invalidateQueries({ queryKey: ['hybridizationProjects'] });
      toast.success("Project created!", {
        description: `${project.project_name} has been added to your projects.`
      });
      setTimeout(() => {
        navigate(createPageUrl(`ProjectDetail?id=${project.id}`));
      }, 500);
    },
    onError: (error) => {
      toast.error("Failed to create project", {
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
    const cleanedData = Object.fromEntries(
      Object.entries(formData).filter(([_, value]) => 
        value !== "" && !(Array.isArray(value) && value.length === 0)
      )
    );
    createMutation.mutate(cleanedData);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate(createPageUrl("Projects"))}
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
            New Hybridization Project
          </h1>
          <p style={{ color: "#DDD6FE" }}>Start breeding your unique cultivar</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="glass-card rounded-3xl p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: "#F5F3FF" }}>
              Project Name *
            </label>
            <input
              type="text"
              required
              value={formData.project_name}
              onChange={(e) => setFormData(prev => ({ ...prev, project_name: e.target.value }))}
              placeholder="e.g., Purple Dream Cross, Variegated Experiment"
              className="glass-input w-full px-4 py-3 rounded-2xl"
              style={{ color: "#F5F3FF" }}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: "#F5F3FF" }}>
              Project Type *
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, project_type: "goal-oriented" }))}
                className={`px-4 py-3 rounded-2xl font-semibold transition-all flex items-center gap-2 justify-center ${
                  formData.project_type === "goal-oriented" ? "glass-accent-lavender" : "glass-button"
                }`}
                style={{ color: formData.project_type === "goal-oriented" ? "#F0EBFF" : "#DDD6FE" }}
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
                style={{ color: formData.project_type === "experimental" ? "#A7F3D0" : "#DDD6FE" }}
              >
                <Sparkles className="w-5 h-5" />
                Experimental
              </button>
            </div>
          </div>

          {formData.project_type === "goal-oriented" && (
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: "#F5F3FF" }}>
                Goal Description
              </label>
              <textarea
                value={formData.goal_description}
                onChange={(e) => setFormData(prev => ({ ...prev, goal_description: e.target.value }))}
                placeholder="Describe what you're hoping to achieve with this cross..."
                rows={3}
                className="glass-input w-full px-4 py-3 rounded-2xl resize-none"
                style={{ color: "#F5F3FF" }}
              />
            </div>
          )}
        </div>

        {/* Parents Selection */}
        <div className="glass-card rounded-3xl p-6 space-y-4">
          <h3 className="text-lg font-bold" style={{ 
            color: "#F5F3FF",
            textShadow: "0 1px 3px rgba(32, 24, 51, 0.4)",
            fontFamily: "'Playfair Display', Georgia, serif"
          }}>
            Parent Plants
          </h3>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: "#F5F3FF" }}>
                Seed Parent (Mother)
              </label>
              <select
                value={formData.seed_parent_id}
                onChange={(e) => setFormData(prev => ({ ...prev, seed_parent_id: e.target.value }))}
                className="glass-input w-full px-4 py-3 rounded-2xl"
                style={{ color: "#F5F3FF" }}
              >
                <option value="">Select plant...</option>
                {plants.map(plant => (
                  <option key={plant.id} value={plant.id}>{plant.cultivar_name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: "#F5F3FF" }}>
                Pollen Parent (Father)
              </label>
              <select
                value={formData.pollen_parent_id}
                onChange={(e) => setFormData(prev => ({ ...prev, pollen_parent_id: e.target.value }))}
                className="glass-input w-full px-4 py-3 rounded-2xl"
                style={{ color: "#F5F3FF" }}
              >
                <option value="">Select plant...</option>
                {plants.map(plant => (
                  <option key={plant.id} value={plant.id}>{plant.cultivar_name}</option>
                ))}
              </select>
            </div>
          </div>

          <DatePicker
            label="Cross Date"
            value={formData.cross_date}
            onChange={(date) => setFormData(prev => ({ ...prev, cross_date: date }))}
            placeholder="Select cross date"
          />
        </div>

        {/* Expected Traits */}
        <div className="glass-card rounded-3xl p-6 space-y-4">
          <h3 className="text-lg font-bold" style={{ 
            color: "#F5F3FF",
            textShadow: "0 1px 3px rgba(32, 24, 51, 0.4)",
            fontFamily: "'Playfair Display', Georgia, serif"
          }}>
            Expected Traits
          </h3>

          {/* Selected Traits */}
          {Array.isArray(formData.expected_traits) && formData.expected_traits.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {formData.expected_traits.map(trait => (
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

          {/* Common Traits */}
          <div>
            <p className="text-sm font-semibold mb-2" style={{ color: "#DDD6FE" }}>Common Traits:</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {COMMON_TRAITS.map(trait => (
                <button
                  key={trait}
                  type="button"
                  onClick={() => toggleTrait(trait)}
                  className={`px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                    formData.expected_traits.includes(trait) ? "glass-accent-lavender" : "glass-button"
                  }`}
                  style={{ color: formData.expected_traits.includes(trait) ? "#F0EBFF" : "#DDD6FE" }}
                >
                  {trait}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Trait Input */}
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

        {/* Additional Details */}
        <div className="glass-card rounded-3xl p-6 space-y-4">
          <h3 className="text-lg font-bold" style={{ 
            color: "#F5F3FF",
            textShadow: "0 1px 3px rgba(32, 24, 51, 0.4)",
            fontFamily: "'Playfair Display', Georgia, serif"
          }}>
            Additional Details
          </h3>

          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: "#F5F3FF" }}>
              Growing Conditions
            </label>
            <textarea
              value={formData.growing_conditions}
              onChange={(e) => setFormData(prev => ({ ...prev, growing_conditions: e.target.value }))}
              placeholder="Describe special growing conditions, techniques, or variables you're testing..."
              rows={3}
              className="glass-input w-full px-4 py-3 rounded-2xl resize-none"
              style={{ color: "#F5F3FF" }}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: "#F5F3FF" }}>
              Project Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Any other notes about this project..."
              rows={3}
              className="glass-input w-full px-4 py-3 rounded-2xl resize-none"
              style={{ color: "#F5F3FF" }}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: "#F5F3FF" }}>
              Initial Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
              className="glass-input w-full px-4 py-3 rounded-2xl"
              style={{ color: "#F5F3FF" }}
            >
              <option value="planning">Planning</option>
              <option value="active">Active</option>
            </select>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => navigate(createPageUrl("Projects"))}
            className="glass-button px-6 py-3 rounded-2xl font-semibold"
            style={{ color: "#DDD6FE" }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={createMutation.isPending}
            className="glass-accent-lavender flex-1 px-6 py-3 rounded-2xl font-semibold disabled:opacity-50"
            style={{ color: "#F0EBFF" }}
          >
            {createMutation.isPending ? "Creating..." : "Create Project"}
          </button>
        </div>
      </form>
    </div>
  );
}