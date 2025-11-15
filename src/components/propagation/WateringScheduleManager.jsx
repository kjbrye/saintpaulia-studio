import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Droplets, Calendar, Clock, Save } from "lucide-react";
import { toast } from "sonner";

export default function WateringScheduleManager({ project }) {
  const queryClient = useQueryClient();
  const [schedule, setSchedule] = useState({
    frequency_days: project.watering_schedule?.frequency_days || "",
    method: project.watering_schedule?.method || "",
    amount_ml: project.watering_schedule?.amount_ml || "",
    time_of_day: project.watering_schedule?.time_of_day || ""
  });

  const updateMutation = useMutation({
    mutationFn: (data) => base44.entities.PropagationProject.update(project.id, {
      watering_schedule: data
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['propagationProject', project.id] });
      queryClient.invalidateQueries({ queryKey: ['propagationProjects'] });
      toast.success("Watering schedule updated!");
    },
    onError: (error) => {
      toast.error("Update failed", {
        description: error.message || "Please try again."
      });
    }
  });

  const handleSave = () => {
    updateMutation.mutate(schedule);
  };

  // Calculate next watering date
  const getNextWateringDate = () => {
    if (!schedule.frequency_days) return null;
    const today = new Date();
    const nextDate = new Date(today);
    nextDate.setDate(today.getDate() + parseInt(schedule.frequency_days));
    return nextDate;
  };

  const nextWatering = getNextWateringDate();

  return (
    <div className="glass-card rounded-3xl p-6">
      <h3 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ 
        color: "#F5F3FF",
        textShadow: "0 1px 3px rgba(32, 24, 51, 0.4)",
        fontFamily: "'Playfair Display', Georgia, serif"
      }}>
        <Droplets className="w-5 h-5" style={{ color: "#7DD3FC", strokeWidth: 1.5 }} />
        Watering Schedule
      </h3>

      <div className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: "#F5F3FF" }}>
              <Calendar className="w-4 h-4 inline mr-1" style={{ color: "#A7F3D0" }} />
              Frequency (days)
            </label>
            <input
              type="number"
              value={schedule.frequency_days}
              onChange={(e) => setSchedule(prev => ({ ...prev, frequency_days: e.target.value }))}
              placeholder="e.g., 3"
              className="glass-input w-full px-4 py-3 rounded-2xl"
              style={{ color: "#F5F3FF" }}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: "#F5F3FF" }}>
              <Clock className="w-4 h-4 inline mr-1" style={{ color: "#C4B5FD" }} />
              Time of Day
            </label>
            <select
              value={schedule.time_of_day}
              onChange={(e) => setSchedule(prev => ({ ...prev, time_of_day: e.target.value }))}
              className="glass-input w-full px-4 py-3 rounded-2xl"
              style={{ color: "#F5F3FF" }}
            >
              <option value="">Not specified</option>
              <option value="morning">Morning</option>
              <option value="afternoon">Afternoon</option>
              <option value="evening">Evening</option>
            </select>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: "#F5F3FF" }}>
              Method
            </label>
            <select
              value={schedule.method}
              onChange={(e) => setSchedule(prev => ({ ...prev, method: e.target.value }))}
              className="glass-input w-full px-4 py-3 rounded-2xl"
              style={{ color: "#F5F3FF" }}
            >
              <option value="">Select method...</option>
              <option value="bottom">Bottom Watering</option>
              <option value="top">Top Watering</option>
              <option value="mist">Misting</option>
              <option value="wick">Wick System</option>
              <option value="drip">Drip System</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: "#F5F3FF" }}>
              Amount (ml)
            </label>
            <input
              type="number"
              value={schedule.amount_ml}
              onChange={(e) => setSchedule(prev => ({ ...prev, amount_ml: e.target.value }))}
              placeholder="e.g., 50"
              className="glass-input w-full px-4 py-3 rounded-2xl"
              style={{ color: "#F5F3FF" }}
            />
          </div>
        </div>

        {/* Next Watering Indicator */}
        {nextWatering && (
          <div className="glass-accent-moss rounded-2xl p-4">
            <p className="text-sm font-semibold mb-1" style={{ color: "#A7F3D0" }}>
              Next Scheduled Watering
            </p>
            <p className="text-lg font-bold" style={{ 
              color: "#F5F3FF",
              fontFamily: "'Playfair Display', Georgia, serif"
            }}>
              {nextWatering.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              {schedule.time_of_day && ` (${schedule.time_of_day})`}
            </p>
          </div>
        )}

        <button
          onClick={handleSave}
          disabled={updateMutation.isPending}
          className="glass-accent-moss w-full px-6 py-3 rounded-2xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
          style={{ color: "#A7F3D0" }}
        >
          <Save className="w-4 h-4" />
          {updateMutation.isPending ? "Saving..." : "Save Schedule"}
        </button>

        <p className="text-xs text-center" style={{ color: "#DDD6FE", opacity: 0.7 }}>
          Track watering in your progress logs to monitor adherence to this schedule
        </p>
      </div>
    </div>
  );
}