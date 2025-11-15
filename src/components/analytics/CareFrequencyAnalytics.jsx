
import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Droplets, Leaf, Scissors, Shovel } from "lucide-react";

export default function CareFrequencyAnalytics({ careLogs, plants }) {
  // Count care types
  const careTypeCounts = {
    watering: careLogs.filter(log => log.care_type === 'watering').length,
    fertilizing: careLogs.filter(log => log.care_type === 'fertilizing').length,
    grooming: careLogs.filter(log => log.care_type === 'grooming').length,
    repotting: careLogs.filter(log => log.care_type === 'repotting').length
  };

  const chartData = [
    { name: 'Watering', count: careTypeCounts.watering, color: '#7DD3FC' },
    { name: 'Fertilizing', count: careTypeCounts.fertilizing, color: '#A7F3D0' },
    { name: 'Grooming', count: careTypeCounts.grooming, color: '#C4B5FD' },
    { name: 'Repotting', count: careTypeCounts.repotting, color: '#FCD34D' }
  ];

  const totalCare = Object.values(careTypeCounts).reduce((sum, count) => sum + count, 0);
  const avgCarePerPlant = plants.length > 0 ? (totalCare / plants.length).toFixed(1) : 0;

  // Calculate most active care day
  const dayOfWeekCounts = {};
  careLogs.forEach(log => {
    const date = new Date(log.care_date);
    const day = date.toLocaleDateString('en-US', { weekday: 'long' });
    dayOfWeekCounts[day] = (dayOfWeekCounts[day] || 0) + 1;
  });
  const mostActiveDay = Object.entries(dayOfWeekCounts)
    .sort(([, a], [, b]) => b - a)[0]?.[0] || "N/A";

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-card rounded-2xl p-3 shadow-lg">
          {/* Changed color to CSS variable, kept payload data consistent with chartData */}
          <p className="text-xs font-semibold mb-1" style={{ color: "var(--text-primary)" }}>
            {payload[0].payload.name}
          </p>
          {/* Kept dynamic color and original text content consistent with chartData */}
          <p className="text-xs" style={{ color: payload[0].payload.color }}>
            {payload[0].value} actions
          </p>
        </div>
      );
    }
    return null;
  };

  const getIcon = (name) => {
    switch (name) {
      case 'Watering': return <Droplets className="w-4 h-4" style={{ color: "#7DD3FC" }} />;
      case 'Fertilizing': return <Leaf className="w-4 h-4" style={{ color: "#A7F3D0" }} />;
      case 'Grooming': return <Scissors className="w-4 h-4" style={{ color: "#C4B5FD" }} />;
      case 'Repotting': return <Shovel className="w-4 h-4" style={{ color: "#FCD34D" }} />;
      default: return null;
    }
  };

  return (
    <div className="glass-card rounded-3xl p-6">
      <div className="mb-6">
        <h3 className="text-lg font-bold mb-2" style={{ 
          color: "var(--text-primary)",
          textShadow: "var(--heading-shadow)",
          fontFamily: "'Playfair Display', Georgia, serif"
        }}>
          Care Activity Breakdown
        </h3>
        <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
          Analysis of your plant care habits and patterns
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Chart */}
        <div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(227, 201, 255, 0.1)" />
              <XAxis 
                dataKey="name" 
                stroke="var(--text-muted)" 
                style={{ fontSize: '11px', fill: 'var(--text-muted)' }}
                angle={-20}
                textAnchor="end"
                height={60}
              />
              <YAxis 
                stroke="var(--text-muted)" 
                style={{ fontSize: '12px', fill: 'var(--text-muted)' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="count" 
                fill="#A7F3D0"
                radius={[8, 8, 0, 0]}
              >
                {chartData.map((entry, index) => (
                  <Bar key={`bar-${index}`} dataKey="count" fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Stats */}
        <div className="space-y-3">
          {chartData.map(item => (
            <div key={item.name} className="glass-button rounded-2xl p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getIcon(item.name)}
                  <div>
                    <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                      {item.name}
                    </p>
                    <p className="text-xs" style={{ color: "var(--text-secondary)", opacity: 0.8 }}>
                      {totalCare > 0 ? Math.round((item.count / totalCare) * 100) : 0}% of total care
                    </p>
                  </div>
                </div>
                <p className="text-xl font-bold" style={{ 
                  color: item.color,
                  fontFamily: "'Playfair Display', Georgia, serif"
                }}>
                  {item.count}
                </p>
              </div>
            </div>
          ))}

          <div className="glass-accent-moss rounded-2xl p-4 mt-4">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-xs font-semibold mb-1" style={{ color: "#FFFFFF" }}>
                  Avg Care/Plant
                </p>
                <p className="text-2xl font-bold" style={{ 
                  color: "#FFFFFF",
                  fontFamily: "'Playfair Display', Georgia, serif"
                }}>
                  {avgCarePerPlant}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold mb-1" style={{ color: "#FFFFFF" }}>
                  Most Active Day
                </p>
                <p className="text-lg font-bold" style={{ color: "#FFFFFF" }}>
                  {mostActiveDay}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
