
import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { X, ShoppingCart, Loader2, CheckCircle } from "lucide-react";
import { toast } from "sonner";

export default function PurchaseWishlistModal({ item, onClose }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [purchaseDetails, setPurchaseDetails] = useState({
    acquisition_date: new Date().toISOString().split('T')[0],
    source: item.sources?.[0] || "",
    location: "Living Room",
    notes: item.notes || ""
  });

  const purchaseMutation = useMutation({
    mutationFn: async (purchaseData) => {
      // Create the plant in collection
      const plantData = {
        cultivar_name: item.cultivar_name,
        hybridizer: item.hybridizer || "",
        blossom_type: item.blossom_type || "",
        blossom_color: item.blossom_color || "",
        leaf_types: item.leaf_types ? [item.leaf_types] : [],
        acquisition_date: purchaseData.acquisition_date,
        source: purchaseData.source || `From wishlist (${item.cultivar_name})`,
        location: purchaseData.location || "",
        notes: purchaseData.notes || `Originally added to wishlist on ${new Date(item.date_added).toLocaleDateString()}`,
        photos: item.photo_url ? [item.photo_url] : []
      };

      const plant = await base44.entities.Plant.create(plantData);

      // Update wishlist item as acquired
      await base44.entities.Wishlist.update(item.id, {
        acquired: true,
        acquired_date: purchaseData.acquisition_date,
        acquired_plant_id: plant.id
      });

      return plant;
    },
    onSuccess: (plant) => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      queryClient.invalidateQueries({ queryKey: ['plants'] });
      toast.success("Plant acquired!", {
        description: `${item.cultivar_name} has been added to your collection.`
      });
      onClose();
      setTimeout(() => {
        navigate(createPageUrl(`PlantDetail?id=${plant.id}`));
      }, 500);
    },
    onError: (error) => {
      toast.error("Failed to add plant", {
        description: error.message || "Please try again."
      });
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    purchaseMutation.mutate(purchaseDetails);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
      style={{ background: "rgba(32, 24, 51, 0.8)" }}>
      <div className="glass-card rounded-[32px] p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        style={{
          boxShadow: "0 20px 60px rgba(32, 24, 51, 0.9), inset 0 1px 1px rgba(255, 255, 255, 0.2)"
        }}>
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold mb-1" style={{ 
              color: "#F5F3FF",
              textShadow: "0 2px 4px rgba(32, 24, 51, 0.4)",
              fontFamily: "'Playfair Display', Georgia, serif"
            }}>
              Purchase & Add to Collection
            </h2>
            <p className="text-sm" style={{ color: "#DDD6FE" }}>
              {item.cultivar_name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="glass-button w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ color: "#DDD6FE" }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Acquisition Date */}
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: "#F5F3FF" }}>
              Purchase Date
            </label>
            <input
              type="date"
              value={purchaseDetails.acquisition_date}
              onChange={(e) => setPurchaseDetails(prev => ({ ...prev, acquisition_date: e.target.value }))}
              className="glass-input w-full px-4 py-3 rounded-2xl"
              style={{ color: "#F5F3FF" }}
              required
            />
          </div>

          {/* Source */}
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: "#F5F3FF" }}>
              Where Did You Purchase It?
            </label>
            <input
              type="text"
              value={purchaseDetails.source}
              onChange={(e) => setPurchaseDetails(prev => ({ ...prev, source: e.target.value }))}
              placeholder="Vendor, nursery, online shop..."
              className="glass-input w-full px-4 py-3 rounded-2xl"
              style={{ color: "#F5F3FF" }}
            />
            {item.sources && item.sources.length > 0 && (
              <div className="mt-2">
                <p className="text-xs mb-1" style={{ color: "#C7C9E6", opacity: 0.8 }}>
                  Quick select from sources:
                </p>
                <div className="flex flex-wrap gap-2">
                  {item.sources.map((source, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setPurchaseDetails(prev => ({ ...prev, source }))}
                      className="glass-button px-3 py-1.5 rounded-xl text-xs hover:opacity-80 transition-opacity"
                      style={{ color: "#C4B5FD" }}
                    >
                      {source}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: "#F5F3FF" }}>
              Where Will You Keep It?
            </label>
            <input
              type="text"
              value={purchaseDetails.location}
              onChange={(e) => setPurchaseDetails(prev => ({ ...prev, location: e.target.value }))}
              placeholder="Living room, bedroom, shelf..."
              className="glass-input w-full px-4 py-3 rounded-2xl"
              style={{ color: "#F5F3FF" }}
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: "#F5F3FF" }}>
              Notes (Optional)
            </label>
            <textarea
              value={purchaseDetails.notes}
              onChange={(e) => setPurchaseDetails(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Add any additional notes..."
              rows={4}
              className="glass-input w-full px-4 py-3 rounded-2xl resize-none"
              style={{ color: "#F5F3FF" }}
            />
          </div>

          {/* Info Box */}
          <div className="glass-accent-moss rounded-2xl p-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "#A7F3D0", strokeWidth: 2 }} />
              <div>
                <p className="text-sm font-semibold mb-1" style={{ color: "#F5F3FF" }}>
                  What happens next?
                </p>
                <ul className="text-xs space-y-1" style={{ color: "#DDD6FE" }}>
                  <li>• Plant will be added to your collection</li>
                  <li>• Wishlist item will be marked as purchased</li>
                  <li>• You'll be redirected to the plant's detail page</li>
                  <li>• You can start tracking care and growth immediately</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="glass-button flex-1 px-6 py-4 rounded-2xl font-semibold"
              style={{ color: "#DDD6FE" }}
              disabled={purchaseMutation.isPending}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="glass-accent-lavender flex-1 px-6 py-4 rounded-2xl font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
              style={{ color: "#F0EBFF" }}
              disabled={purchaseMutation.isPending}
            >
              {purchaseMutation.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Adding to Collection...
                </>
              ) : (
                <>
                  <ShoppingCart className="w-5 h-5" style={{ strokeWidth: 2 }} />
                  Purchase & Add to Collection
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
