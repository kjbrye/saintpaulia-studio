import React from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";

const COLOR_OPTIONS = {
  lavender: { bg: "rgba(227, 201, 255, 0.2)", border: "rgba(227, 201, 255, 0.4)", text: "#F0EBFF" },
  moss: { bg: "rgba(154, 226, 211, 0.2)", border: "rgba(154, 226, 211, 0.4)", text: "#A7F3D0" },
  mint: { bg: "rgba(167, 243, 208, 0.2)", border: "rgba(167, 243, 208, 0.4)", text: "#A7F3D0" },
  rose: { bg: "rgba(251, 113, 133, 0.2)", border: "rgba(251, 113, 133, 0.4)", text: "#FCA5A5" },
  amber: { bg: "rgba(251, 191, 36, 0.2)", border: "rgba(251, 191, 36, 0.4)", text: "#FCD34D" },
  sky: { bg: "rgba(125, 211, 252, 0.2)", border: "rgba(125, 211, 252, 0.4)", text: "#7DD3FC" }
};

export default function CollectionBadges({ plantId, maxDisplay = 2 }) {
  const { data: collections = [] } = useQuery({
    queryKey: ['plantCollections'],
    queryFn: () => base44.entities.PlantCollection.list(),
    initialData: []
  });

  const plantCollections = collections.filter(c => 
    c.plant_ids && c.plant_ids.includes(plantId)
  );

  if (plantCollections.length === 0) return null;

  const displayedCollections = plantCollections.slice(0, maxDisplay);
  const remainingCount = plantCollections.length - maxDisplay;

  return (
    <div className="flex flex-wrap gap-1.5">
      {displayedCollections.map(collection => {
        const colorConfig = COLOR_OPTIONS[collection.color] || COLOR_OPTIONS.lavender;
        
        return (
          <Link
            key={collection.id}
            to={createPageUrl(`CollectionDetail?id=${collection.id}`)}
            onClick={(e) => e.stopPropagation()}
          >
            <span
              className="px-2 py-1 rounded-lg text-xs font-medium backdrop-blur-xl hover:opacity-80 transition-opacity cursor-pointer inline-block"
              style={{
                background: colorConfig.bg,
                border: `1px solid ${colorConfig.border}`,
                color: colorConfig.text
              }}
            >
              {collection.name}
            </span>
          </Link>
        );
      })}
      {remainingCount > 0 && (
        <span
          className="px-2 py-1 rounded-lg text-xs font-medium backdrop-blur-xl"
          style={{
            background: "rgba(221, 214, 254, 0.15)",
            border: "1px solid rgba(221, 214, 254, 0.3)",
            color: "var(--text-secondary)"
          }}
        >
          +{remainingCount}
        </span>
      )}
    </div>
  );
}