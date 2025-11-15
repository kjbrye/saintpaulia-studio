import React, { useState } from "react";
import { MapPin, Grid, List, Search, X } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function PlantLocationMap({ plants }) {
  const [viewMode, setViewMode] = useState("grid"); // grid or list
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState(null);

  // Group plants by location
  const plantsByLocation = plants.reduce((acc, plant) => {
    const location = plant.location || "Unassigned";
    if (!acc[location]) {
      acc[location] = [];
    }
    acc[location].push(plant);
    return acc;
  }, {});

  const locations = Object.keys(plantsByLocation).sort();

  // Filter locations by search
  const filteredLocations = locations.filter(location => 
    location.toLowerCase().includes(searchQuery.toLowerCase()) ||
    plantsByLocation[location].some(plant => 
      plant.cultivar_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plant.nickname?.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const totalPlants = plants.length;
  const assignedPlants = plants.filter(p => p.location).length;
  const unassignedPlants = totalPlants - assignedPlants;

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="glass-card rounded-3xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl glass-accent-lavender flex items-center justify-center">
              <MapPin className="w-5 h-5" style={{ color: "#F0EBFF", strokeWidth: 2 }} />
            </div>
            <div>
              <p className="text-2xl font-bold" style={{ 
                color: "#F0EBFF",
                fontFamily: "'Playfair Display', Georgia, serif"
              }}>
                {locations.length}
              </p>
              <p className="text-xs" style={{ color: "#DDD6FE", opacity: 0.8 }}>
                Locations
              </p>
            </div>
          </div>
        </div>

        <div className="glass-card rounded-3xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl glass-accent-moss flex items-center justify-center">
              <Grid className="w-5 h-5" style={{ color: "#A7F3D0", strokeWidth: 2 }} />
            </div>
            <div>
              <p className="text-2xl font-bold" style={{ 
                color: "#A7F3D0",
                fontFamily: "'Playfair Display', Georgia, serif"
              }}>
                {assignedPlants}
              </p>
              <p className="text-xs" style={{ color: "#DDD6FE", opacity: 0.8 }}>
                Assigned
              </p>
            </div>
          </div>
        </div>

        <div className="glass-card rounded-3xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl backdrop-blur-xl flex items-center justify-center"
              style={{
                background: unassignedPlants > 0 
                  ? "linear-gradient(135deg, rgba(251, 146, 60, 0.3) 0%, rgba(249, 115, 22, 0.2) 100%)"
                  : "linear-gradient(135deg, rgba(168, 159, 239, 0.2) 0%, rgba(154, 226, 211, 0.15) 100%)",
                border: unassignedPlants > 0
                  ? "1px solid rgba(251, 146, 60, 0.4)"
                  : "1px solid rgba(168, 159, 239, 0.3)"
              }}>
              <MapPin className="w-5 h-5" style={{ 
                color: unassignedPlants > 0 ? "#FB923C" : "#C4B5FD", 
                strokeWidth: 2 
              }} />
            </div>
            <div>
              <p className="text-2xl font-bold" style={{ 
                color: unassignedPlants > 0 ? "#FB923C" : "#C4B5FD",
                fontFamily: "'Playfair Display', Georgia, serif"
              }}>
                {unassignedPlants}
              </p>
              <p className="text-xs" style={{ color: "#DDD6FE", opacity: 0.8 }}>
                Unassigned
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and View Controls */}
      <div className="glass-card rounded-3xl p-4">
        <div className="flex gap-3 flex-wrap">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4" 
              style={{ color: '#DDD6FE', opacity: 0.7 }} />
            <input
              type="text"
              placeholder="Search locations or plants..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="glass-input w-full pl-11 pr-10 py-3 rounded-2xl text-sm"
              style={{ color: '#F5F3FF' }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 glass-button w-6 h-6 rounded-full flex items-center justify-center"
                style={{ color: '#DDD6FE' }}
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          <div className="glass-button rounded-2xl p-1 flex gap-1">
            <button
              onClick={() => setViewMode("grid")}
              className={`px-3 py-2 rounded-xl transition-all ${
                viewMode === "grid" ? "glass-accent-lavender" : ""
              }`}
              style={{ color: viewMode === "grid" ? "#F0EBFF" : "#DDD6FE" }}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`px-3 py-2 rounded-xl transition-all ${
                viewMode === "list" ? "glass-accent-lavender" : ""
              }`}
              style={{ color: viewMode === "list" ? "#F0EBFF" : "#DDD6FE" }}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Locations Display */}
      {filteredLocations.length === 0 ? (
        <div className="glass-card rounded-3xl p-12 text-center">
          <Search className="w-12 h-12 mx-auto mb-4" style={{ color: "#C4B5FD", opacity: 0.5 }} />
          <p style={{ color: "#DDD6FE" }}>
            {searchQuery ? "No locations or plants match your search" : "No locations found"}
          </p>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredLocations.map(location => {
            const locationPlants = plantsByLocation[location];
            const isUnassigned = location === "Unassigned";
            
            return (
              <div
                key={location}
                className="glass-card rounded-3xl p-5 hover:shadow-xl transition-all cursor-pointer"
                onClick={() => setSelectedLocation(selectedLocation === location ? null : location)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                      isUnassigned ? "" : "glass-accent-moss"
                    }`}
                      style={isUnassigned ? {
                        background: "linear-gradient(135deg, rgba(251, 146, 60, 0.25) 0%, rgba(249, 115, 22, 0.2) 100%)",
                        border: "1px solid rgba(251, 146, 60, 0.4)"
                      } : undefined}>
                      <MapPin className="w-5 h-5" style={{ 
                        color: isUnassigned ? "#FB923C" : "#A7F3D0", 
                        strokeWidth: 2 
                      }} />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm" style={{ color: "#F5F3FF" }}>
                        {location}
                      </h3>
                      <p className="text-xs" style={{ color: "#DDD6FE", opacity: 0.8 }}>
                        {locationPlants.length} {locationPlants.length === 1 ? 'plant' : 'plants'}
                      </p>
                    </div>
                  </div>
                </div>

                {selectedLocation === location && (
                  <div className="space-y-2 mt-4 pt-4 border-t" style={{ borderColor: "rgba(227, 201, 255, 0.2)" }}>
                    {locationPlants.map(plant => (
                      <Link
                        key={plant.id}
                        to={createPageUrl(`PlantDetail?id=${plant.id}`)}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="glass-button rounded-2xl p-3 hover:opacity-90 transition-all">
                          <div className="flex items-center gap-3">
                            {plant.photos?.[0] && (
                              <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0"
                                style={{
                                  boxShadow: "inset 0 1px 4px rgba(32, 24, 51, 0.3)"
                                }}>
                                <img 
                                  src={plant.photos[0]} 
                                  alt={plant.cultivar_name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold truncate" style={{ color: "#F5F3FF" }}>
                                {plant.nickname || plant.cultivar_name}
                              </p>
                              {plant.nickname && (
                                <p className="text-xs truncate" style={{ color: "#DDD6FE", opacity: 0.7 }}>
                                  {plant.cultivar_name}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredLocations.map(location => {
            const locationPlants = plantsByLocation[location];
            const isUnassigned = location === "Unassigned";
            const isExpanded = selectedLocation === location;
            
            return (
              <div key={location} className="glass-card rounded-3xl overflow-hidden">
                <button
                  onClick={() => setSelectedLocation(isExpanded ? null : location)}
                  className="w-full p-5 flex items-center justify-between hover:opacity-90 transition-opacity"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                      isUnassigned ? "" : "glass-accent-moss"
                    }`}
                      style={isUnassigned ? {
                        background: "linear-gradient(135deg, rgba(251, 146, 60, 0.25) 0%, rgba(249, 115, 22, 0.2) 100%)",
                        border: "1px solid rgba(251, 146, 60, 0.4)"
                      } : undefined}>
                      <MapPin className="w-5 h-5" style={{ 
                        color: isUnassigned ? "#FB923C" : "#A7F3D0", 
                        strokeWidth: 2 
                      }} />
                    </div>
                    <div className="text-left">
                      <h3 className="font-bold" style={{ color: "#F5F3FF" }}>
                        {location}
                      </h3>
                      <p className="text-sm" style={{ color: "#DDD6FE", opacity: 0.8 }}>
                        {locationPlants.length} {locationPlants.length === 1 ? 'plant' : 'plants'}
                      </p>
                    </div>
                  </div>
                  <div className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                    <svg className="w-5 h-5" style={{ color: "#DDD6FE" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-5 pb-5 space-y-2">
                    {locationPlants.map(plant => (
                      <Link
                        key={plant.id}
                        to={createPageUrl(`PlantDetail?id=${plant.id}`)}
                      >
                        <div className="glass-button rounded-2xl p-4 hover:opacity-90 transition-all">
                          <div className="flex items-center gap-4">
                            {plant.photos?.[0] && (
                              <div className="w-16 h-16 rounded-2xl overflow-hidden flex-shrink-0"
                                style={{
                                  boxShadow: "inset 0 2px 6px rgba(32, 24, 51, 0.3)"
                                }}>
                                <img 
                                  src={plant.photos[0]} 
                                  alt={plant.cultivar_name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold mb-1" style={{ color: "#F5F3FF" }}>
                                {plant.nickname || plant.cultivar_name}
                              </p>
                              {plant.nickname && (
                                <p className="text-sm mb-1" style={{ color: "#DDD6FE", opacity: 0.7 }}>
                                  {plant.cultivar_name}
                                </p>
                              )}
                              {plant.blossom_color && (
                                <p className="text-xs" style={{ color: "#DDD6FE", opacity: 0.8 }}>
                                  {plant.blossom_color} blooms
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}