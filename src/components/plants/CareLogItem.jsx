
import React from "react";
import { Droplets, Leaf, Shovel, Scissors, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";

const careIconMap = {
  watering: { icon: Droplets, gradient: "from-blue-200 to-blue-300", color: "#7DD3FC" },
  fertilizing: { icon: Leaf, gradient: "from-emerald-200 to-emerald-300", color: "#A7F3D0" },
  repotting: { icon: Shovel, gradient: "from-amber-200 to-amber-300", color: "#FCD34D" },
  grooming: { icon: Scissors, gradient: "from-purple-200 to-purple-300", color: "#F0EBFF" }
};

export default function CareLogItem({ log, plantId }) {
  const queryClient = useQueryClient();
  const config = careIconMap[log.care_type] || careIconMap.watering;
  const Icon = config.icon;

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me().catch(() => null),
  });

  const currentTheme = currentUser?.theme || "glassmorphism";

  const deleteMutation = useMutation({
    mutationFn: () => base44.entities.CareLog.delete(log.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['careLogs', plantId] });
    }
  });

  const handleDelete = () => {
    if (window.confirm("Delete this care log entry?")) {
      deleteMutation.mutate();
    }
  };

  return (
    <div className="glass-card rounded-2xl p-4 flex items-start gap-4 group">
      <div 
        className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 backdrop-blur-xl"
        style={{
          background: `${config.color}30`,
          border: `1px solid ${config.color}60`
        }}
      >
        <Icon className="w-6 h-6" style={{ color: config.color, strokeWidth: 1.8 }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <h4 className="font-semibold capitalize" style={{ color: (currentTheme === 'light' || currentTheme === 'minimal') ? 'var(--text-primary)' : "#F5F3FF" }}>
            {log.care_type.replace('_', ' ')}
          </h4>
          <button
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="opacity-0 group-hover:opacity-100 transition-opacity glass-button w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ color: "#FCA5A5" }}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
        <p className="text-sm mb-2" style={{ color: (currentTheme === 'light' || currentTheme === 'minimal') ? 'var(--text-secondary)' : "#DDD6FE" }}>
          {format(new Date(log.care_date), "MMM d, yyyy 'at' h:mm a")}
        </p>

        {/* Conditional Details */}
        {log.watering_method && (
          <p className="text-sm mb-1" style={{ color: (currentTheme === 'light' || currentTheme === 'minimal') ? 'var(--text-secondary)' : "#DDD6FE", opacity: 0.9 }}>
            Method: <span className="font-medium" style={{ color: (currentTheme === 'light' || currentTheme === 'minimal') ? 'var(--text-primary)' : "#F5F3FF" }}>
              {log.watering_method === "top" ? "Top Watering" :
               log.watering_method === "bottom" ? "Bottom Watering" :
               log.watering_method === "wick" ? "Wick Watering" :
               log.watering_method === "self-watering" ? "Self-Watering Pot" :
               log.watering_method === "mist" ? "Misting" : log.watering_method}
            </span>
          </p>
        )}

        {log.fertilizer_type && (
          <p className="text-sm mb-1" style={{ color: (currentTheme === 'light' || currentTheme === 'minimal') ? 'var(--text-secondary)' : "#DDD6FE", opacity: 0.9 }}>
            Fertilizer: <span className="font-medium" style={{ color: (currentTheme === 'light' || currentTheme === 'minimal') ? 'var(--text-primary)' : "#F5F3FF" }}>{log.fertilizer_type}</span>
          </p>
        )}

        {(log.new_pot_size || log.new_soil_mix) && (
          <div className="text-sm mb-1" style={{ color: (currentTheme === 'light' || currentTheme === 'minimal') ? 'var(--text-secondary)' : "#DDD6FE", opacity: 0.9 }}>
            {log.new_pot_size && (
              <p>New Pot: <span className="font-medium" style={{ color: (currentTheme === 'light' || currentTheme === 'minimal') ? 'var(--text-primary)' : "#F5F3FF" }}>{log.new_pot_size}"</span></p>
            )}
            {log.new_soil_mix && (
              <p>Soil: <span className="font-medium" style={{ color: (currentTheme === 'light' || currentTheme === 'minimal') ? 'var(--text-primary)' : "#F5F3FF" }}>{log.new_soil_mix}</span></p>
            )}
          </div>
        )}

        {log.notes && (
          <p className="text-sm mt-2" style={{ color: (currentTheme === 'light' || currentTheme === 'minimal') ? 'var(--text-secondary)' : "#DDD6FE", opacity: 0.9 }}>
            {log.notes}
          </p>
        )}
      </div>
    </div>
  );
}
