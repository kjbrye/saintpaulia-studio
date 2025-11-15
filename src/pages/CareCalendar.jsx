
import React, { useState, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { createPageUrl } from "@/utils";
import { ArrowLeft, ChevronLeft, ChevronRight, Calendar as CalendarIcon, Droplets, Leaf, Scissors, Shovel, Filter, X, Plus, AlertCircle } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, isToday, isPast, isFuture, startOfWeek, endOfWeek, addDays, differenceInDays } from "date-fns";
import QuickCareButtons from "../components/plants/QuickCareButtons";

const LOGO_URL = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/690e3cd78523fb5fba0a8466/632f6e485_PlantLogos.png";

const CARE_TYPES = {
  watering: { 
    icon: Droplets, 
    color: "#7DD3FC", 
    bg: "rgba(125, 211, 252, 0.2)", 
    border: "rgba(125, 211, 252, 0.4)",
    label: "Water"
  },
  fertilizing: { 
    icon: Leaf, 
    color: "#A7F3D0", 
    bg: "rgba(167, 243, 208, 0.2)", 
    border: "rgba(167, 243, 208, 0.4)",
    label: "Fertilize"
  },
  grooming: { 
    icon: Scissors, 
    color: "#E9D5FF", 
    bg: "rgba(233, 213, 255, 0.2)", 
    border: "rgba(233, 213, 255, 0.4)",
    label: "Groom"
  },
  repotting: { 
    icon: Shovel, 
    color: "#FCD34D", 
    bg: "rgba(252, 211, 77, 0.2)", 
    border: "rgba(252, 211, 77, 0.4)",
    label: "Repot"
  }
};

