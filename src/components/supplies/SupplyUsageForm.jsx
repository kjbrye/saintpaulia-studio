import React, { useState } from "react";
import { X, TrendingDown, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import DateTimePicker from "../ui/DateTimePicker";
import { toast } from "sonner";

export default function SupplyUsageForm({ supply, onClose, preselectedPlantId = null }) {
  const queryClient = useQueryClient();

  const { data: plants = [] } = useQuery({
    queryKey: ['plants'],
    queryFn: () => base44.entities.Plant.list(),
    initialData: []
  });

  const [formData, setFormData] = useState({
    quantity_used: "",
    usage_date: new Date().toISOString().split('T')[0] + 'T' + new Date().toTimeString().slice(0, 5),
    plant_id: preselectedPlantId || "",
    purpose: "",
    notes: ""
  });

  const logUsageMutation = useMutation({
    mutationFn: async (data) => {
      // Create the usage log
      await base44.entities.SupplyUsageLog.create(data);
      
      // Update supply quantity
      const newQuantity = Math.max(0, supply.quantity - data.quantity_used);
      await base44.entities.Supply.update(supply.id, {
        quantity: newQuantity
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supplies'] });
      queryClient.invalidateQueries({ queryKey: ['supply', supply.id] });
      queryClient.invalidateQueries({ queryKey: ['supplyUsage', supply.id] });
      toast.success("Usage logged!", {
        description: `${formData.quantity_used} ${supply.unit} used`
      });
      onClose();
    },
    onError: (error) => {
      toast.error("Failed to log usage", {
        description: error.message || "Please try again."
      });
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const quantityUsed = parseFloat(formData.quantity_used);
    if (quantityUsed > supply.quantity) {
      toast.error("Invalid quantity", {
        description: `You only have ${supply.quantity} ${supply.unit} available.`
      });
      return;
    }

    const cleanedData = {
      supply_id: supply.id,
      quantity_used: quantityUsed,
      usage_date: new Date(formData.usage_date).toISOString(),
      ...(formData.plant_id && { plant_id: formData.plant_id }),
      ...(formData.purpose && { purpose: formData.purpose }),
      ...(formData.notes && { notes: formData.notes })
    };

    logUsageMutation.mutate(cleanedData);
  };

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass-card rounded-[32px] w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 backdrop-blur-2xl rounded-t-[32px] p-6 flex items-center justify-between"
          style={{
            background: "linear-gradient(135deg, rgba(227, 201, 255, 0.2) 0%, rgba(168, 159, 239, 0.15) 100%)",
            borderBottom: "1px solid rgba(227, 201, 255, 0.2)"
          }}>
          <h2 className="text-2xl font-bold" style={{ 
            color: "#F5F3FF",
            textShadow: "0 2px 4px rgba(32, 24, 51, 0.4)",
            fontFamily: "'Playfair Display', Georgia, serif"
          }}>
            Log Supply Usage
          </h2>
          <button
            onClick={onClose}
            className="glass-button w-10 h-10 rounded-2xl flex items-center justify-center"
            style={{ color: "#FCA5A5" }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Supply Info */}
          <div className="glass-card rounded-2xl p-4">
            <p className="text-sm mb-1" style={{ color: "#DDD6FE", opacity: 0.8 }}>Using supply:</p>
            <p className="text-lg font-bold" style={{ color: "#F5F3FF" }}>{supply.name}</p>
            <p className="text-sm mt-1" style={{ color: "#DDD6FE" }}>
              Available: {supply.quantity} {supply.unit}
            </p>
          </div>

          {/* Quantity Used */}
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: "#F5F3FF" }}>
              Quantity Used *
            </label>
            <div className="flex gap-3">
              <input
                type="number"
                step="0.1"
                required
                min="0.1"
                max={supply.quantity}
                value={formData.quantity_used}
                onChange={(e) => setFormData(prev => ({ ...prev, quantity_used: e.target.value }))}
                placeholder="0"
                className="glass-input flex-1 px-4 py-3 rounded-2xl"
                style={{ color: "#F5F3FF" }}
              />
              <div className="glass-button px-4 py-3 rounded-2xl flex items-center font-semibold"
                style={{ color: "#DDD6FE" }}>
                {supply.unit}
              </div>
            </div>
          </div>

          {/* Date and Time */}
          <DateTimePicker
            label="Date & Time"
            value={formData.usage_date}
            onChange={(datetime) => setFormData(prev => ({ ...prev, usage_date: datetime }))}
            placeholder="Select date and time"
            required
          />

          {/* Plant (Optional) */}
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: "#F5F3FF" }}>
              Used for Plant (optional)
            </label>
            <select
              value={formData.plant_id}
              onChange={(e) => setFormData(prev => ({ ...prev, plant_id: e.target.value }))}
              className="glass-input w-full px-4 py-3 rounded-2xl"
              style={{ color: "#F5F3FF" }}
            >
              <option value="">General use / Multiple plants</option>
              {plants.map(plant => (
                <option key={plant.id} value={plant.id}>
                  {plant.nickname || plant.cultivar_name}
                </option>
              ))}
            </select>
          </div>

          {/* Purpose */}
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: "#F5F3FF" }}>
              Purpose
            </label>
            <input
              type="text"
              value={formData.purpose}
              onChange={(e) => setFormData(prev => ({ ...prev, purpose: e.target.value }))}
              placeholder="e.g., Repotting, Fertilizing, Pest treatment"
              className="glass-input w-full px-4 py-3 rounded-2xl"
              style={{ color: "#F5F3FF" }}
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: "#F5F3FF" }}>
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Additional details..."
              rows={3}
              className="glass-input w-full px-4 py-3 rounded-2xl resize-none"
              style={{ color: "#F5F3FF" }}
            />
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="glass-button px-6 py-3 rounded-2xl font-semibold"
              style={{ color: "#DDD6FE" }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={logUsageMutation.isPending}
              className="glass-accent-lavender flex-1 px-6 py-3 rounded-2xl font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
              style={{ color: "#F0EBFF" }}
            >
              {logUsageMutation.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Logging...
                </>
              ) : (
                <>
                  <TrendingDown className="w-5 h-5" style={{ strokeWidth: 2 }} />
                  Log Usage
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}