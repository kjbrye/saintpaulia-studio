
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Printer, Check } from "lucide-react";
import { createPageUrl } from "@/utils";

const LOGO_URL = "/wax seal.svg";

export default function PrintLabels() {
  const navigate = useNavigate();
  const [selectedPlants, setSelectedPlants] = useState([]);
  const [exhibitorName, setExhibitorName] = useState("");
  const [labelStyle, setLabelStyle] = useState("standard"); // standard, detailed, minimal

  const { data: plants = [], isLoading } = useQuery({
    queryKey: ['plants'],
    queryFn: () => base44.entities.Plant.list('-updated_date'),
    initialData: [],
  });

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  React.useEffect(() => {
    if (currentUser) {
      setExhibitorName(currentUser.username || currentUser.full_name || "");
    }
  }, [currentUser]);

  const togglePlant = (plantId) => {
    if (selectedPlants.includes(plantId)) {
      setSelectedPlants(selectedPlants.filter(id => id !== plantId));
    } else {
      setSelectedPlants([...selectedPlants, plantId]);
    }
  };

  const selectAll = () => {
    setSelectedPlants(plants.map(p => p.id));
  };

  const clearAll = () => {
    setSelectedPlants([]);
  };

  const handlePrint = () => {
    window.print();
  };

  const selectedPlantData = plants.filter(p => selectedPlants.includes(p.id));

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
    <>
      {/* Screen View - Not Printed */}
      <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 print:hidden">
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
                  alt="Print Labels" 
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h1 className="text-4xl font-bold" style={{ 
                  color: 'var(--text-primary)',
                  textShadow: 'var(--heading-shadow)',
                  fontFamily: "'Playfair Display', Georgia, serif"
                }}>
                  Print Show Labels
                </h1>
                <p className="text-muted" style={{ color: 'var(--text-secondary)' }}>
                  Create professional labels for exhibitions and shows
                </p>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left Column - Settings */}
            <div className="lg:col-span-1 space-y-6">
              {/* Exhibitor Name */}
              <div className="glass-card rounded-3xl p-6">
                <h2 className="text-lg font-bold mb-4" style={{ 
                  color: "var(--text-primary)",
                  textShadow: "var(--heading-shadow)",
                  fontFamily: "'Playfair Display', Georgia, serif"
                }}>
                  Exhibitor Information
                </h2>
                <label className="block text-sm font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
                  Exhibitor Name
                </label>
                <input
                  type="text"
                  value={exhibitorName}
                  onChange={(e) => setExhibitorName(e.target.value)}
                  placeholder="Your name for labels"
                  className="glass-input w-full px-4 py-3 rounded-2xl"
                  style={{ color: "var(--text-primary)" }}
                />
                <p className="text-xs mt-2" style={{ color: "var(--text-secondary)", opacity: 0.7 }}>
                  This name will appear on all printed labels
                </p>
              </div>

              {/* Label Style */}
              <div className="glass-card rounded-3xl p-6">
                <h2 className="text-lg font-bold mb-4" style={{ 
                  color: "var(--text-primary)",
                  textShadow: "var(--heading-shadow)",
                  fontFamily: "'Playfair Display', Georgia, serif"
                }}>
                  Label Style
                </h2>
                <div className="space-y-3">
                  <button
                    onClick={() => setLabelStyle("standard")}
                    className={`w-full px-4 py-3 rounded-2xl font-medium text-left transition-all ${
                      labelStyle === "standard" ? "glass-accent-lavender" : "glass-button"
                    }`}
                    style={{ color: labelStyle === "standard" ? "#F0EBFF" : "var(--text-secondary)" }}
                  >
                    <div className="font-semibold mb-1">Standard</div>
                    <div className="text-xs opacity-80">Name, hybridizer, AVSA #</div>
                  </button>
                  <button
                    onClick={() => setLabelStyle("detailed")}
                    className={`w-full px-4 py-3 rounded-2xl font-medium text-left transition-all ${
                      labelStyle === "detailed" ? "glass-accent-lavender" : "glass-button"
                    }`}
                    style={{ color: labelStyle === "detailed" ? "#F0EBFF" : "var(--text-secondary)" }}
                  >
                    <div className="font-semibold mb-1">Detailed</div>
                    <div className="text-xs opacity-80">Includes blossom & leaf info</div>
                  </button>
                  <button
                    onClick={() => setLabelStyle("minimal")}
                    className={`w-full px-4 py-3 rounded-2xl font-medium text-left transition-all ${
                      labelStyle === "minimal" ? "glass-accent-lavender" : "glass-button"
                    }`}
                    style={{ color: labelStyle === "minimal" ? "#F0EBFF" : "var(--text-secondary)" }}
                  >
                    <div className="font-semibold mb-1">Minimal</div>
                    <div className="text-xs opacity-80">Name and exhibitor only</div>
                  </button>
                </div>
              </div>

              {/* Print Button */}
              <button
                onClick={handlePrint}
                disabled={selectedPlants.length === 0}
                className="glass-accent-moss w-full px-6 py-4 rounded-3xl font-semibold flex items-center justify-center gap-2 hover:shadow-lg transition-all disabled:opacity-30"
                style={{ color: "#A7F3D0" }}
              >
                <Printer className="w-5 h-5" style={{ strokeWidth: 2 }} />
                Print {selectedPlants.length} {selectedPlants.length === 1 ? 'Label' : 'Labels'}
              </button>

              <p className="text-xs text-center" style={{ color: "var(--text-secondary)", opacity: 0.7 }}>
                Avery 5160 format: 30 labels per sheet (1" × 2⅝")
              </p>
            </div>

            {/* Right Column - Plant Selection */}
            <div className="lg:col-span-2">
              <div className="glass-card rounded-3xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-bold" style={{ 
                    color: "var(--text-primary)",
                    textShadow: "var(--heading-shadow)",
                    fontFamily: "'Playfair Display', Georgia, serif"
                  }}>
                    Select Plants ({selectedPlants.length} selected)
                  </h2>
                  <div className="flex gap-2">
                    <button
                      onClick={selectAll}
                      className="glass-button px-4 py-2 rounded-2xl text-sm font-semibold"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      Select All
                    </button>
                    <button
                      onClick={clearAll}
                      className="glass-button px-4 py-2 rounded-2xl text-sm font-semibold"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      Clear
                    </button>
                  </div>
                </div>

                {plants.length === 0 ? (
                  <div className="text-center py-12">
                    <p style={{ color: "var(--text-secondary)" }}>No plants in your collection yet</p>
                    <Link to={createPageUrl("AddPlant")}>
                      <button className="glass-accent-lavender px-6 py-3 rounded-2xl font-semibold mt-4"
                        style={{ color: '#F0EBFF' }}>
                        Add Your First Plant
                      </button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[600px] overflow-y-auto">
                    {plants.map(plant => (
                      <button
                        key={plant.id}
                        onClick={() => togglePlant(plant.id)}
                        className={`w-full text-left px-4 py-3 rounded-2xl transition-all ${
                          selectedPlants.includes(plant.id) ? "glass-accent-lavender" : "glass-button"
                        }`}
                        style={{ color: selectedPlants.includes(plant.id) ? "#F0EBFF" : "var(--text-secondary)" }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="font-semibold">{plant.cultivar_name}</div>
                            {plant.hybridizer && (
                              <div className="text-xs opacity-80 mt-1">
                                {plant.hybridizer}
                              </div>
                            )}
                          </div>
                          {selectedPlants.includes(plant.id) && (
                            <Check className="w-5 h-5 flex-shrink-0" style={{ strokeWidth: 2.5 }} />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Print View - Only Visible When Printing - Avery 5160 Format */}
      <div className="hidden print:block">
        <style>{`
          @media print {
            @page {
              size: letter;
              margin: 0.5in 0.1875in;
            }
            body {
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
              margin: 0;
              padding: 0;
            }
            .label-grid {
              display: grid;
              grid-template-columns: repeat(3, 2.625in);
              gap: 0;
              width: 8.125in;
            }
            .label {
              width: 2.625in;
              height: 1in;
              padding: 0.05in 0.1in;
              box-sizing: border-box;
              page-break-inside: avoid;
              break-inside: avoid;
              border: 1px solid #ddd;
              overflow: hidden;
            }
          }
        `}</style>
        
        <div className="label-grid">
          {selectedPlantData.map((plant) => (
            <div key={plant.id} className="label">
              {/* Standard Style */}
              {labelStyle === "standard" && (
                <div style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', fontSize: '9pt', lineHeight: '1.1' }}>
                  <div>
                    <div style={{ fontSize: '11pt', fontWeight: 'bold', fontFamily: 'Georgia, serif', marginBottom: '1px' }}>
                      {plant.cultivar_name}
                    </div>
                    {plant.hybridizer && (
                      <div style={{ fontSize: '8pt', marginBottom: '1px' }}>
                        {plant.hybridizer}
                        {plant.year && ` (${plant.year})`}
                      </div>
                    )}
                    {plant.avsa_number && (
                      <div style={{ fontSize: '8pt', fontWeight: '600' }}>
                        AVSA #{plant.avsa_number}
                      </div>
                    )}
                  </div>
                  <div style={{ borderTop: '1px solid #ccc', paddingTop: '1px' }}>
                    <div style={{ fontSize: '7pt', fontWeight: '500' }}>
                      {exhibitorName || "________________"}
                    </div>
                  </div>
                </div>
              )}

              {/* Detailed Style */}
              {labelStyle === "detailed" && (
                <div style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', fontSize: '7pt', lineHeight: '1.1' }}>
                  <div>
                    <div style={{ fontSize: '10pt', fontWeight: 'bold', fontFamily: 'Georgia, serif', marginBottom: '1px' }}>
                      {plant.cultivar_name}
                    </div>
                    {plant.hybridizer && (
                      <div style={{ fontSize: '7pt', marginBottom: '1px' }}>
                        {plant.hybridizer}
                        {plant.year && ` (${plant.year})`}
                        {plant.avsa_number && ` • #${plant.avsa_number}`}
                      </div>
                    )}
                    {(plant.blossom_type || plant.blossom_color || (plant.leaf_types && plant.leaf_types.length > 0)) && (
                      <div style={{ marginTop: '2px', fontSize: '6.5pt' }}>
                        {plant.blossom_type && plant.blossom_color && (
                          <div>
                            <strong>B:</strong> {plant.blossom_color} {plant.blossom_type}
                          </div>
                        )}
                        {plant.leaf_types && plant.leaf_types.length > 0 && (
                          <div>
                            <strong>L:</strong> {plant.leaf_types.slice(0, 2).join(", ")}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <div style={{ borderTop: '1px solid #ccc', paddingTop: '0.5px' }}>
                    <div style={{ fontSize: '6.5pt', fontWeight: '500' }}>
                      {exhibitorName || "________________"}
                    </div>
                  </div>
                </div>
              )}

              {/* Minimal Style */}
              {labelStyle === "minimal" && (
                <div style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
                  <div style={{ fontSize: '11pt', fontWeight: 'bold', fontFamily: 'Georgia, serif', marginBottom: '3px', lineHeight: '1.1' }}>
                    {plant.cultivar_name}
                  </div>
                  <div style={{ fontSize: '8pt', fontWeight: '500' }}>
                    {exhibitorName || "________________"}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
