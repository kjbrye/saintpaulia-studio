
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Upload, Loader2, Package } from "lucide-react";
import { createPageUrl } from "@/utils";
import DatePicker from "../components/ui/DatePicker";
import { toast } from "sonner";

const LOGO_URL = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/690e3cd78523fb5fba0a8466/632f6e485_PlantLogos.png";

export default function AddSupply() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    category: "other",
    quantity: "",
    unit: "count",
    minimum_quantity: "1",
    purchase_date: new Date().toISOString().split('T')[0],
    expiration_date: "",
    supplier: "",
    cost: "",
    storage_location: "",
    notes: "",
    photo: ""
  });

  const createMutation = useMutation({
    mutationFn: (supplyData) => base44.entities.Supply.create(supplyData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supplies'] });
      toast.success("Supply added!", {
        description: "Successfully added to your inventory."
      });
      navigate(createPageUrl("SupplyInventory"));
    },
    onError: (error) => {
      toast.error("Failed to add supply", {
        description: error.message || "Please try again."
      });
    }
  });

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData(prev => ({ ...prev, photo: file_url }));
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const cleanedData = Object.fromEntries(
      Object.entries(formData)
        .filter(([, value]) => value !== "")
        .map(([key, value]) => [
          key, 
          ["quantity", "minimum_quantity", "cost"].includes(key) ? Number(value) : value
        ])
    );
    createMutation.mutate(cleanedData);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate(createPageUrl("SupplyInventory"))}
          className="glass-button w-12 h-12 rounded-2xl flex items-center justify-center"
          style={{ color: "var(--accent)" }}
        >
          <ArrowLeft className="w-5 h-5" style={{ strokeWidth: 2 }} />
        </button>
        <div>
          <h1 className="text-3xl font-bold" style={{ 
            color: "var(--text-primary)",
            textShadow: "var(--heading-shadow)",
            fontFamily: "'Playfair Display', Georgia, serif"
          }}>
            Add New Supply
          </h1>
          <p style={{ color: "var(--text-secondary)" }}>Add an item to your inventory</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Photo Upload */}
        <div className="glass-card rounded-3xl p-6">
          <label className="block text-sm font-semibold mb-3" style={{ color: "var(--text-primary)" }}>Supply Photo</label>
          <div className="flex items-start gap-4 flex-col sm:flex-row">
            <div className="glass-card rounded-2xl overflow-hidden w-32 h-32 flex-shrink-0"
              style={{
                boxShadow: "inset 0 2px 8px rgba(32, 24, 51, 0.4), 0 4px 16px rgba(32, 24, 51, 0.3)"
              }}>
              {formData.photo ? (
                <img 
                  src={formData.photo} 
                  alt="Supply preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center"
                  style={{
                    background: "linear-gradient(135deg, rgba(168, 159, 239, 0.15) 0%, rgba(154, 226, 211, 0.12) 100%)"
                  }}>
                  <Package className="w-8 h-8" style={{ color: "#C4B5FD", opacity: 0.5 }} />
                </div>
              )}
            </div>
            <div className="flex-1">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="photo-upload"
                disabled={uploading}
              />
              <label
                htmlFor="photo-upload"
                className="glass-button inline-flex items-center gap-2 px-6 py-3 rounded-2xl font-medium cursor-pointer hover:opacity-90 transition-opacity"
                style={{ color: "var(--text-secondary)" }}
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    Choose Photo
                  </>
                )}
              </label>
            </div>
          </div>
        </div>

        {/* Basic Information */}
        <div className="glass-card rounded-3xl p-6 space-y-4">
          <h3 className="text-lg font-bold mb-4" style={{ 
            color: "var(--text-primary)",
            textShadow: "var(--heading-shadow)",
            fontFamily: "'Playfair Display', Georgia, serif"
          }}>
            Basic Information
          </h3>

          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
              Supply Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., Peat Moss, 20-20-20 Fertilizer"
              className="glass-input w-full px-4 py-3 rounded-2xl"
              style={{ color: "var(--text-primary)" }}
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                className="glass-input w-full px-4 py-3 rounded-2xl"
                style={{ color: "var(--text-primary)" }}
              >
                <option value="soil">Soil & Substrate</option>
                <option value="fertilizer">Fertilizer</option>
                <option value="pot">Pot & Container</option>
                <option value="pesticide">Pesticide & Treatment</option>
                <option value="tool">Tool</option>
                <option value="supplement">Supplement</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
                Storage Location
              </label>
              <input
                type="text"
                value={formData.storage_location}
                onChange={(e) => setFormData(prev => ({ ...prev, storage_location: e.target.value }))}
                placeholder="e.g., Garage shelf, Cabinet"
                className="glass-input w-full px-4 py-3 rounded-2xl"
                style={{ color: "var(--text-primary)" }}
              />
            </div>
          </div>
        </div>

        {/* Quantity & Stock */}
        <div className="glass-card rounded-3xl p-6 space-y-4">
          <h3 className="text-lg font-bold mb-4" style={{ 
            color: "var(--text-primary)",
            textShadow: "var(--heading-shadow)",
            fontFamily: "'Playfair Display', Georgia, serif"
          }}>
            Quantity & Stock Levels
          </h3>

          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
                Current Quantity *
              </label>
              <input
                type="number"
                step="0.1"
                required
                value={formData.quantity}
                onChange={(e) => setFormData(prev => ({ ...prev, quantity: e.target.value }))}
                placeholder="e.g., 5"
                className="glass-input w-full px-4 py-3 rounded-2xl"
                style={{ color: "var(--text-primary)" }}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
                Unit *
              </label>
              <select
                value={formData.unit}
                onChange={(e) => setFormData(prev => ({ ...prev, unit: e.target.value }))}
                className="glass-input w-full px-4 py-3 rounded-2xl"
                style={{ color: "var(--text-primary)" }}
              >
                <option value="count">Count</option>
                <option value="oz">Ounces (oz)</option>
                <option value="lb">Pounds (lb)</option>
                <option value="ml">Milliliters (ml)</option>
                <option value="l">Liters (L)</option>
                <option value="gal">Gallons (gal)</option>
                <option value="qt">Quarts (qt)</option>
                <option value="cups">Cups</option>
                <option value="tbsp">Tablespoons</option>
                <option value="tsp">Teaspoons</option>
                <option value="bag">Bag</option>
                <option value="bottle">Bottle</option>
                <option value="box">Box</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
                Min. Quantity Alert *
              </label>
              <input
                type="number"
                step="0.1"
                required
                value={formData.minimum_quantity}
                onChange={(e) => setFormData(prev => ({ ...prev, minimum_quantity: e.target.value }))}
                placeholder="e.g., 1"
                className="glass-input w-full px-4 py-3 rounded-2xl"
                style={{ color: "var(--text-primary)" }}
              />
              <p className="text-xs mt-1" style={{ color: "#DDD6FE", opacity: 0.7 }}>
                Get alerts when stock falls below this level
              </p>
            </div>
          </div>
        </div>

        {/* Purchase Details */}
        <div className="glass-card rounded-3xl p-6 space-y-4">
          <h3 className="text-lg font-bold mb-4" style={{ 
            color: "var(--text-primary)",
            textShadow: "var(--heading-shadow)",
            fontFamily: "'Playfair Display', Georgia, serif"
          }}>
            Purchase Details
          </h3>

          <div className="grid sm:grid-cols-2 gap-4">
            <DatePicker
              label="Purchase Date"
              value={formData.purchase_date}
              onChange={(date) => setFormData(prev => ({ ...prev, purchase_date: date }))}
              placeholder="Select date"
            />

            <DatePicker
              label="Expiration Date"
              value={formData.expiration_date}
              onChange={(date) => setFormData(prev => ({ ...prev, expiration_date: date }))}
              placeholder="Select date"
              minDate={formData.purchase_date || undefined}
            />

            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
                Supplier/Store
              </label>
              <input
                type="text"
                value={formData.supplier}
                onChange={(e) => setFormData(prev => ({ ...prev, supplier: e.target.value }))}
                placeholder="e.g., Local Garden Center"
                className="glass-input w-full px-4 py-3 rounded-2xl"
                style={{ color: "var(--text-primary)" }}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
                Cost ($)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.cost}
                onChange={(e) => setFormData(prev => ({ ...prev, cost: e.target.value }))}
                placeholder="e.g., 15.99"
                className="glass-input w-full px-4 py-3 rounded-2xl"
                style={{ color: "var(--text-primary)" }}
              />
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="glass-card rounded-3xl p-6">
          <label className="block text-sm font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
            Notes
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            placeholder="Additional notes about this supply..."
            rows={3}
            className="glass-input w-full px-4 py-3 rounded-2xl resize-none"
            style={{ color: "var(--text-primary)" }}
          />
        </div>

        {/* Submit Button */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => navigate(createPageUrl("SupplyInventory"))}
            className="glass-button px-8 py-4 rounded-2xl font-semibold"
            style={{ color: "var(--text-secondary)" }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={createMutation.isPending}
            className="glass-accent-moss flex-1 px-8 py-4 rounded-2xl font-semibold disabled:opacity-50"
            style={{ color: "#A7F3D0" }}
          >
            {createMutation.isPending ? "Adding..." : "Add to Inventory"}
          </button>
        </div>
      </form>
    </div>
  );
}
