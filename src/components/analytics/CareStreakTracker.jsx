
import React from "react";
import { Zap, Award, Calendar, TrendingUp } from "lucide-react";
import { differenceInDays, startOfDay } from "date-fns";

export default function CareStreakTracker({ careLogs }) {
  // Calculate current streak (consecutive days with care)
  const calculateStreak = () => {
    if (careLogs.length === 0) return 0;

    const sortedLogs = [...careLogs].sort((a, b) => 
      new Date(b.care_date).getTime() - new Date(a.care_date).getTime()
    );

    const today = startOfDay(new Date());
    const mostRecentLog = startOfDay(new Date(sortedLogs[0].care_date));
    
    // Check if most recent log is today or yesterday
    const daysSinceLastCare = differenceInDays(today, mostRecentLog);
    if (daysSinceLastCare > 1) return 0; // Streak broken

    let streak = 1;
    let currentDate = mostRecentLog;

    for (let i = 1; i < sortedLogs.length; i++) {
      const logDate = startOfDay(new Date(sortedLogs[i].care_date));
      const daysDiff = differenceInDays(currentDate, logDate);

      if (daysDiff === 1) {
        streak++;
        currentDate = logDate;
      } else if (daysDiff > 1) {
        break;
      }
      // If daysDiff === 0, same day, continue to next log
    }

    return streak;
  };

  // Calculate longest streak
  const calculateLongestStreak = () => {
    if (careLogs.length === 0) return 0;

    const sortedLogs = [...careLogs].sort((a, b) => 
      new Date(b.care_date).getTime() - new Date(a.care_date).getTime()
    );

    let longestStreak = 1;
    let currentStreak = 1;
    let currentDate = startOfDay(new Date(sortedLogs[0].care_date));

    for (let i = 1; i < sortedLogs.length; i++) {
      const logDate = startOfDay(new Date(sortedLogs[i].care_date));
      const daysDiff = differenceInDays(currentDate, logDate);

      if (daysDiff === 1) {
        currentStreak++;
        longestStreak = Math.max(longestStreak, currentStreak);
        currentDate = logDate;
      } else if (daysDiff > 1) {
        currentStreak = 1;
        currentDate = logDate;
      }
    }

    return longestStreak;
  };

  // Calculate this month's care days
  const thisMonthCareDays = () => {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const uniqueDays = new Set(
      careLogs
        .filter(log => new Date(log.care_date) >= firstDayOfMonth)
        .map(log => new Date(log.care_date).toDateString())
    );

    return uniqueDays.size;
  };

  const currentStreak = calculateStreak();
  const longestStreak = calculateLongestStreak();
  const monthlyCareDays = thisMonthCareDays();
  const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
  const monthlyPercentage = Math.round((monthlyCareDays / daysInMonth) * 100);

  // Get streak status
  const getStreakStatus = () => {
    if (currentStreak === 0) return { text: "Start Today!", color: "#DDD6FE" };
    if (currentStreak < 7) return { text: "Building", color: "#7DD3FC" };
    if (currentStreak < 14) return { text: "On Fire!", color: "#FCD34D" };
    if (currentStreak < 30) return { text: "Amazing!", color: "#A7F3D0" };
    return { text: "Legend!", color: "#E9D5FF" };
  };

  const streakStatus = getStreakStatus();

  return (
    <div className="glass-card rounded-3xl p-6 h-full">
      <div className="mb-6">
        <h3 className="text-lg font-bold mb-2 flex items-center gap-2" style={{ 
          color: "var(--text-primary)",
          textShadow: "var(--heading-shadow)",
          fontFamily: "'Playfair Display', Georgia, serif"
        }}>
          <Zap className="w-5 h-5" style={{ color: "#FCD34D", strokeWidth: 1.5 }} />
          Care Streak
        </h3>
        <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
          Keep your care momentum going!
        </p>
      </div>

      {/* Current Streak */}
      <div className="text-center mb-6">
        <div className="glass-accent-moss rounded-3xl p-6 mb-3">
          <p className="text-6xl font-bold mb-2" style={{ 
            color: "#FFFFFF",
            fontFamily: "'Playfair Display', Georgia, serif"
          }}>
            {currentStreak}
          </p>
          <p className="text-sm font-semibold" style={{ color: "#FFFFFF" }}>
            {currentStreak === 1 ? 'Day' : 'Days'} Streak
          </p>
          <p className="text-xs mt-2" style={{ color: streakStatus.color }}>
            {streakStatus.text}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="space-y-3">
        <div className="glass-button rounded-2xl p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4" style={{ color: "#FCD34D" }} />
              <span className="text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>
                Longest Streak
              </span>
            </div>
            <span className="text-lg font-bold" style={{ 
              color: "var(--text-primary)",
              fontFamily: "'Playfair Display', Georgia, serif"
            }}>
              {longestStreak}
            </span>
          </div>
        </div>

        <div className="glass-button rounded-2xl p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" style={{ color: "#7DD3FC" }} />
              <span className="text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>
                This Month
              </span>
            </div>
            <span className="text-lg font-bold" style={{ 
              color: "var(--text-primary)",
              fontFamily: "'Playfair Display', Georgia, serif"
            }}>
              {monthlyCareDays}/{daysInMonth}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-2 rounded-full" style={{ background: "rgba(107, 114, 128, 0.2)" }}>
              <div 
                className="h-full rounded-full transition-all duration-300"
                style={{ 
                  width: `${monthlyPercentage}%`,
                  background: "linear-gradient(90deg, #7DD3FC 0%, #A7F3D0 100%)"
                }}
              />
            </div>
            <span className="text-xs" style={{ color: "#7DD3FC" }}>
              {monthlyPercentage}%
            </span>
          </div>
        </div>

        <div className="glass-button rounded-2xl p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" style={{ color: "#A7F3D0" }} />
              <span className="text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>
                Total Care Actions
              </span>
            </div>
            <span className="text-lg font-bold" style={{ 
              color: "var(--text-primary)",
              fontFamily: "'Playfair Display', Georgia, serif"
            }}>
              {careLogs.length}
            </span>
          </div>
        </div>
      </div>

      {/* Motivation Message */}
      <div className="mt-6 p-3 rounded-2xl" style={{ background: "rgba(227, 201, 255, 0.1)" }}>
        <p className="text-xs text-center" style={{ color: "var(--text-secondary)" }}>
          {currentStreak === 0 
            ? "Start your care streak today!"
            : currentStreak === longestStreak && currentStreak > 1
            ? "🎉 This is your best streak yet!"
            : currentStreak >= 7
            ? "Keep going! You're doing great!"
            : "Building a consistent care routine!"}
        </p>
      </div>
    </div>
  );
}
