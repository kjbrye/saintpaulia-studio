import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { FolderOpen } from "lucide-react";

const COLOR_OPTIONS = {
  lavender: { bg: "rgba(227, 201, 255, 0.2)", border: "rgba(227, 201, 255, 0.4)", text: "#F0EBFF" },
  moss: { bg: "rgba(154, 226, 211, 0.2)", border: "rgba(154, 226, 211, 0.4)", text: "#A7F3D0" },
  mint: { bg: "rgba(167, 243, 208, 0.2)", border: "rgba(167, 243, 208, 0.4)", text: "#A7F3D0" },
  rose: { bg: "rgba(251, 113, 133, 0.2)", border: "rgba(251, 113, 133, 0.4)", text: "#FCA5A5" },
  amber: { bg: "rgba(251, 191, 36, 0.2)", border: "rgba(251, 191, 36, 0.4)", text: "#FCD34D" },
  sky: { bg: "rgba(125, 211, 252, 0.2)", border: "rgba(125, 211, 252, 0.4)", text: "#7DD3FC" }
};

export default function CollectionSelector({ selectedCollections, onChange }) {
  const { data: collections = [] } = useQuery({
    queryKey: ['plantCollections'],
    queryFn: () => base44.entities.PlantCollection.list(),
    initialData: []
  });

  const isInCollection = (collectionId) => {
    return selectedCollections.includes(collectionId);
  };

  const toggleCollection = (collectionId) => {
    if (isInCollection(collectionId)) {
      onChange(selectedCollections.filter(id => id !== collectionId));
    } else {
      onChange([...selectedCollections, collectionId]);
    }
  };

  if (collections.length === 0) {
    return (
      <div className="text-center py-4">
        <FolderOpen className="w-8 h-8 mx-auto mb-2" style={{ color: "#C4B5FD", opacity: 0.5 }} />
        <p className="text-sm" style={{ color: "#DDD6FE" }}>
          No collections yet. Create one in the library!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-sm font-semibold mb-3" style={{ color: "#F5F3FF" }}>
        Add to Collections
      </p>
      <div className="grid grid-cols-2 gap-2">
        {collections.map(collection => {
          const colorConfig = COLOR_OPTIONS[collection.color] || COLOR_OPTIONS.lavender;
          const selected = isInCollection(collection.id);

          return (
            <button
              key={collection.id}
              type="button"
              onClick={() => toggleCollection(collection.id)}
              className={`px-4 py-3 rounded-2xl text-sm font-medium transition-all ${
                selected ? "ring-2 ring-offset-0" : ""
              }`}
              style={{
                background: selected ? colorConfig.bg : "rgba(221, 214, 254, 0.08)",
                border: `1px solid ${selected ? colorConfig.border : "rgba(221, 214, 254, 0.2)"}`,
                color: selected ? colorConfig.text : "#DDD6FE",
                ringColor: colorConfig.border
              }}
            >
              {collection.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}