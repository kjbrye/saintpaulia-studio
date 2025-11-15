
import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Target, TrendingUp, Award } from "lucide-react";

export default function PropagationSuccessChart({ propagationProjects, hybridizationProjects }) {
  // Calculate success rates for propagation projects
  const propData = propagationProjects.map(project => ({
    name: project.project_name.length > 20 
      ? project.project_name.substring(0, 20) + '...' 
      : project.project_name,
    fullName: project.project_name,
    rate: project.total_attempts > 0 
      ? Math.round((project.success_count / project.total_attempts) * 100) 
      : 0,
    type: 'propagation'
  }));

  // Sort by success rate
  const sortedData = [...propData].sort((a, b) => b.rate - a.rate).slice(0, 8);

  // Calculate overall stats
  const avgSuccess = propData.length > 0
    ? Math.round(propData.reduce((sum, p) => sum + p.rate, 0) / propData.length)
    : 0;

  const bestProject = sortedData[0];
  const totalProjects = propagationProjects.length + hybridizationProjects.length;
  const completedProjects = [
    ...propagationProjects.filter(p => p.status === 'completed'),
    ...hybridizationProjects.filter(p => p.status === 'completed')
  ].length;

  const getBarColor = (rate) => {
    if (rate >= 80) return '#A7F3D0';
    if (rate >= 60) return '#7DD3FC';
    if (rate >= 40) return '#FCD34D';
    return '#FCA5A5';
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-card rounded-2xl p-3 shadow-lg">
          <p className="text-xs font-semibold mb-1" style={{ color: "var(--text-primary)" }}>
            {payload[0].payload.fullName}
          </p>
          <p className="text-xs" style={{ color: getBarColor(payload[0].value) }}>
            Success Rate: {payload[0].value}%
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
          <Target className="w-5 h-5" style={{ color: "#A7F3D0", strokeWidth: 1.5 }} />
          Propagation & Breeding Success
        </h3>
        <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
          Track success rates across your propagation and hybridization projects
        </p>
      </div>

      {sortedData.length === 0 ? (
        <div className="text-center py-12">
          <Target className="w-8 h-8 mx-auto mb-2" style={{ color: "#C4B5FD", opacity: 0.5 }} />
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            No propagation projects with recorded success data yet
          </p>
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="glass-button rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4" style={{ color: "#A7F3D0" }} />
                <p className="text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>Avg Success</p>
              </div>
              <p className="text-2xl font-bold" style={{ 
                color: "var(--text-primary)",
                fontFamily: "'Playfair Display', Georgia, serif"
              }}>
                {avgSuccess}%
              </p>
            </div>

            <div className="glass-button rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Award className="w-4 h-4" style={{ color: "#FCD34D" }} />
                <p className="text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>Best Project</p>
              </div>
              <p className="text-sm font-bold truncate" style={{ color: "var(--text-primary)" }}>
                {bestProject ? `${bestProject.rate}%` : 'N/A'}
              </p>
            </div>

            <div className="glass-button rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-4 h-4" style={{ color: "#C4B5FD" }} />
                <p className="text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>Completed</p>
              </div>
              <p className="text-2xl font-bold" style={{ 
                color: "var(--text-primary)",
                fontFamily: "'Playfair Display', Georgia, serif"
              }}>
                {completedProjects}/{totalProjects}
              </p>
            </div>
          </div>

          {/* Chart */}
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={sortedData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(227, 201, 255, 0.1)" />
              <XAxis 
                dataKey="name" 
                stroke="var(--text-muted)" 
                style={{ fontSize: '11px', fill: 'var(--text-muted)' }}
                angle={-30}
                textAnchor="end"
                height={80}
              />
              <YAxis 
                stroke="var(--text-muted)" 
                style={{ fontSize: '12px', fill: 'var(--text-muted)' }}
                domain={[0, 100]}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="rate" 
                radius={[8, 8, 0, 0]}
              >
                {sortedData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getBarColor(entry.rate)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </>
      )}
    </div>
  );
}
