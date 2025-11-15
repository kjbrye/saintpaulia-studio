import React, { useState } from "react";
import { X, LayoutGrid, Eye, EyeOff } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const WIDGET_OPTIONS = [
  {
    id: "collection_stats",
    name: "Collection Stats",
    description: "Total plants, projects, and collection overview",
    category: "Overview"
  },
  {
    id: "care_overview",
    name: "Care Activity",
    description: "This month's care actions and blooming plants",
    category: "Overview"
  },
  {
    id: "plants_needing_care",
    name: "Plants Needing Care",
    description: "List of plants that need watering, fertilizing, or grooming",
    category: "Alerts"
  },
  {
    id: "active_issues",
    name: "Active Issues",
    description: "Plants with active pest or disease problems",
    category: "Alerts"
  },
  {
    id: "low_stock_supplies",
    name: "Low Stock Supplies",
    description: "Supplies running low that need restocking",
    category: "Alerts"
  },
  {
    id: "currently_blooming",
    name: "Currently Blooming",
    description: "Plants that are currently flowering",
    category: "Status"
  },
  {
    id: "recent_activity",
    name: "Recent Activity",
    description: "Your latest care logs, journal entries, and updates",
    category: "Activity"
  },
  {
    id: "quick_actions",
    name: "Quick Action Bar",
    description: "Fast navigation to Library, Projects, Analytics, etc.",
    category: "Navigation"
  },
  {
    id: "care_calendar",
    name: "Upcoming Care Calendar",
    description: "Calendar view of upcoming care tasks (Coming Soon)",
    category: "Planning",
    comingSoon: true
  },
  {
    id: "collection_growth",
    name: "Collection Growth Chart",
    description: "Visualize how your collection has grown over time (Coming Soon)",
    category: "Analytics",
    comingSoon: true
  }
];

const CATEGORIES = ["Overview", "Alerts", "Status", "Activity", "Navigation", "Planning", "Analytics"];

export default function DashboardCustomizer({ currentUser, onClose }) {
  const queryClient = useQueryClient();
  const [widgets, setWidgets] = useState(
    currentUser?.dashboard_widgets || {
      collection_stats: true,
      care_overview: true,
      plants_needing_care: true,
      active_issues: true,
      low_stock_supplies: true,
      currently_blooming: true,
      recent_activity: true,
      quick_actions: true,
      care_calendar: false,
      collection_growth: false
    }
  );

  const updateMutation = useMutation({
    mutationFn: (dashboard_widgets) => base44.auth.updateMe({ dashboard_widgets }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      toast.success("Dashboard customized!", {
        description: "Your widget preferences have been saved."
      });
      onClose();
    },
    onError: (error) => {
      toast.error("Update failed", {
        description: error.message || "Please try again."
      });
    }
  });

  const toggleWidget = (widgetId) => {
    setWidgets(prev => ({
      ...prev,
      [widgetId]: !prev[widgetId]
    }));
  };

  const handleSave = () => {
    updateMutation.mutate(widgets);
  };

  const enabledCount = Object.values(widgets).filter(Boolean).length;

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass-card rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="sticky top-0 backdrop-blur-2xl rounded-t-3xl p-6 flex items-center justify-between"
          style={{
            background: "linear-gradient(135deg, rgba(227, 201, 255, 0.2) 0%, rgba(168, 159, 239, 0.15) 100%)",
            borderBottom: "1px solid rgba(227, 201, 255, 0.2)"
          }}>
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2" style={{ 
              color: "#F5F3FF",
              textShadow: "0 2px 4px rgba(32, 24, 51, 0.4)",
              fontFamily: "'Playfair Display', Georgia, serif"
            }}>
              <LayoutGrid className="w-6 h-6" style={{ color: "#C4B5FD" }} />
              Customize Dashboard
            </h2>
            <p className="text-sm mt-1" style={{ color: "#DDD6FE" }}>
              {enabledCount} of {WIDGET_OPTIONS.length} widgets enabled
            </p>
          </div>
          <button
            onClick={onClose}
            className="glass-button w-10 h-10 rounded-2xl flex items-center justify-center"
            style={{ color: "#DDD6FE" }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {CATEGORIES.map(category => {
            const categoryWidgets = WIDGET_OPTIONS.filter(w => w.category === category);
            if (categoryWidgets.length === 0) return null;

            return (
              <div key={category}>
                <h3 className="text-sm font-bold mb-3" style={{ 
                  color: "#C7C9E6",
                  opacity: 0.9
                }}>
                  {category}
                </h3>
                <div className="space-y-3">
                  {categoryWidgets.map(widget => (
                    <button
                      key={widget.id}
                      onClick={() => !widget.comingSoon && toggleWidget(widget.id)}
                      disabled={widget.comingSoon}
                      className={`w-full text-left p-4 rounded-2xl transition-all ${
                        widgets[widget.id] ? "glass-accent-lavender" : "glass-button"
                      } ${widget.comingSoon ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                      style={{ 
                        color: widgets[widget.id] ? "#F0EBFF" : "#DDD6FE"
                      }}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold">{widget.name}</h4>
                            {widget.comingSoon && (
                              <span className="text-xs px-2 py-0.5 rounded-lg"
                                style={{
                                  background: "rgba(252, 211, 77, 0.2)",
                                  border: "1px solid rgba(252, 211, 77, 0.4)",
                                  color: "#FCD34D"
                                }}>
                                Coming Soon
                              </span>
                            )}
                          </div>
                          <p className="text-xs opacity-80">{widget.description}</p>
                        </div>
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                          widgets[widget.id] ? "glass-card" : ""
                        }`}
                          style={{
                            background: widgets[widget.id] 
                              ? "rgba(255, 255, 255, 0.15)"
                              : undefined,
                            border: widgets[widget.id]
                              ? "1px solid rgba(255, 255, 255, 0.25)"
                              : undefined
                          }}>
                          {widgets[widget.id] ? (
                            <Eye className="w-5 h-5" style={{ strokeWidth: 2 }} />
                          ) : (
                            <EyeOff className="w-5 h-5" style={{ strokeWidth: 2, opacity: 0.5 }} />
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="sticky bottom-0 backdrop-blur-2xl rounded-b-3xl p-6 flex gap-3"
          style={{
            background: "linear-gradient(135deg, rgba(227, 201, 255, 0.2) 0%, rgba(168, 159, 239, 0.15) 100%)",
            borderTop: "1px solid rgba(227, 201, 255, 0.2)"
          }}>
          <button
            onClick={onClose}
            className="glass-button px-6 py-3 rounded-2xl font-semibold"
            style={{ color: "#DDD6FE" }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={updateMutation.isPending}
            className="glass-accent-lavender flex-1 px-6 py-3 rounded-2xl font-semibold disabled:opacity-50"
            style={{ color: "#F0EBFF" }}
          >
            {updateMutation.isPending ? "Saving..." : "Save Preferences"}
          </button>
        </div>
      </div>
    </div>
  );
}