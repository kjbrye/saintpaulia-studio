import React from "react";
import { Calendar, Cake, TrendingUp } from "lucide-react";
import { differenceInDays, differenceInMonths, differenceInYears, format } from "date-fns";

export default function PlantAge({ plant, careLogs }) {
  if (!plant.acquisition_date) {
    return (
      <div className="clay-card rounded-[16px] bg-white/70 p-6">
        <h3 className="text-lg font-bold text-purple-900 mb-4">Plant Journey</h3>
        <div className="text-center py-8">
          <div className="clay-card w-16 h-16 rounded-[18px] bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-8 h-8 text-purple-400" />
          </div>
          <p className="text-sm text-purple-600">Add an acquisition date to track your plant's journey</p>
        </div>
      </div>
    );
  }

  const acquisitionDate = new Date(plant.acquisition_date);
  const today = new Date();
  
  const totalDays = differenceInDays(today, acquisitionDate);
  const years = differenceInYears(today, acquisitionDate);
  const months = differenceInMonths(today, acquisitionDate) % 12;
  // Calculate care timeline milestones
  const firstWatering = careLogs.find(log => log.care_type === "watering");
  const firstFertilizing = careLogs.find(log => log.care_type === "fertilizing");
  const totalCareActions = careLogs.length;

  return (
    <div className="clay-card rounded-[16px] bg-white/70 p-6">
      <h3 className="text-lg font-bold text-purple-900 mb-4">Plant Journey</h3>
      
      <div className="space-y-4">
        {/* Age Display */}
        <div className="clay-card rounded-[14px] bg-gradient-to-br from-purple-100 to-pink-100 p-5 text-center">
          <Cake className="w-8 h-8 text-purple-700 mx-auto mb-3" />
          <div className="space-y-1">
            <p className="text-sm font-medium text-purple-700">In Your Care For</p>
            <div className="flex items-center justify-center gap-2">
              {years > 0 && (
                <div className="clay-button px-3 py-2 rounded-[10px] bg-white/60">
                  <p className="text-2xl font-bold text-purple-900">{years}</p>
                  <p className="text-xs text-purple-700">{years === 1 ? "year" : "years"}</p>
                </div>
              )}
              {months > 0 && (
                <div className="clay-button px-3 py-2 rounded-[10px] bg-white/60">
                  <p className="text-2xl font-bold text-purple-900">{months}</p>
                  <p className="text-xs text-purple-700">{months === 1 ? "month" : "months"}</p>
                </div>
              )}
              {years === 0 && months === 0 && (
                <div className="clay-button px-3 py-2 rounded-[10px] bg-white/60">
                  <p className="text-2xl font-bold text-purple-900">{totalDays}</p>
                  <p className="text-xs text-purple-700">{totalDays === 1 ? "day" : "days"}</p>
                </div>
              )}
            </div>
            <p className="text-xs text-purple-600 mt-2">
              Since {format(acquisitionDate, "MMMM d, yyyy")}
            </p>
          </div>
        </div>

        {/* Care Milestones */}
        <div>
          <p className="text-sm font-semibold text-purple-900 mb-3">Care Milestones</p>
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="clay-button w-8 h-8 rounded-[10px] bg-gradient-to-br from-blue-200 to-blue-300 flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-4 h-4 text-blue-900" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-purple-900">{totalCareActions} Care Actions</p>
                <p className="text-xs text-purple-600">Total care logged</p>
              </div>
            </div>

            {firstWatering && (
              <div className="flex items-center gap-3">
                <div className="clay-button w-8 h-8 rounded-[10px] bg-gradient-to-br from-blue-200 to-blue-300 flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-4 h-4 text-blue-900" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-purple-900">First Watering</p>
                  <p className="text-xs text-purple-600">
                    {format(new Date(firstWatering.care_date), "MMM d, yyyy")}
                  </p>
                </div>
              </div>
            )}

            {firstFertilizing && (
              <div className="flex items-center gap-3">
                <div className="clay-button w-8 h-8 rounded-[10px] bg-gradient-to-br from-emerald-200 to-emerald-300 flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-4 h-4 text-emerald-900" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-purple-900">First Fertilizing</p>
                  <p className="text-xs text-purple-600">
                    {format(new Date(firstFertilizing.care_date), "MMM d, yyyy")}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Growth Stage */}
        <div className="clay-card rounded-[12px] bg-gradient-to-br from-emerald-50 to-blue-50 p-4">
          <p className="text-sm font-semibold text-purple-900 mb-1">Growth Stage</p>
          <p className="text-xs text-purple-700">
            {totalDays < 30 ? "🌱 New Addition - Getting settled" :
             totalDays < 90 ? "🌿 Young Plant - Building roots" :
             totalDays < 180 ? "🌺 Developing - Starting to bloom" :
             totalDays < 365 ? "🌸 Maturing - Establishing growth" :
             "✨ Established - Thriving beauty"}
          </p>
        </div>
      </div>
    </div>
  );
}