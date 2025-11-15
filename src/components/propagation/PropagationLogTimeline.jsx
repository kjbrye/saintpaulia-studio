import React from "react";
import { format } from "date-fns";
import { Leaf, Edit, Sprout, Flower2, Move } from "lucide-react";

const MILESTONE_CONFIG = {
  started: { icon: Leaf, color: "#C4B5FD", label: "Started" },
  roots_visible: { icon: Sprout, color: "#A7F3D0", label: "Roots Visible" },
  new_growth: { icon: Leaf, color: "#93E9BE", label: "New Growth" },
  transplanted: { icon: Move, color: "#FCD34D", label: "Transplanted" },
  established: { icon: Sprout, color: "#6EE7B7", label: "Established" },
  first_bloom: { icon: Flower2, color: "#F0ABFC", label: "First Bloom" },
  other: { icon: Leaf, color: "#C4B5FD", label: "Other" }
};

export default function PropagationLogTimeline({ logs, onEdit }) {
  return (
    <div className="space-y-4">
      {logs.map((log, index) => {
        const milestoneConfig = log.milestone ? MILESTONE_CONFIG[log.milestone] : null;
        const Icon = milestoneConfig?.icon || Leaf;

        return (
          <div key={log.id} className="glass-button rounded-2xl p-5 relative group">
            {/* Timeline connector */}
            {index < logs.length - 1 && (
              <div 
                className="absolute left-7 top-16 w-0.5 h-8"
                style={{
                  background: "linear-gradient(180deg, rgba(227, 201, 255, 0.3) 0%, rgba(227, 201, 255, 0) 100%)"
                }}
              />
            )}

            <div className="flex items-start gap-4">
              {/* Icon */}
              <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 backdrop-blur-xl"
                style={{
                  background: milestoneConfig 
                    ? `linear-gradient(135deg, ${milestoneConfig.color}20 0%, ${milestoneConfig.color}10 100%)`
                    : "linear-gradient(135deg, rgba(196, 181, 253, 0.2) 0%, rgba(196, 181, 253, 0.1) 100%)",
                  border: `1px solid ${milestoneConfig?.color || "#C4B5FD"}40`,
                  boxShadow: `0 2px 8px ${milestoneConfig?.color || "#C4B5FD"}20`
                }}>
                <Icon className="w-5 h-5" style={{ 
                  color: milestoneConfig?.color || "#C4B5FD", 
                  strokeWidth: 1.8 
                }} />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-semibold" style={{ color: "#F5F3FF" }}>
                        {format(new Date(log.log_date), "MMMM d, yyyy")}
                      </p>
                      {milestoneConfig && (
                        <span
                          className="px-2 py-0.5 rounded-lg text-xs font-medium backdrop-blur-xl"
                          style={{
                            background: `${milestoneConfig.color}20`,
                            border: `1px solid ${milestoneConfig.color}40`,
                            color: milestoneConfig.color
                          }}
                        >
                          {milestoneConfig.label}
                        </span>
                      )}
                    </div>
                    {log.measurements && (
                      <p className="text-xs mb-2" style={{ color: "#DDD6FE", opacity: 0.8 }}>
                        {log.measurements}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => onEdit(log)}
                    className="glass-button w-8 h-8 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ color: "#C4B5FD" }}
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-sm whitespace-pre-wrap mb-3" style={{ color: "#DDD6FE" }}>
                  {log.observation}
                </p>

                {/* Photos */}
                {log.photos && log.photos.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mt-3">
                    {log.photos.map((photo, idx) => (
                      <img 
                        key={idx}
                        src={photo} 
                        alt={`Progress ${idx + 1}`}
                        className="w-full h-24 object-cover rounded-2xl"
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}