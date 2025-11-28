import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { GitCompare, CheckSquare, Square, Clock, Heart } from "lucide-react";
import LocationBadge from "../locations/LocationBadge";
import CollectionBadges from "../collections/CollectionBadges";

const LOGO_URL = "/wax seal.svg";

const getCareStatus = (lastCareDate, daysThreshold) => {
  if (!lastCareDate) return { status: "overdue", days: null };
  const daysSince = Math.floor((new Date() - new Date(lastCareDate)) / (1000 * 60 * 60 * 24));
  if (daysSince >= daysThreshold) return { status: "overdue", days: daysSince };
  if (daysSince >= daysThreshold * 0.8) return { status: "soon", days: daysSince };
  return { status: "good", days: daysSince };
};

export default function PlantListItem({ 
  plant, 
  compareMode, 
  isSelected, 
  onToggleCompare,
  bulkMode,
  isBulkSelected,
  onToggleBulk 
}) {
  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me().catch(() => null),
  });

  const primaryPhoto = plant.photos?.[0];
  const wateringStatus = getCareStatus(plant.last_watered, 7);
  const fertilizingStatus = getCareStatus(plant.last_fertilized, 14);
  const currentTheme = currentUser?.theme || "glassmorphism";
  
  const handleClick = (e) => {
    if (compareMode) {
      e.preventDefault();
      onToggleCompare(plant.id);
    } else if (bulkMode) {
      e.preventDefault();
      onToggleBulk(plant.id);
    }
  };

  // Dynamic colors for light mode
  const bulkSelectBg = (currentTheme === 'light' || currentTheme === 'minimal')
    ? "linear-gradient(135deg, rgba(147, 51, 234, 0.35) 0%, rgba(126, 34, 206, 0.3) 100%)"
    : "linear-gradient(135deg, rgba(154, 226, 211, 0.35) 0%, rgba(110, 231, 183, 0.3) 100%)";

  const bulkSelectColor = (currentTheme === 'light' || currentTheme === 'minimal')
    ? "#7C3AED"
    : "#A7F3D0";

  const bulkSelectBorder = (currentTheme === 'light' || currentTheme === 'minimal')
    ? "rgba(147, 51, 234, 0.6)"
    : "rgba(154, 226, 211, 0.6)";

  const bulkSelectRing = (currentTheme === 'light' || currentTheme === 'minimal')
    ? "rgba(147, 51, 234, 0.6)"
    : "rgba(154, 226, 211, 0.6)";

  const fertilizeBadgeBg = (currentTheme === 'light' || currentTheme === 'minimal')
    ? "rgba(147, 51, 234, 0.2)"
    : "rgba(167, 243, 208, 0.2)";

  const fertilizeBadgeBorder = (currentTheme === 'light' || currentTheme === 'minimal')
    ? "rgba(147, 51, 234, 0.4)"
    : "rgba(167, 243, 208, 0.4)";

  const fertilizeBadgeColor = (currentTheme === 'light' || currentTheme === 'minimal')
    ? "#7C3AED"
    : "#A7F3D0";

  return (
    <Link to={createPageUrl(`PlantDetail?id=${plant.id}`)} onClick={handleClick}>
      <div className={`neuro-card rounded-3xl p-4 hover:shadow-2xl transition-all duration-300 ${
        (compareMode && isSelected) || (bulkMode && isBulkSelected) ? "ring-2 ring-offset-0" : ""
      }`}
        style={{
          ringColor: compareMode && isSelected 
            ? "rgba(227, 201, 255, 0.6)" 
            : bulkMode && isBulkSelected 
            ? bulkSelectRing
            : undefined
        }}>
        <div className="flex items-center gap-4">
          {/* Selection Indicator */}
          {bulkMode && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onToggleBulk(plant.id);
              }}
              className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                isBulkSelected ? "neuro-accent-raised" : "neuro-button"
              }`}
              style={{ 
                background: isBulkSelected 
                  ? bulkSelectBg
                  : undefined,
                color: isBulkSelected ? bulkSelectColor : "#DDD6FE",
                border: isBulkSelected 
                  ? `2px solid ${bulkSelectBorder}`
                  : undefined
              }}
            >
              {isBulkSelected ? (
                <CheckSquare className="w-5 h-5" style={{ strokeWidth: 2.5 }} />
              ) : (
                <Square className="w-5 h-5" style={{ strokeWidth: 2 }} />
              )}
            </button>
          )}

          {compareMode && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onToggleCompare(plant.id);
              }}
              className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                isSelected ? "neuro-accent-raised" : "neuro-button"
              }`}
              style={{ 
                color: isSelected ? "#F0EBFF" : "#DDD6FE",
                border: isSelected 
                  ? "2px solid rgba(227, 201, 255, 0.6)" 
                  : undefined
              }}
            >
              {isSelected ? (
                <GitCompare className="w-5 h-5" style={{ strokeWidth: 2.5 }} />
              ) : (
                <GitCompare className="w-5 h-5" style={{ strokeWidth: 2 }} />
              )}
            </button>
          )}

          {/* Photo */}
          <div className="w-16 h-16 rounded-2xl overflow-hidden neuro-icon-well flex-shrink-0">
            {primaryPhoto ? (
              <img 
                src={primaryPhoto} 
                alt={plant.cultivar_name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center"
                style={{
                  background: "linear-gradient(135deg, rgba(168, 159, 239, 0.15) 0%, rgba(154, 226, 211, 0.12) 100%)"
                }}>
                <img 
                  src={LOGO_URL} 
                  alt="No photo" 
                  className="w-full h-full object-contain p-2"
                  style={{ opacity: 0.4 }}
                />
              </div>
            )}
          </div>

          {/* Plant Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h3 className="text-lg font-bold truncate" style={{ 
                color: "var(--text-primary)",
                fontFamily: "'Playfair Display', Georgia, serif"
              }}>
                {plant.nickname || plant.cultivar_name}
              </h3>
              {plant.is_favorite && (
                <Heart className="w-4 h-4 flex-shrink-0" style={{ 
                  color: "#F0ABFC", 
                  fill: "#F0ABFC",
                  strokeWidth: 2 
                }} />
              )}
            </div>
            
            {plant.nickname && (
              <p className="text-sm mb-1" style={{ color: "var(--text-secondary)", opacity: 0.8 }}>
                {plant.cultivar_name}
              </p>
            )}

            <div className="flex items-center gap-2 flex-wrap mt-2">
              {plant.blossom_color && (
                <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
                  {plant.blossom_color} {plant.blossom_type}
                </span>
              )}
              {plant.location_id && (
                <LocationBadge locationId={plant.location_id} size="sm" />
              )}
            </div>

            <div className="mt-2">
              <CollectionBadges plantId={plant.id} maxDisplay={2} size="sm" />
            </div>
          </div>

          {/* Care Status Indicators */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {wateringStatus.status === "overdue" && (
              <div className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium backdrop-blur-xl"
                style={{
                  background: "rgba(252, 211, 77, 0.2)",
                  border: "1px solid rgba(252, 211, 77, 0.4)",
                  color: "#FCD34D"
                }}>
                <Clock className="w-3 h-3" />
                Water
              </div>
            )}
            {fertilizingStatus.status === "overdue" && (
              <div className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium backdrop-blur-xl"
                style={{
                  background: fertilizeBadgeBg,
                  border: `1px solid ${fertilizeBadgeBorder}`,
                  color: fertilizeBadgeColor
                }}>
                <Clock className="w-3 h-3" />
                Fertilize
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}