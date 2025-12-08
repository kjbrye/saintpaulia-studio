import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Edit, Trash2, Plus, Target, Sparkles, Calendar, Sprout, TrendingUp, Award, BookText } from "lucide-react";
import { format } from "date-fns";
import { createPageUrl } from "@/utils";
import OffspringForm from "../components/hybridization/OffspringForm";
import OffspringGrid from "../components/hybridization/OffspringGrid";
import HybridizationLogForm from "../components/hybridization/HybridizationLogForm";
import HybridizationLogTimeline from "../components/hybridization/HybridizationLogTimeline";
import GenealogyTree from "../components/hybridization/GenealogyTree";
import TraitInheritancePrediction from "../components/hybridization/TraitInheritancePrediction";

const LOGO_URL = "/wax seal.svg";

const statusConfig = {
  planning: { color: "from-purple-200 to-purple-300", text: "Planning", textColor: "#9333EA", bg: "rgba(147, 51, 234, 0.2)", border: "rgba(147, 51, 234, 0.3)" },
  active: { color: "from-emerald-200 to-emerald-300", text: "Active", textColor: "#059669", bg: "rgba(5, 150, 105, 0.2)", border: "rgba(5, 150, 105, 0.3)" },
  completed: { color: "from-blue-200 to-blue-300", text: "Completed", textColor: "#2563EB", bg: "rgba(37, 99, 235, 0.2)", border: "rgba(37, 99, 235, 0.3)" },
  archived: { color: "from-gray-200 to-gray-300", text: "Archived", textColor: "#6B7280", bg: "rgba(107, 114, 128, 0.2)", border: "rgba(107, 114, 128, 0.3)" }
};

