
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Edit, Trash2, Leaf, Plus, Calendar, Package, CheckCircle, Thermometer, Droplets } from "lucide-react";
import { createPageUrl } from "@/utils";
import { format } from "date-fns";
import { toast } from "sonner";
import PropagationLogForm from "../components/propagation/PropagationLogForm";
import PropagationLogTimeline from "../components/propagation/PropagationLogTimeline";
import EnvironmentalChart from "../components/propagation/EnvironmentalChart";
import WateringScheduleManager from "../components/propagation/WateringScheduleManager";
import BatchManager from "../components/propagation/BatchManager";

const LOGO_URL = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/690e3cd78523fb5fba0a8466/632f6e485_PlantLogos.png";

export default function PropagationProjectDetail() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const projectId = urlParams.get('id');
  const [showLogForm, setShowLogForm] = useState(false);
  const [editingLog, setEditingLog] = useState(null);
  const [activeTab, setActiveTab] = useState("timeline"); // timeline, environment, batches

  const { data: project, isLoading } = useQuery({
    queryKey: ['propagationProject', projectId],
    queryFn: () => base44.entities.PropagationProject.filter({ id: projectId }).then(projects => projects[0]),
    enabled: !!projectId
  });

  const { data: logs = [] } = useQuery({
    queryKey: ['propagationLogs', projectId],
    queryFn: () => base44.entities.PropagationLog.filter({ project_id: projectId }, '-log_date'),
    enabled: !!projectId
  });

  const { data: plants = [] } = useQuery({
    queryKey: ['plants'],
    queryFn: () => base44.entities.Plant.list(),
    initialData: []
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const logsToDelete = await base44.entities.PropagationLog.filter({ project_id: projectId });
      const batchesToDelete = await base44.entities.PropagationBatch.filter({ project_id: projectId });
      await Promise.all([
        ...logsToDelete.map(log => base44.entities.PropagationLog.delete(log.id)),
        ...batchesToDelete.map(batch => base44.entities.PropagationBatch.delete(batch.id))
      ]);
      await base44.entities.PropagationProject.delete(projectId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['propagationProjects'] });
      queryClient.invalidateQueries({ queryKey: ['propagationLogs'] });
      queryClient.invalidateQueries({ queryKey: ['propagationBatches'] });
      toast.success("Project deleted", {
        description: "The propagation project has been removed."
      });
      navigate(createPageUrl("Projects"));
    },
    onError: (error) => {
      toast.error("Delete failed", {
        description: error.message || "Please try again."
      });
    }
  });

  const updateSuccessMutation = useMutation({
    mutationFn: (data) => base44.entities.PropagationProject.update(projectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['propagationProject', projectId] });
      queryClient.invalidateQueries({ queryKey: ['propagationProjects'] });
      toast.success("Success count updated!");
    }
  });

  const handleDelete = () => {
    if (window.confirm(`Delete "${project.project_name}"? This will also delete all logs and batches.`)) {
      deleteMutation.mutate();
    }
  };

  const handleEditLog = (log) => {
    setEditingLog(log);
    setShowLogForm(true);
  };

  const handleCloseLogForm = () => {
    setShowLogForm(false);
    setEditingLog(null);
  };

  const incrementSuccess = () => {
    const newCount = (project.success_count || 0) + 1;
    if (newCount <= project.total_attempts) {
      updateSuccessMutation.mutate({ success_count: newCount });
    }
  };

  const decrementSuccess = () => {
    const newCount = Math.max(0, (project.success_count || 0) - 1);
    updateSuccessMutation.mutate({ success_count: newCount });
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

  if (!project) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="glass-card rounded-3xl p-12 text-center">
          <p style={{ color: "#F5F3FF" }} className="font-medium">Project not found</p>
        </div>
      </div>
    );
  }

  const parentPlant = plants.find(p => p.id === project.parent_plant_id);
  const successRate = project.total_attempts > 0 
    ? Math.round((project.success_count / project.total_attempts) * 100) 
    : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8 flex-wrap">
        <button
          onClick={() => navigate(createPageUrl("Projects"))}
          className="glass-button w-12 h-12 rounded-2xl flex items-center justify-center"
          style={{ color: "var(--accent)" }}
        >
          <ArrowLeft className="w-5 h-5" style={{ strokeWidth: 2 }} />
        </button>
        <div className="flex-1 min-w-[200px]">
          <h1 className="text-3xl font-bold mb-1" style={{ 
            color: "var(--text-primary)",
            textShadow: "var(--heading-shadow)",
            fontFamily: "'Playfair Display', Georgia, serif"
          }}>
            {project.project_name}
          </h1>
          <p className="text-sm capitalize" style={{ color: "#A7F3D0" }}>
            Propagation • {project.propagation_method?.replace(/_/g, ' ')}
          </p>
        </div>
        <button
          onClick={() => navigate(createPageUrl(`EditPropagationProject?id=${projectId}`))}
          className="glass-accent-moss w-12 h-12 rounded-2xl flex items-center justify-center"
          style={{ color: "#A7F3D0" }}
        >
          <Edit className="w-5 h-5" style={{ strokeWidth: 2 }} />
        </button>
        <button
          onClick={handleDelete}
          className="w-12 h-12 rounded-2xl flex items-center justify-center backdrop-blur-md"
          style={{
            background: "linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(220, 38, 38, 0.15) 100%)",
            border: "1px solid rgba(239, 68, 68, 0.45)",
            color: "#FCA5A5",
            boxShadow: "0 2px 12px rgba(239, 68, 68, 0.35), inset 0 0.5px 0 rgba(255, 255, 255, 0.2)"
          }}
        >
          <Trash2 className="w-5 h-5" style={{ strokeWidth: 2 }} />
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - Project Info & Schedule */}
        <div className="lg:col-span-1 space-y-6">
          {/* Success Rate */}
          <div className="glass-card rounded-3xl p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ 
              color: "var(--text-primary)",
              textShadow: "var(--heading-shadow)",
              fontFamily: "'Playfair Display', Georgia, serif"
            }}>
              <CheckCircle className="w-5 h-5" style={{ color: "#A7F3D0", strokeWidth: 1.5 }} />
              Success Rate
            </h3>
            
            <div className="text-center mb-4">
              <p className="text-5xl font-bold mb-2" style={{ 
                color: successRate >= 70 ? "#A7F3D0" : successRate >= 40 ? "#FCD34D" : "#FCA5A5",
                fontFamily: "'Playfair Display', Georgia, serif"
              }}>
                {successRate}%
              </p>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                {project.success_count} of {project.total_attempts} successful
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={decrementSuccess}
                disabled={project.success_count <= 0}
                className="glass-button flex-1 py-2 rounded-2xl font-semibold disabled:opacity-30"
                style={{ color: "#DDD6FE" }}
              >
                -
              </button>
              <button
                onClick={incrementSuccess}
                disabled={project.success_count >= project.total_attempts}
                className="glass-accent-moss flex-1 py-2 rounded-2xl font-semibold disabled:opacity-30"
                style={{ color: "#A7F3D0" }}
              >
                +
              </button>
            </div>
          </div>

          {/* Watering Schedule */}
          <WateringScheduleManager project={project} />

          {/* Parent Plant */}
          {parentPlant && (
            <div className="glass-card rounded-3xl p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ 
                color: "var(--text-primary)",
                textShadow: "var(--heading-shadow)",
                fontFamily: "'Playfair Display', Georgia, serif"
              }}>
                <Leaf className="w-5 h-5" style={{ color: "#A7F3D0", strokeWidth: 1.5 }} />
                Parent Plant
              </h3>
              <Link to={createPageUrl(`PlantDetail?id=${parentPlant.id}`)}>
                <div className="glass-button rounded-2xl p-4 hover:opacity-90 transition-all">
                  <div className="flex items-center gap-3">
                    {parentPlant.photos?.[0] && (
                      <img 
                        src={parentPlant.photos[0]} 
                        alt={parentPlant.cultivar_name}
                        className="w-16 h-16 rounded-xl object-cover"
                      />
                    )}
                    <div>
                      <p className="font-bold" style={{ color: "var(--text-primary)" }}>
                        {parentPlant.nickname || parentPlant.cultivar_name}
                      </p>
                      {parentPlant.nickname && (
                        <p className="text-xs" style={{ color: "var(--text-secondary)", opacity: 0.8 }}>
                          {parentPlant.cultivar_name}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          )}

          {/* Project Details */}
          <div className="glass-card rounded-3xl p-6">
            <h3 className="text-lg font-bold mb-4" style={{ 
              color: "var(--text-primary)",
              textShadow: "var(--heading-shadow)",
              fontFamily: "'Playfair Display', Georgia, serif"
            }}>
              Project Details
            </h3>

            <div className="space-y-3">
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: "var(--text-secondary)", opacity: 0.8 }}>Status</p>
                <span
                  className="px-3 py-1 rounded-xl text-xs font-semibold backdrop-blur-xl inline-block"
                  style={{
                    background: project.status === 'active' 
                      ? "rgba(154, 226, 211, 0.2)"
                      : project.status === 'completed'
                      ? "rgba(147, 197, 253, 0.2)"
                      : "rgba(196, 181, 253, 0.2)",
                    border: `1px solid ${
                      project.status === 'active' 
                        ? "rgba(154, 226, 211, 0.4)"
                        : project.status === 'completed'
                        ? "rgba(147, 197, 253, 0.4)"
                        : "rgba(196, 181, 253, 0.4)"
                    }`,
                    color: project.status === 'active' 
                      ? "#A7F3D0"
                      : project.status === 'completed'
                      ? "#93C5FD"
                      : "#C4B5FD"
                  }}
                >
                  {project.status}
                </span>
              </div>

              <div>
                <p className="text-xs font-medium mb-1" style={{ color: "var(--text-secondary)", opacity: 0.8 }}>Started</p>
                <p className="text-sm" style={{ color: "var(--text-primary)" }}>
                  {format(new Date(project.start_date), "MMMM d, yyyy")}
                </p>
              </div>

              {/* Environmental Targets */}
              {(project.target_temperature_min || project.target_humidity_min) && (
                <div className="glass-button rounded-2xl p-3 mt-2">
                  <p className="text-xs font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
                    Environmental Targets
                  </p>
                  {project.target_temperature_min && project.target_temperature_max && (
                    <p className="text-xs mb-1" style={{ color: "var(--text-secondary)" }}>
                      <Thermometer className="w-3 h-3 inline mr-1" />
                      Temp: {project.target_temperature_min}°F - {project.target_temperature_max}°F
                    </p>
                  )}
                  {project.target_humidity_min && project.target_humidity_max && (
                    <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                      <Droplets className="w-3 h-3 inline mr-1" />
                      Humidity: {project.target_humidity_min}% - {project.target_humidity_max}%
                    </p>
                  )}
                </div>
              )}

              {project.expected_completion_date && (
                <div>
                  <p className="text-xs font-medium mb-1" style={{ color: "var(--text-secondary)", opacity: 0.8 }}>Expected Completion</p>
                  <p className="text-sm" style={{ color: "var(--text-primary)" }}>
                    {format(new Date(project.expected_completion_date), "MMMM d, yyyy")}
                  </p>
                </div>
              )}

              {project.rooting_hormone_used && (
                <div>
                  <p className="text-xs font-medium mb-1" style={{ color: "var(--text-secondary)", opacity: 0.8 }}>Rooting Hormone</p>
                  <p className="text-sm" style={{ color: "var(--text-primary)" }}>
                    {project.rooting_hormone_type || "Yes"}
                  </p>
                </div>
              )}

              {project.growing_medium && (
                <div>
                  <p className="text-xs font-medium mb-1" style={{ color: "var(--text-secondary)", opacity: 0.8 }}>Growing Medium</p>
                  <p className="text-sm" style={{ color: "var(--text-primary)" }}>{project.growing_medium}</p>
                </div>
              )}

              {project.notes && (
                <div>
                  <p className="text-xs font-medium mb-1" style={{ color: "var(--text-secondary)", opacity: 0.8 }}>Notes</p>
                  <p className="text-sm whitespace-pre-wrap" style={{ color: "var(--text-primary)" }}>
                    {project.notes}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Tabbed Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tab Navigation */}
          <div className="glass-card rounded-3xl p-2 grid grid-cols-3 gap-2">
            <button
              onClick={() => setActiveTab("timeline")}
              className={`px-4 py-3 rounded-2xl font-semibold transition-all ${
                activeTab === "timeline" ? "glass-accent-lavender" : "glass-button"
              }`}
              style={{ color: activeTab === "timeline" ? "#F0EBFF" : "var(--text-secondary)" }}
            >
              <Calendar className="w-4 h-4 inline mr-2" />
              <span className="hidden sm:inline">Timeline</span>
            </button>
            <button
              onClick={() => setActiveTab("environment")}
              className={`px-4 py-3 rounded-2xl font-semibold transition-all ${
                activeTab === "environment" ? "glass-accent-moss" : "glass-button"
              }`}
              style={{ color: activeTab === "environment" ? "#A7F3D0" : "var(--text-secondary)" }}
            >
              <Thermometer className="w-4 h-4 inline mr-2" />
              <span className="hidden sm:inline">Environment</span>
            </button>
            <button
              onClick={() => setActiveTab("batches")}
              className={`px-4 py-3 rounded-2xl font-semibold transition-all ${
                activeTab === "batches" ? "glass-accent-moss" : "glass-button"
              }`}
              style={{ color: activeTab === "batches" ? "#A7F3D0" : "var(--text-secondary)" }}
            >
              <Package className="w-4 h-4 inline mr-2" />
              <span className="hidden sm:inline">Batches</span>
            </button>
          </div>

          {/* Timeline Tab */}
          {activeTab === "timeline" && (
            <div className="glass-card rounded-3xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold" style={{ 
                  color: "var(--text-primary)",
                  textShadow: "var(--heading-shadow)",
                  fontFamily: "'Playfair Display', Georgia, serif"
                }}>
                  Progress Timeline
                </h2>
                <button
                  onClick={() => setShowLogForm(true)}
                  className="glass-accent-moss px-5 py-2.5 rounded-2xl font-semibold flex items-center gap-2"
                  style={{ color: "#A7F3D0" }}
                >
                  <Plus className="w-4 h-4" style={{ strokeWidth: 2 }} />
                  <span className="hidden sm:inline">Log Progress</span>
                </button>
              </div>

              {logs.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="w-8 h-8 mx-auto mb-2" style={{ color: "#C4B5FD", opacity: 0.5 }} />
                  <p className="text-sm" style={{ color: "var(--text-secondary)" }}>No progress logs yet</p>
                </div>
              ) : (
                <PropagationLogTimeline logs={logs} onEdit={handleEditLog} />
              )}
            </div>
          )}

          {/* Environment Tab */}
          {activeTab === "environment" && (
            <EnvironmentalChart logs={logs} project={project} />
          )}

          {/* Batches Tab */}
          {activeTab === "batches" && (
            <BatchManager projectId={projectId} />
          )}
        </div>
      </div>

      {showLogForm && (
        <PropagationLogForm
          projectId={projectId}
          log={editingLog}
          onClose={handleCloseLogForm}
        />
      )}
    </div>
  );
}
