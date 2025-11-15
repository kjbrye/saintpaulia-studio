import React from "react";
import { Sparkles, AlertTriangle, Heart, TrendingUp } from "lucide-react";
import { differenceInDays } from "date-fns";

export default function HealthSummary({ healthLogs }) {
  if (healthLogs.length === 0) {
    return (
      <div className="clay-card rounded-[16px] bg-white/70 p-6">
        <h3 className="text-lg font-bold text-purple-900 mb-4">Health Summary</h3>
        <div className="text-center py-8">
          <div className="clay-card w-16 h-16 rounded-[18px] bg-gradient-to-br from-emerald-100 to-emerald-200 flex items-center justify-center mx-auto mb-4">
            <Heart className="w-8 h-8 text-emerald-600" />
          </div>
          <p className="text-sm text-purple-600">No health observations logged yet</p>
        </div>
      </div>
    );
  }

  // Calculate stats
  const statusCounts = {
    excellent: healthLogs.filter(l => l.health_status === "excellent").length,
    good: healthLogs.filter(l => l.health_status === "good").length,
    concerning: healthLogs.filter(l => l.health_status === "concerning").length,
    critical: healthLogs.filter(l => l.health_status === "critical").length
  };

  const totalObservations = healthLogs.length;
  const healthyPercentage = Math.round(
    ((statusCounts.excellent + statusCounts.good) / totalObservations) * 100
  );

  // Get all symptoms
  const allSymptoms = healthLogs.flatMap(log => log.symptoms || []);
  const symptomCounts = {};
  allSymptoms.forEach(symptom => {
    symptomCounts[symptom] = (symptomCounts[symptom] || 0) + 1;
  });
  const topSymptoms = Object.entries(symptomCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // Calculate health trend
  const recentLogs = healthLogs.slice(0, 3);
  const statusScores = { excellent: 4, good: 3, concerning: 2, critical: 1 };
  let trend = "stable";
  if (recentLogs.length >= 2) {
    const recentScore = statusScores[recentLogs[0].health_status];
    const previousScore = statusScores[recentLogs[1].health_status];
    if (recentScore > previousScore) trend = "improving";
    else if (recentScore < previousScore) trend = "declining";
  }

  const trendConfig = {
    improving: { icon: TrendingUp, text: "Improving", color: "text-emerald-700" },
    declining: { icon: AlertTriangle, text: "Needs Attention", color: "text-amber-700" },
    stable: { icon: Heart, text: "Stable", color: "text-blue-700" }
  };

  const TrendIcon = trendConfig[trend].icon;

  return (
    <div className="clay-card rounded-[16px] bg-white/70 p-6">
      <h3 className="text-lg font-bold text-purple-900 mb-4">Health Summary</h3>
      
      <div className="space-y-4">
        {/* Overall Health */}
        <div className="clay-card rounded-[14px] bg-gradient-to-br from-purple-50 to-pink-50 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-purple-900">Overall Health</span>
            <span className="text-2xl font-bold text-purple-900">{healthyPercentage}%</span>
          </div>
          <div className="w-full h-2 clay-input rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 transition-all duration-500"
              style={{ width: `${healthyPercentage}%` }}
            />
          </div>
          <p className="text-xs text-purple-700 mt-2">
            {statusCounts.excellent + statusCounts.good} healthy observations out of {totalObservations}
          </p>
        </div>

        {/* Health Trend */}
        <div className="clay-card rounded-[14px] bg-gradient-to-br from-blue-50 to-purple-50 p-4">
          <div className="flex items-center gap-3">
            <div className="clay-button w-10 h-10 rounded-[12px] bg-white/60 flex items-center justify-center">
              <TrendIcon className={`w-5 h-5 ${trendConfig[trend].color}`} />
            </div>
            <div>
              <p className="text-sm font-semibold text-purple-900">Current Trend</p>
              <p className={`text-xs font-medium ${trendConfig[trend].color}`}>
                {trendConfig[trend].text}
              </p>
            </div>
          </div>
        </div>

        {/* Status Breakdown */}
        <div>
          <p className="text-sm font-semibold text-purple-900 mb-2">Observation Breakdown</p>
          <div className="grid grid-cols-2 gap-2">
            <div className="clay-card px-3 py-2 rounded-[10px] bg-emerald-50">
              <p className="text-xs text-emerald-700 mb-1">Excellent</p>
              <p className="text-lg font-bold text-emerald-900">{statusCounts.excellent}</p>
            </div>
            <div className="clay-card px-3 py-2 rounded-[10px] bg-blue-50">
              <p className="text-xs text-blue-700 mb-1">Good</p>
              <p className="text-lg font-bold text-blue-900">{statusCounts.good}</p>
            </div>
            <div className="clay-card px-3 py-2 rounded-[10px] bg-amber-50">
              <p className="text-xs text-amber-700 mb-1">Concerning</p>
              <p className="text-lg font-bold text-amber-900">{statusCounts.concerning}</p>
            </div>
            <div className="clay-card px-3 py-2 rounded-[10px] bg-rose-50">
              <p className="text-xs text-rose-700 mb-1">Critical</p>
              <p className="text-lg font-bold text-rose-900">{statusCounts.critical}</p>
            </div>
          </div>
        </div>

        {/* Top Symptoms */}
        {topSymptoms.length > 0 && (
          <div>
            <p className="text-sm font-semibold text-purple-900 mb-2">Most Common Observations</p>
            <div className="space-y-1.5">
              {topSymptoms.map(([symptom, count]) => (
                <div key={symptom} className="flex items-center justify-between text-xs">
                  <span className="text-purple-700">{symptom}</span>
                  <span className="clay-card px-2 py-0.5 rounded-[6px] bg-purple-100 text-purple-900 font-semibold">
                    {count}x
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}