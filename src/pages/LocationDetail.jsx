
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Edit, Trash2, MapPin, Thermometer, Droplets, Sun, Wind, Image as ImageIcon, Plus, ChevronRight } from "lucide-react";
import { createPageUrl } from "@/utils";

const LOGO_URL = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/690e3cd78523fb5fba0a8466/632f6e485_PlantLogos.png";

const COLOR_MAP = {
  lavender: "#E3C9FF",
  moss: "#A7F3D0",
  mint: "#9AE2D3",
  rose: "#FCA5A5",
  amber: "#FCD34D",
  sky: "#7DD3FC"
};

export default function LocationDetail() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const locationId = urlParams.get('id');

  const { data: location, isLoading } = useQuery({
    queryKey: ['location', locationId],
    queryFn: () => base44.entities.Location.filter({ id: locationId }).then(locations => locations[0]),
    enabled: !!locationId
  });

  const { data: plants = [] } = useQuery({
    queryKey: ['plantsInLocation', locationId],
    queryFn: () => base44.entities.Plant.filter({ location_id: locationId }, '-updated_date'),
    enabled: !!locationId
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      // Update all plants with this location to have no location
      await Promise.all(
        plants.map(plant => 
          base44.entities.Plant.update(plant.id, { location_id: null })
        )
      );
      // Delete the location
      await base44.entities.Location.delete(locationId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] });
      queryClient.invalidateQueries({ queryKey: ['plants'] });
      navigate(createPageUrl("PlantLibrary"));
    }
  });

  const handleDelete = () => {
    if (window.confirm(
      `Delete "${location.name}"? ${plants.length > 0 ? `${plants.length} ${plants.length === 1 ? 'plant' : 'plants'} will be unassigned.` : ''}`
    )) {
      deleteMutation.mutate();
    }
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

  if (!location) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="glass-card rounded-3xl p-12 text-center">
          <p style={{ color: "var(--text-primary)" }} className="font-medium">Location not found</p>
        </div>
      </div>
    );
  }

  const locationColor = COLOR_MAP[location.color] || COLOR_MAP.lavender;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
          <div className="flex items-center gap-3 mb-1">
            <div 
              className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{
                background: `${locationColor}30`,
                border: `1px solid ${locationColor}60`
              }}>
              <MapPin className="w-7 h-7" style={{ color: locationColor, strokeWidth: 2 }} />
            </div>
            <div>
              <h1 className="text-3xl font-bold" style={{ 
                color: "var(--text-primary)",
                textShadow: "var(--heading-shadow)",
                fontFamily: "'Playfair Display', Georgia, serif"
              }}>
                {location.name}
              </h1>
              <p style={{ color: "var(--text-secondary)" }}>
                {plants.length} {plants.length === 1 ? 'plant' : 'plants'} in this location
              </p>
            </div>
          </div>
        </div>
        <button
          onClick={() => navigate(createPageUrl(`EditLocation?id=${locationId}`))}
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
        {/* Left Column - Photo & Description */}
        <div className="lg:col-span-1 space-y-6">
          {/* Location Photo */}
          {location.photo && (
            <div className="glass-card rounded-3xl overflow-hidden aspect-square"
              style={{ 
                boxShadow: "inset 0 2px 12px rgba(32, 24, 51, 0.4), 0 8px 32px rgba(32, 24, 51, 0.6), inset 0 1px 1px rgba(255, 255, 255, 0.2)",
                border: "1px solid rgba(227, 201, 255, 0.25)"
              }}>
              <img 
                src={location.photo} 
                alt={location.name}
                className="w-full h-full object-cover"
                style={{ filter: "contrast(1.05) saturate(1.1)" }}
              />
            </div>
          )}

          {/* Description */}
          {location.description && (
            <div className="glass-card rounded-3xl p-6">
              <h2 className="text-lg font-bold mb-3" style={{ 
                color: "var(--text-primary)",
                textShadow: "var(--heading-shadow)",
                fontFamily: "'Playfair Display', Georgia, serif"
              }}>
                Description
              </h2>
              <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                {location.description}
              </p>
            </div>
          )}

          {/* Notes */}
          {location.notes && (
            <div className="glass-card rounded-3xl p-6">
              <h2 className="text-lg font-bold mb-3" style={{ 
                color: "var(--text-primary)",
                textShadow: "var(--heading-shadow)",
                fontFamily: "'Playfair Display', Georgia, serif"
              }}>
                Notes
              </h2>
              <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: "var(--text-secondary)" }}>
                {location.notes}
              </p>
            </div>
          )}
        </div>

        {/* Right Column - Environmental Conditions & Plants */}
        <div className="lg:col-span-2 space-y-6">
          {/* Environmental Conditions */}
          <div className="glass-card rounded-3xl p-6">
            <h2 className="text-xl font-bold mb-6" style={{ 
              color: "var(--text-primary)",
              textShadow: "var(--heading-shadow)",
              fontFamily: "'Playfair Display', Georgia, serif"
            }}>
              Environmental Conditions
            </h2>

            <div className="space-y-5">
              {/* Light */}
              {(location.light_type || location.light_hours) && (
                <div className="glass-button rounded-2xl p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{
                        background: "rgba(252, 211, 77, 0.2)",
                        border: "1px solid rgba(252, 211, 77, 0.4)"
                      }}>
                      <Sun className="w-5 h-5" style={{ color: "#FCD34D", strokeWidth: 2 }} />
                    </div>
                    <div>
                      <h3 className="font-semibold" style={{ color: "var(--text-primary)" }}>Light</h3>
                      {location.light_type && (
                        <p className="text-sm capitalize" style={{ color: "var(--text-secondary)" }}>
                          {location.light_type.replace(/_/g, ' ')}
                        </p>
                      )}
                      {location.light_hours && (
                        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                          {location.light_hours} hours/day
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Temperature */}
              {(location.temperature_min || location.temperature_max) && (
                <div className="glass-button rounded-2xl p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{
                        background: "rgba(252, 165, 165, 0.2)",
                        border: "1px solid rgba(252, 165, 165, 0.4)"
                      }}>
                      <Thermometer className="w-5 h-5" style={{ color: "#FCA5A5", strokeWidth: 2 }} />
                    </div>
                    <div>
                      <h3 className="font-semibold" style={{ color: "var(--text-primary)" }}>Temperature</h3>
                      <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                        {location.temperature_min && location.temperature_max 
                          ? `${location.temperature_min}°F - ${location.temperature_max}°F`
                          : location.temperature_min 
                          ? `Min: ${location.temperature_min}°F`
                          : `Max: ${location.temperature_max}°F`
                        }
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Humidity */}
              {(location.humidity_min || location.humidity_max) && (
                <div className="glass-button rounded-2xl p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{
                        background: "rgba(125, 211, 252, 0.2)",
                        border: "1px solid rgba(125, 211, 252, 0.4)"
                      }}>
                      <Droplets className="w-5 h-5" style={{ color: "#7DD3FC", strokeWidth: 2 }} />
                    </div>
                    <div>
                      <h3 className="font-semibold" style={{ color: "var(--text-primary)" }}>Humidity</h3>
                      <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                        {location.humidity_min && location.humidity_max 
                          ? `${location.humidity_min}% - ${location.humidity_max}%`
                          : location.humidity_min 
                          ? `Min: ${location.humidity_min}%`
                          : `Max: ${location.humidity_max}%`
                        }
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Air Circulation */}
              {location.air_circulation && (
                <div className="glass-button rounded-2xl p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{
                        background: "rgba(167, 243, 208, 0.2)",
                        border: "1px solid rgba(167, 243, 208, 0.4)"
                      }}>
                      <Wind className="w-5 h-5" style={{ color: "#A7F3D0", strokeWidth: 2 }} />
                    </div>
                    <div>
                      <h3 className="font-semibold" style={{ color: "var(--text-primary)" }}>Air Circulation</h3>
                      <p className="text-sm capitalize" style={{ color: "var(--text-secondary)" }}>
                        {location.air_circulation}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* No conditions set */}
              {!location.light_type && !location.light_hours && 
               !location.temperature_min && !location.temperature_max &&
               !location.humidity_min && !location.humidity_max &&
               !location.air_circulation && (
                <div className="text-center py-8">
                  <p className="text-sm" style={{ color: "var(--text-secondary)", opacity: 0.8 }}>
                    No environmental conditions configured yet
                  </p>
                  <button
                    onClick={() => navigate(createPageUrl(`EditLocation?id=${locationId}`))}
                    className="glass-button px-4 py-2 rounded-2xl text-sm font-semibold mt-3"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Configure Now
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Plants in this Location */}
          <div className="glass-card rounded-3xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold" style={{ 
                color: "var(--text-primary)",
                textShadow: "var(--heading-shadow)",
                fontFamily: "'Playfair Display', Georgia, serif"
              }}>
                Plants ({plants.length})
              </h2>
              <Link to={createPageUrl("AddPlant")}>
                <button className="glass-accent-lavender px-4 py-2 rounded-2xl font-semibold flex items-center gap-2"
                  style={{ color: '#F0EBFF' }}>
                  <Plus className="w-4 h-4" />
                  Add Plant
                </button>
              </Link>
            </div>

            {plants.length === 0 ? (
              <div className="text-center py-12">
                <div className="glass-accent-lavender w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 glow-violet p-2">
                  <img 
                    src={LOGO_URL} 
                    alt="No plants" 
                    className="w-full h-full object-contain"
                    style={{ opacity: 0.4 }}
                  />
                </div>
                <p className="text-sm mb-4" style={{ color: "var(--text-secondary)" }}>
                  No plants in this location yet
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {plants.map(plant => (
                  <Link key={plant.id} to={createPageUrl(`PlantDetail?id=${plant.id}`)}>
                    <div className="glass-button rounded-2xl p-4 hover:opacity-90 transition-all">
                      <div className="flex items-center gap-4">
                        {plant.photos?.[0] ? (
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
                        ) : (
                          <div className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0"
                            style={{
                              background: "linear-gradient(135deg, rgba(168, 159, 239, 0.15) 0%, rgba(154, 226, 211, 0.12) 100%)"
                            }}>
                            <img 
                              src={LOGO_URL} 
                              alt="No photo" 
                              className="w-10 h-10 object-contain"
                              style={{ opacity: 0.4 }}
                            />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold mb-1 truncate" style={{ color: "var(--text-primary)" }}>
                            {plant.nickname || plant.cultivar_name}
                          </p>
                          {plant.nickname && (
                            <p className="text-sm mb-1 truncate" style={{ color: "var(--text-secondary)", opacity: 0.7 }}>
                              {plant.cultivar_name}
                            </p>
                          )}
                          {plant.blossom_color && (
                            <p className="text-xs" style={{ color: "var(--text-secondary)", opacity: 0.8 }}>
                              {plant.blossom_color} blooms
                            </p>
                          )}
                        </div>
                        <ChevronRight className="w-5 h-5 flex-shrink-0" style={{ color: "var(--text-secondary)", strokeWidth: 2 }} />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
