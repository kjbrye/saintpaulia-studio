import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Droplets, Sparkles, Scissors, Package, Heart, AlertCircle } from "lucide-react";
import HealthStatusBadge from "../health/HealthStatusBadge";

const LOGO_URL = "/wax seal.svg";

const getCareStatus = (lastCareDate, daysThreshold) => {
  if (!lastCareDate) return { status: "overdue", days: null };
  const daysSince = Math.floor((new Date() - new Date(lastCareDate)) / (1000 * 60 * 60 * 24));
  if (daysSince >= daysThreshold) return { status: "overdue", days: daysSince };
  if (daysSince >= daysThreshold * 0.8) return { status: "soon", days: daysSince };
  return { status: "good", days: daysSince };
};

const CareIndicator = ({ icon: Icon, status, days, label, currentTheme }) => {
  const statusColors = {
    overdue: { bg: "rgba(252, 165, 165, 0.2)", border: "rgba(252, 165, 165, 0.4)", color: "#FCA5A5" },
    soon: { bg: "rgba(252, 211, 77, 0.2)", border: "rgba(252, 211, 77, 0.4)", color: "#FCD34D" },
    good: { 
      bg: (currentTheme === 'light' || currentTheme === 'minimal') 
        ? "rgba(147, 51, 234, 0.15)" 
        : "rgba(167, 243, 208, 0.15)", 
      border: (currentTheme === 'light' || currentTheme === 'minimal') 
        ? "rgba(147, 51, 234, 0.3)" 
        : "rgba(167, 243, 208, 0.3)", 
      color: (currentTheme === 'light' || currentTheme === 'minimal') 
        ? "#7C3AED" 
        : "#A7F3D0" 
    }
  };

  const config = statusColors[status] || statusColors.good;

  return (
    <div className="flex items-center gap-2">
      <div 
        className="w-7 h-7 rounded-lg flex items-center justify-center backdrop-blur-xl"
        style={{
          background: config.bg,
          border: `1px solid ${config.border}`
        }}
      >
        <Icon className="w-4 h-4" style={{ color: config.color, strokeWidth: 1.8 }} />
      </div>
      <div>
        <p className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>
          {label}
        </p>
        <p className="text-xs" style={{ color: config.color }}>
          {days === null ? "Never" : days === 0 ? "Today" : `${days}d ago`}
        </p>
      </div>
    </div>
  );
};

export default function PlantCard({ plant }) {
  const queryClient = useQueryClient();
  
  const { data: latestHealthLog } = useQuery({
    queryKey: ['latestHealthLog', plant.id],
    queryFn: () => base44.entities.HealthLog.filter({ plant_id: plant.id }, '-observation_date', 1).then(logs => logs[0]),
  });

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me().catch(() => null),
  });

  const toggleFavoriteMutation = useMutation({
    mutationFn: () => base44.entities.Plant.update(plant.id, { is_favorite: !plant.is_favorite }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plants'] });
      queryClient.invalidateQueries({ queryKey: ['plant', plant.id] });
    }
  });

  const wateringStatus = getCareStatus(plant.last_watered, 7);
  const fertilizingStatus = getCareStatus(plant.last_fertilized, 14);
  const groomingStatus = getCareStatus(plant.last_groomed, 7);
  const repottingStatus = getCareStatus(plant.last_repotted, 180);

  const needsAttention = 
    wateringStatus.status === "overdue" || 
    fertilizingStatus.status === "overdue" || 
    groomingStatus.status === "overdue";

  const primaryPhoto = plant.photos?.[0];
  const currentTheme = currentUser?.theme || "glassmorphism";

  return (
    <Link to={createPageUrl(`PlantDetail?id=${plant.id}`)}>
      <div className="neuro-card rounded-3xl overflow-hidden hover:shadow-2xl transition-all group relative">
        {needsAttention && (
          <div className="absolute top-3 left-3 z-10 neuro-badge w-9 h-9 rounded-full flex items-center justify-center"
            style={{
              background: "rgba(252, 165, 165, 0.3)",
              border: "1px solid rgba(252, 165, 165, 0.5)"
            }}>
            <AlertCircle className="w-5 h-5" style={{ color: "#FCA5A5", strokeWidth: 2 }} />
          </div>
        )}

        <button
          onClick={(e) => {
            e.preventDefault();
            toggleFavoriteMutation.mutate();
          }}
          className="absolute top-4 right-4 z-10 neuro-button w-10 h-10 rounded-full flex items-center justify-center shadow-lg"
        >
          <Heart
            className="w-5 h-5"
            style={{
              color: plant.is_favorite ? "#FCA5A5" : "#DDD6FE",
              strokeWidth: 2,
              fill: plant.is_favorite ? "#FCA5A5" : "none"
            }}
          />
        </button>

        <div className="aspect-square neuro-icon-well">
          {primaryPhoto ? (
            <img 
              src={primaryPhoto} 
              alt={plant.cultivar_name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center p-8"
              style={{ background: "linear-gradient(135deg, rgba(168, 159, 239, 0.15) 0%, rgba(154, 226, 211, 0.12) 100%)" }}>
              <img 
                src={LOGO_URL} 
                alt="No photo" 
                className="w-full h-full object-contain opacity-40"
              />
            </div>
          )}
        </div>

        <div className="p-5 space-y-4">
          <div>
            <h3 className="font-bold text-lg mb-1" style={{ 
              color: "var(--text-primary)",
              fontFamily: "'Playfair Display', Georgia, serif"
            }}>
              {plant.nickname || plant.cultivar_name}
            </h3>
            {plant.blossom_color && (
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                {plant.blossom_color}
              </p>
            )}
            {latestHealthLog && (
              <div className="mt-2">
                <HealthStatusBadge status={latestHealthLog.health_status} size="sm" />
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <CareIndicator 
              icon={Droplets}
              status={wateringStatus.status}
              days={wateringStatus.days}
              label="Watered"
              currentTheme={currentTheme}
            />
            <CareIndicator 
              icon={Sparkles}
              status={fertilizingStatus.status}
              days={fertilizingStatus.days}
              label="Fertilized"
              currentTheme={currentTheme}
            />
            <CareIndicator 
              icon={Scissors}
              status={groomingStatus.status}
              days={groomingStatus.days}
              label="Groomed"
              currentTheme={currentTheme}
            />
            <CareIndicator 
              icon={Package}
              status={repottingStatus.status}
              days={repottingStatus.days}
              label="Repotted"
              currentTheme={currentTheme}
            />
          </div>
        </div>
      </div>
    </Link>
  );
}