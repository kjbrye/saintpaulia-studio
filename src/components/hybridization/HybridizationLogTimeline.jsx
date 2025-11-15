import React from "react";
import { format } from "date-fns";
import { Calendar, Edit, Trash2, Star, Image as ImageIcon, Sprout } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const milestoneConfig = {
  germination: { icon: Sprout, label: "Germination", color: "#A7F3D0", bg: "rgba(167, 243, 208, 0.2)", border: "rgba(167, 243, 208, 0.4)" },
  first_leaf: { icon: Sprout, label: "First True Leaf", color: "#C4B5FD", bg: "rgba(196, 181, 253, 0.2)", border: "rgba(196, 181, 253, 0.4)" },
  transplant: { icon: Sprout, label: "Transplant", color: "#FCD34D", bg: "rgba(252, 211, 77, 0.2)", border: "rgba(252, 211, 77, 0.4)" },
  first_bloom: { icon: Star, label: "First Bloom", color: "#F0EBFF", bg: "rgba(168, 159, 239, 0.25)", border: "rgba(168, 159, 239, 0.5)" },
  selection: { icon: Star, label: "Selection", color: "#A7F3D0", bg: "rgba(154, 226, 211, 0.25)", border: "rgba(154, 226, 211, 0.5)" },
  other: { icon: Star, label: "Milestone", color: "#DDD6FE", bg: "rgba(221, 214, 254, 0.15)", border: "rgba(221, 214, 254, 0.3)" }
};

export default function HybridizationLogTimeline({ logs, offspring, onEdit, projectId }) {
  const queryClient = useQueryClient();
  const deleteMutation = useMutation({
    mutationFn: (logId) => base44.entities.HybridizationLog.delete(logId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hybridizationLogs', projectId] });
    }
  });

  const handleDelete = (log) => {
    if (window.confirm("Delete this log entry?")) {
      deleteMutation.mutate(log.id);
    }
  };

  const getOffspringName = (offspringId) => {
    if (!offspringId) return "Project Log";
    const off = offspring.find(o => o.id === offspringId);
    return off ? `Seedling ${off.offspring_number}` : "Unknown Seedling";
  };

  if (logs.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="glass-accent-lavender w-20 h-20 rounded-[28px] flex items-center justify-center mx-auto mb-6 glow-violet">
          <Calendar className="w-10 h-10" style={{ color: "#F0EBFF", strokeWidth: 1.5 }} />
        </div>
        <h3 className="text-xl font-bold mb-2" style={{ 
          color: "#F5F3FF",
          textShadow: "0 2px 4px rgba(32, 24, 51, 0.4)",
          fontFamily: "'Playfair Display', Georgia, serif"
        }}>
          No Log Entries Yet
        </h3>
        <p style={{ color: "#DDD6FE" }}>
          Start documenting your hybridization journey
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {logs.map((log, index) => {
        const isLatest = index === 0;
        const milestone = log.milestone ? milestoneConfig[log.milestone] : null;
        const MilestoneIcon = milestone?.icon;

        return (
          <div
            key={log.id}
            className={`glass-card rounded-3xl overflow-hidden transition-all ${
              isLatest ? "ring-2 ring-offset-0" : ""
            }`}
            style={{
              ringColor: isLatest ? "rgba(168, 159, 239, 0.5)" : undefined
            }}
          >
            <div className="p-5">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" style={{ color: "#C4B5FD", strokeWidth: 1.8 }} />
                      <span className="text-sm font-semibold" style={{ color: "#DDD6FE" }}>
                        {format(new Date(log.log_date), "MMMM d, yyyy")}
                      </span>
                    </div>
                    
                    {milestone && (
                      <div 
                        className="px-3 py-1 rounded-xl text-xs font-semibold backdrop-blur-xl flex items-center gap-1.5"
                        style={{
                          background: milestone.bg,
                          border: `1px solid ${milestone.border}`,
                          color: milestone.color
                        }}
                      >
                        <MilestoneIcon className="w-3 h-3" />
                        {milestone.label}
                      </div>
                    )}

                    {isLatest && (
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-xl glass-accent-lavender"
                        style={{ color: "#F0EBFF" }}>
                        Latest
                      </span>
                    )}
                  </div>
                  
                  {log.title && (
                    <h3 className="text-lg font-bold mb-1" style={{ 
                      color: "#F5F3FF",
                      textShadow: "0 1px 3px rgba(32, 24, 51, 0.4)",
                      fontFamily: "'Playfair Display', Georgia, serif"
                    }}>
                      {log.title}
                    </h3>
                  )}

                  <p className="text-xs" style={{ color: "#C7C9E6", opacity: 0.8 }}>
                    {getOffspringName(log.offspring_id)}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onEdit(log)}
                    className="glass-button w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ color: "#C4B5FD" }}
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(log)}
                    className="glass-button w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ color: "#FCA5A5" }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="space-y-4">
                <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: "#DDD6FE" }}>
                  {log.observation}
                </p>

                {/* Traits Observed */}
                {log.traits_observed && log.traits_observed.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold mb-2" style={{ color: "#C7C9E6", opacity: 0.8 }}>
                      Traits Observed:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {log.traits_observed.map((trait, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 rounded-lg text-xs backdrop-blur-xl"
                          style={{
                            background: "rgba(154, 226, 211, 0.15)",
                            border: "1px solid rgba(154, 226, 211, 0.3)",
                            color: "#A7F3D0"
                          }}
                        >
                          {trait}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Photos */}
                {log.photos && log.photos.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <ImageIcon className="w-4 h-4" style={{ color: "#C4B5FD", strokeWidth: 1.8 }} />
                      <span className="text-xs font-semibold" style={{ color: "#DDD6FE" }}>
                        {log.photos.length} {log.photos.length === 1 ? "Photo" : "Photos"}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {log.photos.map((photo, i) => (
                        <a
                          key={i}
                          href={photo}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="glass-card rounded-2xl overflow-hidden aspect-square hover:ring-2 hover:ring-offset-0 transition-all group"
                          style={{
                            ringColor: "rgba(168, 159, 239, 0.5)",
                            boxShadow: "inset 0 2px 8px rgba(32, 24, 51, 0.4), 0 4px 16px rgba(32, 24, 51, 0.3)"
                          }}
                        >
                          <img 
                            src={photo} 
                            alt={`Log photo ${i + 1}`} 
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            style={{ filter: "contrast(1.05) saturate(1.1)" }}
                          />
                        </a>
                      ))}
                    </div>
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