
import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { PieChart as PieIcon, Package } from "lucide-react";

export default function CollectionBreakdown({ plants }) {
  // Blossom type breakdown
  const blossomTypeCounts = {};
  plants.forEach(plant => {
    if (plant.blossom_type) {
      blossomTypeCounts[plant.blossom_type] = (blossomTypeCounts[plant.blossom_type] || 0) + 1;
    }
  });

  const blossomData = Object.entries(blossomTypeCounts)
    .map(([type, count]) => ({
      name: type.replace(/_/g, ' '),
      value: count
    }))
    .sort((a, b) => b.value - a.value);

  // Leaf type breakdown
  const leafTypeCounts = {};
  plants.forEach(plant => {
    if (plant.leaf_type) {
      leafTypeCounts[plant.leaf_type] = (leafTypeCounts[plant.leaf_type] || 0) + 1;
    }
  });

  const leafData = Object.entries(leafTypeCounts)
    .map(([type, count]) => ({
      name: type.replace(/_/g, ' '),
      value: count
    }))
    .sort((a, b) => b.value - a.value);

  // Acquisition source breakdown
  const sourceCounts = {};
  plants.forEach(plant => {
    if (plant.source) {
      sourceCounts[plant.source] = (sourceCounts[plant.source] || 0) + 1;
    }
  });

  const topSources = Object.entries(sourceCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  // Color palettes
  const blossomColors = ['#A7F3D0', '#7DD3FC', '#C4B5FD', '#FCD34D', '#FCA5A5', '#93C5FD', '#E9D5FF'];
  const leafColors = ['#E3C9FF', '#A89FEF', '#C4B5FD', '#9AE2D3', '#7DD3FC', '#FCA5A5', '#FCD34D'];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-card rounded-2xl p-3 shadow-lg">
          <p className="text-xs font-semibold mb-1 capitalize" style={{ color: "var(--text-primary)" }}>
            {payload[0].name}
          </p>
          <p className="text-xs" style={{ color: payload[0].payload.fill }}>
            {payload[0].value} plants ({Math.round((payload[0].value / plants.length) * 100)}%)
          </p>
        </div>
      );
    }
    return null;
  };

  // Hybridizer stats
  const hybridizerCounts = {};
  plants.forEach(plant => {
    if (plant.hybridizer) {
      hybridizerCounts[plant.hybridizer] = (hybridizerCounts[plant.hybridizer] || 0) + 1;
    }
  });
  const topHybridizer = Object.entries(hybridizerCounts)
    .sort(([, a], [, b]) => b - a)[0];

  return (
    <div className="glass-card rounded-3xl p-6">
      <div className="mb-6">
        <h3 className="text-lg font-bold mb-2 flex items-center gap-2" style={{ 
          color: "var(--text-primary)",
          textShadow: "var(--heading-shadow)",
          fontFamily: "'Playfair Display', Georgia, serif"
        }}>
          <PieIcon className="w-5 h-5" style={{ color: "#C4B5FD", strokeWidth: 1.5 }} />
          Collection Breakdown
        </h3>
        <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
          Diversity analysis of your African violet collection
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Blossom Types */}
        <div>
          <h4 className="text-sm font-bold mb-4" style={{ color: "var(--text-primary)" }}>
            Blossom Types
          </h4>
          {blossomData.length === 0 ? (
            <p className="text-xs text-center py-8" style={{ color: "var(--text-secondary)" }}>
              No blossom type data
            </p>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={blossomData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {blossomData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={blossomColors[index % blossomColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1 mt-4">
                {blossomData.map((item, idx) => (
                  <div key={item.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ background: blossomColors[idx % blossomColors.length] }}
                      />
                      <span className="capitalize" style={{ color: "var(--text-secondary)" }}>
                        {item.name}
                      </span>
                    </div>
                    <span style={{ color: "var(--text-primary)" }}>
                      {item.value} ({Math.round((item.value / plants.length) * 100)}%)
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Leaf Types */}
        <div>
          <h4 className="text-sm font-bold mb-4" style={{ color: "var(--text-primary)" }}>
            Leaf Types
          </h4>
          {leafData.length === 0 ? (
            <p className="text-xs text-center py-8" style={{ color: "var(--text-secondary)" }}>
              No leaf type data
            </p>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={leafData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {leafData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={leafColors[index % leafColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1 mt-4">
                {leafData.map((item, idx) => (
                  <div key={item.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ background: leafColors[idx % leafColors.length] }}
                      />
                      <span className="capitalize" style={{ color: "var(--text-secondary)" }}>
                        {item.name}
                      </span>
                    </div>
                    <span style={{ color: "var(--text-primary)" }}>
                      {item.value} ({Math.round((item.value / plants.length) * 100)}%)
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Additional Stats */}
      <div className="grid md:grid-cols-2 gap-4 mt-6">
        {topSources.length > 0 && (
          <div className="glass-button rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Package className="w-4 h-4" style={{ color: "#A7F3D0" }} />
              <p className="text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>
                Top Acquisition Sources
              </p>
            </div>
            <div className="space-y-2">
              {topSources.map(([source, count]) => (
                <div key={source} className="flex items-center justify-between text-xs">
                  <span style={{ color: "var(--text-secondary)" }}>{source}</span>
                  <span style={{ color: "#A7F3D0" }}>{count}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {topHybridizer && (
          <div className="glass-button rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">🌱</span>
              <p className="text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>
                Most Common Hybridizer
              </p>
            </div>
            <p className="font-bold mb-1" style={{ color: "var(--text-primary)" }}>
              {topHybridizer[0]}
            </p>
            <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
              {topHybridizer[1]} plants ({Math.round((topHybridizer[1] / plants.length) * 100)}% of collection)
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
