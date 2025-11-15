
import React from "react";
import { Sprout, Edit, Trash2, Award, TrendingUp, Flower2, X } from "lucide-react";
import { format } from "date-fns";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const statusConfig = {
  germinated: { icon: Sprout, color: "from-emerald-200 to-emerald-300", text: "Germinated", textColor: "#059669" },
  growing: { icon: TrendingUp, color: "from-blue-200 to-blue-300", text: "Growing", textColor: "#2563EB" },
  bloomed: { icon: Flower2, color: "from-purple-200 to-purple-300", text: "Bloomed", textColor: "#9333EA" },
  selected: { icon: Award, color: "from-yellow-200 to-yellow-300", text: "Selected", textColor: "#D97706" },
  discarded: { icon: X, color: "from-gray-200 to-gray-300", text: "Discarded", textColor: "#6B7280" }
};

const LOGO_URL = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/690e3cd78523fb5fba0a8466/632f6e485_PlantLogos.png";

export default function OffspringGrid({ offspring, onEdit, projectId }) {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: (offspringId) => base44.entities.Offspring.delete(offspringId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['offspring', projectId] });
    }
  });

  const handleDelete = (offspringItem) => {
    if (window.confirm(`Delete seedling ${offspringItem.offspring_number}?`)) {
      deleteMutation.mutate(offspringItem.id);
    }
  };

  if (offspring.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="glass-accent-lavender w-20 h-20 rounded-[28px] flex items-center justify-center mx-auto mb-6 glow-violet p-3">
          <Sprout className="w-10 h-10" style={{ color: "#F0EBFF", strokeWidth: 1.5 }} />
        </div>
        <h3 className="text-xl font-bold mb-2" style={{ 
          color: "#F5F3FF",
          textShadow: "0 2px 4px rgba(32, 24, 51, 0.4)",
          fontFamily: "'Playfair Display', Georgia, serif"
        }}>
          No Offspring Yet
        </h3>
        <p style={{ color: "#DDD6FE" }}>
          Start tracking seedlings from this cross
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {offspring.map(off => {
        const config = statusConfig[off.status] || statusConfig.germinated;
        const Icon = config.icon;
        const isSelected = off.status === "selected";

        return (
          <div 
            key={off.id}
            className={`glass-card rounded-3xl p-5 hover:shadow-2xl transition-all ${
              isSelected ? "ring-2 ring-offset-0" : ""
            }`}
            style={{
              ringColor: isSelected ? "rgba(252, 211, 77, 0.6)" : undefined
            }}
          >
            {/* Photo */}
            {off.photos && off.photos.length > 0 ? (
              <div className="relative mb-4 overflow-hidden rounded-2xl aspect-square"
                style={{ 
                  boxShadow: "inset 0 2px 12px rgba(32, 24, 51, 0.4), 0 1px 0 rgba(255, 255, 255, 0.1)",
                  border: "1px solid rgba(227, 201, 255, 0.2)"
                }}>
                <img 
                  src={off.photos[0]} 
                  alt={`Offspring ${off.offspring_number}`}
                  className="w-full h-full object-cover"
                  style={{ filter: "contrast(1.05) saturate(1.1)" }}
                />
                {off.photos.length > 1 && (
                  <div className="absolute bottom-2 right-2 px-2 py-1 rounded-xl text-xs font-semibold backdrop-blur-xl"
                    style={{
                      background: "rgba(0, 0, 0, 0.5)",
                      color: "#FFF"
                    }}>
                    +{off.photos.length - 1} more
                  </div>
                )}
              </div>
            ) : (
              <div 
                className="mb-4 rounded-2xl aspect-square flex items-center justify-center p-8"
                style={{
                  background: "linear-gradient(135deg, rgba(168, 159, 239, 0.15) 0%, rgba(154, 226, 211, 0.12) 100%)",
                  boxShadow: "inset 0 2px 12px rgba(32, 24, 51, 0.4)",
                  border: "1px solid rgba(227, 201, 255, 0.2)"
                }}
              >
                <img 
                  src={LOGO_URL} 
                  alt="No photo" 
                  className="w-full h-full object-contain"
                  style={{ opacity: 0.4 }}
                />
              </div>
            )}

            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-bold" style={{ 
                      color: "#F5F3FF",
                      textShadow: "0 1px 3px rgba(32, 24, 51, 0.4)",
                      fontFamily: "'Playfair Display', Georgia, serif"
                    }}>
                      Seedling {off.offspring_number}
                    </h3>
                    <div 
                      className="px-2 py-1 rounded-xl text-xs font-semibold backdrop-blur-xl"
                      style={{
                        background: `linear-gradient(135deg, rgba(${config.textColor === '#059669' ? '5, 150, 105' : config.textColor === '#2563EB' ? '37, 99, 235' : config.textColor === '#9333EA' ? '147, 51, 234' : config.textColor === '#D97706' ? '217, 119, 6' : '107, 114, 128'}, 0.2) 0%, rgba(${config.textColor === '#059669' ? '5, 150, 105' : config.textColor === '#2563EB' ? '37, 99, 235' : config.textColor === '#9333EA' ? '147, 51, 234' : config.textColor === '#D97706' ? '217, 119, 6' : '107, 114, 128'}, 0.1) 100%)`,
                        border: `1px solid rgba(${config.textColor === '#059669' ? '5, 150, 105' : config.textColor === '#2563EB' ? '37, 99, 235' : config.textColor === '#9333EA' ? '147, 51, 234' : config.textColor === '#D97706' ? '217, 119, 6' : '107, 114, 128'}, 0.3)`,
                        color: config.textColor
                      }}
                    >
                      <Icon className="w-3 h-3 inline mr-1" />
                      {config.text}
                    </div>
                  </div>

                  {isSelected && (
                    <div className="flex items-center gap-1.5 mb-2 text-xs" style={{ color: "#FCD34D" }}>
                      <Award className="w-3.5 h-3.5" />
                      <span className="font-semibold">Promising Cultivar</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onEdit(off)}
                    className="glass-button w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ color: "#C4B5FD" }}
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(off)}
                    className="glass-button w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ color: "#FCA5A5" }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Details */}
              {off.germination_date && (
                <p className="text-xs" style={{ color: "#DDD6FE" }}>
                  Germinated: {format(new Date(off.germination_date), "MMM d, yyyy")}
                </p>
              )}

              {off.bloom_date && (
                <p className="text-xs" style={{ color: "#DDD6FE" }}>
                  First Bloom: {format(new Date(off.bloom_date), "MMM d, yyyy")}
                </p>
              )}

              {off.flower_color && (
                <p className="text-sm font-semibold" style={{ color: "#F5F3FF" }}>
                  {off.flower_color} blooms
                </p>
              )}

              {off.observed_traits && off.observed_traits.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {off.observed_traits.slice(0, 3).map((trait, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-lg text-xs backdrop-blur-xl"
                      style={{
                        background: "rgba(154, 226, 211, 0.12)",
                        border: "1px solid rgba(154, 226, 211, 0.25)",
                        color: "#A7F3D0"
                      }}
                    >
                      {trait}
                    </span>
                  ))}
                  {off.observed_traits.length > 3 && (
                    <span className="text-xs" style={{ color: "#DDD6FE" }}>
                      +{off.observed_traits.length - 3}
                    </span>
                  )}
                </div>
              )}

              {off.notes && (
                <p className="text-xs mt-2 line-clamp-2" style={{ color: "#DDD6FE" }}>
                  {off.notes}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
