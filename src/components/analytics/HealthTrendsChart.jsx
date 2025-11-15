
import React from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { format, startOfWeek, eachWeekOfInterval, subWeeks } from "date-fns";
import { Activity, TrendingUp, TrendingDown } from "lucide-react";

export default function HealthTrendsChart({ healthLogs }) {
  // Map health status to numeric score
  const healthScore = {
    'excellent': 5,
    'good': 4,
    'fair': 3,
    'concerning': 2,
    'critical': 1
  };

  // Get weekly average health scores
  const now = new Date();
  const startDate = subWeeks(now, 12); // Last 12 weeks
  const weeks = eachWeekOfInterval({ start: startDate, end: now });

  const chartData = weeks.map(weekStart => {
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);

    const weekLogs = healthLogs.filter(log => {
      const logDate = new Date(log.observation_date);
      return logDate >= weekStart && logDate < weekEnd;
    });

    const avgScore = weekLogs.length > 0
      ? weekLogs.reduce((sum, log) => sum + (healthScore[log.health_status] || 0), 0) / weekLogs.length
      : null;

    return {
      week: format(weekStart, "MMM d"),
      score: avgScore ? Math.round(avgScore * 10) / 10 : null,
      count: weekLogs.length,
      fullDate: weekStart
    };
  }).filter(d => d.score !== null);

  // Calculate trend
  const recentAvg = chartData.slice(-4).reduce((sum, d) => sum + (d.score || 0), 0) / 4;
  const olderAvg = chartData.slice(0, 4).reduce((sum, d) => sum + (d.score || 0), 0) / 4;
  const trend = recentAvg - olderAvg;

  // Overall health distribution
  const healthCounts = {
    excellent: healthLogs.filter(l => l.health_status === 'excellent').length,
    good: healthLogs.filter(l => l.health_status === 'good').length,
    fair: healthLogs.filter(l => l.health_status === 'fair').length,
    concerning: healthLogs.filter(l => l.health_status === 'concerning').length,
    critical: healthLogs.filter(l => l.health_status === 'critical').length
  };

  const totalLogs = Object.values(healthCounts).reduce((sum, count) => sum + count, 0);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-card rounded-2xl p-3 shadow-lg">
          <p className="text-xs font-semibold mb-1" style={{ color: "var(--text-primary)" }}>
            Week of {payload[0].payload.week}
          </p>
          <p className="text-xs" style={{ color: "#7DD3FC" }}>
            Avg Health: {payload[0].value}/5
          </p>
          <p className="text-xs" style={{ color: "var(--text-secondary)", opacity: 0.8 }}>
            {payload[0].payload.count} observations
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="glass-card rounded-3xl p-6">
      <div className="mb-6">
        <h3 className="text-lg font-bold mb-2 flex items-center gap-2" style={{ 
          color: "var(--text-primary)",
          textShadow: "var(--heading-shadow)",
          fontFamily: "'Playfair Display', Georgia, serif"
        }}>
          <Activity className="w-5 h-5" style={{ color: "#7DD3FC", strokeWidth: 1.5 }} />
          Health Trends
        </h3>
        <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
          Weekly average health scores for your collection
        </p>
      </div>

      {chartData.length === 0 ? (
        <div className="text-center py-12">
          <Activity className="w-8 h-8 mx-auto mb-2" style={{ color: "#C4B5FD", opacity: 0.5 }} />
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            No health observations logged yet
          </p>
        </div>
      ) : (
        <>
          {/* Trend Indicator */}
          <div className="glass-button rounded-2xl p-4 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {trend > 0 ? (
                  <TrendingUp className="w-5 h-5" style={{ color: "#A7F3D0" }} />
                ) : (
                  <TrendingDown className="w-5 h-5" style={{ color: "#FCA5A5" }} />
                )}
                <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                  {trend > 0 ? 'Improving' : trend < 0 ? 'Declining' : 'Stable'} Health Trend
                </span>
              </div>
              <span className="text-xl font-bold" style={{ 
                color: trend > 0 ? "#A7F3D0" : trend < 0 ? "#FCA5A5" : "#FCD34D",
                fontFamily: "'Playfair Display', Georgia, serif"
              }}>
                {trend > 0 ? '+' : ''}{trend.toFixed(1)}
              </span>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(227, 201, 255, 0.1)" />
              <XAxis 
                dataKey="week" 
                stroke="var(--text-muted)" 
                style={{ fontSize: '11px', fill: 'var(--text-muted)' }}
                angle={-30}
                textAnchor="end"
                height={60}
              />
              <YAxis 
                stroke="#7DD3FC" 
                style={{ fontSize: '12px', fill: 'var(--text-muted)' }}
                domain={[1, 5]}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey="score" 
                stroke="#7DD3FC" 
                strokeWidth={3}
                dot={{ fill: '#7DD3FC', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>

          {/* Health Distribution */}
          <div className="mt-4 space-y-2">
            <p className="text-xs font-semibold mb-2" style={{ color: "var(--text-secondary)" }}>
              Health Status Distribution
            </p>
            {Object.entries(healthCounts).map(([status, count]) => {
              if (count === 0) return null;
              const percentage = totalLogs > 0 ? Math.round((count / totalLogs) * 100) : 0;
              const colors = {
                excellent: '#A7F3D0',
                good: '#7DD3FC',
                fair: '#FCD34D',
                concerning: '#FCA5A5',
                critical: '#EF4444'
              };
              return (
                <div key={status} className="flex items-center gap-2">
                  <span className="text-xs capitalize w-24" style={{ color: "var(--text-secondary)" }}>
                    {status}
                  </span>
                  <div className="flex-1 h-2 rounded-full" style={{ background: "rgba(107, 114, 128, 0.2)" }}>
                    <div 
                      className="h-full rounded-full transition-all duration-300"
                      style={{ 
                        width: `${percentage}%`,
                        background: colors[status]
                      }}
                    />
                  </div>
                  <span className="text-xs w-12 text-right" style={{ color: colors[status] }}>
                    {percentage}%
                  </span>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
