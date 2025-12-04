
import React from "react";
import { format } from "date-fns";
import { Calendar, Droplets, Leaf, Shovel, Scissors, Heart, Flower2, Clock } from "lucide-react";

import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

const CARE_ICONS = {
  watering: { icon: Droplets, color: "#7DD3FC" },
  fertilizing: { icon: Leaf, color: "#A7F3D0" },
  repotting: { icon: Shovel, color: "#FCD34D" },
  grooming: { icon: Scissors, color: "#F0EBFF" }
};

const HEALTH_STATUS_COLORS = {
  excellent: "#A7F3D0",
  good: "#C4B5FD",
  concerning: "#FCD34D",
  critical: "#FCA5A5"
};

const BLOOM_QUALITY_COLORS = {
  poor: "#9CA3AF",
  fair: "#FCD34D",
  good: "#A7F3D0",
  excellent: "#C4B5FD",
  exceptional: "#F0EBFF"
};

export default function PlantTimeline({ careLogs = [], healthLogs = [], bloomLogs = [] }) {
  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me().catch(() => null),
  });

  const currentTheme = currentUser?.theme || "glassmorphism";

  // Combine all logs into timeline events
  const timelineEvents = [
    ...careLogs.map(log => ({
      type: 'care',
      date: log.care_date,
      data: log
    })),
    ...healthLogs.map(log => ({
      type: 'health',
      date: log.observation_date,
      data: log
    })),
    ...bloomLogs.map(log => ({
      type: 'bloom',
      date: log.bloom_start_date,
      data: log
    }))
  ].sort((a, b) => new Date(b.date) - new Date(a.date));

  if (timelineEvents.length === 0) {
    return (
      <div className="text-center py-12">
        <Clock className="w-8 h-8 mx-auto mb-2" style={{ color: "#C4B5FD", opacity: 0.5 }} />
        <p className="text-sm" style={{ color: (currentTheme === 'light' || currentTheme === 'minimal') ? 'var(--text-secondary)' : "#DDD6FE" }}>No timeline events yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {timelineEvents.map((event, index) => {
        const isLatest = index === 0;

        if (event.type === 'care') {
          const careConfig = CARE_ICONS[event.data.care_type];
          const Icon = careConfig?.icon || Calendar;

          return (
            <div
              key={`care-${event.data.id}`}
              className={`glass-card rounded-3xl p-5 ${isLatest ? "ring-2 ring-offset-0" : ""}`}
              style={{ ringColor: isLatest ? "rgba(168, 159, 239, 0.5)" : undefined }}
            >
              <div className="flex items-start gap-4">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 backdrop-blur-xl"
                  style={{
                    background: `${careConfig?.color || '#C4B5FD'}30`,
                    border: `1px solid ${careConfig?.color || '#C4B5FD'}60`
                  }}
                >
                  <Icon className="w-6 h-6" style={{ color: careConfig?.color || "#C4B5FD", strokeWidth: 1.8 }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="font-bold capitalize" style={{ color: (currentTheme === 'light' || currentTheme === 'minimal') ? 'var(--text-primary)' : "#F5F3FF" }}>
                      {event.data.care_type.replace('_', ' ')}
                    </h3>
                    {isLatest && (
                      <span className="text-xs px-2 py-0.5 rounded-lg glass-accent-lavender" style={{ color: (currentTheme === 'light' || currentTheme === 'minimal') ? "#FFFFFF" : "#F0EBFF" }}>
                        Latest
                      </span>
                    )}
                  </div>
                  <p className="text-sm mb-2" style={{ color: (currentTheme === 'light' || currentTheme === 'minimal') ? 'var(--text-secondary)' : "#DDD6FE" }}>
                    {format(new Date(event.date), "MMMM d, yyyy 'at' h:mm a")}
                  </p>

                  {/* Care-specific details */}
                  {event.data.watering_method && (
                    <p className="text-sm mb-1" style={{ color: (currentTheme === 'light' || currentTheme === 'minimal') ? 'var(--text-secondary)' : "#DDD6FE", opacity: 0.9 }}>
                      Method: <span className="font-medium" style={{ color: (currentTheme === 'light' || currentTheme === 'minimal') ? 'var(--text-primary)' : "#F5F3FF" }}>
                        {event.data.watering_method === "top" ? "Top Watering" :
                         event.data.watering_method === "bottom" ? "Bottom Watering" :
                         event.data.watering_method === "wick" ? "Wick Watering" :
                         event.data.watering_method === "self-watering" ? "Self-Watering Pot" :
                         event.data.watering_method === "mist" ? "Misting" : event.data.watering_method}
                      </span>
                    </p>
                  )}

                  {event.data.fertilizer_type && (
                    <p className="text-sm mb-1" style={{ color: (currentTheme === 'light' || currentTheme === 'minimal') ? 'var(--text-secondary)' : "#DDD6FE", opacity: 0.9 }}>
                      Fertilizer: <span className="font-medium" style={{ color: (currentTheme === 'light' || currentTheme === 'minimal') ? 'var(--text-primary)' : "#F5F3FF" }}>{event.data.fertilizer_type}</span>
                    </p>
                  )}

                  {(event.data.new_pot_size || event.data.new_soil_mix) && (
                    <div className="text-sm mb-1" style={{ color: (currentTheme === 'light' || currentTheme === 'minimal') ? 'var(--text-secondary)' : "#DDD6FE", opacity: 0.9 }}>
                      {event.data.new_pot_size && (
                        <p>New Pot: <span className="font-medium" style={{ color: (currentTheme === 'light' || currentTheme === 'minimal') ? 'var(--text-primary)' : "#F5F3FF" }}>{event.data.new_pot_size}"</span></p>
                      )}
                      {event.data.new_soil_mix && (
                        <p>Soil: <span className="font-medium" style={{ color: (currentTheme === 'light' || currentTheme === 'minimal') ? 'var(--text-primary)' : "#F5F3FF" }}>{event.data.new_soil_mix}</span></p>
                      )}
                    </div>
                  )}

                  {event.data.notes && (
                    <p className="text-sm" style={{ color: (currentTheme === 'light' || currentTheme === 'minimal') ? 'var(--text-secondary)' : "#DDD6FE", opacity: 0.9 }}>
                      {event.data.notes}
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        }

        if (event.type === 'health') {
          const statusColor = HEALTH_STATUS_COLORS[event.data.health_status];

          return (
            <div
              key={`health-${event.data.id}`}
              className={`glass-card rounded-3xl p-5 ${isLatest ? "ring-2 ring-offset-0" : ""}`}
              style={{ ringColor: isLatest ? "rgba(168, 159, 239, 0.5)" : undefined }}
            >
              <div className="flex items-start gap-4">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 backdrop-blur-xl"
                  style={{
                    background: `${statusColor}30`,
                    border: `1px solid ${statusColor}60`
                  }}
                >
                  <Heart className="w-6 h-6" style={{ color: statusColor, strokeWidth: 1.8 }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="font-bold capitalize" style={{ color: statusColor }}>
                      Health: {event.data.health_status}
                    </h3>
                    {isLatest && (
                      <span className="text-xs px-2 py-0.5 rounded-lg glass-accent-lavender" style={{ color: (currentTheme === 'light' || currentTheme === 'minimal') ? "#FFFFFF" : "#F0EBFF" }}>
                        Latest
                      </span>
                    )}
                  </div>
                  <p className="text-sm mb-2" style={{ color: (currentTheme === 'light' || currentTheme === 'minimal') ? 'var(--text-secondary)' : "#DDD6FE" }}>
                    {format(new Date(event.date), "MMMM d, yyyy")}
                  </p>
                  {event.data.symptoms && event.data.symptoms.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {event.data.symptoms.map((symptom, i) => (
                        <span
                          key={i}
                          className="text-xs px-2 py-1 rounded-lg backdrop-blur-xl"
                          style={{
                            background: "rgba(252, 211, 77, 0.15)",
                            border: "1px solid rgba(252, 211, 77, 0.3)",
                            color: "#FCD34D"
                          }}
                        >
                          {symptom}
                        </span>
                      ))}
                    </div>
                  )}
                  {event.data.notes && (
                    <p className="text-sm mb-2" style={{ color: (currentTheme === 'light' || currentTheme === 'minimal') ? 'var(--text-secondary)' : "#DDD6FE", opacity: 0.9 }}>
                      {event.data.notes}
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        }

        if (event.type === 'bloom') {
          const qualityColor = BLOOM_QUALITY_COLORS[event.data.bloom_quality] || "#C4B5FD";

          return (
            <div
              key={`bloom-${event.data.id}`}
              className={`glass-card rounded-3xl p-5 ${isLatest ? "ring-2 ring-offset-0" : ""}`}
              style={{ ringColor: isLatest ? "rgba(168, 159, 239, 0.5)" : undefined }}
            >
              <div className="flex items-start gap-4">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 backdrop-blur-xl"
                  style={{
                    background: `${qualityColor}30`,
                    border: `1px solid ${qualityColor}60`
                  }}
                >
                  <Flower2 className="w-6 h-6" style={{ color: qualityColor, strokeWidth: 1.8 }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="font-bold" style={{ color: (currentTheme === 'light' || currentTheme === 'minimal') ? 'var(--text-primary)' : "#F5F3FF" }}>
                      Bloom Cycle
                    </h3>
                    {event.data.bloom_quality && (
                      <span
                        className="text-xs px-2 py-1 rounded-lg backdrop-blur-xl capitalize font-medium"
                        style={{
                          background: `${qualityColor}20`,
                          border: `1px solid ${qualityColor}40`,
                          color: qualityColor
                        }}
                      >
                        {event.data.bloom_quality}
                      </span>
                    )}
                    {isLatest && (
                      <span className="text-xs px-2 py-0.5 rounded-lg glass-accent-lavender" style={{ color: (currentTheme === 'light' || currentTheme === 'minimal') ? "#FFFFFF" : "#F0EBFF" }}>
                        Latest
                      </span>
                    )}
                  </div>
                  <p className="text-sm mb-2" style={{ color: (currentTheme === 'light' || currentTheme === 'minimal') ? 'var(--text-secondary)' : "#DDD6FE" }}>
                    {format(new Date(event.data.bloom_start_date), "MMM d, yyyy")}
                    {event.data.bloom_end_date && ` - ${format(new Date(event.data.bloom_end_date), "MMM d, yyyy")}`}
                  </p>
                  {event.data.flower_count && (
                    <p className="text-sm mb-2" style={{ color: (currentTheme === 'light' || currentTheme === 'minimal') ? 'var(--text-secondary)' : "#DDD6FE" }}>
                      ~{event.data.flower_count} flowers
                    </p>
                  )}
                  {event.data.notes && (
                    <p className="text-sm mb-2" style={{ color: (currentTheme === 'light' || currentTheme === 'minimal') ? 'var(--text-secondary)' : "#DDD6FE", opacity: 0.9 }}>
                      {event.data.notes}
                    </p>
                  )}
                  {event.data.photos && event.data.photos.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-3">
                      {event.data.photos.map((photo, i) => (
                        <a
                          key={i}
                          href={photo}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="glass-card rounded-xl overflow-hidden aspect-square hover:ring-2 hover:ring-offset-0 transition-all group"
                          style={{
                            ringColor: "rgba(168, 159, 239, 0.5)",
                            boxShadow: "inset 0 2px 8px rgba(32, 24, 51, 0.4)"
                          }}
                        >
                          <img 
                            src={photo} 
                            alt={`Bloom ${i + 1}`} 
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        }

        return null;
      })}
    </div>
  );
}
