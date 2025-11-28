import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { User, ChevronDown, ChevronUp, Maximize2, Download } from "lucide-react";

const LOGO_URL = "/wax seal.svg";

// Plant node component for the tree
function PlantNode({ plant, label, generation, onClick }) {
  if (!plant) {
    return (
      <div className="glass-button rounded-2xl p-4 w-48 opacity-50 cursor-not-allowed">
        <div className="flex items-center justify-center h-32 mb-2"
          style={{
            background: "linear-gradient(135deg, rgba(168, 159, 239, 0.1) 0%, rgba(154, 226, 211, 0.08) 100%)"
          }}>
          <User className="w-12 h-12" style={{ color: "#C4B5FD", opacity: 0.3 }} />
        </div>
        <p className="text-xs text-center" style={{ color: "var(--text-secondary)", opacity: 0.5 }}>
          Unknown {label}
        </p>
      </div>
    );
  }

  const displayName = plant.nickname || plant.cultivar_name;
  const primaryPhoto = plant.photos?.[0];

  return (
    <Link to={createPageUrl(`PlantDetail?id=${plant.id}`)}>
      <div 
        onClick={onClick}
        className="glass-card rounded-2xl p-4 w-48 hover:shadow-2xl transition-all cursor-pointer group relative"
        style={{
          background: generation === 0 
            ? "linear-gradient(135deg, rgba(154, 226, 211, 0.15) 0%, rgba(110, 231, 183, 0.12) 100%)"
            : "linear-gradient(135deg, rgba(168, 159, 239, 0.15) 0%, rgba(154, 226, 211, 0.12) 100%)"
        }}
      >
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 px-3 py-1 rounded-xl text-xs font-semibold backdrop-blur-xl"
          style={{
            background: generation === 0 ? "rgba(154, 226, 211, 0.3)" : "rgba(168, 159, 239, 0.3)",
            border: generation === 0 ? "1px solid rgba(154, 226, 211, 0.5)" : "1px solid rgba(168, 159, 239, 0.5)",
            color: generation === 0 ? "#A7F3D0" : "#C4B5FD"
          }}
        >
          {label}
        </div>

        {/* Plant Photo */}
        <div className="rounded-xl overflow-hidden h-32 mb-3"
          style={{
            boxShadow: "inset 0 2px 8px rgba(32, 24, 51, 0.3)"
          }}>
          {primaryPhoto ? (
            <img 
              src={primaryPhoto} 
              alt={displayName}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center p-4"
              style={{
                background: "linear-gradient(135deg, rgba(168, 159, 239, 0.1) 0%, rgba(154, 226, 211, 0.08) 100%)"
              }}>
              <img 
                src={LOGO_URL} 
                alt={displayName}
                className="w-full h-full object-contain opacity-40"
              />
            </div>
          )}
        </div>

        {/* Plant Info */}
        <div className="text-center">
          <h4 className="font-bold text-sm mb-1 line-clamp-2" style={{ color: "var(--text-primary)" }}>
            {displayName}
          </h4>
          {plant.blossom_color && (
            <p className="text-xs line-clamp-1" style={{ color: "var(--text-secondary)" }}>
              {plant.blossom_color}
            </p>
          )}
        </div>

        {/* Trait Badges */}
        {(plant.blossom_type || plant.leaf_types?.length > 0) && (
          <div className="flex flex-wrap gap-1 mt-2 justify-center">
            {plant.blossom_type && (
              <span className="px-2 py-0.5 rounded-lg text-xs backdrop-blur-xl"
                style={{
                  background: "rgba(168, 159, 239, 0.15)",
                  border: "1px solid rgba(168, 159, 239, 0.3)",
                  color: "#C4B5FD"
                }}>
                {plant.blossom_type}
              </span>
            )}
            {plant.leaf_types?.slice(0, 1).map((type, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 rounded-lg text-xs backdrop-blur-xl"
                style={{
                  background: "rgba(154, 226, 211, 0.15)",
                  border: "1px solid rgba(154, 226, 211, 0.3)",
                  color: "#A7F3D0"
                }}>
                {type}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}

// Connector line component
function Connector({ orientation = "vertical" }) {
  return (
    <div 
      className={orientation === "vertical" ? "w-0.5 h-12 mx-auto" : "h-0.5 w-12"}
      style={{
        background: "linear-gradient(135deg, rgba(168, 159, 239, 0.3) 0%, rgba(154, 226, 211, 0.3) 100%)"
      }}
    />
  );
}

export default function GenealogyTree({ project, seedParent, pollenParent, allPlants }) {
  const [expandedGenerations, setExpandedGenerations] = useState({
    grandparents: false
  });
  const [fullscreen, setFullscreen] = useState(false);

  // Get grandparents
  const seedGrandparents = {
    seed: seedParent?.seed_parent_id ? allPlants.find(p => p.id === seedParent.seed_parent_id) : null,
    pollen: seedParent?.pollen_parent_id ? allPlants.find(p => p.id === seedParent.pollen_parent_id) : null
  };

  const pollenGrandparents = {
    seed: pollenParent?.seed_parent_id ? allPlants.find(p => p.id === pollenParent.seed_parent_id) : null,
    pollen: pollenParent?.pollen_parent_id ? allPlants.find(p => p.id === pollenParent.pollen_parent_id) : null
  };

  const hasGrandparents = seedGrandparents.seed || seedGrandparents.pollen || 
                          pollenGrandparents.seed || pollenGrandparents.pollen;

  const handleExport = () => {
    // Create a simple text representation for export
    let text = `GENEALOGY TREE: ${project.project_name}\n\n`;
    
    if (hasGrandparents && expandedGenerations.grandparents) {
      text += "=== GRANDPARENTS (Generation 2) ===\n";
      if (seedGrandparents.seed) text += `Seed Parent's Seed Parent: ${seedGrandparents.seed.cultivar_name}\n`;
      if (seedGrandparents.pollen) text += `Seed Parent's Pollen Parent: ${seedGrandparents.pollen.cultivar_name}\n`;
      if (pollenGrandparents.seed) text += `Pollen Parent's Seed Parent: ${pollenGrandparents.seed.cultivar_name}\n`;
      if (pollenGrandparents.pollen) text += `Pollen Parent's Pollen Parent: ${pollenGrandparents.pollen.cultivar_name}\n`;
      text += "\n";
    }

    text += "=== PARENTS (Generation 1) ===\n";
    text += `Seed Parent (♀): ${seedParent?.cultivar_name || 'Unknown'}\n`;
    text += `Pollen Parent (♂): ${pollenParent?.cultivar_name || 'Unknown'}\n\n`;

    text += "=== PROJECT (Generation 0) ===\n";
    text += `Cross: ${project.project_name}\n`;
    text += `Expected Traits: ${Array.isArray(project.expected_traits) ? project.expected_traits.join(', ') : 'None specified'}\n`;

    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.project_name}_genealogy.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={`${fullscreen ? 'fixed inset-0 z-50 bg-black/90 backdrop-blur-sm overflow-auto p-8' : ''}`}>
      <div className={`${fullscreen ? 'max-w-7xl mx-auto' : ''}`}>
        <div className="glass-card rounded-3xl p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold mb-1" style={{ 
                color: "var(--text-primary)",
                textShadow: "var(--heading-shadow)",
                fontFamily: "'Playfair Display', Georgia, serif"
              }}>
                Family Tree
              </h2>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                {project.project_name} genealogy
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleExport}
                className="glass-button px-4 py-2 rounded-2xl font-semibold flex items-center gap-2"
                style={{ color: "var(--text-secondary)" }}
              >
                <Download className="w-4 h-4" />
                Export
              </button>
              <button
                onClick={() => setFullscreen(!fullscreen)}
                className="glass-button px-4 py-2 rounded-2xl font-semibold"
                style={{ color: "var(--text-secondary)" }}
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Tree Visualization */}
          <div className="overflow-x-auto pb-4">
            <div className="min-w-max">
              {/* Grandparents Level (Generation 2) - Collapsible */}
              {hasGrandparents && (
                <>
                  <button
                    onClick={() => setExpandedGenerations(prev => ({ ...prev, grandparents: !prev.grandparents }))}
                    className="glass-button px-4 py-2 rounded-2xl font-semibold flex items-center gap-2 mx-auto mb-4"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {expandedGenerations.grandparents ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    {expandedGenerations.grandparents ? 'Hide' : 'Show'} Grandparents
                  </button>

                  {expandedGenerations.grandparents && (
                    <>
                      <div className="flex justify-center gap-24 mb-6">
                        {/* Seed Parent's Parents */}
                        <div className="flex gap-8">
                          <PlantNode 
                            plant={seedGrandparents.seed}
                            label="♀ Grandparent"
                            generation={2}
                          />
                          <PlantNode 
                            plant={seedGrandparents.pollen}
                            label="♂ Grandparent"
                            generation={2}
                          />
                        </div>

                        {/* Pollen Parent's Parents */}
                        <div className="flex gap-8">
                          <PlantNode 
                            plant={pollenGrandparents.seed}
                            label="♀ Grandparent"
                            generation={2}
                          />
                          <PlantNode 
                            plant={pollenGrandparents.pollen}
                            label="♂ Grandparent"
                            generation={2}
                          />
                        </div>
                      </div>

                      {/* Connectors to Parents */}
                      <div className="flex justify-center gap-24 mb-2">
                        <div className="w-48 flex justify-center">
                          <Connector orientation="vertical" />
                        </div>
                        <div className="w-48 flex justify-center">
                          <Connector orientation="vertical" />
                        </div>
                      </div>
                    </>
                  )}
                </>
              )}

              {/* Parents Level (Generation 1) */}
              <div className="flex justify-center items-start gap-8 mb-6">
                <PlantNode 
                  plant={seedParent}
                  label="Seed Parent ♀"
                  generation={1}
                />
                <div className="flex flex-col items-center justify-center pt-20">
                  <span className="text-4xl" style={{ color: "#C4B5FD" }}>×</span>
                  <p className="text-xs mt-1 font-semibold" style={{ color: "var(--text-secondary)" }}>Cross</p>
                </div>
                <PlantNode 
                  plant={pollenParent}
                  label="Pollen Parent ♂"
                  generation={1}
                />
              </div>

              {/* Connector to Project */}
              <div className="flex justify-center mb-2">
                <Connector orientation="vertical" />
              </div>

              {/* Current Project (Generation 0) */}
              <div className="flex justify-center">
                <div className="glass-accent-raised rounded-3xl p-6 w-80">
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                      style={{
                        background: "rgba(154, 226, 211, 0.2)",
                        border: "1px solid rgba(154, 226, 211, 0.4)"
                      }}>
                      <span className="text-3xl">🌱</span>
                    </div>
                    <h3 className="text-xl font-bold mb-2" style={{ 
                      color: "#F0EBFF",
                      fontFamily: "'Playfair Display', Georgia, serif"
                    }}>
                      {project.project_name}
                    </h3>
                    <p className="text-sm mb-3" style={{ color: "#F0EBFF", opacity: 0.8 }}>
                      Current Generation
                    </p>

                    {Array.isArray(project.expected_traits) && project.expected_traits.length > 0 && (
                      <>
                        <p className="text-xs font-semibold mb-2" style={{ color: "#A7F3D0" }}>
                          Expected Traits:
                        </p>
                        <div className="flex flex-wrap gap-1.5 justify-center">
                          {project.expected_traits.map((trait, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 rounded-lg text-xs backdrop-blur-xl"
                              style={{
                                background: "rgba(154, 226, 211, 0.25)",
                                border: "1px solid rgba(154, 226, 211, 0.4)",
                                color: "#A7F3D0"
                              }}>
                              {trait}
                            </span>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Legend */}
              <div className="mt-8 flex justify-center gap-6">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded" style={{ background: "rgba(154, 226, 211, 0.3)" }} />
                  <span className="text-xs" style={{ color: "var(--text-secondary)" }}>Current Project</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded" style={{ background: "rgba(168, 159, 239, 0.3)" }} />
                  <span className="text-xs" style={{ color: "var(--text-secondary)" }}>Parent/Grandparent</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}