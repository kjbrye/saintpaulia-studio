import React from "react";
import { Link } from "react-router-dom";
import { MapPin } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";

const COLOR_MAP = {
  lavender: { bg: "rgba(227, 201, 255, 0.2)", border: "rgba(227, 201, 255, 0.4)", text: "#E9D5FF" },
  moss: { bg: "rgba(167, 243, 208, 0.2)", border: "rgba(167, 243, 208, 0.4)", text: "#A7F3D0" },
  mint: { bg: "rgba(154, 226, 211, 0.2)", border: "rgba(154, 226, 211, 0.4)", text: "#9AE2D3" },
  rose: { bg: "rgba(252, 165, 165, 0.2)", border: "rgba(252, 165, 165, 0.4)", text: "#FCA5A5" },
  amber: { bg: "rgba(252, 211, 77, 0.2)", border: "rgba(252, 211, 77, 0.4)", text: "#FCD34D" },
  sky: { bg: "rgba(125, 211, 252, 0.2)", border: "rgba(125, 211, 252, 0.4)", text: "#7DD3FC" }
};

export default function LocationBadge({ locationId, clickable = true }) {
  const { data: location } = useQuery({
    queryKey: ['location', locationId],
    queryFn: () => base44.entities.Location.filter({ id: locationId }).then(locations => locations[0]),
    enabled: !!locationId
  });

  if (!location) return null;

  const colors = COLOR_MAP[location.color] || COLOR_MAP.lavender;

  const badge = (
    <div 
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium backdrop-blur-xl transition-all"
      style={{
        background: colors.bg,
        border: `1px solid ${colors.border}`,
        color: colors.text,
        boxShadow: `0 2px 8px ${colors.border}40`
      }}
    >
      <MapPin className="w-3 h-3" style={{ strokeWidth: 2 }} />
      <span>{location.name}</span>
    </div>
  );

  if (clickable) {
    return (
      <Link to={createPageUrl(`LocationDetail?id=${locationId}`)}>
        {badge}
      </Link>
    );
  }

  return badge;
}