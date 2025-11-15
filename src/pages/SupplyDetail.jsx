import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Edit, Trash2, Package, Calendar, MapPin, DollarSign, TrendingDown, AlertTriangle } from "lucide-react";
import { createPageUrl } from "@/utils";
import { toast } from "sonner";
import SupplyUsageForm from "../components/supplies/SupplyUsageForm";

const LOGO_URL = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/690e3cd78523fb5fba0a8466/632f6e485_PlantLogos.png";

const CATEGORY_COLORS = {
  soil: { bg: "rgba(154, 226, 211, 0.18)", border: "rgba(154, 226, 211, 0.35)", text: "#A7F3D0" },
  fertilizer: { bg: "rgba(251, 146, 60, 0.15)", border: "rgba(251, 146, 60, 0.3)", text: "#FCD34D" },
  pot: { bg: "rgba(168, 159, 239, 0.18)", border: "rgba(168, 159, 239, 0.35)", text: "#C4B5FD" },
  pesticide: { bg: "rgba(239, 68, 68, 0.15)", border: "rgba(239, 68, 68, 0.3)", text: "#FCA5A5" },
  tool: { bg: "rgba(167, 139, 250, 0.18)", border: "rgba(167, 139, 250, 0.35)", text: "#E9D5FF" },
  supplement: { bg: "rgba(110, 231, 183, 0.18)", border: "rgba(110, 231, 183, 0.35)", text: "#6EE7B7" },
  other: { bg: "rgba(199, 201, 230, 0.15)", border: "rgba(199, 201, 230, 0.3)", text: "#DDD6FE" }
};

