
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { createPageUrl } from "@/utils";
import { toast } from "sonner";

export default function EditPropagationProject() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const projectId = urlParams.get('id');

  const [formData, setFormData] = useState({
    project_name: "",
    parent_plant_id: "",
    propagation_method: "leaf_cutting",
    start_date: "",
    rooting_hormone_used: false,
    rooting_hormone_type: "",
    growing_medium: "",
    container_type: "",
    environmental_conditions: "",
    expected_completion_date: "",
    actual_completion_date: "",
    success_count: 0,
    total_attempts: 1,
    notes: "",
    status: "active"
  });

  const { data: project, isLoading: projectLoading } = useQuery({
    queryKey: ['propagationProject', projectId],
    queryFn: () => base44.entities.PropagationProject.filter({ id: projectId }).then(projects => projects[0]),
    enabled: !!projectId
  });

  const { data: plants = [] } = useQuery({
    queryKey: ['plants'],
    queryFn: () => base44.entities.Plant.list(),
    initialData: []
  });

  useEffect(() => {
    if (project) {
      setFormData({
        project_name: project.project_name || "",
        parent_plant_id: project.parent_plant_id || "",
        propagation_method: project.propagation_method || "leaf_cutting",
        start_date: project.start_date || "",
        rooting_hormone_used: project.rooting_hormone_used || false,
        rooting_hormone_type: project.rooting_hormone_type || "",
        growing_medium: project.growing_medium || "",
        container_type: project.container_type || "",
        environmental_conditions: project.environmental_conditions || "",
        expected_completion_date: project.expected_completion_date || "",
        actual_completion_date: project.actual_completion_date || "",
        success_count: project.success_count || 0,
        total_attempts: project.total_attempts || 1,
        notes: project.notes || "",
        status: project.status || "active"
      });
    }
  }, [project]);

  const updateMutation = useMutation({
    mutationFn: (projectData) => base44.entities.PropagationProject.update(projectId, projectData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['propagationProject', projectId] });
      queryClient.invalidateQueries({ queryKey: ['propagationProjects'] });
      toast.success("Project updated!", {
        description: "Your changes have been saved."
      });
      navigate(createPageUrl(`PropagationProjectDetail?id=${projectId}`));
    },
    onError: (error) => {
      toast.error("Update failed", {
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
          if (['total_attempts', 'success_count'].includes(key)) return [key, Number(value)];
          return [key, value];
        })
    );
    updateMutation.mutate(cleanedData);
  };

  if (projectLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="glass-card w-16 h-16 rounded-2xl flex items-center justify-center animate-pulse glow-violet p-2">
          <img 
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/690e3cd78523fb5fba0a8466/632f6e485_PlantLogos.png"
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
          onClick={() => navigate(createPageUrl(`PropagationProjectDetail?id=${projectId}`))}
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
            Edit Propagation Project
          </h1>
          <p style={{ color: "var(--text-secondary)" }}>Update project details</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="glass-card rounded-3xl p-6 space-y-4">
          <h3 className="text-lg font-bold mb-4" style={{ 
            color: "var(--text-primary)",
            textShadow: "var(--heading-shadow)",
            fontFamily: "'Playfair Display', Georgia, serif"
          }}>
            Basic Information
          </h3>

          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
              Project Name *
            </label>
            <input
              type="text"
              required
              value={formData.project_name}
              onChange={(e) => setFormData(prev => ({ ...prev, project_name: e.target.value }))}
              className="glass-input w-full px-4 py-3 rounded-2xl"
              style={{ color: "var(--text-primary)" }}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
              Parent Plant *
            </label>
            <select
              required
              value={formData.parent_plant_id}
              onChange={(e) => setFormData(prev => ({ ...prev, parent_plant_id: e.target.value }))}
              className="glass-input w-full px-4 py-3 rounded-2xl"
              style={{ color: "var(--text-primary)" }}
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
              <label className="block text-sm font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
                Propagation Method *
              </label>
              <select
                value={formData.propagation_method}
                onChange={(e) => setFormData(prev => ({ ...prev, propagation_method: e.target.value }))}
                className="glass-input w-full px-4 py-3 rounded-2xl"
                style={{ color: "var(--text-primary)" }}
              >
                <option value="leaf_cutting">Leaf Cutting</option>
                <option value="sucker">Sucker</option>
                <option value="crown_division">Crown Division</option>
                <option value="stem_cutting">Stem Cutting</option>
                <option value="tissue_culture">Tissue Culture</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
                Start Date *
              </label>
              <input
                type="date"
                required
                value={formData.start_date}
                onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                className="glass-input w-full px-4 py-3 rounded-2xl"
                style={{ color: "var(--text-primary)" }}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
              Status
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

        {/* Rooting Details */}
        <div className="glass-card rounded-3xl p-6 space-y-4">
          <h3 className="text-lg font-bold mb-4" style={{ 
            color: "var(--text-primary)",
            textShadow: "var(--heading-shadow)",
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
            <label htmlFor="rooting_hormone" className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
              Using rooting hormone
            </label>
          </div>

          {formData.rooting_hormone_used && (
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
                Rooting Hormone Type/Brand
              </label>
              <input
                type="text"
                value={formData.rooting_hormone_type}
                onChange={(e) => setFormData(prev => ({ ...prev, rooting_hormone_type: e.target.value }))}
                placeholder="e.g., IBA powder, Clonex gel"
                className="glass-input w-full px-4 py-3 rounded-2xl"
                style={{ color: "var(--text-primary)" }}
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
              Growing Medium
            </label>
            <input
              type="text"
              value={formData.growing_medium}
              onChange={(e) => setFormData(prev => ({ ...prev, growing_medium: e.target.value }))}
              placeholder="e.g., Perlite/vermiculite mix, water"
              className="glass-input w-full px-4 py-3 rounded-2xl"
              style={{ color: "var(--text-primary)" }}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
              Container Type
            </label>
            <input
              type="text"
              value={formData.container_type}
              onChange={(e) => setFormData(prev => ({ ...prev, container_type: e.target.value }))}
              placeholder="e.g., Covered tray, plastic bag, humidity dome"
              className="glass-input w-full px-4 py-3 rounded-2xl"
              style={{ color: "var(--text-primary)" }}
            />
          </div>
        </div>

        {/* Environment & Tracking */}
        <div className="glass-card rounded-3xl p-6 space-y-4">
          <h3 className="text-lg font-bold mb-4" style={{ 
            color: "var(--text-primary)",
            textShadow: "var(--heading-shadow)",
            fontFamily: "'Playfair Display', Georgia, serif"
          }}>
            Environment & Tracking
          </h3>

          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
              Environmental Conditions
            </label>
            <textarea
              value={formData.environmental_conditions}
              onChange={(e) => setFormData(prev => ({ ...prev, environmental_conditions: e.target.value }))}
              placeholder="Light levels, temperature, humidity notes..."
              rows={3}
              className="glass-input w-full px-4 py-3 rounded-2xl resize-none"
              style={{ color: "var(--text-primary)" }}
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
                Success Count
              </label>
              <input
                type="number"
                min="0"
                value={formData.success_count}
                onChange={(e) => setFormData(prev => ({ ...prev, success_count: e.target.value }))}
                className="glass-input w-full px-4 py-3 rounded-2xl"
                style={{ color: "var(--text-primary)" }}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
                Total Attempts
              </label>
              <input
                type="number"
                min="1"
                value={formData.total_attempts}
                onChange={(e) => setFormData(prev => ({ ...prev, total_attempts: e.target.value }))}
                className="glass-input w-full px-4 py-3 rounded-2xl"
                style={{ color: "var(--text-primary)" }}
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
                Expected Completion Date
              </label>
              <input
                type="date"
                value={formData.expected_completion_date}
                onChange={(e) => setFormData(prev => ({ ...prev, expected_completion_date: e.target.value }))}
                className="glass-input w-full px-4 py-3 rounded-2xl"
                style={{ color: "var(--text-primary)" }}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
                Actual Completion Date
              </label>
              <input
                type="date"
                value={formData.actual_completion_date}
                onChange={(e) => setFormData(prev => ({ ...prev, actual_completion_date: e.target.value }))}
                className="glass-input w-full px-4 py-3 rounded-2xl"
                style={{ color: "var(--text-primary)" }}
              />
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="glass-card rounded-3xl p-6">
          <label className="block text-sm font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
            Notes
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            placeholder="Additional observations, goals, or notes..."
            rows={4}
            className="glass-input w-full px-4 py-3 rounded-2xl resize-none"
            style={{ color: "var(--text-primary)" }}
          />
        </div>

        {/* Submit Buttons */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => navigate(createPageUrl(`PropagationProjectDetail?id=${projectId}`))}
            className="glass-button px-8 py-4 rounded-2xl font-semibold"
            style={{ color: "var(--text-secondary)" }}
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
  );
}
