
import React from "react";
import { Flower2, Calendar, Award } from "lucide-react";

export default function BloomAnalytics({ bloomLogs, plants }) {
  // Calculate bloom statistics
  const totalBlooms = bloomLogs.length;
  const currentlyBlooming = bloomLogs.filter(log => {
    if (!log.bloom_start_date) return false;
    const now = new Date();
    const startDate = new Date(log.bloom_start_date);
    const endDate = log.bloom_end_date ? new Date(log.bloom_end_date) : null;
    return startDate <= now && (!endDate || endDate >= now);
  }).length;

  // Find plant with most blooms
  const bloomsByPlant = {};
  bloomLogs.forEach(log => {
    bloomsByPlant[log.plant_id] = (bloomsByPlant[log.plant_id] || 0) + 1;
  });
  const topBloomerPlantId = Object.entries(bloomsByPlant)
    .sort(([, a], [, b]) => b - a)[0]?.[0];
  const topBloomer = plants.find(p => p.id === topBloomerPlantId);
  const topBloomerCount = bloomsByPlant[topBloomerPlantId] || 0;

  // Calculate average bloom quality
  const qualityScores = {
    'exceptional': 5,
    'excellent': 4,
    'good': 3,
    'fair': 2,
    'poor': 1
  };
  const avgQuality = bloomLogs.filter(l => l.bloom_quality).length > 0
    ? bloomLogs
        .filter(l => l.bloom_quality)
        .reduce((sum, log) => sum + (qualityScores[log.bloom_quality] || 0), 0) 
        / bloomLogs.filter(l => l.bloom_quality).length
    : 0;

  // Quality distribution
  const qualityCounts = {
    exceptional: bloomLogs.filter(l => l.bloom_quality === 'exceptional').length,
    excellent: bloomLogs.filter(l => l.bloom_quality === 'excellent').length,
    good: bloomLogs.filter(l => l.bloom_quality === 'good').length,
    fair: bloomLogs.filter(l => l.bloom_quality === 'fair').length,
    poor: bloomLogs.filter(l => l.bloom_quality === 'poor').length
  };

  // Calculate bloom rate (blooms per plant)
  const bloomRate = plants.length > 0 ? (totalBlooms / plants.length).toFixed(1) : 0;

  // Find most recent bloom
  const recentBloom = bloomLogs[0];
  const recentBloomPlant = recentBloom ? plants.find(p => p.id === recentBloom.plant_id) : null;

  const getQualityColor = (quality) => {
    switch (quality) {
      case 'exceptional': return '#A7F3D0';
      case 'excellent': return '#7DD3FC';
      case 'good': return '#C4B5FD';
      case 'fair': return '#FCD34D';
      case 'poor': return '#FCA5A5';
      default: return '#DDD6FE';
    }
  };

  return (
    <div className="glass-card rounded-3xl p-6">
      <div className="mb-6">
        <h3 className="text-lg font-bold mb-2 flex items-center gap-2" style={{ 
          color: "var(--text-primary)",
          textShadow: "var(--heading-shadow)",
          fontFamily: "'Playfair Display', Georgia, serif"
        }}>
          <Flower2 className="w-5 h-5" style={{ color: "#FCA5A5", strokeWidth: 1.5 }} />
          Bloom Analytics
        </h3>
        <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
          Track blooming patterns and quality across your collection
        </p>
      </div>

      {totalBlooms === 0 ? (
        <div className="text-center py-12">
          <Flower2 className="w-8 h-8 mx-auto mb-2" style={{ color: "#C4B5FD", opacity: 0.5 }} />
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            No bloom logs yet
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Key Metrics */}
          <div className="grid grid-cols-3 gap-3">
            <div className="glass-button rounded-2xl p-3 text-center">
              <p className="text-xs font-semibold mb-1" style={{ color: "var(--text-secondary)" }}>
                Total Blooms
              </p>
              <p className="text-2xl font-bold" style={{ 
                color: "var(--text-primary)",
                fontFamily: "'Playfair Display', Georgia, serif"
              }}>
                {totalBlooms}
              </p>
            </div>

            <div className="glass-button rounded-2xl p-3 text-center">
              <p className="text-xs font-semibold mb-1" style={{ color: "var(--text-secondary)" }}>
                Blooming Now
              </p>
              <p className="text-2xl font-bold" style={{ 
                color: "#FCA5A5",
                fontFamily: "'Playfair Display', Georgia, serif"
              }}>
                {currentlyBlooming}
              </p>
            </div>

            <div className="glass-button rounded-2xl p-3 text-center">
              <p className="text-xs font-semibold mb-1" style={{ color: "var(--text-secondary)" }}>
                Bloom Rate
              </p>
              <p className="text-2xl font-bold" style={{ 
                color: "var(--text-primary)",
                fontFamily: "'Playfair Display', Georgia, serif"
              }}>
                {bloomRate}
              </p>
            </div>
          </div>

          {/* Top Bloomer */}
          {topBloomer && (
            <div className="glass-accent-moss rounded-2xl p-4">
              <div className="flex items-center gap-3">
                <Award className="w-6 h-6" style={{ color: "#FFFFFF" }} />
                <div className="flex-1">
                  <p className="text-xs font-semibold mb-1" style={{ color: "#FFFFFF" }}>
                    Top Bloomer
                  </p>
                  <p className="font-bold" style={{ color: "#FFFFFF" }}>
                    {topBloomer.nickname || topBloomer.cultivar_name}
                  </p>
                  <p className="text-xs" style={{ color: "#FFFFFF", opacity: 0.9 }}>
                    {topBloomerCount} bloom {topBloomerCount === 1 ? 'cycle' : 'cycles'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Recent Bloom */}
          {recentBloomPlant && (
            <div className="glass-button rounded-2xl p-4">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5" style={{ color: "#C4B5FD" }} />
                <div className="flex-1">
                  <p className="text-xs font-semibold mb-1" style={{ color: "var(--text-secondary)" }}>
                    Most Recent Bloom
                  </p>
                  <p className="font-semibold" style={{ color: "var(--text-primary)" }}>
                    {recentBloomPlant.nickname || recentBloomPlant.cultivar_name}
                  </p>
                  <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                    {new Date(recentBloom.bloom_start_date).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Average Quality */}
          {avgQuality > 0 && (
            <div className="glass-button rounded-2xl p-4">
              <p className="text-xs font-semibold mb-3" style={{ color: "var(--text-secondary)" }}>
                Average Bloom Quality
              </p>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-3 rounded-full" style={{ background: "rgba(107, 114, 128, 0.2)" }}>
                  <div 
                    className="h-full rounded-full transition-all duration-300"
                    style={{ 
                      width: `${(avgQuality / 5) * 100}%`,
                      background: "linear-gradient(90deg, #FCA5A5 0%, #FCD34D 25%, #C4B5FD 50%, #7DD3FC 75%, #A7F3D0 100%)"
                    }}
                  />
                </div>
                <span className="text-lg font-bold" style={{ 
                  color: "var(--text-primary)",
                  fontFamily: "'Playfair Display', Georgia, serif"
                }}>
                  {avgQuality.toFixed(1)}/5
                </span>
              </div>
            </div>
          )}

          {/* Quality Distribution */}
          <div className="space-y-2">
            <p className="text-xs font-semibold mb-2" style={{ color: "var(--text-secondary)" }}>
              Quality Distribution
            </p>
            {Object.entries(qualityCounts).reverse().map(([quality, count]) => {
              if (count === 0) return null;
              const percentage = totalBlooms > 0 ? Math.round((count / totalBlooms) * 100) : 0;
              return (
                <div key={quality} className="flex items-center gap-2">
                  <span className="text-xs capitalize w-24" style={{ color: "var(--text-secondary)" }}>
                    {quality}
                  </span>
                  <div className="flex-1 h-2 rounded-full" style={{ background: "rgba(107, 114, 128, 0.2)" }}>
                    <div 
                      className="h-full rounded-full transition-all duration-300"
                      style={{ 
                        width: `${percentage}%`,
                        background: getQualityColor(quality)
                      }}
                    />
                  </div>
                  <span className="text-xs w-12 text-right" style={{ color: getQualityColor(quality) }}>
                    {percentage}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