export default function SupplyDetail() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const supplyId = urlParams.get('id');
  const [showUsageForm, setShowUsageForm] = useState(false);

  const { data: supply, isLoading } = useQuery({
    queryKey: ['supply', supplyId],
    queryFn: () => base44.entities.Supply.filter({ id: supplyId }).then(supplies => supplies[0]),
    enabled: !!supplyId
  });

  const { data: usageLogs = [] } = useQuery({
    queryKey: ['supplyUsage', supplyId],
    queryFn: () => base44.entities.SupplyUsageLog.filter({ supply_id: supplyId }, '-usage_date'),
    enabled: !!supplyId
  });

  const { data: plants = [] } = useQuery({
    queryKey: ['plants'],
    queryFn: () => base44.entities.Plant.list(),
    initialData: []
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      // Delete all usage logs first
      await Promise.all(usageLogs.map(log => base44.entities.SupplyUsageLog.delete(log.id)));
      // Delete the supply
      await base44.entities.Supply.delete(supplyId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supplies'] });
      queryClient.invalidateQueries({ queryKey: ['supplyUsage'] });
      toast.success("Supply deleted!");
      navigate(createPageUrl("SupplyInventory"));
    }
  });

  const handleDelete = () => {
    if (window.confirm(`Delete ${supply.name}? This will also delete all usage history.`)) {
      deleteMutation.mutate();
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="glass-card w-16 h-16 rounded-2xl flex items-center justify-center animate-pulse glow-violet p-2">
          <img 
            src={LOGO_URL} 
            alt="Loading" 
            className="w-full h-full object-contain"
            style={{ opacity: 0.6 }}
          />
        </div>
      </div>
    );
  }

  if (!supply) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="glass-card rounded-3xl p-12 text-center">
          <p style={{ color: "var(--text-primary)" }} className="font-medium">Supply not found</p>
        </div>
      </div>
    );
  }

  const isLowStock = supply.quantity <= supply.minimum_quantity;
  const stockPercentage = (supply.quantity / (supply.minimum_quantity * 3)) * 100;
  const categoryColor = CATEGORY_COLORS[supply.category] || CATEGORY_COLORS.other;
  const isExpiringSoon = supply.expiration_date && 
    new Date(supply.expiration_date) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  const totalUsed = usageLogs.reduce((sum, log) => sum + log.quantity_used, 0);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8 flex-wrap">
        <button
          onClick={() => navigate(createPageUrl("SupplyInventory"))}
          className="glass-button w-12 h-12 rounded-2xl flex items-center justify-center"
          style={{ color: "#E3C9FF" }}
        >
          <ArrowLeft className="w-5 h-5" style={{ strokeWidth: 2 }} />
        </button>
        <div className="flex-1 min-w-[200px]">
          <div className="flex items-center gap-3 mb-1 flex-wrap">
            <h1 className="text-3xl font-bold" style={{ 
              color: "var(--text-primary)",
              textShadow: "0 2px 4px rgba(32, 24, 51, 0.4)",
              fontFamily: "'Playfair Display', Georgia, serif"
            }}>
              {supply.name}
            </h1>
            {isLowStock && (
              <div className="px-3 py-1 rounded-xl text-sm font-semibold backdrop-blur-xl"
                style={{
                  background: "rgba(251, 146, 60, 0.25)",
                  border: "1px solid rgba(251, 146, 60, 0.45)",
                  color: "#FCD34D"
                }}>
                Low Stock
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1 rounded-xl text-xs font-medium backdrop-blur-xl"
              style={{
                background: categoryColor.bg,
                border: `1px solid ${categoryColor.border}`,
                color: categoryColor.text
              }}>
              {supply.category.replace(/_/g, ' ')}
            </span>
          </div>
        </div>
        <button
          onClick={() => navigate(createPageUrl(`EditSupply?id=${supplyId}`))}
          className="glass-accent-moss w-12 h-12 rounded-2xl flex items-center justify-center"
          style={{ color: "#A7F3D0" }}
        >
          <Edit className="w-5 h-5" style={{ strokeWidth: 2 }} />
        </button>
        <button
          onClick={handleDelete}
          className="w-12 h-12 rounded-2xl flex items-center justify-center backdrop-blur-md"
          style={{
            background: "linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(220, 38, 38, 0.15) 100%)",
            border: "1px solid rgba(239, 68, 68, 0.45)",
            color: "#FCA5A5",
            boxShadow: "0 2px 12px rgba(239, 68, 68, 0.35), inset 0 0.5px 0 rgba(255, 255, 255, 0.2)"
          }}
        >
          <Trash2 className="w-5 h-5" style={{ strokeWidth: 2 }} />
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-1 space-y-6">
          {/* Photo */}
          <div className="glass-card rounded-3xl overflow-hidden aspect-square"
            style={{
              boxShadow: "inset 0 2px 12px rgba(32, 24, 51, 0.4), 0 8px 32px rgba(32, 24, 51, 0.6), inset 0 1px 1px rgba(255, 255, 255, 0.2)",
              border: "1px solid rgba(227, 201, 255, 0.25)"
            }}>
            {supply.photo ? (
              <img 
                src={supply.photo} 
                alt={supply.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center p-12"
                style={{
                  background: "linear-gradient(135deg, rgba(168, 159, 239, 0.15) 0%, rgba(154, 226, 211, 0.12) 100%)"
                }}>
                <Package className="w-full h-full" style={{ color: "#C4B5FD", opacity: 0.3 }} />
              </div>
            )}
          </div>

          {/* Stock Level */}
          <div className="glass-card rounded-3xl p-6">
            <h2 className="text-lg font-bold mb-4" style={{ 
              color: "var(--text-primary)",
              textShadow: "0 1px 3px rgba(32, 24, 51, 0.4)",
              fontFamily: "'Playfair Display', Georgia, serif"
            }}>
              Stock Level
            </h2>
            <div className="text-center mb-4">
              <p className="text-5xl font-bold mb-2" style={{ 
                color: isLowStock ? "#FCD34D" : "var(--text-primary)",
                fontFamily: "'Playfair Display', Georgia, serif"
              }}>
                {supply.quantity}
              </p>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{supply.unit}</p>
            </div>
            <div className="h-3 rounded-full overflow-hidden backdrop-blur-xl mb-3"
              style={{
                background: "rgba(60, 46, 90, 0.4)",
                border: "1px solid rgba(227, 201, 255, 0.2)"
              }}>
              <div 
                className="h-full transition-all duration-500"
                style={{
                  width: `${Math.min(stockPercentage, 100)}%`,
                  background: isLowStock 
                    ? "linear-gradient(90deg, rgba(251, 146, 60, 0.6) 0%, rgba(249, 115, 22, 0.5) 100%)"
                    : stockPercentage < 50
                    ? "linear-gradient(90deg, rgba(251, 191, 36, 0.6) 0%, rgba(245, 158, 11, 0.5) 100%)"
                    : "linear-gradient(90deg, rgba(110, 231, 183, 0.6) 0%, rgba(52, 211, 153, 0.5) 100%)"
                }}
              />
            </div>
            <div className="flex justify-between text-xs" style={{ color: "var(--text-secondary)" }}>
              <span>Min: {supply.minimum_quantity}</span>
              <span>Total used: {totalUsed}</span>
            </div>
          </div>

          {/* Log Usage Button */}
          <button
            onClick={() => setShowUsageForm(true)}
            className="glass-accent-lavender w-full px-6 py-4 rounded-3xl font-semibold flex items-center justify-center gap-2"
            style={{ color: "#F0EBFF" }}
          >
            <TrendingDown className="w-5 h-5" style={{ strokeWidth: 2 }} />
            Log Usage
          </button>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Details */}
          <div className="glass-card rounded-3xl p-6">
            <h2 className="text-xl font-bold mb-6" style={{ 
              color: "var(--text-primary)",
              textShadow: "0 1px 3px rgba(32, 24, 51, 0.4)",
              fontFamily: "'Playfair Display', Georgia, serif"
            }}>
              Supply Details
            </h2>

            <div className="grid sm:grid-cols-2 gap-4">
              {supply.storage_location && (
                <div>
                  <p className="text-xs font-medium mb-1 flex items-center gap-2" style={{ color: "var(--text-muted)", opacity: 0.8 }}>
                    <MapPin className="w-3 h-3" />
                    Storage Location
                  </p>
                  <p className="font-semibold" style={{ color: "var(--text-primary)" }}>{supply.storage_location}</p>
                </div>
              )}

              {supply.purchase_date && (
                <div>
                  <p className="text-xs font-medium mb-1 flex items-center gap-2" style={{ color: "var(--text-muted)", opacity: 0.8 }}>
                    <Calendar className="w-3 h-3" />
                    Purchase Date
                  </p>
                  <p className="font-semibold" style={{ color: "var(--text-primary)" }}>
                    {new Date(supply.purchase_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
              )}

              {supply.expiration_date && (
                <div>
                  <p className="text-xs font-medium mb-1 flex items-center gap-2" style={{ color: "var(--text-muted)", opacity: 0.8 }}>
                    <AlertTriangle className="w-3 h-3" style={{ color: isExpiringSoon ? "#FCA5A5" : undefined }} />
                    Expiration Date
                  </p>
                  <p className="font-semibold" style={{ color: isExpiringSoon ? "#FCA5A5" : "var(--text-primary)" }}>
                    {new Date(supply.expiration_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
              )}

              {supply.supplier && (
                <div>
                  <p className="text-xs font-medium mb-1" style={{ color: "#C7C9E6", opacity: 0.8 }}>Supplier</p>
                  <p className="font-semibold" style={{ color: "var(--text-primary)" }}>{supply.supplier}</p>
                </div>
              )}

              {supply.cost && (
                <div>
                  <p className="text-xs font-medium mb-1 flex items-center gap-2" style={{ color: "var(--text-muted)", opacity: 0.8 }}>
                    <DollarSign className="w-3 h-3" />
                    Cost
                  </p>
                  <p className="font-semibold" style={{ color: "var(--text-primary)" }}>${supply.cost.toFixed(2)}</p>
                </div>
              )}
            </div>

            {supply.notes && (
              <div className="mt-6 pt-6" style={{ borderTop: "1px solid rgba(227, 201, 255, 0.2)" }}>
                <p className="text-xs font-medium mb-2" style={{ color: "var(--text-muted)", opacity: 0.8 }}>Notes</p>
                <p className="text-sm whitespace-pre-wrap" style={{ color: "var(--text-secondary)" }}>{supply.notes}</p>
              </div>
            )}
          </div>

          {/* Usage History */}
          <div className="glass-card rounded-3xl p-6">
            <h2 className="text-xl font-bold mb-6" style={{ 
              color: "var(--text-primary)",
              textShadow: "0 1px 3px rgba(32, 24, 51, 0.4)",
              fontFamily: "'Playfair Display', Georgia, serif"
            }}>
              Usage History
            </h2>

            {usageLogs.length === 0 ? (
              <div className="text-center py-12">
                <TrendingDown className="w-12 h-12 mx-auto mb-3" style={{ color: "#C4B5FD", opacity: 0.5 }} />
                <p style={{ color: "var(--text-secondary)" }}>No usage recorded yet</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {usageLogs.map(log => {
                  const plant = log.plant_id ? plants.find(p => p.id === log.plant_id) : null;
                  return (
                    <div key={log.id} className="glass-button rounded-2xl p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold" style={{ color: "var(--text-primary)" }}>
                              Used {log.quantity_used} {supply.unit}
                            </p>
                            {plant && (
                              <Link to={createPageUrl(`PlantDetail?id=${plant.id}`)}>
                                <span className="text-xs px-2 py-1 rounded-lg backdrop-blur-xl hover:opacity-80 transition-opacity"
                                  style={{
                                    background: "rgba(168, 159, 239, 0.2)",
                                    border: "1px solid rgba(168, 159, 239, 0.35)",
                                    color: "#C4B5FD"
                                  }}>
                                  {plant.cultivar_name}
                                </span>
                              </Link>
                            )}
                          </div>
                          <p className="text-xs" style={{ color: "var(--text-secondary)", opacity: 0.8 }}>
                            {new Date(log.usage_date).toLocaleString('en-US', { 
                              month: 'short', 
                              day: 'numeric', 
                              year: 'numeric',
                              hour: 'numeric',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                      {log.purpose && (
                        <p className="text-sm mb-2" style={{ color: "var(--text-secondary)" }}>
                          <span className="font-medium">Purpose:</span> {log.purpose}
                        </p>
                      )}
                      {log.notes && (
                        <p className="text-sm" style={{ color: "var(--text-secondary)", opacity: 0.8 }}>
                          {log.notes}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {showUsageForm && (
        <SupplyUsageForm
          supply={supply}
          onClose={() => setShowUsageForm(false)}
        />
      )}
    </div>
  );
}