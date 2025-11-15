import React from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { format, parseISO } from "date-fns";

const statusToScore = {
  excellent: 4,
  good: 3,
  concerning: 2,
  critical: 1
};

const scoreToStatus = {
  4: "Excellent",
  3: "Good",
  2: "Concerning",
  1: "Critical"
};

export default function HealthChart({ logs }) {
  if (logs.length < 2) {
    return (
      <div className="clay-card rounded-[16px] bg-white/70 p-8 text-center">
        <p className="text-sm text-purple-600">
          Add more health observations to see trends over time
        </p>
      </div>
    );
  }

  const data = [...logs]
    .reverse()
    .map(log => ({
      date: log.observation_date,
      score: statusToScore[log.health_status],
      status: log.health_status
    }));

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="clay-card rounded-[12px] bg-white p-3 shadow-lg">
          <p className="text-sm font-semibold text-purple-900">
            {format(parseISO(payload[0].payload.date), "MMM d, yyyy")}
          </p>
          <p className="text-sm text-purple-700 capitalize">
            {scoreToStatus[payload[0].value]}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="clay-card rounded-[16px] bg-white/70 p-6">
      <h3 className="text-lg font-bold text-purple-900 mb-4">Health Trend</h3>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E9D5FF" />
          <XAxis
            dataKey="date"
            tickFormatter={(date) => format(parseISO(date), "MMM d")}
            stroke="#9333EA"
            style={{ fontSize: "12px" }}
          />
          <YAxis
            domain={[0.5, 4.5]}
            ticks={[1, 2, 3, 4]}
            tickFormatter={(value) => scoreToStatus[value]}
            stroke="#9333EA"
            style={{ fontSize: "12px" }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="score"
            stroke="#A855F7"
            strokeWidth={3}
            dot={{ fill: "#9333EA", strokeWidth: 2, r: 5 }}
            activeDot={{ r: 7 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}