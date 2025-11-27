import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ArrowLeft, TrendingUp, Users, Library, Activity, Calendar, BarChart3 } from "lucide-react";
import { AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart as RechartsPieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { format, subDays, startOfMonth, endOfMonth, eachDayOfInterval, eachMonthOfInterval, startOfYear } from "date-fns";

const COLORS = ["#C4B5FD", "#A7F3D0", "#FCD34D", "#FCA5A5", "#7DD3FC", "#F0ABFC", "#E9D5FF"];

export default function AdminAnalyticsDashboard() {
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState("30days");

  const { data: currentUser, isLoading: isLoadingUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  // Redirect if not admin
  React.useEffect(() => {
    if (currentUser && currentUser.role !== 'admin') {
      alert('Access denied: Admin privileges required');
      navigate(createPageUrl("Collection"));
    }
  }, [currentUser, navigate]);

  // Fetch all data
  const { data: allUsers = [] } = useQuery({
    queryKey: ['allUsers'],
    queryFn: () => base44.entities.User.list(),
    initialData: []
  });

  const { data: allPlants = [] } = useQuery({
    queryKey: ['allPlants'],
    queryFn: () => base44.entities.Plant.list(),
    initialData: []
  });

  const { data: allCareLogs = [] } = useQuery({
    queryKey: ['allCareLogs'],
    queryFn: () => base44.entities.CareLog.list(),
    initialData: []
  });

  // Analytics calculations
  const analytics = useMemo(() => {
    const now = new Date();
    const startDate = timeRange === "7days" ? subDays(now, 7) :
      timeRange === "30days" ? subDays(now, 30) :
      timeRange === "90days" ? subDays(now, 90) :
      startOfYear(now);

    const totalUsers = allUsers.length;
    const activeUsers = allUsers.filter(u => {
      const hasPlants = allPlants.some(p => p.created_by === u.email);
      return hasPlants;
    }).length;

    const totalPlants = allPlants.length;
    const avgPlantsPerUser = totalUsers > 0 ? (totalPlants / totalUsers).toFixed(1) : 0;

    const totalCareLogs = allCareLogs.length;

    // User growth over time
    const userGrowthData = [];
    if (timeRange === "year") {
      const months = eachMonthOfInterval({ start: startDate, end: now });
      months.forEach(month => {
        const monthEnd = endOfMonth(month);
        const usersAtMonth = allUsers.filter(u => new Date(u.created_date) <= monthEnd).length;
        userGrowthData.push({
          date: format(month, "MMM yyyy"),
          users: usersAtMonth
        });
      });
    } else {
      const days = eachDayOfInterval({ start: startDate, end: now });
      days.forEach(day => {
        const usersAtDay = allUsers.filter(u => new Date(u.created_date) <= day).length;
        userGrowthData.push({
          date: format(day, "MMM d"),
          users: usersAtDay
        });
      });
    }

    // Plant creation over time
    const plantCreationData = [];
    if (timeRange === "year") {
      const months = eachMonthOfInterval({ start: startDate, end: now });
      months.forEach(month => {
        const monthStart = startOfMonth(month);
        const monthEnd = endOfMonth(month);
        const plantsInMonth = allPlants.filter(p => {
          const created = new Date(p.created_date);
          return created >= monthStart && created <= monthEnd;
        }).length;
        plantCreationData.push({
          date: format(month, "MMM yyyy"),
          plants: plantsInMonth
        });
      });
    } else {
      const days = eachDayOfInterval({ start: startDate, end: now });
      days.forEach(day => {
        const plantsOnDay = allPlants.filter(p => {
          const created = new Date(p.created_date);
          return format(created, "yyyy-MM-dd") === format(day, "yyyy-MM-dd");
        }).length;
        plantCreationData.push({
          date: format(day, "MMM d"),
          plants: plantsOnDay
        });
      });
    }

    // Care activity over time
    const careActivityData = [];
    if (timeRange === "year") {
      const months = eachMonthOfInterval({ start: startDate, end: now });
      months.forEach(month => {
        const monthStart = startOfMonth(month);
        const monthEnd = endOfMonth(month);
        const careInMonth = allCareLogs.filter(c => {
          const careDate = new Date(c.care_date);
          return careDate >= monthStart && careDate <= monthEnd;
        }).length;
        careActivityData.push({
          date: format(month, "MMM yyyy"),
          careLogs: careInMonth
        });
      });
    } else {
      const days = eachDayOfInterval({ start: startDate, end: now });
      days.forEach(day => {
        const careOnDay = allCareLogs.filter(c => {
          const careDate = new Date(c.care_date);
          return format(careDate, "yyyy-MM-dd") === format(day, "yyyy-MM-dd");
        }).length;
        careActivityData.push({
          date: format(day, "MMM d"),
          careLogs: careOnDay
        });
      });
    }

    // Care type distribution
    const careTypeData = [
      { name: "Watering", value: allCareLogs.filter(c => c.care_type === "watering").length },
      { name: "Fertilizing", value: allCareLogs.filter(c => c.care_type === "fertilizing").length },
      { name: "Repotting", value: allCareLogs.filter(c => c.care_type === "repotting").length },
      { name: "Grooming", value: allCareLogs.filter(c => c.care_type === "grooming").length }
    ].filter(d => d.value > 0);

    // User engagement levels
    const userEngagementData = allUsers.map(user => {
      const userPlants = allPlants.filter(p => p.created_by === user.email).length;
      const userCareLogs = allCareLogs.filter(c => c.created_by === user.email).length;

      return {
        email: user.email,
        plants: userPlants,
        careLogs: userCareLogs,
        totalActivity: userPlants + userCareLogs
      };
    }).sort((a, b) => b.totalActivity - a.totalActivity).slice(0, 10);

    return {
      totalUsers,
      activeUsers,
      totalPlants,
      avgPlantsPerUser,
      totalCareLogs,
      userGrowthData,
      plantCreationData,
      careActivityData,
      careTypeData,
      userEngagementData
    };
  }, [allUsers, allPlants, allCareLogs, timeRange]);

  if (isLoadingUser) {
    return (
      <div className="min-h-screen py-8 px-4 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4"
            style={{ borderColor: "var(--accent)", borderTopColor: "transparent" }} />
          <p style={{ color: "var(--text-secondary)" }}>Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!currentUser || currentUser.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate(createPageUrl("ProfileSettings"))}
            className="glass-button w-12 h-12 rounded-2xl flex items-center justify-center"
            style={{ color: "var(--accent)" }}
          >
            <ArrowLeft className="w-5 h-5" style={{ strokeWidth: 2 }} />
          </button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold flex items-center gap-3" style={{ 
              color: "var(--text-primary)",
              textShadow: "var(--heading-shadow)",
              fontFamily: "'Playfair Display', Georgia, serif"
            }}>
              <BarChart3 className="w-8 h-8" style={{ color: "#C4B5FD", strokeWidth: 1.5 }} />
              Admin Analytics Dashboard
            </h1>
            <p style={{ color: "var(--text-secondary)" }}>Platform insights and user behavior analytics</p>
          </div>
        </div>

        {/* Time Range Filter */}
        <div className="glass-card rounded-3xl p-6 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="w-5 h-5" style={{ color: "#C4B5FD" }} />
            <h3 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>Time Range</h3>
          </div>
          <div className="flex gap-3 flex-wrap">
            {[
              { value: "7days", label: "Last 7 Days" },
              { value: "30days", label: "Last 30 Days" },
              { value: "90days", label: "Last 90 Days" },
              { value: "year", label: "This Year" }
            ].map(option => (
              <button
                key={option.value}
                onClick={() => setTimeRange(option.value)}
                className={`px-4 py-2 rounded-2xl font-semibold transition-all ${
                  timeRange === option.value ? "glass-accent-lavender" : "glass-button"
                }`}
                style={{ color: timeRange === option.value ? "#F0EBFF" : "var(--text-secondary)" }}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="glass-card rounded-3xl p-6">
            <div className="flex items-center justify-between mb-3">
              <Users className="w-8 h-8" style={{ color: "#C4B5FD", opacity: 0.5 }} />
              <TrendingUp className="w-5 h-5" style={{ color: "#A7F3D0" }} />
            </div>
            <p className="text-3xl font-bold mb-1" style={{ 
              color: "#C4B5FD",
              fontFamily: "'Playfair Display', Georgia, serif"
            }}>
              {analytics.totalUsers}
            </p>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Total Users</p>
            <p className="text-xs mt-1" style={{ color: "#A7F3D0" }}>
              {analytics.activeUsers} active ({analytics.totalUsers > 0 ? ((analytics.activeUsers / analytics.totalUsers) * 100).toFixed(0) : 0}%)
            </p>
          </div>

          <div className="glass-card rounded-3xl p-6">
            <div className="flex items-center justify-between mb-3">
              <Library className="w-8 h-8" style={{ color: "#A7F3D0", opacity: 0.5 }} />
              <TrendingUp className="w-5 h-5" style={{ color: "#C4B5FD" }} />
            </div>
            <p className="text-3xl font-bold mb-1" style={{ 
              color: "#A7F3D0",
              fontFamily: "'Playfair Display', Georgia, serif"
            }}>
              {analytics.totalPlants}
            </p>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Total Plants</p>
            <p className="text-xs mt-1" style={{ color: "#C4B5FD" }}>
              {analytics.avgPlantsPerUser} avg per user
            </p>
          </div>

          <div className="glass-card rounded-3xl p-6">
            <div className="flex items-center justify-between mb-3">
              <Activity className="w-8 h-8" style={{ color: "#FCD34D", opacity: 0.5 }} />
              <TrendingUp className="w-5 h-5" style={{ color: "#A7F3D0" }} />
            </div>
            <p className="text-3xl font-bold mb-1" style={{
              color: "#FCD34D",
              fontFamily: "'Playfair Display', Georgia, serif"
            }}>
              {analytics.totalCareLogs}
            </p>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Care Logs</p>
            <p className="text-xs mt-1" style={{ color: "#A7F3D0" }}>
              Plant care actions
            </p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          {/* User Growth */}
          <div className="glass-card rounded-3xl p-6">
            <h3 className="text-lg font-bold mb-4" style={{ color: "var(--text-primary)" }}>
              User Growth
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={analytics.userGrowthData}>
                <defs>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#C4B5FD" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#C4B5FD" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(227, 201, 255, 0.2)" />
                <XAxis dataKey="date" stroke="var(--text-secondary)" style={{ fontSize: '12px' }} />
                <YAxis stroke="var(--text-secondary)" style={{ fontSize: '12px' }} />
                <Tooltip 
                  contentStyle={{ 
                    background: 'rgba(79, 63, 115, 0.95)', 
                    border: '1px solid rgba(227, 201, 255, 0.3)',
                    borderRadius: '12px',
                    color: 'var(--text-primary)'
                  }} 
                />
                <Area type="monotone" dataKey="users" stroke="#C4B5FD" fillOpacity={1} fill="url(#colorUsers)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Plant Creation */}
          <div className="glass-card rounded-3xl p-6">
            <h3 className="text-lg font-bold mb-4" style={{ color: "var(--text-primary)" }}>
              Plant Creation Activity
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={analytics.plantCreationData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(227, 201, 255, 0.2)" />
                <XAxis dataKey="date" stroke="var(--text-secondary)" style={{ fontSize: '12px' }} />
                <YAxis stroke="var(--text-secondary)" style={{ fontSize: '12px' }} />
                <Tooltip 
                  contentStyle={{ 
                    background: 'rgba(79, 63, 115, 0.95)', 
                    border: '1px solid rgba(227, 201, 255, 0.3)',
                    borderRadius: '12px',
                    color: 'var(--text-primary)'
                  }} 
                />
                <Bar dataKey="plants" fill="#A7F3D0" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Care Activity */}
          <div className="glass-card rounded-3xl p-6">
            <h3 className="text-lg font-bold mb-4" style={{ color: "var(--text-primary)" }}>
              Care Activity Over Time
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={analytics.careActivityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(227, 201, 255, 0.2)" />
                <XAxis dataKey="date" stroke="var(--text-secondary)" style={{ fontSize: '12px' }} />
                <YAxis stroke="var(--text-secondary)" style={{ fontSize: '12px' }} />
                <Tooltip 
                  contentStyle={{ 
                    background: 'rgba(79, 63, 115, 0.95)', 
                    border: '1px solid rgba(227, 201, 255, 0.3)',
                    borderRadius: '12px',
                    color: 'var(--text-primary)'
                  }} 
                />
                <Line type="monotone" dataKey="careLogs" stroke="#FCD34D" strokeWidth={2} dot={{ fill: '#FCD34D', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Care Type Distribution */}
          <div className="glass-card rounded-3xl p-6">
            <h3 className="text-lg font-bold mb-4" style={{ color: "var(--text-primary)" }}>
              Care Type Distribution
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <RechartsPieChart>
                <Pie
                  data={analytics.careTypeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {analytics.careTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    background: 'rgba(79, 63, 115, 0.95)', 
                    border: '1px solid rgba(227, 201, 255, 0.3)',
                    borderRadius: '12px',
                    color: 'var(--text-primary)'
                  }} 
                />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>

          {/* Top Users */}
          <div className="glass-card rounded-3xl p-6">
            <h3 className="text-lg font-bold mb-4" style={{ color: "var(--text-primary)" }}>
              Most Active Users
            </h3>
            <div className="space-y-3 max-h-[250px] overflow-y-auto">
              {analytics.userEngagementData.map((user, idx) => (
                <div key={user.email} className="glass-button rounded-2xl p-3">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
                      #{idx + 1} {user.email.split('@')[0]}
                    </p>
                    <span className="text-xs font-bold px-2 py-1 rounded-lg backdrop-blur-xl"
                      style={{
                        background: "rgba(167, 243, 208, 0.2)",
                        border: "1px solid rgba(167, 243, 208, 0.4)",
                        color: "#A7F3D0"
                      }}>
                      {user.totalActivity} actions
                    </span>
                  </div>
                  <div className="flex gap-3 text-xs" style={{ color: "var(--text-secondary)" }}>
                    <span>{user.plants} plants</span>
                    <span>•</span>
                    <span>{user.careLogs} care logs</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}