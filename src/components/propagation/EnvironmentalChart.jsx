import React from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { format } from "date-fns";
import { Thermometer, Wind } from "lucide-react";

export default function EnvironmentalChart({ logs, project }) {
  // Filter logs that have environmental data
  const logsWithEnvData = logs.filter(log => log.temperature || log.humidity);

  if (logsWithEnvData.length === 0) {
    return (
      <div className="glass-card rounded-3xl p-6">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ 
          color: "#F5F3FF",
          textShadow: "0 1px 3px rgba(32, 24, 51, 0.4)",
          fontFamily: "'Playfair Display', Georgia, serif"
        }}>
          <Thermometer className="w-5 h-5" style={{ color: "#A7F3D0", strokeWidth: 1.5 }} />
          Environmental Tracking
        </h3>
        <div className="text-center py-8">
          <p className="text-sm" style={{ color: "#DDD6FE" }}>
            No environmental data recorded yet. Start logging temperature and humidity in your progress logs!
          </p>
        </div>
      </div>
    );
  }

  // Prepare chart data
  const chartData = logsWithEnvData.map(log => ({
    date: format(new Date(log.log_date), "MMM d"),
    temperature: log.temperature || null,
    humidity: log.humidity || null,
    fullDate: log.log_date
  })).reverse(); // Oldest to newest for chart

  // Custom tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-card rounded-2xl p-3 shadow-lg" style={{ minWidth: "150px" }}>
          <p className="text-xs font-semibold mb-2" style={{ color: "#F5F3FF" }}>
            {format(new Date(payload[0].payload.fullDate), "MMM d, yyyy")}
          </p>
          {payload.map((entry, index) => (
            <p key={index} className="text-xs" style={{ color: entry.color }}>
              {entry.name}: {entry.value}{entry.name === "Temperature" ? "°F" : "%"}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Calculate stats
  const avgTemp = logsWithEnvData.filter(l => l.temperature).reduce((sum, l) => sum + l.temperature, 0) / logsWithEnvData.filter(l => l.temperature).length;
  const avgHumidity = logsWithEnvData.filter(l => l.humidity).reduce((sum, l) => sum + l.humidity, 0) / logsWithEnvData.filter(l => l.humidity).length;

  return (
    <div className="glass-card rounded-3xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold flex items-center gap-2" style={{ 
          color: "#F5F3FF",
          textShadow: "0 1px 3px rgba(32, 24, 51, 0.4)",
          fontFamily: "'Playfair Display', Georgia, serif"
        }}>
          <Thermometer className="w-5 h-5" style={{ color: "#A7F3D0", strokeWidth: 1.5 }} />
          Environmental Tracking
        </h3>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="glass-button rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Thermometer className="w-4 h-4" style={{ color: "#FCA5A5" }} />
            <p className="text-xs font-semibold" style={{ color: "#DDD6FE" }}>Avg Temperature</p>
          </div>
          <p className="text-2xl font-bold" style={{ 
            color: "#F5F3FF",
            fontFamily: "'Playfair Display', Georgia, serif"
          }}>
            {avgTemp.toFixed(1)}°F
          </p>
          {project.target_temperature_min && project.target_temperature_max && (
            <p className="text-xs mt-1" style={{ color: "#DDD6FE", opacity: 0.7 }}>
              Target: {project.target_temperature_min}°F - {project.target_temperature_max}°F
            </p>
          )}
        </div>

        <div className="glass-button rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Wind className="w-4 h-4" style={{ color: "#7DD3FC" }} />
            <p className="text-xs font-semibold" style={{ color: "#DDD6FE" }}>Avg Humidity</p>
          </div>
          <p className="text-2xl font-bold" style={{ 
            color: "#F5F3FF",
            fontFamily: "'Playfair Display', Georgia, serif"
          }}>
            {avgHumidity.toFixed(0)}%
          </p>
          {project.target_humidity_min && project.target_humidity_max && (
            <p className="text-xs mt-1" style={{ color: "#DDD6FE", opacity: 0.7 }}>
              Target: {project.target_humidity_min}% - {project.target_humidity_max}%
            </p>
          )}
        </div>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(227, 201, 255, 0.1)" />
          <XAxis 
            dataKey="date" 
            stroke="#DDD6FE" 
            style={{ fontSize: '12px', fill: '#DDD6FE' }}
          />
          <YAxis 
            yAxisId="temp"
            orientation="left"
            stroke="#FCA5A5" 
            style={{ fontSize: '12px', fill: '#FCA5A5' }}
            domain={['dataMin - 5', 'dataMax + 5']}
          />
          <YAxis 
            yAxisId="humidity"
            orientation="right"
            stroke="#7DD3FC" 
            style={{ fontSize: '12px', fill: '#7DD3FC' }}
            domain={[0, 100]}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            wrapperStyle={{ fontSize: '12px', color: '#DDD6FE' }}
            iconType="line"
          />
          <Line 
            yAxisId="temp"
            type="monotone" 
            dataKey="temperature" 
            stroke="#FCA5A5" 
            strokeWidth={2}
            name="Temperature"
            dot={{ fill: '#FCA5A5', r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line 
            yAxisId="humidity"
            type="monotone" 
            dataKey="humidity" 
            stroke="#7DD3FC" 
            strokeWidth={2}
            name="Humidity"
            dot={{ fill: '#7DD3FC', r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}