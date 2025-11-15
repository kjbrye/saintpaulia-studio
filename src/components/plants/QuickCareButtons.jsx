
import React, { useState } from "react";
import { Droplets, Leaf, Shovel, Scissors } from "lucide-react";
import CareLogForm from "./CareLogForm";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

const careTypes = [
  { 
    type: "watering", 
    icon: Droplets, 
    label: "Water",
    gradient: "from-blue-200 to-blue-300",
    color: "#7DD3FC"
  },
  { 
    type: "fertilizing", 
    icon: Leaf, 
    label: "Fertilize",
    gradient: "from-emerald-200 to-emerald-300",
    color: "#A7F3D0"
  },
  { 
    type: "grooming", 
    icon: Scissors, 
    label: "Groom",
    gradient: "from-purple-200 to-purple-300",
    color: "#F0EBFF"
  },
  { 
    type: "repotting", 
    icon: Shovel, 
    label: "Repot",
    gradient: "from-amber-200 to-amber-300",
    color: "#FCD34D"
  }
];

export default function QuickCareButtons({ plantId }) {
  const [showForm, setShowForm] = useState(false);
  const [selectedCareType, setSelectedCareType] = useState(null);

  const { data: plant } = useQuery({
    queryKey: ['plant', plantId],
    queryFn: () => base44.entities.Plant.filter({ id: plantId }).then(plants => plants[0]),
    enabled: !!plantId
  });

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me().catch(() => null),
  });

  const currentTheme = currentUser?.theme || "glassmorphism";

  const handleCareClick = (careType) => {
    setSelectedCareType(careType);
    setShowForm(true);
  };

  const handleClose = () => {
    setShowForm(false);
    setSelectedCareType(null);
  };

  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        {careTypes.map(({ type, icon: Icon, label, gradient, color }) => (
          <button
            key={type}
            onClick={() => handleCareClick(type)}
            className="glass-button px-4 py-4 rounded-2xl font-semibold flex flex-col items-center gap-2 hover:opacity-90 transition-all group"
          >
            <div 
              className="w-12 h-12 rounded-2xl flex items-center justify-center backdrop-blur-xl transition-all group-hover:scale-110"
              style={{
                background: `${color}30`,
                border: `1px solid ${color}60`
              }}
            >
              <Icon className="w-6 h-6" style={{ color, strokeWidth: 1.8 }} />
            </div>
            <span className="text-sm" style={{ color: (currentTheme === 'light' || currentTheme === 'minimal') ? 'var(--text-primary)' : "#F5F3FF" }}>{label}</span>
          </button>
        ))}
      </div>

      {showForm && (
        <CareLogForm
          plantId={plantId}
          plant={plant}
          careType={selectedCareType}
          onClose={handleClose}
        />
      )}
    </>
  );
}
