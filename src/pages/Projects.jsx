
import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Beaker, Search, ArrowLeft, Leaf } from "lucide-react";
import EmptyState from "../components/shared/EmptyState";
import BackToTop from "../components/shared/BackToTop";

const LOGO_URL = "/wax seal.svg";

const STATUS_CONFIG = {
  planning: { color: "#C4B5FD", bg: "rgba(196, 181, 253, 0.2)", border: "rgba(196, 181, 253, 0.4)", text: "Planning" },
  active: { color: "#A7F3D0", bg: "rgba(154, 226, 211, 0.2)", border: "rgba(154, 226, 211, 0.4)", text: "Active" },
  completed: { color: "#93C5FD", bg: "rgba(147, 197, 253, 0.2)", border: "rgba(147, 197, 253, 0.4)", text: "Completed" },
  archived: { color: "#D1D5DB", bg: "rgba(209, 213, 219, 0.2)", border: "rgba(209, 213, 219, 0.4)", text: "Archived" }
};

export default function Projects() {
  const [searchQuery, setSearchQuery] = useState("");
  const [projectType, setProjectType] = useState("all"); // all, hybridization, propagation

  const { data: hybridizationProjects = [], isLoading: hybridLoading } = useQuery({
    queryKey: ['hybridizationProjects'],
    queryFn: () => base44.entities.HybridizationProject.list('-updated_date'),
    initialData: [],
  });

  const { data: propagationProjects = [], isLoading: propLoading } = useQuery({
    queryKey: ['propagationProjects'],
    queryFn: () => base44.entities.PropagationProject.list('-updated_date'),
    initialData: [],
  });

  const { data: plants = [] } = useQuery({
    queryKey: ['plants'],
    queryFn: () => base44.entities.Plant.list(),
    initialData: []
  });

  const isLoading = hybridLoading || propLoading;

  // Combine and filter projects
  const allProjects = [
    ...hybridizationProjects.map(p => ({ ...p, type: 'hybridization' })),
    ...propagationProjects.map(p => ({ ...p, type: 'propagation' }))
  ].filter(project => {
    const searchMatch = project.project_name?.toLowerCase().includes(searchQuery.toLowerCase());
    const typeMatch = projectType === 'all' || project.type === projectType;
    return searchMatch && typeMatch;
  });

  const getParentPlant = (plantId) => plants.find(p => p.id === plantId);

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <Link to={createPageUrl("Collection")}>
              <button className="glass-button w-12 h-12 rounded-2xl flex items-center justify-center"
                style={{ color: "var(--accent)" }}>
                <ArrowLeft className="w-5 h-5" style={{ strokeWidth: 2 }} />
              </button>
            </Link>
            <div className="flex items-center gap-4">
              <div className="glass-card w-16 h-16 rounded-3xl flex items-center justify-center glow-violet p-2">
                <img 
                  src={LOGO_URL} 
                  alt="Projects" 
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h1 className="text-4xl font-bold" style={{ 
                  color: 'var(--text-primary)',
                  textShadow: 'var(--heading-shadow)',
                  fontFamily: "'Playfair Display', Georgia, serif"
                }}>
                  Breeding & Propagation
                </h1>
                <p className="text-muted" style={{ color: 'var(--text-secondary)' }}>
                  {allProjects.length} {allProjects.length === 1 ? 'project' : 'projects'} in progress
                </p>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex gap-3 flex-col sm:flex-row">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5" 
                style={{ color: 'var(--text-muted)', opacity: 0.7, strokeWidth: 1.5 }} />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="glass-input w-full pl-12 pr-4 py-4 rounded-3xl"
                style={{ color: 'var(--text-primary)' }}
              />
            </div>

            <select
              value={projectType}
              onChange={(e) => setProjectType(e.target.value)}
              className="glass-input px-6 py-4 rounded-3xl"
              style={{ color: 'var(--text-primary)' }}
            >
              <option value="all">All Projects</option>
              <option value="hybridization">Hybridization</option>
              <option value="propagation">Propagation</option>
            </select>

            <div className="flex gap-3">
              <Link to={createPageUrl("AddProject")}>
                <button className="glass-accent-lavender w-full sm:w-auto px-6 py-4 rounded-3xl font-semibold flex items-center justify-center gap-2 hover:shadow-lg transition-all"
                  style={{ color: '#F0EBFF' }}>
                  <Beaker className="w-5 h-5" style={{ strokeWidth: 2 }} />
                  <span className="hidden sm:inline">New Hybridization</span>
                  <span className="sm:hidden">Hybridization</span>
                </button>
              </Link>
              <Link to={createPageUrl("AddPropagationProject")}>
                <button className="glass-accent-moss w-full sm:w-auto px-6 py-4 rounded-3xl font-semibold flex items-center justify-center gap-2 hover:shadow-lg transition-all"
                  style={{ color: '#A7F3D0' }}>
                  <Leaf className="w-5 h-5" style={{ strokeWidth: 2 }} />
                  <span className="hidden sm:inline">New Propagation</span>
                  <span className="sm:hidden">Propagation</span>
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* Projects List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="glass-card w-16 h-16 rounded-3xl flex items-center justify-center animate-pulse glow-violet p-2">
              <img 
                src={LOGO_URL} 
                alt="Loading" 
                className="w-full h-full object-contain"
                style={{ opacity: 0.6 }}
              />
            </div>
          </div>
        ) : allProjects.length === 0 ? (
          <div className="glass-card rounded-3xl">
            {hybridizationProjects.length === 0 && propagationProjects.length === 0 ? (
              <EmptyState
                icon={Beaker}
                title="Start Your First Project"
                description="Track your hybridization crosses and propagation batches. Document offspring traits, monitor success rates, and maintain detailed breeding records."
                actionText="Hybridization Project"
                actionLink="AddProject"
                secondaryActionText="Propagation Project"
                secondaryActionLink="AddPropagationProject"
                variant="default"
                size="large"
              />
            ) : (
              <EmptyState
                icon={Search}
                title="No Projects Found"
                description="No projects match your current search or filter criteria. Try adjusting your filters to see more results."
                actionText="Clear Search"
                onAction={() => setSearchQuery("")}
                variant="info"
                size="medium"
              />
            )}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {allProjects.map(project => {
              const statusConfig = STATUS_CONFIG[project.status] || STATUS_CONFIG.active;
              const detailUrl = project.type === 'hybridization' 
                ? `ProjectDetail?id=${project.id}`
                : `PropagationProjectDetail?id=${project.id}`;
              
              let parentInfo = null;
              if (project.type === 'propagation') {
                const parent = getParentPlant(project.parent_plant_id);
                parentInfo = parent?.cultivar_name || "Unknown parent";
              } else {
                const seedParent = getParentPlant(project.seed_parent_id);
                const pollenParent = getParentPlant(project.pollen_parent_id);
                if (seedParent && pollenParent) {
                  parentInfo = `${seedParent.cultivar_name} × ${pollenParent.cultivar_name}`;
                } else if (seedParent || pollenParent) {
                  parentInfo = seedParent?.cultivar_name || pollenParent?.cultivar_name;
                }
              }

              return (
                <Link key={`${project.type}-${project.id}`} to={createPageUrl(detailUrl)}>
                  <div className="glass-card rounded-3xl p-6 hover:shadow-2xl transition-all duration-300">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                          project.type === 'hybridization' ? 'glass-accent-lavender' : 'glass-accent-moss'
                        }`}>
                          {project.type === 'hybridization' ? (
                            <Beaker className="w-6 h-6" style={{ 
                              color: "#F0EBFF", 
                              strokeWidth: 1.8 
                            }} />
                          ) : (
                            <Leaf className="w-6 h-6" style={{ 
                              color: "#A7F3D0", 
                              strokeWidth: 1.8 
                            }} />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-bold mb-1 truncate" style={{ 
                            color: "var(--text-primary)",
                            textShadow: "var(--heading-shadow)",
                            fontFamily: "'Playfair Display', Georgia, serif"
                          }}>
                            {project.project_name}
                          </h3>
                          <p className="text-xs capitalize mb-1" style={{ 
                            color: project.type === 'hybridization' ? "#E3C9FF" : "#A7F3D0"
                          }}>
                            {project.type === 'hybridization' ? 'Hybridization' : 'Propagation'}
                            {project.type === 'propagation' && project.propagation_method && 
                              ` • ${project.propagation_method.replace(/_/g, ' ')}`
                            }
                          </p>
                          {parentInfo && (
                            <p className="text-xs truncate" style={{ color: "var(--text-secondary)", opacity: 0.8 }}>
                              {parentInfo}
                            </p>
                          )}
                        </div>
                      </div>
                      <span
                        className="px-3 py-1 rounded-xl text-xs font-semibold backdrop-blur-xl ml-3 flex-shrink-0"
                        style={{
                          background: statusConfig.bg,
                          border: `1px solid ${statusConfig.border}`,
                          color: statusConfig.color
                        }}
                      >
                        {statusConfig.text}
                      </span>
                    </div>

                    {project.goal_description && (
                      <p className="text-sm mb-3 line-clamp-2" style={{ color: "var(--text-secondary)" }}>
                        {project.goal_description}
                      </p>
                    )}

                    {project.notes && !project.goal_description && (
                      <p className="text-sm mb-3 line-clamp-2" style={{ color: "var(--text-secondary)" }}>
                        {project.notes}
                      </p>
                    )}

                    {/* Project-specific stats */}
                    {project.type === 'hybridization' && Array.isArray(project.expected_traits) && project.expected_traits.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {project.expected_traits.slice(0, 3).map((trait, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-lg text-xs backdrop-blur-xl"
                            style={{
                              background: "rgba(168, 159, 239, 0.15)",
                              border: "1px solid rgba(168, 159, 239, 0.3)",
                              color: "#C4B5FD"
                            }}
                          >
                            {trait}
                          </span>
                        ))}
                        {project.expected_traits.length > 3 && (
                          <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
                            +{project.expected_traits.length - 3}
                          </span>
                        )}
                      </div>
                    )}

                    {project.type === 'propagation' && (
                      <div className="flex items-center gap-4 mt-3 text-xs" style={{ color: "var(--text-secondary)" }}>
                        {project.success_count !== undefined && project.total_attempts !== undefined && (
                          <span>
                            Success: {project.success_count}/{project.total_attempts}
                          </span>
                        )}
                        {project.rooting_hormone_used && (
                          <span className="px-2 py-0.5 rounded-lg backdrop-blur-xl"
                            style={{
                              background: "rgba(154, 226, 211, 0.15)",
                              border: "1px solid rgba(154, 226, 211, 0.3)",
                              color: "#A7F3D0"
                            }}>
                            Rooting hormone
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
      <BackToTop />
    </div>
  );
}
