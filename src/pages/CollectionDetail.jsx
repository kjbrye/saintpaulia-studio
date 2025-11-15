
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Edit, Plus, X, Search } from "lucide-react";
import { createPageUrl } from "@/utils";
import PlantCard from "../components/plants/PlantCard";

const LOGO_URL = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/690e3cd78523fb5fba0a8466/632f6e485_PlantLogos.png";

const COLOR_OPTIONS = {
  lavender: { bg: "rgba(227, 201, 255, 0.2)", border: "rgba(227, 201, 255, 0.4)", text: "#F0EBFF" },
  moss: { bg: "rgba(154, 226, 211, 0.2)", border: "rgba(154, 226, 211, 0.4)", text: "#A7F3D0" },
  mint: { bg: "rgba(167, 243, 208, 0.2)", border: "rgba(167, 243, 208, 0.4)", text: "#A7F3D0" },
  rose: { bg: "rgba(251, 113, 133, 0.2)", border: "rgba(251, 113, 133, 0.4)", text: "#FCA5A5" },
  amber: { bg: "rgba(251, 191, 36, 0.2)", border: "rgba(251, 191, 36, 0.4)", text: "#FCD34D" },
  sky: { bg: "rgba(125, 211, 252, 0.2)", border: "rgba(125, 211, 252, 0.4)", text: "#7DD3FC" }
};

