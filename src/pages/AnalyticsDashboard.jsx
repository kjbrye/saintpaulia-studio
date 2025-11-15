
import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ArrowLeft, TrendingUp, BarChart3, PieChart, Target, Zap } from "lucide-react";
import CollectionGrowthChart from "../components/analytics/CollectionGrowthChart";
import CareFrequencyAnalytics from "../components/analytics/CareFrequencyAnalytics";
import PropagationSuccessChart from "../components/analytics/PropagationSuccessChart";
import HealthTrendsChart from "../components/analytics/HealthTrendsChart";
import BloomAnalytics from "../components/analytics/BloomAnalytics";
import CollectionBreakdown from "../components/analytics/CollectionBreakdown";
import CareStreakTracker from "../components/analytics/CareStreakTracker";

const LOGO_URL = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/690e3cd78523fb5fba0a8466/632f6e485_PlantLogos.png";

export default function AnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState("6months"); // 1month, 3months, 6months, 1year, all

  const { data: plants = [], isLoading: plantsLoading } = useQuery({
    queryKey: ['plants'],
    queryFn: () => base44.entities.Plant.list(),
    initialData: [],
  });

  const { data: careLogs = [], isLoading: careLogsLoading } = useQuery({
    queryKey: ['allCareLogs'],
    queryFn: () => base44.entities.CareLog.list('-care_date'),
    initialData: [],
  });

  const { data: healthLogs = [], isLoading: healthLogsLoading } = useQuery({
    queryKey: ['allHealthLogs'],
    queryFn: () => base44.entities.HealthLog.list('-observation_date'),
    initialData: [],
  });

  const { data: bloomLogs = [], isLoading: bloomLogsLoading } = useQuery({
    queryKey: ['allBloomLogs'],
    queryFn: () => base44.entities.BloomLog.list('-bloom_start_date'),
    initialData: [],
  });

  const { data: propagationProjects = [], isLoading: propProjectsLoading } = useQuery({
    queryKey: ['propagationProjects'],
    queryFn: () => base44.entities.PropagationProject.list(),
    initialData: [],
  });

  const { data: hybridizationProjects = [], isLoading: hybridProjectsLoading } = useQuery({
    queryKey: ['hybridizationProjects'],
    queryFn: () => base44.entities.HybridizationProject.list(),
    initialData: [],
  });

  const isLoading = plantsLoading || careLogsLoading || healthLogsLoading || 
                     bloomLogsLoading || propProjectsLoading || hybridProjectsLoading;

  // Calculate time range filter
  const getTimeRangeDate = () => {
    const now = new Date();
    switch (timeRange) {
      case "1month": return new Date(now.setMonth(now.getMonth() - 1));
      case "3months": return new Date(now.setMonth(now.getMonth() - 3));
      case "6months": return new Date(now.setMonth(now.getMonth() - 6));
      case "1year": return new Date(now.setFullYear(now.getFullYear() - 1));
      default: return new Date(0); // all time
    }
  };

  const filterDate = getTimeRangeDate();

  // Filter data by time range
  const filteredCareLogs = careLogs.filter(log => new Date(log.care_date) >= filterDate);
  const filteredHealthLogs = healthLogs.filter(log => new Date(log.observation_date) >= filterDate);
  const filteredBloomLogs = bloomLogs.filter(log => new Date(log.bloom_start_date) >= filterDate);

  // Calculate quick stats
  const totalCareLogs = filteredCareLogs.length;
  const totalPlants = plants.length;
  const activePropProjects = propagationProjects.filter(p => p.status === 'active').length;
  const activeHybridProjects = hybridizationProjects.filter(p => p.status === 'active').length;
  const avgPropSuccess = propagationProjects.length > 0
    ? Math.round(
        propagationProjects.reduce((sum, p) => {
          const rate = p.total_attempts > 0 ? (p.success_count / p.total_attempts) * 100 : 0;
          return sum + rate;
        }, 0) / propagationProjects.length
      )
    : 0;

  const currentlyBlooming = bloomLogs.filter(log => {
    if (!log.bloom_start_date) return false;
    const now = new Date();
    const startDate = new Date(log.bloom_start_date);
    const endDate = log.bloom_end_date ? new Date(log.bloom_end_date) : null;
    return startDate <= now && (!endDate || endDate >= now);
  }).length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="glass-card w-16 h-16 rounded-2xl flex items-center justify-center animate-pulse glow-violet p-2">
          <img 
            src={LOGO_URL} 
            alt="Loading" 
            className="w-full h-full object-contain"
            style={{ opacity: 0.6 }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <Link to={createPageUrl("Collection")}>
              <button className="glass-button w-12 h-12 rounded-2xl flex items-center justify-center"
                style={{ color: "var(--accent)" }}>
                <ArrowLeft className="w-5 h-5" style={{ strokeWidth: 2 }} />
              </button>
            </Link>
            <div className="flex items-center gap-4">
              <div className="glass-card w-16 h-16 rounded-3xl flex items-center justify-center glow-violet p-2">
                <img 
                  src={LOGO_URL} 
                  alt="Analytics" 
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h1 className="text-4xl font-bold" style={{ 
                  color: 'var(--text-primary)',
                  textShadow: 'var(--heading-shadow)',
                  fontFamily: "'Playfair Display', Georgia, serif"
                }}>
                  Analytics Dashboard
                </h1>
                <p className="text-muted" style={{ color: 'var(--text-secondary)' }}>
                  Insights into your collection and care habits
                </p>
              </div>
            </div>
          </div>

          {/* Time Range Selector */}
          <div className="glass-card rounded-3xl p-2 inline-flex gap-2">
            {[
              { value: "1month", label: "1M" },
              { value: "3months", label: "3M" },
              { value: "6months", label: "6M" },
              { value: "1year", label: "1Y" },
              { value: "all", label: "All" }
            ].map(range => (
              <button
                key={range.value}
                onClick={() => setTimeRange(range.value)}
                className={`px-4 py-2 rounded-2xl font-semibold transition-all ${
                  timeRange === range.value ? "glass-accent-lavender" : ""
                }`}
                style={{ color: timeRange === range.value ? "#F0EBFF" : "var(--text-secondary)" }}
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <div className="glass-card rounded-3xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4" style={{ color: "#A7F3D0" }} />
              <p className="text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>Total Plants</p>
            </div>
            <p className="text-2xl font-bold" style={{ 
              color: "var(--text-primary)",
              fontFamily: "'Playfair Display', Georgia, serif"
            }}>
              {totalPlants}
            </p>
          </div>

          <div className="glass-card rounded-3xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4" style={{ color: "#FCD34D" }} />
              <p className="text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>Care Actions</p>
            </div>
            <p className="text-2xl font-bold" style={{ 
              color: "var(--text-primary)",
              fontFamily: "'Playfair Display', Georgia, serif"
            }}>
              {totalCareLogs}
            </p>
          </div>

          <div className="glass-card rounded-3xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">🌸</span>
              <p className="text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>Blooming</p>
            </div>
            <p className="text-2xl font-bold" style={{ 
              color: "var(--text-primary)",
              fontFamily: "'Playfair Display', Georgia, serif"
            }}>
              {currentlyBlooming}
            </p>
          </div>

          <div className="glass-card rounded-3xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-4 h-4" style={{ color: "#C4B5FD" }} />
              <p className="text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>Prop Success</p>
            </div>
            <p className="text-2xl font-bold" style={{ 
              color: "var(--text-primary)",
              fontFamily: "'Playfair Display', Georgia, serif"
            }}>
              {avgPropSuccess}%
            </p>
          </div>

          <div className="glass-card rounded-3xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="w-4 h-4" style={{ color: "#7DD3FC" }} />
              <p className="text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>Active Props</p>
            </div>
            <p className="text-2xl font-bold" style={{ 
              color: "var(--text-primary)",
              fontFamily: "'Playfair Display', Georgia, serif"
            }}>
              {activePropProjects}
            </p>
          </div>

          <div className="glass-card rounded-3xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <PieChart className="w-4 h-4" style={{ color: "#FCA5A5" }} />
              <p className="text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>Hybrids</p>
            </div>
            <p className="text-2xl font-bold" style={{ 
              color: "var(--text-primary)",
              fontFamily: "'Playfair Display', Georgia, serif"
            }}>
              {activeHybridProjects}
            </p>
          </div>
        </div>

        {/* Analytics Sections */}
        <div className="space-y-6">
          {/* Collection Growth & Care Streak */}
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <CollectionGrowthChart plants={plants} timeRange={timeRange} />
            </div>
            <div>
              <CareStreakTracker careLogs={careLogs} />
            </div>
          </div>

          {/* Care Frequency */}
          <CareFrequencyAnalytics careLogs={filteredCareLogs} plants={plants} />

          {/* Health & Blooms */}
          <div className="grid lg:grid-cols-2 gap-6">
            <HealthTrendsChart healthLogs={filteredHealthLogs} />
            <BloomAnalytics bloomLogs={filteredBloomLogs} plants={plants} />
          </div>

          {/* Propagation Success */}
          <PropagationSuccessChart 
            propagationProjects={propagationProjects}
            hybridizationProjects={hybridizationProjects}
          />

          {/* Collection Breakdown */}
          <CollectionBreakdown plants={plants} />
        </div>
      </div>
    </div>
  );
}
