import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { MapPin, Calendar, DollarSign, AlertTriangle } from "lucide-react";

const CATEGORY_ICONS = {
  soil: "🌱",
  fertilizer: "💊",
  pot: "🏺",
  pesticide: "🛡️",
  tool: "🔧",
  supplement: "✨",
  other: "📦"
};

const CATEGORY_COLORS = {
  soil: { bg: "rgba(154, 226, 211, 0.15)", border: "rgba(154, 226, 211, 0.3)", text: "#A7F3D0" },
  fertilizer: { bg: "rgba(252, 211, 77, 0.15)", border: "rgba(252, 211, 77, 0.3)", text: "#FCD34D" },
  pot: { bg: "rgba(196, 181, 253, 0.15)", border: "rgba(196, 181, 253, 0.3)", text: "#C4B5FD" },
  pesticide: { bg: "rgba(252, 165, 165, 0.15)", border: "rgba(252, 165, 165, 0.3)", text: "#FCA5A5" },
  tool: { bg: "rgba(125, 211, 252, 0.15)", border: "rgba(125, 211, 252, 0.3)", text: "#7DD3FC" },
  supplement: { bg: "rgba(240, 171, 252, 0.15)", border: "rgba(240, 171, 252, 0.3)", text: "#F0ABFC" },
  other: { bg: "rgba(209, 213, 219, 0.15)", border: "rgba(209, 213, 219, 0.3)", text: "#D1D5DB" }
};

export default function SupplyCard({ supply }) {
  const categoryColor = CATEGORY_COLORS[supply.category] || CATEGORY_COLORS.other;
  const categoryIcon = CATEGORY_ICONS[supply.category] || CATEGORY_ICONS.other;
  const isLowStock = supply.quantity <= supply.minimum_quantity;
  const stockPercentage = Math.min(100, (supply.quantity / (supply.minimum_quantity * 2)) * 100);

  const isExpiringSoon = supply.expiration_date && 
    new Date(supply.expiration_date) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  return (
    <Link to={createPageUrl(`SupplyDetail?id=${supply.id}`)}>
      <div className="neuro-card rounded-3xl p-6 hover:shadow-2xl transition-all">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div 
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl neuro-icon-well"
            >
              {categoryIcon}
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-lg" style={{ 
                color: "var(--text-primary)",
                fontFamily: "'Playfair Display', Georgia, serif"
              }}>
                {supply.name}
              </h3>
              <span 
                className="text-xs px-2 py-1 rounded-lg inline-block mt-1"
                style={{
                  background: categoryColor.bg,
                  border: `1px solid ${categoryColor.border}`,
                  color: categoryColor.text
                }}
              >
                {supply.category}
              </span>
            </div>
          </div>
          {isLowStock && (
            <AlertTriangle className="w-5 h-5 flex-shrink-0" style={{ color: "#FCA5A5", strokeWidth: 2 }} />
          )}
        </div>

        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold" style={{ color: "var(--text-secondary)" }}>
              Stock Level
            </span>
            <span className="text-sm font-bold" style={{ 
              color: isLowStock ? "#FCA5A5" : "#A7F3D0" 
            }}>
              {supply.quantity} {supply.unit}
            </span>
          </div>
          <div className="neuro-surface h-2 rounded-full overflow-hidden">
            <div 
              className="h-full rounded-full transition-all"
              style={{ 
                width: `${stockPercentage}%`,
                background: isLowStock 
                  ? "linear-gradient(90deg, #FCA5A5 0%, #F87171 100%)"
                  : "linear-gradient(90deg, #A7F3D0 0%, #6EE7B7 100%)"
              }}
            />
          </div>
        </div>

        <div className="space-y-2 text-sm">
          {supply.storage_location && (
            <div className="flex items-center gap-2" style={{ color: "var(--text-secondary)" }}>
              <MapPin className="w-4 h-4" style={{ opacity: 0.7 }} />
              <span>{supply.storage_location}</span>
            </div>
          )}
          {supply.purchase_date && (
            <div className="flex items-center gap-2" style={{ color: "var(--text-secondary)" }}>
              <Calendar className="w-4 h-4" style={{ opacity: 0.7 }} />
              <span>Purchased {new Date(supply.purchase_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
            </div>
          )}
          {supply.cost && (
            <div className="flex items-center gap-2" style={{ color: "var(--text-secondary)" }}>
              <DollarSign className="w-4 h-4" style={{ opacity: 0.7 }} />
              <span>${supply.cost.toFixed(2)}</span>
            </div>
          )}
          {isExpiringSoon && (
            <div className="px-3 py-1.5 rounded-xl text-xs font-semibold"
              style={{
                background: "rgba(252, 211, 77, 0.2)",
                border: "1px solid rgba(252, 211, 77, 0.4)",
                color: "#FCD34D"
              }}>
              Expiring Soon
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}