export default function CollectionDetail() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const collectionId = urlParams.get('id');
  const [showAddPlants, setShowAddPlants] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: collection, isLoading } = useQuery({
    queryKey: ['plantCollection', collectionId],
    queryFn: () => base44.entities.PlantCollection.filter({ id: collectionId }).then(collections => collections[0]),
    enabled: !!collectionId
  });

  const { data: allPlants = [] } = useQuery({
    queryKey: ['plants'],
    queryFn: () => base44.entities.Plant.list('-updated_date'),
    initialData: [],
  });

  const updateMutation = useMutation({
    mutationFn: ({ plantIds }) => base44.entities.PlantCollection.update(collectionId, {
      plant_ids: plantIds
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plantCollection', collectionId] });
      queryClient.invalidateQueries({ queryKey: ['plantCollections'] });
    }
  });

  const removePlant = (plantId) => {
    if (window.confirm("Remove this plant from the collection?")) {
      const updatedPlantIds = (collection.plant_ids || []).filter(id => id !== plantId);
      updateMutation.mutate({ plantIds: updatedPlantIds });
    }
  };

  const addPlant = (plantId) => {
    const updatedPlantIds = [...(collection.plant_ids || []), plantId];
    updateMutation.mutate({ plantIds: updatedPlantIds });
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

  if (!collection) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="glass-card rounded-3xl p-12 text-center">
          <p style={{ color: "var(--text-primary)" }} className="font-medium">Collection not found</p>
        </div>
      </div>
    );
  }

  const colorConfig = COLOR_OPTIONS[collection.color] || COLOR_OPTIONS.lavender;
  const collectionPlants = allPlants.filter(p => collection.plant_ids?.includes(p.id));
  
  // Plants not in collection for adding
  const availablePlants = allPlants.filter(p => !collection.plant_ids?.includes(p.id));
  const filteredAvailablePlants = availablePlants.filter(plant =>
    plant.cultivar_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    plant.nickname?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8 flex-wrap">
        <button
          onClick={() => navigate(createPageUrl("PlantLibrary"))}
          className="glass-button w-12 h-12 rounded-2xl flex items-center justify-center"
          style={{ color: "var(--accent)" }}
        >
          <ArrowLeft className="w-5 h-5" style={{ strokeWidth: 2 }} />
        </button>
        <div className="flex-1 min-w-[200px]">
          <div className="flex items-center gap-3 mb-2 flex-wrap">
            <div
              className="px-4 py-2 rounded-2xl text-lg font-bold backdrop-blur-xl"
              style={{
                background: colorConfig.bg,
                border: `1px solid ${colorConfig.border}`,
                color: colorConfig.text
              }}
            >
              {collection.name}
            </div>
            <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
              {collectionPlants.length} {collectionPlants.length === 1 ? "plant" : "plants"}
            </span>
          </div>
          {collection.description && (
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              {collection.description}
            </p>
          )}
        </div>
        <button
          onClick={() => setShowAddPlants(true)}
          className="glass-accent-lavender px-6 py-3 rounded-2xl font-semibold flex items-center gap-2"
          style={{ color: "#F0EBFF" }}
        >
          <Plus className="w-5 h-5" />
          <span className="hidden sm:inline">Add Plants</span>
        </button>
        <button
          onClick={() => navigate(createPageUrl("PlantLibrary"))}
          className="glass-accent-moss px-6 py-3 rounded-2xl font-semibold flex items-center gap-2"
          style={{ color: "#A7F3D0" }}
        >
          <Edit className="w-5 h-5" />
          <span className="hidden sm:inline">Edit Collection</span>
        </button>
      </div>

      {/* Plants in Collection */}
      {collectionPlants.length === 0 ? (
        <div className="glass-card rounded-[32px] p-12 text-center">
          <div className="glass-accent-lavender w-20 h-20 rounded-[28px] flex items-center justify-center mx-auto mb-6 glow-violet p-3">
            <img 
              src={LOGO_URL} 
              alt="Empty collection" 
              className="w-full h-full object-contain"
            />
          </div>
          <h3 className="text-xl font-bold mb-2" style={{ 
            color: 'var(--text-primary)',
            fontFamily: "'Playfair Display', Georgia, serif"
          }}>
            No Plants in Collection
          </h3>
          <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>
            Add plants to start building this collection
          </p>
          <button
            onClick={() => setShowAddPlants(true)}
            className="glass-accent-lavender px-8 py-4 rounded-3xl font-semibold inline-flex items-center gap-2"
            style={{ color: '#F0EBFF' }}
          >
            <Plus className="w-5 h-5" style={{ strokeWidth: 2 }} />
            Add Plants
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {collectionPlants.map(plant => (
            <div key={plant.id} className="relative">
              <PlantCard plant={plant} />
              <button
                onClick={() => removePlant(plant.id)}
                className="absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity backdrop-blur-xl z-10"
                style={{
                  background: "linear-gradient(135deg, rgba(239, 68, 68, 0.9) 0%, rgba(220, 38, 38, 0.85) 100%)",
                  border: "1px solid rgba(255, 255, 255, 0.3)",
                  color: "#FFF",
                  boxShadow: "0 2px 8px rgba(239, 68, 68, 0.5)"
                }}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add Plants Modal */}
      {showAddPlants && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card rounded-[32px] w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="backdrop-blur-2xl rounded-t-[32px] p-6 flex items-center justify-between"
              style={{
                background: "linear-gradient(135deg, rgba(227, 201, 255, 0.2) 0%, rgba(168, 159, 239, 0.15) 100%)",
                borderBottom: "1px solid rgba(227, 201, 255, 0.2)"
              }}>
              <h2 className="text-2xl font-bold" style={{ 
                color: "var(--text-primary)",
                textShadow: "var(--heading-shadow)",
                fontFamily: "'Playfair Display', Georgia, serif"
              }}>
                Add Plants to {collection.name}
              </h2>
              <button
                onClick={() => {
                  setShowAddPlants(false);
                  setSearchQuery("");
                }}
                className="glass-button w-10 h-10 rounded-2xl flex items-center justify-center"
                style={{ color: "#FCA5A5" }}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 flex-1 overflow-y-auto">
              {/* Search */}
              <div className="mb-6 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5" 
                  style={{ color: 'var(--text-muted)', opacity: 0.7, strokeWidth: 1.5 }} />
                <input
                  type="text"
                  placeholder="Search plants to add..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="glass-input w-full pl-12 pr-4 py-3 rounded-2xl"
                  style={{ color: 'var(--text-primary)' }}
                />
              </div>

              {/* Available Plants */}
              {filteredAvailablePlants.length === 0 ? (
                <div className="text-center py-12">
                  <p style={{ color: "var(--text-secondary)" }}>
                    {availablePlants.length === 0 
                      ? "All plants are already in this collection"
                      : "No plants found matching your search"}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredAvailablePlants.map(plant => (
                    <button
                      key={plant.id}
                      onClick={() => {
                        addPlant(plant.id);
                        setSearchQuery("");
                      }}
                      className="glass-button w-full rounded-2xl p-4 hover:opacity-90 transition-all flex items-center gap-4"
                    >
                      <div className="glass-card rounded-xl overflow-hidden w-16 h-16 flex-shrink-0"
                        style={{
                          boxShadow: "inset 0 2px 8px rgba(32, 24, 51, 0.4)"
                        }}>
                        {plant.photo_url ? (
                          <img src={plant.photo_url} alt={plant.cultivar_name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center"
                            style={{ background: "linear-gradient(135deg, rgba(168, 159, 239, 0.15) 0%, rgba(154, 226, 211, 0.12) 100%)" }}>
                            <img src={LOGO_URL} alt="No photo" className="w-8 h-8 object-contain opacity-40" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 text-left min-w-0">
                        <h3 className="font-semibold truncate" style={{ color: "var(--text-primary)" }}>
                          {plant.nickname || plant.cultivar_name}
                        </h3>
                        {plant.blossom_color && (
                          <p className="text-sm truncate" style={{ color: "var(--text-secondary)" }}>
                            {plant.blossom_color} {plant.blossom_type}
                          </p>
                        )}
                      </div>
                      <Plus className="w-5 h-5" style={{ color: "#A7F3D0", strokeWidth: 2 }} />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
