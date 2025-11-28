
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Plus, X, Check, Calendar, Droplets, Sun, Leaf, Beaker, MapPin, Package } from "lucide-react";
import { createPageUrl } from "@/utils";
import { format } from "date-fns";

const LOGO_URL = "/wax seal.svg";

export default function ComparePlants() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const initialPlantIds = urlParams.get('plants')?.split(',').filter(Boolean) || [];
  
  const [selectedPlantIds, setSelectedPlantIds] = useState(initialPlantIds);
  const [showAddModal, setShowAddModal] = useState(false);

  const { data: allPlants = [], isLoading } = useQuery({
    queryKey: ['plants'],
    queryFn: () => base44.entities.Plant.list('-updated_date'),
    initialData: [],
  });

  const selectedPlants = selectedPlantIds.map(id => allPlants.find(p => p.id === id)).filter(Boolean);

  const addPlant = (plantId) => {
    if (selectedPlantIds.length < 4 && !selectedPlantIds.includes(plantId)) {
      setSelectedPlantIds([...selectedPlantIds, plantId]);
      setShowAddModal(false);
    }
  };

  const removePlant = (plantId) => {
    setSelectedPlantIds(selectedPlantIds.filter(id => id !== plantId));
  };

  const comparisonRows = [
    {
      label: "Photo",
      icon: null,
      getValue: (plant) => plant.photos?.[0] || null,
      render: (value) => value ? (
        <img src={value} alt="Plant" className="w-full h-40 object-cover rounded-2xl" />
      ) : (
        <div className="w-full h-40 rounded-2xl flex items-center justify-center"
          style={{ background: "linear-gradient(135deg, rgba(168, 159, 239, 0.15) 0%, rgba(154, 226, 211, 0.12) 100%)" }}>
          <img src={LOGO_URL} alt="No photo" className="w-12 h-12 object-contain opacity-40" />
        </div>
      )
    },
    {
      label: "Cultivar Name",
      icon: Leaf,
      getValue: (plant) => plant.cultivar_name,
      render: (value) => (
        <p className="font-bold text-lg" style={{ 
          color: "var(--text-primary)",
          fontFamily: "'Playfair Display', Georgia, serif"
        }}>
          {value}
        </p>
      )
    },
    {
      label: "Nickname",
      icon: null,
      getValue: (plant) => plant.nickname || "—",
      render: (value) => <p style={{ color: "var(--text-secondary)" }}>{value}</p>
    },
    {
      label: "Hybridizer",
      icon: Beaker,
      getValue: (plant) => plant.hybridizer || "—",
      render: (value) => <p style={{ color: "var(--text-secondary)" }}>{value}</p>
    },
    {
      label: "Year Introduced",
      icon: Calendar,
      getValue: (plant) => plant.year || "—",
      render: (value) => <p style={{ color: "var(--text-secondary)" }}>{value}</p>
    },
    {
      label: "Blossom Type",
      icon: null,
      getValue: (plant) => plant.blossom_type || "—",
      render: (value) => <p className="capitalize" style={{ color: "var(--text-secondary)" }}>{value}</p>
    },
    {
      label: "Blossom Color",
      icon: null,
      getValue: (plant) => plant.blossom_color || "—",
      render: (value) => <p style={{ color: "var(--text-secondary)" }}>{value}</p>
    },
    {
      label: "Leaf Type",
      icon: Leaf,
      getValue: (plant) => (plant.leaf_types && plant.leaf_types.length > 0) ? plant.leaf_types.join(", ") : "—",
      render: (value) => <p className="capitalize" style={{ color: "var(--text-secondary)" }}>{value}</p>
    },
    {
      label: "Variegation",
      icon: null,
      getValue: (plant) => plant.variegation || "—",
      render: (value) => <p style={{ color: "var(--text-secondary)" }}>{value}</p>
    },
    {
      label: "Acquired",
      icon: Calendar,
      getValue: (plant) => plant.acquisition_date,
      render: (value) => value ? (
        <p style={{ color: "var(--text-secondary)" }}>
          {format(new Date(value), "MMM d, yyyy")}
        </p>
      ) : <p style={{ color: "var(--text-secondary)" }}>—</p>
    },
    {
      label: "Source",
      icon: null,
      getValue: (plant) => plant.source || "—",
      render: (value) => <p style={{ color: "var(--text-secondary)" }}>{value}</p>
    },
    {
      label: "Location",
      icon: MapPin,
      getValue: (plant) => plant.location || "—",
      render: (value) => <p style={{ color: "var(--text-secondary)" }}>{value}</p>
    },
    {
      label: "Pot Size",
      icon: Package,
      getValue: (plant) => plant.pot_size,
      render: (value) => value ? (
        <p style={{ color: "var(--text-secondary)" }}>{value}"</p>
      ) : <p style={{ color: "var(--text-secondary)" }}>—</p>
    },
    {
      label: "Soil Mix",
      icon: null,
      getValue: (plant) => plant.soil_mix || "—",
      render: (value) => <p style={{ color: "var(--text-secondary)" }}>{value}</p>
    },
    {
      label: "Watering Interval",
      icon: Droplets,
      getValue: (plant) => plant.watering_interval,
      render: (value) => value ? (
        <p style={{ color: "var(--text-secondary)" }}>Every {value} days</p>
      ) : <p style={{ color: "var(--text-secondary)" }}>—</p>
    },
    {
      label: "Fertilizer Interval",
      icon: Sun,
      getValue: (plant) => plant.fertilizer_interval,
      render: (value) => value ? (
        <p style={{ color: "var(--text-secondary)" }}>Every {value} days</p>
      ) : <p style={{ color: "var(--text-secondary)" }}>—</p>
    },
    {
      label: "Fertilizer (NPK)",
      icon: null,
      getValue: (plant) => plant.fertilizer_npk || "—",
      render: (value) => <p style={{ color: "var(--text-secondary)" }}>{value}</p>
    },
    {
      label: "Last Watered",
      icon: Droplets,
      getValue: (plant) => plant.last_watered,
      render: (value) => value ? (
        <p style={{ color: "var(--text-secondary)" }}>
          {format(new Date(value), "MMM d, yyyy")}
        </p>
      ) : <p style={{ color: "var(--text-secondary)" }}>—</p>
    },
    {
      label: "Last Fertilized",
      icon: Sun,
      getValue: (plant) => plant.last_fertilized,
      render: (value) => value ? (
        <p style={{ color: "var(--text-secondary)" }}>
          {format(new Date(value), "MMM d, yyyy")}
        </p>
      ) : <p style={{ color: "var(--text-secondary)" }}>—</p>
    },
    {
      label: "Last Repotted",
      icon: Package,
      getValue: (plant) => plant.last_repotted,
      render: (value) => value ? (
        <p style={{ color: "var(--text-secondary)" }}>
          {format(new Date(value), "MMM d, yyyy")}
        </p>
      ) : <p style={{ color: "var(--text-secondary)" }}>—</p>
    }
  ];

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
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate(createPageUrl("PlantLibrary"))}
            className="glass-button w-12 h-12 rounded-2xl flex items-center justify-center"
            style={{ color: "var(--accent)" }}
          >
            <ArrowLeft className="w-5 h-5" style={{ strokeWidth: 2 }} />
          </button>
          <div className="flex items-center gap-4">
            <div className="glass-card w-16 h-16 rounded-3xl flex items-center justify-center glow-violet p-2">
              <img 
                src={LOGO_URL} 
                alt="Compare Plants" 
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h1 className="text-4xl font-bold" style={{ 
                color: 'var(--text-primary)',
                textShadow: 'var(--heading-shadow)',
                fontFamily: "'Playfair Display', Georgia, serif"
              }}>
                Compare Plants
              </h1>
              <p className="text-muted" style={{ color: 'var(--text-secondary)' }}>
                Side-by-side comparison of your violets
              </p>
            </div>
          </div>
        </div>

        {/* Empty State */}
        {selectedPlants.length === 0 && (
          <div className="glass-card rounded-3xl p-12 text-center">
            <div className="glass-accent-lavender w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 glow-violet p-3">
              <Check className="w-10 h-10" style={{ color: "#F0EBFF", strokeWidth: 1.5 }} />
            </div>
            <h3 className="text-xl font-bold mb-2" style={{ 
              color: 'var(--text-primary)',
              fontFamily: "'Playfair Display', Georgia, serif"
            }}>
              Select Plants to Compare
            </h3>
            <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>
              Choose 2-4 plants to see a side-by-side comparison
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="glass-accent-lavender px-8 py-4 rounded-3xl font-semibold inline-flex items-center gap-2"
              style={{ color: '#F0EBFF' }}
            >
              <Plus className="w-5 h-5" style={{ strokeWidth: 2 }} />
              Add Plants
            </button>
          </div>
        )}

        {/* Selected Plants Header */}
        {selectedPlants.length > 0 && (
          <>
            <div className="glass-card rounded-3xl p-6 mb-6">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h3 className="text-lg font-bold mb-1" style={{ 
                    color: "var(--text-primary)",
                    textShadow: "var(--heading-shadow)",
                    fontFamily: "'Playfair Display', Georgia, serif"
                  }}>
                    Comparing {selectedPlants.length} {selectedPlants.length === 1 ? 'Plant' : 'Plants'}
                  </h3>
                  <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                    {selectedPlants.length < 4 ? `You can add up to ${4 - selectedPlants.length} more` : "Maximum reached"}
                  </p>
                </div>
                {selectedPlants.length < 4 && (
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="glass-accent-moss px-6 py-3 rounded-2xl font-semibold flex items-center gap-2"
                    style={{ color: "#A7F3D0" }}
                  >
                    <Plus className="w-4 h-4" style={{ strokeWidth: 2 }} />
                    Add Plant
                  </button>
                )}
              </div>
            </div>

            {/* Comparison Table */}
            <div className="glass-card rounded-3xl p-6 overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom: "2px solid rgba(227, 201, 255, 0.3)" }}>
                    <th className="text-left py-4 px-3 sticky left-0 z-10 backdrop-blur-xl"
                      style={{
                        background: "linear-gradient(135deg, rgba(227, 201, 255, 0.15) 0%, rgba(168, 159, 239, 0.1) 100%)"
                      }}>
                      <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                        Attribute
                      </p>
                    </th>
                    {selectedPlants.map((plant, _idx) => (
                      <th key={plant.id} className="text-left py-4 px-3 min-w-[250px]">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-semibold truncate" style={{ color: "var(--text-primary)" }}>
                            {plant.nickname || plant.cultivar_name}
                          </p>
                          <button
                            onClick={() => removePlant(plant.id)}
                            className="glass-button w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0"
                            style={{ color: "#FCA5A5" }}
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {comparisonRows.map((row, rowIdx) => (
                    <tr key={rowIdx} style={{ 
                      borderBottom: rowIdx < comparisonRows.length - 1 ? "1px solid rgba(227, 201, 255, 0.15)" : "none"
                    }}>
                      <td className="py-4 px-3 sticky left-0 z-10 backdrop-blur-xl"
                        style={{
                          background: "linear-gradient(135deg, rgba(227, 201, 255, 0.15) 0%, rgba(168, 159, 239, 0.1) 100%)"
                        }}>
                        <div className="flex items-center gap-2">
                          {row.icon && <row.icon className="w-4 h-4" style={{ color: "#C4B5FD", strokeWidth: 1.8 }} />}
                          <p className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
                            {row.label}
                          </p>
                        </div>
                      </td>
                      {selectedPlants.map(plant => (
                        <td key={plant.id} className="py-4 px-3">
                          <div className="text-sm">
                            {row.render(row.getValue(plant))}
                          </div>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* View Individual Plants */}
            <div className="mt-6 flex flex-wrap gap-3">
              {selectedPlants.map(plant => (
                <button
                  key={plant.id}
                  onClick={() => navigate(createPageUrl(`PlantDetail?id=${plant.id}`))}
                  className="glass-button px-5 py-3 rounded-2xl font-semibold hover:opacity-90 transition-opacity"
                  style={{ color: "var(--text-secondary)" }}
                >
                  View {plant.nickname || plant.cultivar_name}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Add Plant Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowAddModal(false)}>
          <div className="glass-card rounded-3xl w-full max-w-2xl max-h-[80vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}>
            <div className="backdrop-blur-2xl rounded-t-3xl p-6 flex items-center justify-between"
              style={{
                background: "linear-gradient(135deg, rgba(227, 201, 255, 0.2) 0%, rgba(168, 159, 239, 0.15) 100%)",
                borderBottom: "1px solid rgba(227, 201, 255, 0.2)"
              }}>
              <h2 className="text-2xl font-bold" style={{ 
                color: "var(--text-primary)",
                textShadow: "var(--heading-shadow)",
                fontFamily: "'Playfair Display', Georgia, serif"
              }}>
                Add Plant to Compare
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="glass-button w-10 h-10 rounded-2xl flex items-center justify-center"
                style={{ color: "#FCA5A5" }}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(80vh-100px)]">
              <div className="grid gap-3">
                {allPlants
                  .filter(plant => !selectedPlantIds.includes(plant.id))
                  .map(plant => {
                    const photo = plant.photos?.[0];
                    return (
                      <button
                        key={plant.id}
                        onClick={() => addPlant(plant.id)}
                        className="glass-button rounded-2xl p-4 hover:opacity-90 transition-all text-left"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 rounded-2xl overflow-hidden glass-card flex-shrink-0"
                            style={{ boxShadow: "inset 0 2px 8px rgba(32, 24, 51, 0.4)" }}>
                            {photo ? (
                              <img src={photo} alt={plant.cultivar_name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center"
                                style={{ background: "linear-gradient(135deg, rgba(168, 159, 239, 0.15) 0%, rgba(154, 226, 211, 0.12) 100%)" }}>
                                <img src={LOGO_URL} alt="No photo" className="w-8 h-8 object-contain opacity-40" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold truncate" style={{ color: "var(--text-primary)" }}>
                              {plant.cultivar_name}
                            </p>
                            {plant.nickname && (
                              <p className="text-sm truncate" style={{ color: "var(--text-secondary)", opacity: 0.8 }}>
                                "{plant.nickname}"
                              </p>
                            )}
                            {plant.blossom_color && (
                              <p className="text-xs" style={{ color: "#C4B5FD" }}>
                                {plant.blossom_color}
                              </p>
                            )}
                          </div>
                          <Plus className="w-5 h-5 flex-shrink-0" style={{ color: "#A7F3D0", strokeWidth: 2 }} />
                        </div>
                      </button>
                    );
                  })}
              </div>

              {allPlants.filter(plant => !selectedPlantIds.includes(plant.id)).length === 0 && (
                <div className="text-center py-12">
                  <p style={{ color: "var(--text-secondary)" }}>
                    All plants have been added to the comparison
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
