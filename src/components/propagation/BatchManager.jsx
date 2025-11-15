import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { X, Plus, Edit, Trash2, Package, MapPin } from "lucide-react";
import { toast } from "sonner";

export default function BatchManager({ projectId }) {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingBatch, setEditingBatch] = useState(null);

  const { data: batches = [] } = useQuery({
    queryKey: ['propagationBatches', projectId],
    queryFn: () => base44.entities.PropagationBatch.filter({ project_id: projectId }, '-batch_number'),
    enabled: !!projectId,
    initialData: []
  });

  const [formData, setFormData] = useState({
    project_id: projectId,
    batch_name: "",
    batch_number: batches.length + 1,
    start_date: new Date().toISOString().split('T')[0],
    quantity: "",
    success_count: 0,
    container_location: "",
    special_notes: "",
    status: "active"
  });

  const createMutation = useMutation({
    mutationFn: (data) => {
      if (editingBatch) {
        return base44.entities.PropagationBatch.update(editingBatch.id, data);
      }
      return base44.entities.PropagationBatch.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['propagationBatches', projectId] });
      toast.success(editingBatch ? "Batch updated!" : "Batch created!");
      setShowForm(false);
      setEditingBatch(null);
      setFormData({
        project_id: projectId,
        batch_name: "",
        batch_number: batches.length + 1,
        start_date: new Date().toISOString().split('T')[0],
        quantity: "",
        success_count: 0,
        container_location: "",
        special_notes: "",
        status: "active"
      });
    },
    onError: (error) => {
      toast.error("Operation failed", {
        description: error.message || "Please try again."
      });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (batchId) => base44.entities.PropagationBatch.delete(batchId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['propagationBatches', projectId] });
      toast.success("Batch deleted");
    }
  });

  const handleEdit = (batch) => {
    setEditingBatch(batch);
    setFormData({
      project_id: batch.project_id,
      batch_name: batch.batch_name,
      batch_number: batch.batch_number,
      start_date: batch.start_date,
      quantity: batch.quantity,
      success_count: batch.success_count,
      container_location: batch.container_location || "",
      special_notes: batch.special_notes || "",
      status: batch.status
    });
    setShowForm(true);
  };

  const handleDelete = (batchId) => {
    if (window.confirm("Delete this batch? This cannot be undone.")) {
      deleteMutation.mutate(batchId);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const cleanedData = Object.fromEntries(
      Object.entries(formData).filter(([, value]) => value !== "")
    );
    createMutation.mutate(cleanedData);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return { bg: "rgba(154, 226, 211, 0.2)", border: "rgba(154, 226, 211, 0.4)", text: "#A7F3D0" };
      case 'completed': return { bg: "rgba(147, 197, 253, 0.2)", border: "rgba(147, 197, 253, 0.4)", text: "#93C5FD" };
      case 'failed': return { bg: "rgba(239, 68, 68, 0.2)", border: "rgba(239, 68, 68, 0.4)", text: "#FCA5A5" };
      default: return { bg: "rgba(196, 181, 253, 0.2)", border: "rgba(196, 181, 253, 0.4)", text: "#C4B5FD" };
    }
  };

  return (
    <div className="glass-card rounded-3xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold flex items-center gap-2" style={{ 
          color: "#F5F3FF",
          textShadow: "0 1px 3px rgba(32, 24, 51, 0.4)",
          fontFamily: "'Playfair Display', Georgia, serif"
        }}>
          <Package className="w-5 h-5" style={{ color: "#C4B5FD", strokeWidth: 1.5 }} />
          Batches ({batches.length})
        </h3>
        <button
          onClick={() => {
            setEditingBatch(null);
            setFormData({
              project_id: projectId,
              batch_name: "",
              batch_number: batches.length + 1,
              start_date: new Date().toISOString().split('T')[0],
              quantity: "",
              success_count: 0,
              container_location: "",
              special_notes: "",
              status: "active"
            });
            setShowForm(true);
          }}
          className="glass-accent-lavender px-4 py-2 rounded-2xl font-semibold flex items-center gap-2"
          style={{ color: "#F0EBFF" }}
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Add Batch</span>
        </button>
      </div>

      {/* Batch Form */}
      {showForm && (
        <div className="glass-button rounded-2xl p-4 mb-4">
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: "#F5F3FF" }}>
                  Batch Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.batch_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, batch_name: e.target.value }))}
                  placeholder="e.g., Spring 2024 A"
                  className="glass-input w-full px-3 py-2 rounded-xl text-sm"
                  style={{ color: "#F5F3FF" }}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: "#F5F3FF" }}>
                  Start Date *
                </label>
                <input
                  type="date"
                  required
                  value={formData.start_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                  className="glass-input w-full px-3 py-2 rounded-xl text-sm"
                  style={{ color: "#F5F3FF" }}
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: "#F5F3FF" }}>
                  Quantity
                </label>
                <input
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData(prev => ({ ...prev, quantity: e.target.value }))}
                  placeholder="10"
                  className="glass-input w-full px-3 py-2 rounded-xl text-sm"
                  style={{ color: "#F5F3FF" }}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: "#F5F3FF" }}>
                  Location
                </label>
                <input
                  type="text"
                  value={formData.container_location}
                  onChange={(e) => setFormData(prev => ({ ...prev, container_location: e.target.value }))}
                  placeholder="Shelf A"
                  className="glass-input w-full px-3 py-2 rounded-xl text-sm"
                  style={{ color: "#F5F3FF" }}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: "#F5F3FF" }}>
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                  className="glass-input w-full px-3 py-2 rounded-xl text-sm"
                  style={{ color: "#F5F3FF" }}
                >
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="failed">Failed</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: "#F5F3FF" }}>
                Notes
              </label>
              <textarea
                value={formData.special_notes}
                onChange={(e) => setFormData(prev => ({ ...prev, special_notes: e.target.value }))}
                placeholder="Special observations for this batch..."
                rows={2}
                className="glass-input w-full px-3 py-2 rounded-xl text-sm resize-none"
                style={{ color: "#F5F3FF" }}
              />
            </div>

            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingBatch(null);
                }}
                className="glass-button px-4 py-2 rounded-xl text-sm font-semibold"
                style={{ color: "#DDD6FE" }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createMutation.isPending}
                className="glass-accent-moss px-4 py-2 rounded-xl text-sm font-semibold disabled:opacity-50"
                style={{ color: "#A7F3D0" }}
              >
                {createMutation.isPending ? "Saving..." : editingBatch ? "Update" : "Create"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Batches List */}
      {batches.length === 0 ? (
        <div className="text-center py-8">
          <Package className="w-8 h-8 mx-auto mb-2" style={{ color: "#C4B5FD", opacity: 0.5 }} />
          <p className="text-sm" style={{ color: "#DDD6FE" }}>
            No batches yet. Create batches to organize your propagation efforts.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {batches.map(batch => {
            const statusStyle = getStatusColor(batch.status);
            const successRate = batch.quantity > 0 ? Math.round((batch.success_count / batch.quantity) * 100) : 0;

            return (
              <div key={batch.id} className="glass-button rounded-2xl p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-bold" style={{ color: "#F5F3FF" }}>
                        {batch.batch_name}
                      </h4>
                      <span className="text-xs px-2 py-0.5 rounded-lg font-medium backdrop-blur-xl"
                        style={{
                          background: statusStyle.bg,
                          border: `1px solid ${statusStyle.border}`,
                          color: statusStyle.text
                        }}>
                        Batch #{batch.batch_number}
                      </span>
                    </div>
                    <p className="text-xs mb-2" style={{ color: "#DDD6FE" }}>
                      Started: {new Date(batch.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                    {batch.container_location && (
                      <p className="text-xs flex items-center gap-1" style={{ color: "#DDD6FE" }}>
                        <MapPin className="w-3 h-3" />
                        {batch.container_location}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(batch)}
                      className="glass-button w-8 h-8 rounded-xl flex items-center justify-center"
                      style={{ color: "#C4B5FD" }}
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(batch.id)}
                      className="glass-button w-8 h-8 rounded-xl flex items-center justify-center"
                      style={{ color: "#FCA5A5" }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {batch.quantity && (
                  <div className="flex items-center justify-between text-xs" style={{ color: "#DDD6FE" }}>
                    <span>
                      {batch.success_count}/{batch.quantity} successful ({successRate}%)
                    </span>
                    <span
                      className="px-2 py-0.5 rounded-lg font-medium backdrop-blur-xl"
                      style={{
                        background: statusStyle.bg,
                        border: `1px solid ${statusStyle.border}`,
                        color: statusStyle.text
                      }}>
                      {batch.status}
                    </span>
                  </div>
                )}

                {batch.special_notes && (
                  <p className="text-xs mt-2 p-2 rounded-xl" 
                    style={{ 
                      background: "rgba(227, 201, 255, 0.1)", 
                      color: "#DDD6FE" 
                    }}>
                    {batch.special_notes}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}