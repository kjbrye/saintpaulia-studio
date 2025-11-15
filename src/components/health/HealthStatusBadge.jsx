import React from "react";
import { Heart, AlertTriangle, Sparkles } from "lucide-react";

const statusConfig = {
  excellent: {
    icon: Sparkles,
    label: "Excellent",
    bg: "linear-gradient(135deg, rgba(154, 226, 211, 0.22) 0%, rgba(129, 212, 198, 0.16) 100%)",
    border: "rgba(154, 226, 211, 0.45)",
    text: "#A7F3D0",
    iconColor: "#A7F3D0",
    shadow: "0 2px 10px rgba(154, 226, 211, 0.35), inset 0 0.5px 0 rgba(255, 255, 255, 0.2)"
  },
  good: {
    icon: Heart,
    label: "Good",
    bg: "linear-gradient(135deg, rgba(168, 159, 239, 0.22) 0%, rgba(139, 92, 246, 0.16) 100%)",
    border: "rgba(168, 159, 239, 0.45)",
    text: "#C4B5FD",
    iconColor: "#C4B5FD",
    shadow: "0 2px 10px rgba(168, 159, 239, 0.35), inset 0 0.5px 0 rgba(255, 255, 255, 0.2)"
  },
  concerning: {
    icon: AlertTriangle,
    label: "Concerning",
    bg: "linear-gradient(135deg, rgba(251, 146, 60, 0.18) 0%, rgba(249, 115, 22, 0.13) 100%)",
    border: "rgba(251, 146, 60, 0.4)",
    text: "#FCD34D",
    iconColor: "#FCD34D",
    shadow: "0 2px 10px rgba(251, 146, 60, 0.3), inset 0 0.5px 0 rgba(255, 255, 255, 0.18)"
  },
  critical: {
    icon: AlertTriangle,
    label: "Critical",
    bg: "linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(220, 38, 38, 0.15) 100%)",
    border: "rgba(239, 68, 68, 0.45)",
    text: "#FCA5A5",
    iconColor: "#FCA5A5",
    shadow: "0 2px 10px rgba(239, 68, 68, 0.35), inset 0 0.5px 0 rgba(255, 255, 255, 0.2)"
  }
};

export default function HealthStatusBadge({ status, size = "md" }) {
  const config = statusConfig[status] || statusConfig.good;
  const Icon = config.icon;
  
  const sizeClasses = {
    sm: "px-2 py-1 text-xs",
    md: "px-3 py-1.5 text-sm",
    lg: "px-4 py-2 text-base"
  };

  return (
    <div 
      className={`backdrop-blur-xl ${sizeClasses[size]} rounded-2xl inline-flex items-center gap-1.5 font-semibold icon-duotone`}
      style={{
        background: config.bg,
        border: `1px solid ${config.border}`,
        color: config.text,
        boxShadow: config.shadow
      }}
    >
      <Icon className="w-3.5 h-3.5" style={{ color: config.iconColor, strokeWidth: 2 }} />
      {config.label}
    </div>
  );
}