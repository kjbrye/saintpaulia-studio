import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { createPageUrl } from "@/utils";
import { toast } from "sonner";

export default function AddPropagationProject() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    project_name: "",
    parent_plant_id: "",
    propagation_method: "leaf_cutting",
    start_date: new Date().toISOString().split('T')[0],
    rooting_hormone_used: false,
    rooting_hormone_type: "",
    growing_medium: "",
    container_type: "",
    environmental_conditions: "",
    expected_completion_date: "",
    total_attempts: 1,
    notes: "",
    status: "active"
  });

  const { data: plants = [] } = useQuery({
    queryKey: ['plants'],
    queryFn: () => base44.entities.Plant.list(),
    initialData: []
  });

  const createMutation = useMutation({
    mutationFn: (projectData) => base44.entities.PropagationProject.create(projectData),
    onSuccess: (project) => {
      queryClient.invalidateQueries({ queryKey: ['propagationProjects'] });
      toast.success("Propagation project created!", {
        description: `${project.project_name} has been added to your projects.`
      });
      navigate(createPageUrl(`PropagationProjectDetail?id=${project.id}`));
    },
    onError: (error) => {
      toast.error("Failed to create project", {
        description: error.message || "Please try again."
      });
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const cleanedData = Object.fromEntries(
      Object.entries(formData)
        .filter(([key, value]) => {
          if (key === 'rooting_hormone_type' && !formData.rooting_hormone_used) return false;
          return value !== "";
        })
        .map(([key, value]) => {
          if (key === 'total_attempts') return [key, Number(value)];
          return [key, value];
        })
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
            New Propagation Project
          </h1>
          <p style={{ color: "#DDD6FE" }}>Start tracking a new propagation effort</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
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
              Project Name *
            </label>
            <input
              type="text"
              required
              value={formData.project_name}
              onChange={(e) => setFormData(prev => ({ ...prev, project_name: e.target.value }))}
              placeholder="e.g., Rob's Humpty Doo Leaf Propagation"
              className="glass-input w-full px-4 py-3 rounded-2xl"
              style={{ color: "#F5F3FF" }}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: "#F5F3FF" }}>
              Parent Plant *
            </label>
            <select
              required
              value={formData.parent_plant_id}
              onChange={(e) => setFormData(prev => ({ ...prev, parent_plant_id: e.target.value }))}
              className="glass-input w-full px-4 py-3 rounded-2xl"
              style={{ color: "#F5F3FF" }}
            >
              <option value="">Select parent plant...</option>
              {plants.map(plant => (
                <option key={plant.id} value={plant.id}>
                  {plant.nickname || plant.cultivar_name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: "#F5F3FF" }}>
                Propagation Method *
              </label>
              <select
                value={formData.propagation_method}
                onChange={(e) => setFormData(prev => ({ ...prev, propagation_method: e.target.value }))}
                className="glass-input w-full px-4 py-3 rounded-2xl"
                style={{ color: "#F5F3FF" }}
              >
                <option value="leaf_cutting">Leaf Cutting</option>
                <option value="sucker">Sucker</option>
                <option value="crown_division">Crown Division</option>
                <option value="stem_cutting">Stem Cutting</option>
                <option value="tissue_culture">Tissue Culture</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: "#F5F3FF" }}>
                Start Date *
              </label>
              <input
                type="date"
                required
                value={formData.start_date}
                onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                className="glass-input w-full px-4 py-3 rounded-2xl"
                style={{ color: "#F5F3FF" }}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: "#F5F3FF" }}>
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
              className="glass-input w-full px-4 py-3 rounded-2xl"
              style={{ color: "#F5F3FF" }}
            >
              <option value="planning">Planning</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>

        {/* Rooting Details */}
        <div className="glass-card rounded-3xl p-6 space-y-4">
          <h3 className="text-lg font-bold mb-4" style={{ 
            color: "#F5F3FF",
            textShadow: "0 1px 3px rgba(32, 24, 51, 0.4)",
            fontFamily: "'Playfair Display', Georgia, serif"
          }}>
            Rooting Details
          </h3>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="rooting_hormone"
              checked={formData.rooting_hormone_used}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                rooting_hormone_used: e.target.checked,
                rooting_hormone_type: e.target.checked ? prev.rooting_hormone_type : ""
              }))}
              className="w-5 h-5 rounded"
            />
            <label htmlFor="rooting_hormone" className="text-sm font-semibold" style={{ color: "#F5F3FF" }}>
              Using rooting hormone
            </label>
          </div>

          {formData.rooting_hormone_used && (
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: "#F5F3FF" }}>
                Rooting Hormone Type/Brand
              </label>
              <input
                type="text"
                value={formData.rooting_hormone_type}
                onChange={(e) => setFormData(prev => ({ ...prev, rooting_hormone_type: e.target.value }))}
                placeholder="e.g., IBA powder, Clonex gel"
                className="glass-input w-full px-4 py-3 rounded-2xl"
                style={{ color: "#F5F3FF" }}
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: "#F5F3FF" }}>
              Growing Medium
            </label>
            <input
              type="text"
              value={formData.growing_medium}
              onChange={(e) => setFormData(prev => ({ ...prev, growing_medium: e.target.value }))}
              placeholder="e.g., Perlite/vermiculite mix, water"
              className="glass-input w-full px-4 py-3 rounded-2xl"
              style={{ color: "#F5F3FF" }}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: "#F5F3FF" }}>
              Container Type
            </label>
            <input
              type="text"
              value={formData.container_type}
              onChange={(e) => setFormData(prev => ({ ...prev, container_type: e.target.value }))}
              placeholder="e.g., Covered tray, plastic bag, humidity dome"
              className="glass-input w-full px-4 py-3 rounded-2xl"
              style={{ color: "#F5F3FF" }}
            />
          </div>
        </div>

        {/* Environmental Conditions */}
        <div className="glass-card rounded-3xl p-6 space-y-4">
          <h3 className="text-lg font-bold mb-4" style={{ 
            color: "#F5F3FF",
            textShadow: "0 1px 3px rgba(32, 24, 51, 0.4)",
            fontFamily: "'Playfair Display', Georgia, serif"
          }}>
            Environment & Tracking
          </h3>

          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: "#F5F3FF" }}>
              Environmental Conditions
            </label>
            <textarea
              value={formData.environmental_conditions}
              onChange={(e) => setFormData(prev => ({ ...prev, environmental_conditions: e.target.value }))}
              placeholder="Light levels, temperature, humidity notes..."
              rows={3}
              className="glass-input w-full px-4 py-3 rounded-2xl resize-none"
              style={{ color: "#F5F3FF" }}
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: "#F5F3FF" }}>
                Number of Attempts
              </label>
              <input
                type="number"
                min="1"
                value={formData.total_attempts}
                onChange={(e) => setFormData(prev => ({ ...prev, total_attempts: e.target.value }))}
                className="glass-input w-full px-4 py-3 rounded-2xl"
                style={{ color: "#F5F3FF" }}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: "#F5F3FF" }}>
                Expected Completion Date
              </label>
              <input
                type="date"
                value={formData.expected_completion_date}
                onChange={(e) => setFormData(prev => ({ ...prev, expected_completion_date: e.target.value }))}
                className="glass-input w-full px-4 py-3 rounded-2xl"
                style={{ color: "#F5F3FF" }}
              />
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
            placeholder="Additional observations, goals, or notes..."
            rows={4}
            className="glass-input w-full px-4 py-3 rounded-2xl resize-none"
            style={{ color: "#F5F3FF" }}
          />
        </div>

        {/* Submit Buttons */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => navigate(createPageUrl("Projects"))}
            className="glass-button px-8 py-4 rounded-2xl font-semibold"
            style={{ color: "#DDD6FE" }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={createMutation.isPending}
            className="glass-accent-moss flex-1 px-8 py-4 rounded-2xl font-semibold disabled:opacity-50"
            style={{ color: "#A7F3D0" }}
          >
            {createMutation.isPending ? "Creating..." : "Create Project"}
          </button>
        </div>
      </form>
    </div>
  );
}