export default function ProjectDetail() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const projectId = urlParams.get('id');
  const [showOffspringForm, setShowOffspringForm] = useState(false);
  const [editingOffspring, setEditingOffspring] = useState(null);
  const [showLogForm, setShowLogForm] = useState(false);
  const [editingLog, setEditingLog] = useState(null);
  const [activeTab, setActiveTab] = useState("offspring");

  const { data: project, isLoading } = useQuery({
    queryKey: ['hybridizationProject', projectId],
    queryFn: () => base44.entities.HybridizationProject.filter({ id: projectId }).then(projects => projects[0]),
    enabled: !!projectId
  });

  const { data: offspring = [] } = useQuery({
    queryKey: ['offspring', projectId],
    queryFn: () => base44.entities.Offspring.filter({ project_id: projectId }, '-updated_date'),
    enabled: !!projectId,
    initialData: []
  });

  const { data: allPlants = [] } = useQuery({
    queryKey: ['plants'],
    queryFn: () => base44.entities.Plant.list(),
    initialData: [],
  });

  const { data: hybridizationLogs = [] } = useQuery({
    queryKey: ['hybridizationLogs', projectId],
    queryFn: () => base44.entities.HybridizationLog.filter({ project_id: projectId }, '-log_date'),
    enabled: !!projectId,
    initialData: []
  });

  const deleteMutation = useMutation({
    mutationFn: () => base44.entities.HybridizationProject.delete(projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hybridizationProjects'] });
      navigate(createPageUrl("Projects"));
    }
  });

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete ${project.project_name}? This will also delete all offspring records.`)) {
      deleteMutation.mutate();
    }
  };

  const handleEditOffspring = (offspringItem) => {
    setEditingOffspring(offspringItem);
    setShowOffspringForm(true);
  };

  const handleCloseOffspringForm = () => {
    setShowOffspringForm(false);
    setEditingOffspring(null);
  };

  const handleEditLog = (log) => {
    setEditingLog(log);
    setShowLogForm(true);
  };

  const handleCloseLogForm = () => {
    setShowLogForm(false);
    setEditingLog(null);
  };

  const getPlantName = (plantId) => {
    const plant = allPlants.find(p => p.id === plantId);
    return plant?.cultivar_name || "Unknown";
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

  const normalizedOffspring = (offspring || []).map(off => ({
    ...off,
    observed_traits: Array.isArray(off.observed_traits)
      ? off.observed_traits
      : typeof off.observed_traits === 'string'
        ? off.observed_traits.split(',').map(trait => trait.trim()).filter(Boolean)
        : []
  }));

  const normalizedLogs = (hybridizationLogs || []).map(log => ({
    ...log,
    traits_observed: Array.isArray(log.traits_observed)
      ? log.traits_observed
      : typeof log.traits_observed === 'string'
        ? log.traits_observed.split(',').map(trait => trait.trim()).filter(Boolean)
        : []
  }));

  const config = statusConfig[project.status];
  const bloomedCount = normalizedOffspring.filter(o => o.status === "bloomed").length;
  const selectedCount = normalizedOffspring.filter(o => o.status === "selected").length;
  
  // Get parent plants for genealogy
  const seedParent = project.seed_parent_id ? allPlants.find(p => p.id === project.seed_parent_id) : null;
  const pollenParent = project.pollen_parent_id ? allPlants.find(p => p.id === project.pollen_parent_id) : null;

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
          <div className="flex items-center gap-3 mb-1 flex-wrap">
            <h1 className="text-3xl font-bold" style={{ 
              color: "var(--text-primary)",
              textShadow: "var(--heading-shadow)",
              fontFamily: "'Playfair Display', Georgia, serif"
            }}>
              {project.project_name}
            </h1>
            <div 
              className="px-3 py-1.5 rounded-2xl text-xs font-semibold backdrop-blur-xl"
              style={{
                background: `linear-gradient(135deg, ${config.bg} 0%, ${config.bg} 100%)`,
                border: `1px solid ${config.border}`,
                color: config.textColor
              }}
            >
              {config.text}
            </div>
            {project.project_type === "goal-oriented" ? (
              <Target className="w-5 h-5" style={{ color: "#C4B5FD", strokeWidth: 1.5 }} />
            ) : (
              <Sparkles className="w-5 h-5" style={{ color: "#A7F3D0", strokeWidth: 1.5 }} />
            )}
          </div>
          {project.goal_description && (
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{project.goal_description}</p>
          )}
        </div>
        <button
          onClick={() => navigate(createPageUrl(`EditProject?id=${projectId}`))}
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
        {/* Left Column - Project Info */}
        <div className="lg:col-span-1 space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="glass-card rounded-3xl p-4 text-center">
              <Sprout className="w-6 h-6 mx-auto mb-2" style={{ color: "#A7F3D0", strokeWidth: 1.5 }} />
              <p className="text-2xl font-bold" style={{ 
                color: "var(--text-primary)",
                fontFamily: "'Playfair Display', Georgia, serif"
              }}>
                {normalizedOffspring.length}
              </p>
              <p className="text-xs" style={{ color: "var(--text-secondary)" }}>Total Seedlings</p>
            </div>
            <div className="glass-card rounded-3xl p-4 text-center">
              <TrendingUp className="w-6 h-6 mx-auto mb-2" style={{ color: "#C4B5FD", strokeWidth: 1.5 }} />
              <p className="text-2xl font-bold" style={{ 
                color: "var(--text-primary)",
                fontFamily: "'Playfair Display', Georgia, serif"
              }}>
                {bloomedCount}
              </p>
              <p className="text-xs" style={{ color: "var(--text-secondary)" }}>Bloomed</p>
            </div>
          </div>

          {selectedCount > 0 && (
            <div className="glass-accent-moss rounded-3xl p-4 text-center">
              <Award className="w-8 h-8 mx-auto mb-2" style={{ color: "#A7F3D0", strokeWidth: 1.5 }} />
              <p className="text-2xl font-bold" style={{ color: "#A7F3D0" }}>
                {selectedCount} Selected
              </p>
              <p className="text-xs" style={{ color: "#A7F3D0", opacity: 0.8 }}>
                Promising cultivars
              </p>
            </div>
          )}

          {/* Parent Info */}
          <div className="glass-card rounded-3xl p-6 space-y-4">
            <h3 className="text-lg font-bold" style={{ 
              color: "var(--text-primary)",
              textShadow: "var(--heading-shadow)",
              fontFamily: "'Playfair Display', Georgia, serif"
            }}>
              Parent Plants
            </h3>

            {project.seed_parent_id && (
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: "var(--text-secondary)", opacity: 0.8 }}>
                  Seed Parent (♀)
                </p>
                <p className="font-semibold" style={{ color: "var(--text-primary)" }}>
                  {getPlantName(project.seed_parent_id)}
                </p>
              </div>
            )}

            {project.pollen_parent_id && (
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: "var(--text-secondary)", opacity: 0.8 }}>
                  Pollen Parent (♂)
                </p>
                <p className="font-semibold" style={{ color: "var(--text-primary)" }}>
                  {getPlantName(project.pollen_parent_id)}
                </p>
              </div>
            )}

            {project.cross_date && (
              <div className="pt-3" style={{ borderTop: "1px solid rgba(227, 201, 255, 0.2)" }}>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" style={{ color: "#C4B5FD", strokeWidth: 1.8 }} />
                  <div>
                    <p className="text-xs font-medium" style={{ color: "var(--text-secondary)", opacity: 0.8 }}>
                      Cross Date
                    </p>
                    <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                      {format(new Date(project.cross_date), "MMM d, yyyy")}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Expected Traits */}
          {Array.isArray(project.expected_traits) && project.expected_traits.length > 0 && (
            <div className="glass-card rounded-3xl p-6">
              <h3 className="text-lg font-bold mb-3" style={{
                color: "var(--text-primary)",
                textShadow: "var(--heading-shadow)",
                fontFamily: "'Playfair Display', Georgia, serif"
              }}>
                Expected Traits
              </h3>
              <div className="flex flex-wrap gap-2">
                {project.expected_traits.map((trait, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1.5 rounded-xl text-xs font-medium backdrop-blur-xl"
                    style={{
                      background: "linear-gradient(135deg, rgba(154, 226, 211, 0.15) 0%, rgba(154, 226, 211, 0.1) 100%)",
                      border: "1px solid rgba(154, 226, 211, 0.3)",
                      color: "#A7F3D0"
                    }}
                  >
                    {trait}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Additional Info */}
          {(project.growing_conditions || project.notes) && (
            <div className="glass-card rounded-3xl p-6 space-y-4">
              {project.growing_conditions && (
                <div>
                  <p className="text-xs font-medium mb-2" style={{ color: "var(--text-secondary)", opacity: 0.8 }}>
                    Growing Conditions
                  </p>
                  <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                    {project.growing_conditions}
                  </p>
                </div>
              )}

              {project.notes && (
                <div className={project.growing_conditions ? "pt-4" : ""} 
                  style={project.growing_conditions ? { borderTop: "1px solid rgba(227, 201, 255, 0.2)" } : {}}>
                  <p className="text-xs font-medium mb-2" style={{ color: "var(--text-secondary)", opacity: 0.8 }}>
                    Notes
                  </p>
                  <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                    {project.notes}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column - Offspring & Logs */}
        <div className="lg:col-span-2 space-y-6">
          {/* Genealogy Tree */}
          {(seedParent || pollenParent) && (
            <GenealogyTree 
              project={project}
              seedParent={seedParent}
              pollenParent={pollenParent}
              allPlants={allPlants}
            />
          )}

          {/* Trait Inheritance Prediction */}
          {(seedParent && pollenParent) && (
            <TraitInheritancePrediction 
              seedParent={seedParent}
              pollenParent={pollenParent}
            />
          )}

          {/* Tab Navigation */}
          <div className="glass-card rounded-3xl p-2 grid grid-cols-2 gap-2">
            <button
              onClick={() => setActiveTab("offspring")}
              className={`px-4 py-3 rounded-2xl font-semibold transition-all backdrop-blur-md ${
                activeTab === "offspring"
                  ? "glass-accent-lavender"
                  : "glass-button"
              }`}
              style={{ 
                color: activeTab === "offspring" ? "var(--text-primary)" : "var(--text-secondary)"
              }}
            >
              <Sprout className="w-4 h-4 inline mr-2" style={{ strokeWidth: 2 }} />
              <span className="hidden sm:inline">Offspring</span>
            </button>
            <button
              onClick={() => setActiveTab("logs")}
              className={`px-4 py-3 rounded-2xl font-semibold transition-all backdrop-blur-md ${
                activeTab === "logs"
                  ? "glass-accent-moss"
                  : "glass-button"
              }`}
              style={{ 
                color: activeTab === "logs" ? "var(--text-primary)" : "var(--text-secondary)"
              }}
            >
              <BookText className="w-4 h-4 inline mr-2" style={{ strokeWidth: 2 }} />
              <span className="hidden sm:inline">Timeline</span>
            </button>
          </div>

          {/* Offspring Tab */}
          {activeTab === "offspring" && (
            <div className="glass-card rounded-3xl p-6">
              <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
                <h2 className="text-xl font-bold" style={{ 
                  color: "var(--text-primary)",
                  textShadow: "var(--heading-shadow)",
                  fontFamily: "'Playfair Display', Georgia, serif"
                }}>
                  Offspring
                </h2>
                <button
                  onClick={() => setShowOffspringForm(true)}
                  className="glass-accent-lavender px-5 py-2.5 rounded-2xl font-semibold flex items-center gap-2"
                  style={{ color: "#F0EBFF" }}
                >
                  <Plus className="w-4 h-4" style={{ strokeWidth: 2 }} />
                  <span className="hidden sm:inline">Add Seedling</span>
                </button>
              </div>

              <OffspringGrid
                offspring={normalizedOffspring}
                onEdit={handleEditOffspring}
                projectId={projectId}
              />
            </div>
          )}

          {/* Logs Tab */}
          {activeTab === "logs" && (
            <div className="glass-card rounded-3xl p-6">
              <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
                <h2 className="text-xl font-bold" style={{ 
                  color: "var(--text-primary)",
                  textShadow: "var(--heading-shadow)",
                  fontFamily: "'Playfair Display', Georgia, serif"
                }}>
                  Hybridization Timeline
                </h2>
                <button
                  onClick={() => setShowLogForm(true)}
                  className="glass-accent-moss px-5 py-2.5 rounded-2xl font-semibold flex items-center gap-2"
                  style={{ color: "#A7F3D0" }}
                >
                  <Plus className="w-4 h-4" style={{ strokeWidth: 2 }} />
                  <span className="hidden sm:inline">New Log Entry</span>
                </button>
              </div>

              <HybridizationLogTimeline
                logs={normalizedLogs}
                offspring={normalizedOffspring}
                onEdit={handleEditLog}
                projectId={projectId}
              />
            </div>
          )}
        </div>
      </div>

      {showOffspringForm && (
        <OffspringForm
          projectId={projectId}
          offspring={editingOffspring}
          onClose={handleCloseOffspringForm}
        />
      )}

      {showLogForm && (
        <HybridizationLogForm
          projectId={projectId}
          log={editingLog}
          onClose={handleCloseLogForm}
        />
      )}
    </div>
  );
}