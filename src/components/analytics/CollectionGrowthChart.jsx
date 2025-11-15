
import React from "react";
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";
import { format, eachMonthOfInterval, subMonths } from "date-fns";
import { TrendingUp } from "lucide-react";

export default function CollectionGrowthChart({ plants, timeRange }) {
  // Determine date range
  const getDateRange = () => {
    const now = new Date();
    switch (timeRange) {
      case "1month": return { start: subMonths(now, 1), end: now };
      case "3months": return { start: subMonths(now, 3), end: now };
      case "6months": return { start: subMonths(now, 6), end: now };
      case "1year": return { start: subMonths(now, 12), end: now };
      default: {
        // All time - find earliest acquisition date
        const earliestDate = plants.reduce((earliest, plant) => {
          if (!plant.acquisition_date) return earliest;
          const plantDate = new Date(plant.acquisition_date);
          return plantDate < earliest ? plantDate : earliest;
        }, new Date());
        return { start: earliestDate, end: now };
      }
    }
  };

  const { start, end } = getDateRange();
  const months = eachMonthOfInterval({ start, end });

  // Calculate cumulative plant count per month
  const chartData = months.map(month => {
    const monthEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0);
    const plantsAddedByMonth = plants.filter(plant => {
      if (!plant.acquisition_date) return false;
      const acquisitionDate = new Date(plant.acquisition_date);
      return acquisitionDate <= monthEnd;
    }).length;

    const plantsAddedThisMonth = plants.filter(plant => {
      if (!plant.acquisition_date) return false;
      const acquisitionDate = new Date(plant.acquisition_date);
      return acquisitionDate >= month && acquisitionDate <= monthEnd;
    }).length;

    return {
      month: format(month, "MMM yyyy"),
      total: plantsAddedByMonth,
      added: plantsAddedThisMonth,
      fullDate: month
    };
  });

  // Calculate growth metrics
  const totalGrowth = chartData.length > 1 
    ? chartData[chartData.length - 1].total - chartData[0].total 
    : 0;
  const avgMonthlyGrowth = chartData.length > 1
    ? Math.round(totalGrowth / (chartData.length - 1) * 10) / 10
    : 0;

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-card rounded-2xl p-3 shadow-lg">
          <p className="text-xs font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
            {payload[0].payload.month}
          </p>
          <p className="text-xs" style={{ color: "#A7F3D0" }}>
            Total: {payload[0].value} plants
          </p>
          {payload[0].payload.added > 0 && (
            <p className="text-xs" style={{ color: "#C4B5FD" }}>
              Added: {payload[0].payload.added} plants
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="glass-card rounded-3xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold flex items-center gap-2 mb-2" style={{ 
            color: "var(--text-primary)",
            textShadow: "var(--heading-shadow)",
            fontFamily: "'Playfair Display', Georgia, serif"
          }}>
            <TrendingUp className="w-5 h-5" style={{ color: "#A7F3D0", strokeWidth: 1.5 }} />
            Collection Growth
          </h3>
          <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
            Track how your collection has grown over time
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs font-semibold mb-1" style={{ color: "var(--text-secondary)" }}>
            Growth Rate
          </p>
          <p className="text-2xl font-bold" style={{ 
            color: "var(--text-primary)",
            fontFamily: "'Playfair Display', Georgia, serif"
          }}>
            {avgMonthlyGrowth > 0 ? '+' : ''}{avgMonthlyGrowth}
            <span className="text-sm"> /mo</span>
          </p>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
          <defs>
            <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#A7F3D0" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#A7F3D0" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(227, 201, 255, 0.1)" />
          <XAxis 
            dataKey="month" 
            stroke="var(--text-muted)" 
            style={{ fontSize: '12px', fill: 'var(--text-muted)' }}
            angle={-45}
            textAnchor="end"
            height={60}
          />
          <YAxis 
            stroke="#A7F3D0" 
            style={{ fontSize: '12px', fill: 'var(--text-muted)' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area 
            type="monotone" 
            dataKey="total" 
            stroke="#A7F3D0" 
            strokeWidth={3}
            fill="url(#colorTotal)"
            name="Total Plants"
            dot={{ fill: '#A7F3D0', r: 4 }}
            activeDot={{ r: 6 }}
          />
        </AreaChart>
      </ResponsiveContainer>

      <div className="mt-4 flex items-center justify-between text-xs" style={{ color: "var(--text-secondary)" }}>
        <span>Growth: +{totalGrowth} plants</span>
        <span>Current: {plants.length} plants</span>
      </div>
    </div>
  );
}
