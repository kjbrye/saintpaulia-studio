import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Repeat, Check, X, Edit, Trash2, Calendar, Loader2 } from "lucide-react";
import { format, addDays } from "date-fns";

export default function RecurringCareManager({ plantId, plant, currentUser }) {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const { data: recurringTasks = [] } = useQuery({
    queryKey: ['recurringTasks', plantId],
    queryFn: () => base44.entities.RecurringCareTask.filter({ plant_id: plantId }),
    initialData: []
  });

  const [formData, setFormData] = useState({
    care_type: "watering",
    interval_days: 7,
    start_date: format(new Date(), "yyyy-MM-dd"),
    watering_method: "",
    fertilizer_type: "",
    notes: "",
    is_active: true
  });

  const createMutation = useMutation({
    mutationFn: async (data) => {
      const nextDueDate = format(addDays(new Date(data.start_date), data.interval_days), "yyyy-MM-dd");
      return base44.entities.RecurringCareTask.create({
        plant_id: plantId,
        care_type: data.care_type,
        interval_days: Number(data.interval_days),
        start_date: data.start_date,
        next_due_date: nextDueDate,
        is_active: data.is_active,
        watering_method: data.watering_method || undefined,
        fertilizer_type: data.fertilizer_type || undefined,
        notes: data.notes || undefined
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurringTasks'] });
      setShowForm(false);
      setFormData({
        care_type: "watering",
        interval_days: 7,
        start_date: format(new Date(), "yyyy-MM-dd"),
        watering_method: "",
        fertilizer_type: "",
        notes: "",
        is_active: true
      });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.RecurringCareTask.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurringTasks'] });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.RecurringCareTask.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurringTasks'] });
    }
  });

  const handleComplete = async (task) => {
    const nextDate = format(addDays(new Date(task.next_due_date), task.interval_days), "yyyy-MM-dd");
    await updateMutation.mutateAsync({
      id: task.id,
      data: { next_due_date: nextDate }
    });
  };

  const handleToggleActive = async (task) => {
    await updateMutation.mutateAsync({
      id: task.id,
      data: { is_active: !task.is_active }
    });
  };

  const currentTheme = currentUser?.theme || "glassmorphism";

  return (
    <div className="glass-card rounded-3xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold flex items-center gap-2" style={{
          color: "var(--text-primary)",
          fontFamily: "'Playfair Display', Georgia, serif"
        }}>
          <Repeat className="w-5 h-5" style={{ color: "#C4B5FD" }} />
          Recurring Care Tasks
        </h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="glass-accent-lavender px-4 py-2 rounded-2xl text-sm font-semibold flex items-center gap-2"
          style={{ color: "#F0EBFF" }}
        >
          <Plus className="w-4 h-4" />
          Add Task
        </button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="glass-button rounded-2xl p-5 mb-4">
          <h4 className="text-sm font-bold mb-4" style={{ color: "var(--text-primary)" }}>
            New Recurring Task
          </h4>
          
          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
                  Care Type
                </label>
                <select
                  value={formData.care_type}
                  onChange={(e) => setFormData(prev => ({ ...prev, care_type: e.target.value }))}
                  className="glass-input w-full px-3 py-2 rounded-xl text-sm"
                  style={{ color: "var(--text-primary)" }}
                >
                  <option value="watering">Watering</option>
                  <option value="fertilizing">Fertilizing</option>
                  <option value="grooming">Grooming</option>
                  <option value="repotting">Repotting</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
                  Every (days)
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.interval_days}
                  onChange={(e) => setFormData(prev => ({ ...prev, interval_days: e.target.value }))}
                  className="glass-input w-full px-3 py-2 rounded-xl text-sm"
                  style={{ color: "var(--text-primary)" }}
                />
              </div>
            </div>

            {formData.care_type === "watering" && (
              <div>
                <label className="block text-xs font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
                  Default Watering Method
                </label>
                <select
                  value={formData.watering_method}
                  onChange={(e) => setFormData(prev => ({ ...prev, watering_method: e.target.value }))}
                  className="glass-input w-full px-3 py-2 rounded-xl text-sm"
                  style={{ color: "var(--text-primary)" }}
                >
                  <option value="">Select method...</option>
                  <option value="top">Top Watering</option>
                  <option value="bottom">Bottom Watering</option>
                  <option value="wick">Wick Watering</option>
                </select>
              </div>
            )}

            {formData.care_type === "fertilizing" && (
              <div>
                <label className="block text-xs font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
                  Default Fertilizer Type
                </label>
                <input
                  type="text"
                  value={formData.fertilizer_type}
                  onChange={(e) => setFormData(prev => ({ ...prev, fertilizer_type: e.target.value }))}
                  placeholder="e.g., 20-20-20"
                  className="glass-input w-full px-3 py-2 rounded-xl text-sm"
                  style={{ color: "var(--text-primary)" }}
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Instructions or reminders..."
                rows={2}
                className="glass-input w-full px-3 py-2 rounded-xl text-sm resize-none"
                style={{ color: "var(--text-primary)" }}
              />
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="glass-button px-4 py-2 rounded-xl text-sm font-semibold"
                style={{ color: "var(--text-secondary)" }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => createMutation.mutate(formData)}
                disabled={createMutation.isPending}
                className="glass-accent-moss flex-1 px-4 py-2 rounded-xl text-sm font-semibold"
                style={{ color: (currentTheme === 'light' || currentTheme === 'minimal') ? "#FFFFFF" : "#A7F3D0" }}
              >
                {createMutation.isPending ? "Creating..." : "Create Task"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tasks List */}
      <div className="space-y-3">
        {recurringTasks.length === 0 ? (
          <div className="text-center py-6">
            <Repeat className="w-12 h-12 mx-auto mb-3" style={{ color: "#C4B5FD", opacity: 0.3 }} />
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              No recurring care tasks set up yet
            </p>
            <p className="text-xs mt-1" style={{ color: "var(--text-secondary)", opacity: 0.7 }}>
              Create automated reminders for regular care activities
            </p>
          </div>
        ) : (
          recurringTasks.map(task => {
            const isOverdue = new Date(task.next_due_date) < new Date();
            
            return (
              <div key={task.id} className={`neuro-button rounded-2xl p-4 ${!task.is_active ? 'opacity-60' : ''}`}>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold capitalize" style={{ color: "var(--text-primary)" }}>
                        {task.care_type}
                      </p>
                      <span className="text-xs px-2 py-0.5 rounded-lg backdrop-blur-xl"
                        style={{
                          background: task.is_active ? "rgba(167, 243, 208, 0.2)" : "rgba(156, 163, 175, 0.2)",
                          border: task.is_active ? "1px solid rgba(167, 243, 208, 0.4)" : "1px solid rgba(156, 163, 175, 0.4)",
                          color: task.is_active ? "#A7F3D0" : "#9CA3AF"
                        }}>
                        {task.is_active ? "Active" : "Paused"}
                      </span>
                      {isOverdue && task.is_active && (
                        <span className="text-xs px-2 py-0.5 rounded-lg backdrop-blur-xl"
                          style={{
                            background: "rgba(252, 165, 165, 0.2)",
                            border: "1px solid rgba(252, 165, 165, 0.4)",
                            color: "#FCA5A5"
                          }}>
                          Overdue
                        </span>
                      )}
                    </div>
                    <p className="text-xs mb-1" style={{ color: "var(--text-secondary)" }}>
                      Every {task.interval_days} day{task.interval_days !== 1 ? 's' : ''}
                    </p>
                    <p className="text-xs" style={{ color: "var(--text-secondary)", opacity: 0.8 }}>
                      Next due: {format(new Date(task.next_due_date), "MMM d, yyyy")}
                    </p>
                    {task.notes && (
                      <p className="text-xs mt-2 italic" style={{ color: "var(--text-secondary)", opacity: 0.7 }}>
                        {task.notes}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {task.is_active && (
                      <button
                        onClick={() => handleComplete(task)}
                        className="glass-accent-moss w-8 h-8 rounded-xl flex items-center justify-center"
                        title="Mark as done"
                        style={{ color: (currentTheme === 'light' || currentTheme === 'minimal') ? "#FFFFFF" : "#A7F3D0" }}
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => handleToggleActive(task)}
                      className="glass-button w-8 h-8 rounded-xl flex items-center justify-center"
                      title={task.is_active ? "Pause" : "Resume"}
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {task.is_active ? <X className="w-4 h-4" /> : <Repeat className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => {
                        if (confirm("Delete this recurring task?")) {
                          deleteMutation.mutate(task.id);
                        }
                      }}
                      className="glass-button w-8 h-8 rounded-xl flex items-center justify-center"
                      style={{ color: "#FCA5A5" }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}