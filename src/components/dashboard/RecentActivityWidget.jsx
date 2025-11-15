import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Activity, Droplets, Heart, BookOpen, Flower2 } from "lucide-react";

export default function RecentActivityWidget({ careLogs, healthLogs, journalEntries, bloomLogs, plants }) {
  // Combine and sort all activities
  const activities = [
    ...careLogs.map(log => ({ ...log, type: 'care', date: log.care_date })),
    ...healthLogs.map(log => ({ ...log, type: 'health', date: log.observation_date })),
    ...journalEntries.map(log => ({ ...log, type: 'journal', date: log.entry_date })),
    ...bloomLogs.map(log => ({ ...log, type: 'bloom', date: log.bloom_start_date }))
  ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 10);

  const getActivityIcon = (type) => {
    switch(type) {
      case 'care': return <Droplets className="w-4 h-4" style={{ color: "#7DD3FC", strokeWidth: 1.8 }} />;
      case 'health': return <Heart className="w-4 h-4" style={{ color: "#FCA5A5", strokeWidth: 1.8 }} />;
      case 'journal': return <BookOpen className="w-4 h-4" style={{ color: "#C4B5FD", strokeWidth: 1.8 }} />;
      case 'bloom': return <Flower2 className="w-4 h-4" style={{ color: "#F0ABFC", strokeWidth: 1.8 }} />;
      default: return <Activity className="w-4 h-4" style={{ color: "#DDD6FE", strokeWidth: 1.8 }} />;
    }
  };

  const getActivityTitle = (activity) => {
    const plant = plants.find(p => p.id === activity.plant_id);
    const plantName = plant?.nickname || plant?.cultivar_name || 'Unknown plant';

    switch(activity.type) {
      case 'care': 
        return `${activity.care_type.charAt(0).toUpperCase() + activity.care_type.slice(1)} - ${plantName}`;
      case 'health':
        return `Health check - ${plantName}`;
      case 'journal':
        return activity.title || `Journal entry - ${plantName}`;
      case 'bloom':
        return `Bloom cycle started - ${plantName}`;
      default:
        return 'Activity';
    }
  };

  return (
    <div className="neuro-card rounded-3xl p-8">
      <h2 className="text-xl font-bold mb-8 flex items-center gap-2" style={{ 
        color: "var(--text-primary)",
        textShadow: "0 1px 3px rgba(32, 24, 51, 0.4)",
        fontFamily: "'Playfair Display', Georgia, serif"
      }}>
        <Activity className="w-6 h-6" style={{ color: "#C4B5FD", strokeWidth: 1.5 }} />
        Recent Activity
      </h2>

      <div className="space-y-3 max-h-[400px] overflow-y-auto">
        {activities.length === 0 ? (
          <div className="text-center py-14">
            <Activity className="w-12 h-12 mx-auto mb-3" style={{ color: "#C4B5FD", opacity: 0.5 }} />
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              No recent activity
            </p>
            <p className="text-xs mt-2" style={{ color: "var(--text-secondary)", opacity: 0.7 }}>
              Start logging care actions
            </p>
          </div>
        ) : (
          activities.map((activity, idx) => {
            const plant = plants.find(p => p.id === activity.plant_id);
            return (
              <Link key={`${activity.type}-${activity.id}-${idx}`} to={createPageUrl(`PlantDetail?id=${activity.plant_id}`)}>
                <div className="neuro-button rounded-2xl p-4">
                  <div className="flex items-start gap-3">
                    <div className="neuro-icon-well w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm mb-1" style={{ color: "var(--text-primary)" }}>
                        {getActivityTitle(activity)}
                      </h4>
                      <p className="text-xs" style={{ color: "var(--text-secondary)", opacity: 0.8 }}>
                        {new Date(activity.date).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}