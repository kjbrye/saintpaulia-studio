import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { format, parseISO, startOfWeek, endOfWeek, eachWeekOfInterval, differenceInDays } from "date-fns";

export default function WateringFrequencyChart({ careLogs }) {
  if (careLogs.length === 0) {
    return (
      <div className="clay-card rounded-[16px] bg-white/70 p-8 text-center">
        <p className="text-sm text-purple-600">
          Start logging care actions to see frequency patterns
        </p>
      </div>
    );
  }

  // Get all care logs sorted by date
  const sortedLogs = [...careLogs].sort((a, b) => 
    new Date(a.care_date) - new Date(b.care_date)
  );

  // Get date range
  const startDate = new Date(sortedLogs[0].care_date);
  const endDate = new Date(sortedLogs[sortedLogs.length - 1].care_date);
  
  // Only show if we have a meaningful time range (at least 2 weeks)
  if (differenceInDays(endDate, startDate) < 14) {
    return (
      <div className="clay-card rounded-[16px] bg-white/70 p-8 text-center">
        <p className="text-sm text-purple-600">
          Keep logging for at least 2 weeks to see frequency patterns
        </p>
      </div>
    );
  }

  // Get all weeks in the range
  const weeks = eachWeekOfInterval({ start: startDate, end: endDate });

  // Count care actions per week by type
  const data = weeks.map(weekStart => {
    const weekEnd = endOfWeek(weekStart);
    const logsInWeek = sortedLogs.filter(log => {
      const logDate = new Date(log.care_date);
      return logDate >= weekStart && logDate <= weekEnd;
    });

    return {
      week: format(weekStart, "MMM d"),
      watering: logsInWeek.filter(l => l.care_type === "watering").length,
      fertilizing: logsInWeek.filter(l => l.care_type === "fertilizing").length,
      grooming: logsInWeek.filter(l => l.care_type === "grooming").length,
      repotting: logsInWeek.filter(l => l.care_type === "repotting").length
    };
  });

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="clay-card rounded-[12px] bg-white p-3 shadow-lg">
          <p className="text-sm font-semibold text-purple-900 mb-2">Week of {label}</p>
          {payload.map((entry, index) => (
            entry.value > 0 && (
              <p key={index} className="text-xs" style={{ color: entry.color }}>
                {entry.name}: {entry.value}x
              </p>
            )
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="clay-card rounded-[16px] bg-white/70 p-6">
      <h3 className="text-lg font-bold text-purple-900 mb-4">Weekly Care Activity</h3>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E9D5FF" />
          <XAxis 
            dataKey="week" 
            stroke="#9333EA"
            style={{ fontSize: "12px" }}
          />
          <YAxis 
            stroke="#9333EA"
            style={{ fontSize: "12px" }}
            allowDecimals={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            wrapperStyle={{ fontSize: "12px" }}
            iconType="circle"
          />
          <Bar dataKey="watering" fill="#60A5FA" name="Watering" radius={[8, 8, 0, 0]} />
          <Bar dataKey="fertilizing" fill="#34D399" name="Fertilizing" radius={[8, 8, 0, 0]} />
          <Bar dataKey="grooming" fill="#A78BFA" name="Grooming" radius={[8, 8, 0, 0]} />
          <Bar dataKey="repotting" fill="#FB923C" name="Repotting" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}