export default function CareCalendar() {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [viewMode, setViewMode] = useState("month"); // "month" or "week"
  const [filterTypes, setFilterTypes] = useState({
    watering: true,
    fertilizing: true,
    grooming: true,
    repotting: true
  });
  const [showQuickCareForPlant, setShowQuickCareForPlant] = useState(null);
  const [showUpcomingOnly, setShowUpcomingOnly] = useState(false);

  const { data: plants = [], isLoading: plantsLoading } = useQuery({
    queryKey: ['plants'],
    queryFn: () => base44.entities.Plant.list(),
    initialData: [],
  });

  const { data: careLogs = [], isLoading: careLogsLoading } = useQuery({
    queryKey: ['allCareLogs'],
    queryFn: () => base44.entities.CareLog.list('-care_date', 500),
    initialData: [],
  });

  // Generate care tasks
  const careTasks = useMemo(() => {
    const tasks = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Add historical care logs
    careLogs.forEach(log => {
      const plant = plants.find(p => p.id === log.plant_id);
      if (!plant) return;

      tasks.push({
        date: new Date(log.care_date),
        type: log.care_type,
        plant: plant,
        isHistorical: true,
        isPast: true,
        log: log
      });
    });

    // Calculate upcoming care tasks
    plants.forEach(plant => {
      // Watering
      if (plant.last_watered && plant.watering_interval) {
        const lastWatered = new Date(plant.last_watered);
        const nextWatering = addDays(lastWatered, plant.watering_interval);
        if (isFuture(nextWatering) || isSameDay(nextWatering, today)) {
          tasks.push({
            date: nextWatering,
            type: 'watering',
            plant: plant,
            isHistorical: false,
            isPast: false,
            isOverdue: isPast(nextWatering) && !isSameDay(nextWatering, today)
          });
        }
      }

      // Fertilizing
      if (plant.last_fertilized && plant.fertilizer_interval) {
        const lastFertilized = new Date(plant.last_fertilized);
        const nextFertilizing = addDays(lastFertilized, plant.fertilizer_interval);
        if (isFuture(nextFertilizing) || isSameDay(nextFertilizing, today)) {
          tasks.push({
            date: nextFertilizing,
            type: 'fertilizing',
            plant: plant,
            isHistorical: false,
            isPast: false,
            isOverdue: isPast(nextFertilizing) && !isSameDay(nextFertilizing, today)
          });
        }
      }

      // Grooming (assume 7 day interval if last_groomed exists)
      if (plant.last_groomed) {
        const lastGroomed = new Date(plant.last_groomed);
        const nextGrooming = addDays(lastGroomed, 7);
        if (isFuture(nextGrooming) || isSameDay(nextGrooming, today)) {
          tasks.push({
            date: nextGrooming,
            type: 'grooming',
            plant: plant,
            isHistorical: false,
            isPast: false,
            isOverdue: isPast(nextGrooming) && !isSameDay(nextGrooming, today)
          });
        }
      }

      // Repotting (assume yearly - 365 days)
      if (plant.last_repotted) {
        const lastRepotted = new Date(plant.last_repotted);
        const nextRepotting = addDays(lastRepotted, 365);
        if (isFuture(nextRepotting) || isSameDay(nextRepotting, today)) {
          tasks.push({
            date: nextRepotting,
            type: 'repotting',
            plant: plant,
            isHistorical: false,
            isPast: false,
            isOverdue: isPast(nextRepotting) && !isSameDay(nextRepotting, today)
          });
        }
      }
    });

    return tasks.filter(task => filterTypes[task.type]);
  }, [plants, careLogs, filterTypes]);

  // Get calendar days
  const calendarDays = useMemo(() => {
    if (viewMode === "month") {
      const monthStart = startOfMonth(currentDate);
      const monthEnd = endOfMonth(currentDate);
      const calendarStart = startOfWeek(monthStart);
      const calendarEnd = endOfWeek(monthEnd);
      
      return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
    } else {
      const weekStart = startOfWeek(currentDate);
      const weekEnd = endOfWeek(currentDate);
      return eachDayOfInterval({ start: weekStart, end: weekEnd });
    }
  }, [currentDate, viewMode]);

  // Get tasks for a specific day
  const getTasksForDay = (day) => {
    const dayTasks = careTasks.filter(task => isSameDay(task.date, day));
    if (showUpcomingOnly) {
      return dayTasks.filter(task => !task.isHistorical);
    }
    return dayTasks;
  };

  // Get urgency level for a day (for visual indicators)
  const getDayUrgency = (day) => {
    const tasks = getTasksForDay(day);
    if (tasks.some(t => t.isOverdue)) return "overdue";
    if (tasks.some(t => !t.isHistorical && !t.isOverdue)) return "upcoming";
    if (tasks.some(t => t.isHistorical)) return "completed";
    return "none";
  };

  // Get upcoming tasks summary (next 7 days)
  const upcomingTasksSummary = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const nextWeek = addDays(today, 7);
    
    return careTasks.filter(task => 
      !task.isHistorical && 
      task.date >= today && 
      task.date <= nextWeek
    ).sort((a, b) => a.date - b.date);
  }, [careTasks]);

  // Navigation
  const goToPreviousPeriod = () => {
    setCurrentDate(prev => viewMode === "month" ? subMonths(prev, 1) : addDays(prev, -7));
  };

  const goToNextPeriod = () => {
    setCurrentDate(prev => viewMode === "month" ? addMonths(prev, 1) : addDays(prev, 7));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const toggleFilter = (type) => {
    setFilterTypes(prev => ({ ...prev, [type]: !prev[type] }));
  };

  // Get tasks for selected date
  const selectedDateTasks = selectedDate ? getTasksForDay(selectedDate) : [];

  const isLoading = plantsLoading || careLogsLoading;

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link to={createPageUrl("Collection")}>
            <button className="glass-button w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{ color: "var(--accent)" }}>
              <ArrowLeft className="w-5 h-5" style={{ strokeWidth: 2 }} />
            </button>
          </Link>
          <div className="flex items-center gap-4">
            <div className="glass-card w-16 h-16 rounded-3xl flex items-center justify-center glow-violet p-2">
              <CalendarIcon className="w-8 h-8" style={{ color: "#C4B5FD", strokeWidth: 1.5 }} />
            </div>
            <div>
              <h1 className="text-4xl font-bold" style={{ 
                color: 'var(--text-primary)',
                textShadow: 'var(--heading-shadow)',
                fontFamily: "'Playfair Display', Georgia, serif"
              }}>
                Care Calendar
              </h1>
              <p className="text-muted" style={{ color: 'var(--text-secondary)' }}>
                Track and plan your plant care schedule
              </p>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="glass-card rounded-3xl p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            {/* Date Navigation */}
            <div className="flex items-center gap-3">
              <button
                onClick={goToPreviousPeriod}
                className="glass-button w-10 h-10 rounded-2xl flex items-center justify-center"
                style={{ color: "var(--text-secondary)" }}
              >
                <ChevronLeft className="w-5 h-5" style={{ strokeWidth: 2 }} />
              </button>

              <h2 className="text-xl font-bold min-w-[200px] text-center" style={{ 
                color: "var(--text-primary)",
                fontFamily: "'Playfair Display', Georgia, serif"
              }}>
                {viewMode === "month" 
                  ? format(currentDate, 'MMMM yyyy')
                  : `Week of ${format(startOfWeek(currentDate), 'MMM d, yyyy')}`
                }
              </h2>

              <button
                onClick={goToNextPeriod}
                className="glass-button w-10 h-10 rounded-2xl flex items-center justify-center"
                style={{ color: "var(--text-secondary)" }}
              >
                <ChevronRight className="w-5 h-5" style={{ strokeWidth: 2 }} />
              </button>

              <button
                onClick={goToToday}
                className="glass-accent-lavender px-4 py-2 rounded-2xl font-semibold text-sm"
                style={{ color: "#F0EBFF" }}
              >
                Today
              </button>
            </div>

            {/* View Mode Toggle */}
            <div className="glass-button rounded-2xl p-1 flex gap-1">
              <button
                onClick={() => setViewMode("month")}
                className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all ${
                  viewMode === "month" ? "glass-accent-lavender" : ""
                }`}
                style={{ color: viewMode === "month" ? "#F0EBFF" : "var(--text-secondary)" }}
              >
                Month
              </button>
              <button
                onClick={() => setViewMode("week")}
                className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all ${
                  viewMode === "week" ? "glass-accent-lavender" : ""
                }`}
                style={{ color: viewMode === "week" ? "#F0EBFF" : "var(--text-secondary)" }}
              >
                Week
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="mt-4 pt-4" style={{ borderTop: "1px solid rgba(227, 201, 255, 0.2)" }}>
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex items-center gap-2 flex-wrap">
                <Filter className="w-4 h-4" style={{ color: "var(--text-muted)" }} />
                <span className="text-sm font-semibold mr-2" style={{ color: "var(--text-secondary)" }}>
                  Show:
                </span>
                {Object.entries(CARE_TYPES).map(([type, config]) => {
                  const Icon = config.icon;
                  return (
                    <button
                      key={type}
                      onClick={() => toggleFilter(type)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium backdrop-blur-xl transition-all flex items-center gap-1.5 ${
                        filterTypes[type] ? "" : "opacity-40"
                      }`}
                      style={{
                        background: filterTypes[type] ? config.bg : "rgba(0, 0, 0, 0.2)",
                        border: `1px solid ${filterTypes[type] ? config.border : "rgba(255, 255, 255, 0.1)"}`,
                        color: filterTypes[type] ? config.color : "var(--text-muted)"
                      }}
                    >
                      <Icon className="w-3.5 h-3.5" style={{ strokeWidth: 1.8 }} />
                      {config.label}
                    </button>
                  );
                })}
              </div>
              
              <button
                onClick={() => setShowUpcomingOnly(!showUpcomingOnly)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium backdrop-blur-xl transition-all ${
                  showUpcomingOnly ? "" : "opacity-60"
                }`}
                style={{
                  background: showUpcomingOnly ? "rgba(168, 159, 239, 0.2)" : "rgba(0, 0, 0, 0.2)",
                  border: `1px solid ${showUpcomingOnly ? "rgba(168, 159, 239, 0.4)" : "rgba(255, 255, 255, 0.1)"}`,
                  color: showUpcomingOnly ? "#C4B5FD" : "var(--text-muted)"
                }}
              >
                Upcoming Only
              </button>
            </div>
          </div>
        </div>

        {/* Upcoming Tasks Summary */}
        {upcomingTasksSummary.length > 0 && (
          <div className="glass-card rounded-3xl p-6 mb-6"
            style={{
              background: "linear-gradient(135deg, rgba(252, 211, 77, 0.12) 0%, rgba(251, 146, 60, 0.08) 100%)",
              border: "1px solid rgba(252, 211, 77, 0.3)"
            }}>
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle className="w-5 h-5" style={{ color: "#FCD34D", strokeWidth: 1.8 }} />
              <h3 className="text-lg font-bold" style={{ 
                color: "#FCD34D",
                fontFamily: "'Playfair Display', Georgia, serif"
              }}>
                Upcoming This Week
              </h3>
              <span className="px-2 py-0.5 rounded-lg text-xs font-semibold backdrop-blur-xl"
                style={{
                  background: "rgba(252, 211, 77, 0.2)",
                  border: "1px solid rgba(252, 211, 77, 0.4)",
                  color: "#FCD34D"
                }}>
                {upcomingTasksSummary.length}
              </span>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {upcomingTasksSummary.slice(0, 6).map((task, idx) => {
                const config = CARE_TYPES[task.type];
                const Icon = config.icon;
                const daysUntil = differenceInDays(task.date, new Date());
                return (
                  <Link
                    key={idx}
                    to={createPageUrl(`PlantDetail?id=${task.plant.id}`)}
                  >
                    <div className="glass-button rounded-2xl p-3 hover:opacity-90 transition-all">
                      <div className="flex items-center gap-2 mb-2">
                        <div 
                          className="w-8 h-8 rounded-xl flex items-center justify-center backdrop-blur-xl flex-shrink-0"
                          style={{
                            background: task.isOverdue ? "rgba(239, 68, 68, 0.2)" : config.bg,
                            border: `1px solid ${task.isOverdue ? "rgba(239, 68, 68, 0.4)" : config.border}`
                          }}
                        >
                          <Icon className="w-4 h-4" style={{ color: task.isOverdue ? "#FCA5A5" : config.color, strokeWidth: 1.8 }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold truncate" style={{ color: "var(--text-primary)" }}>
                            {task.plant.nickname || task.plant.cultivar_name}
                          </p>
                          <p className="text-[10px]" style={{ color: config.color }}>
                            {config.label}
                          </p>
                        </div>
                      </div>
                      <p className="text-[10px]" style={{ color: "var(--text-secondary)", opacity: 0.8 }}>
                        {daysUntil === 0 ? "Today" : 
                         daysUntil === 1 ? "Tomorrow" :
                         daysUntil < 0 ? `${Math.abs(daysUntil)} days overdue` :
                         `In ${daysUntil} days`}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Calendar Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="glass-card w-16 h-16 rounded-3xl flex items-center justify-center animate-pulse glow-violet p-2">
              <img 
                src={LOGO_URL} 
                alt="Loading" 
                className="w-full h-full object-contain"
                style={{ opacity: 0.6 }}
              />
            </div>
          </div>
        ) : (
          <div className="glass-card rounded-3xl p-6">
            {/* Weekday Headers */}
            <div className="grid grid-cols-7 gap-2 mb-3">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center py-2">
                  <span className="text-xs font-bold" style={{ color: "var(--text-muted)" }}>
                    {day}
                  </span>
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-2">
              {calendarDays.map((day, idx) => {
                const dayTasks = getTasksForDay(day);
                const isCurrentMonth = isSameMonth(day, currentDate);
                const isTodayDay = isToday(day);
                const isSelected = selectedDate && isSameDay(day, selectedDate);
                const urgency = getDayUrgency(day);
                const hasOverdue = dayTasks.some(t => t.isOverdue);
                const hasUpcoming = dayTasks.some(t => !t.isHistorical && !t.isOverdue);

                return (
                  <button
                    key={idx}
                    onClick={() => setSelectedDate(isSameDay(day, selectedDate) ? null : day)}
                    className={`relative min-h-[100px] p-2 rounded-2xl transition-all backdrop-blur-xl ${
                      isSelected ? "glass-accent-lavender" : "glass-button"
                    } ${!isCurrentMonth && viewMode === "month" ? "opacity-40" : ""}`}
                    style={{
                      border: isTodayDay 
                        ? "2px solid rgba(168, 159, 239, 0.6)" 
                        : isSelected
                        ? "1px solid rgba(227, 201, 255, 0.5)"
                        : urgency === "overdue"
                        ? "1px solid rgba(239, 68, 68, 0.4)"
                        : urgency === "upcoming"
                        ? "1px solid rgba(252, 211, 77, 0.4)"
                        : "1px solid rgba(227, 201, 255, 0.2)",
                      background: urgency === "overdue" && !isSelected
                        ? "linear-gradient(135deg, rgba(239, 68, 68, 0.08) 0%, rgba(220, 38, 38, 0.05) 100%)"
                        : urgency === "upcoming" && !isSelected
                        ? "linear-gradient(135deg, rgba(252, 211, 77, 0.08) 0%, rgba(251, 146, 60, 0.05) 100%)"
                        : undefined
                    }}
                  >
                    {/* Date Number */}
                    <div className="flex items-center justify-between mb-1">
                      <span 
                        className={`text-sm font-bold ${isTodayDay ? "glass-accent-moss px-2 py-0.5 rounded-lg" : ""}`}
                        style={{ color: isTodayDay ? "#A7F3D0" : "var(--text-primary)" }}
                      >
                        {format(day, 'd')}
                      </span>
                      <div className="flex items-center gap-1">
                        {hasOverdue && (
                          <div 
                            className="w-2 h-2 rounded-full animate-pulse"
                            style={{ background: "#FCA5A5" }}
                          />
                        )}
                        {hasUpcoming && !hasOverdue && (
                          <div 
                            className="w-2 h-2 rounded-full"
                            style={{ background: "#FCD34D" }}
                          />
                        )}
                      </div>
                    </div>

                    {/* Task Indicators */}
                    <div className="space-y-1">
                      {dayTasks.slice(0, 3).map((task, taskIdx) => {
                        const config = CARE_TYPES[task.type];
                        const Icon = config.icon;
                        return (
                          <div
                            key={taskIdx}
                            className="flex items-center gap-1 px-1.5 py-1 rounded-lg backdrop-blur-xl text-xs"
                            style={{
                              background: task.isOverdue 
                                ? "rgba(239, 68, 68, 0.2)"
                                : task.isHistorical
                                ? "rgba(0, 0, 0, 0.2)"
                                : config.bg,
                              border: `1px solid ${task.isOverdue ? "rgba(239, 68, 68, 0.4)" : config.border}`
                            }}
                          >
                            <Icon className="w-3 h-3 flex-shrink-0" 
                              style={{ 
                                color: task.isOverdue ? "#FCA5A5" : config.color,
                                strokeWidth: 1.8 
                              }} 
                            />
                            <span 
                              className="truncate text-[10px]"
                              style={{ color: task.isOverdue ? "#FCA5A5" : config.color }}
                            >
                              {task.plant.nickname || task.plant.cultivar_name}
                            </span>
                          </div>
                        );
                      })}
                      {dayTasks.length > 3 && (
                        <div 
                          className="text-[10px] text-center py-0.5 rounded-lg"
                          style={{ 
                            color: "var(--text-muted)",
                            background: "rgba(0, 0, 0, 0.2)"
                          }}
                        >
                          +{dayTasks.length - 3} more
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Selected Date Details */}
        {selectedDate && (
          <div className="mt-6 glass-card rounded-3xl p-6">
            <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
              <h3 className="text-xl font-bold" style={{ 
                color: "var(--text-primary)",
                fontFamily: "'Playfair Display', Georgia, serif"
              }}>
                {format(selectedDate, 'EEEE, MMMM d, yyyy')}
              </h3>
              <button
                onClick={() => setSelectedDate(null)}
                className="glass-button w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ color: "var(--text-secondary)" }}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {selectedDateTasks.length === 0 ? (
              <div className="text-center py-8">
                <CalendarIcon className="w-12 h-12 mx-auto mb-3" style={{ color: "#C4B5FD", opacity: 0.5, strokeWidth: 1.5 }} />
                <p className="text-sm mb-2" style={{ color: "var(--text-secondary)" }}>
                  No scheduled activities for this day
                </p>
                <p className="text-xs mb-4" style={{ color: "var(--text-muted)" }}>
                  Select a plant to log care from Quick Actions
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-semibold" style={{ color: "var(--text-secondary)" }}>
                    {selectedDateTasks.length} {selectedDateTasks.length === 1 ? 'activity' : 'activities'}
                  </span>
                </div>

                <div className="space-y-3">
                  {selectedDateTasks.map((task, idx) => {
                const config = CARE_TYPES[task.type];
                const Icon = config.icon;
                return (
                  <Link
                    key={idx}
                    to={createPageUrl(`PlantDetail?id=${task.plant.id}`)}
                  >
                    <div 
                      className="glass-button rounded-2xl p-4 hover:opacity-90 transition-all"
                      style={{
                        borderLeft: `4px solid ${task.isOverdue ? "#FCA5A5" : config.color}`
                      }}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3 flex-1">
                          <div 
                            className="w-10 h-10 rounded-xl flex items-center justify-center backdrop-blur-xl flex-shrink-0"
                            style={{
                              background: task.isOverdue ? "rgba(239, 68, 68, 0.2)" : config.bg,
                              border: `1px solid ${task.isOverdue ? "rgba(239, 68, 68, 0.4)" : config.border}`
                            }}
                          >
                            <Icon 
                              className="w-5 h-5" 
                              style={{ 
                                color: task.isOverdue ? "#FCA5A5" : config.color,
                                strokeWidth: 1.8 
                              }} 
                            />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-bold mb-1" style={{ color: "var(--text-primary)" }}>
                              {task.plant.nickname || task.plant.cultivar_name}
                            </h4>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span 
                                className="text-sm"
                                style={{ color: task.isOverdue ? "#FCA5A5" : config.color }}
                              >
                                {config.label}
                              </span>
                              {task.isHistorical && (
                                <span 
                                  className="text-xs px-2 py-0.5 rounded-lg backdrop-blur-xl"
                                  style={{
                                    background: "rgba(167, 243, 208, 0.2)",
                                    border: "1px solid rgba(167, 243, 208, 0.4)",
                                    color: "#A7F3D0"
                                  }}
                                >
                                  Completed
                                </span>
                              )}
                              {task.isOverdue && (
                                <span 
                                  className="text-xs px-2 py-0.5 rounded-lg backdrop-blur-xl"
                                  style={{
                                    background: "rgba(239, 68, 68, 0.2)",
                                    border: "1px solid rgba(239, 68, 68, 0.4)",
                                    color: "#FCA5A5"
                                  }}
                                >
                                  Overdue
                                </span>
                              )}
                            </div>
                            {task.log?.notes && (
                              <p className="text-xs mt-2" style={{ color: "var(--text-secondary)", opacity: 0.8 }}>
                                {task.log.notes}
                              </p>
                            )}
                          </div>
                        </div>
                        {!task.isHistorical && (
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              setShowQuickCareForPlant(task.plant.id);
                            }}
                            className="glass-accent-moss px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1"
                            style={{ color: "#A7F3D0" }}
                          >
                            <Plus className="w-3 h-3" />
                            Log
                          </button>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
                </div>
              </>
            )}
          </div>
        )}

        {/* Quick Care Modal */}
        {showQuickCareForPlant && (
          <div 
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
            style={{ background: "rgba(0, 0, 0, 0.7)" }}
            onClick={() => setShowQuickCareForPlant(null)}
          >
            <div 
              className="glass-card rounded-3xl p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold" style={{ 
                  color: "var(--text-primary)",
                  fontFamily: "'Playfair Display', Georgia, serif"
                }}>
                  Quick Care Actions
                </h3>
                <button
                  onClick={() => setShowQuickCareForPlant(null)}
                  className="glass-button w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ color: "var(--text-secondary)" }}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <QuickCareButtons 
                plantId={showQuickCareForPlant}
                onComplete={() => setShowQuickCareForPlant(null)}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
