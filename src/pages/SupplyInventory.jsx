
import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ArrowLeft, Plus, Package, AlertTriangle, Search, Filter, TrendingDown, DollarSign } from "lucide-react";
import SupplyCard from "../components/supplies/SupplyCard";
import ContextualTooltip from "../components/onboarding/ContextualTooltip";
import { useTooltips } from "../components/onboarding/TooltipManager";
import EmptyState from "../components/shared/EmptyState";
import BackToTop from "../components/shared/BackToTop";

const LOGO_URL = "/wax seal.svg";

export default function SupplyInventory() {
  const { isTooltipDismissed, dismissTooltip } = useTooltips();
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);

  const { data: supplies = [], isLoading } = useQuery({
    queryKey: ['supplies'],
    queryFn: () => base44.entities.Supply.list('-updated_date'),
    initialData: [],
  });

  let filteredSupplies = supplies.filter(supply => {
    const searchMatch = supply.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       supply.supplier?.toLowerCase().includes(searchQuery.toLowerCase());
    const categoryMatch = categoryFilter === "all" || supply.category === categoryFilter;
    const stockMatch = !showLowStockOnly || supply.quantity <= supply.minimum_quantity;
    
    return searchMatch && categoryMatch && stockMatch;
  });

  const lowStockCount = supplies.filter(s => s.quantity <= s.minimum_quantity).length;
  const totalValue = supplies.reduce((sum, s) => sum + (s.cost || 0), 0);
  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link to={createPageUrl("Collection")}>
            <button className="neuro-button w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{ color: "var(--accent)" }}>
              <ArrowLeft className="w-5 h-5" style={{ strokeWidth: 2 }} />
            </button>
          </Link>
          <div className="flex items-center gap-4">
            <div className="neuro-icon-well w-16 h-16 rounded-3xl flex items-center justify-center p-2">
              <Package className="w-8 h-8" style={{ color: "#C4B5FD", strokeWidth: 1.5 }} />
            </div>
            <div>
              <h1 className="text-4xl font-bold" style={{ 
                color: 'var(--text-primary)',
                textShadow: 'var(--heading-shadow)',
                fontFamily: "'Playfair Display', Georgia, serif"
              }}>
                Supply Inventory
              </h1>
              <p className="text-muted" style={{ color: 'var(--text-secondary)' }}>
                Track your gardening supplies and consumables
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div className="neuro-card rounded-3xl p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold" style={{ color: "var(--text-secondary)" }}>Total Items</p>
              <Package className="w-5 h-5" style={{ color: "#C4B5FD", strokeWidth: 1.8 }} />
            </div>
            <p className="text-3xl font-bold" style={{ 
              color: "var(--text-primary)",
              fontFamily: "'Playfair Display', Georgia, serif"
            }}>
              {supplies.length}
            </p>
          </div>

          <div className="neuro-card rounded-3xl p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold" style={{ color: "var(--text-secondary)" }}>Low Stock Alerts</p>
              <AlertTriangle className="w-5 h-5" style={{ color: "#FCA5A5", strokeWidth: 1.8 }} />
            </div>
            <p className="text-3xl font-bold" style={{ 
              color: lowStockCount > 0 ? "#FCA5A5" : "var(--text-primary)",
              fontFamily: "'Playfair Display', Georgia, serif"
            }}>
              {lowStockCount}
            </p>
          </div>

          <div className="neuro-card rounded-3xl p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold" style={{ color: "var(--text-secondary)" }}>Total Value</p>
              <DollarSign className="w-5 h-5" style={{ color: "#A7F3D0", strokeWidth: 1.8 }} />
            </div>
            <p className="text-3xl font-bold" style={{ 
              color: "var(--text-primary)",
              fontFamily: "'Playfair Display', Georgia, serif"
            }}>
              ${totalValue.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Low Stock Alert Banner */}
        {lowStockCount > 0 && (
          !isTooltipDismissed('low-stock-alert') && lowStockCount >= 2 ? (
            <ContextualTooltip
              id="low-stock-alert"
              title="Low Stock Alerts"
              description="These supplies are running low based on your minimum quantity settings. Click any item to log usage or update stock levels."
              position="bottom"
              onDismiss={dismissTooltip}
            >
              <div className="rounded-3xl p-6 mb-8 backdrop-blur-md"
                style={{
                  background: "linear-gradient(135deg, rgba(251, 146, 60, 0.15) 0%, rgba(249, 115, 22, 0.1) 100%)",
                  border: "1px solid rgba(251, 146, 60, 0.3)",
                  boxShadow: "0 4px 16px rgba(251, 146, 60, 0.2)"
                }}>
                <div className="flex items-start gap-3">
                  <TrendingDown className="w-6 h-6 flex-shrink-0 mt-1" style={{ color: "#FCD34D" }} />
                  <div>
                    <h3 className="font-bold mb-1" style={{ color: "#FCD34D" }}>
                      {lowStockCount} {lowStockCount === 1 ? 'Item' : 'Items'} Running Low
                    </h3>
                    <p className="text-sm" style={{ color: "#FCD34D", opacity: 0.9 }}>
                      Consider restocking to avoid running out of essential supplies
                    </p>
                  </div>
                </div>
              </div>
            </ContextualTooltip>
          ) : (
            <div className="rounded-3xl p-6 mb-8 backdrop-blur-md"
              style={{
                background: "linear-gradient(135deg, rgba(251, 146, 60, 0.15) 0%, rgba(249, 115, 22, 0.1) 100%)",
                border: "1px solid rgba(251, 146, 60, 0.3)",
                boxShadow: "0 4px 16px rgba(251, 146, 60, 0.2)"
              }}>
              <div className="flex items-start gap-3">
                <TrendingDown className="w-6 h-6 flex-shrink-0 mt-1" style={{ color: "#FCD34D" }} />
                <div>
                  <h3 className="font-bold mb-1" style={{ color: "#FCD34D" }}>
                    {lowStockCount} {lowStockCount === 1 ? 'Item' : 'Items'} Running Low
                  </h3>
                  <p className="text-sm" style={{ color: "#FCD34D", opacity: 0.9 }}>
                    Consider restocking to avoid running out of essential supplies
                  </p>
                </div>
              </div>
            </div>
          )
        )}

        {/* Search and Filters */}
        <div className="neuro-card rounded-3xl p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5" 
                  style={{ color: 'var(--text-muted)', opacity: 0.7, strokeWidth: 1.5 }} />
                <input
                  type="text"
                  placeholder="Search supplies..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="neuro-input w-full pl-12 pr-4 py-3 rounded-2xl"
                  style={{ color: 'var(--text-primary)' }}
                />
              </div>
            </div>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="neuro-input px-4 py-3 rounded-2xl"
              style={{ color: "var(--text-primary)" }}
            >
              <option value="all">All Categories</option>
              <option value="soil">Soil & Substrate</option>
              <option value="fertilizer">Fertilizers</option>
              <option value="pot">Pots & Containers</option>
              <option value="pesticide">Pesticides & Treatments</option>
              <option value="tool">Tools</option>
              <option value="supplement">Supplements</option>
              <option value="other">Other</option>
            </select>

            <button
              onClick={() => setShowLowStockOnly(!showLowStockOnly)}
              className={`px-6 py-3 rounded-2xl font-semibold flex items-center gap-2 transition-all ${
                showLowStockOnly ? "" : "neuro-button"
              }`}
              style={{ 
                background: showLowStockOnly 
                  ? "linear-gradient(135deg, rgba(251, 146, 60, 0.25) 0%, rgba(249, 115, 22, 0.18) 100%)"
                  : undefined,
                color: showLowStockOnly ? "#FCD34D" : "var(--text-secondary)",
                border: showLowStockOnly ? "1px solid rgba(251, 146, 60, 0.4)" : undefined,
                boxShadow: showLowStockOnly ? "0 4px 16px rgba(251, 146, 60, 0.3)" : undefined
              }}
            >
              <Filter className="w-4 h-4" />
              Low Stock
            </button>

            <Link to={createPageUrl("AddSupply")}>
              <button className="neuro-accent-raised px-6 py-3 rounded-2xl font-semibold flex items-center gap-2"
                style={{ color: '#F0EBFF' }}>
                <Plus className="w-5 h-5" style={{ strokeWidth: 2 }} />
                Add Supply
              </button>
            </Link>
          </div>
        </div>

        {/* Supplies Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="neuro-icon-well w-16 h-16 rounded-3xl flex items-center justify-center animate-pulse p-2">
              <img 
                src={LOGO_URL} 
                alt="Loading" 
                className="w-full h-full object-contain"
                style={{ opacity: 0.6 }}
              />
            </div>
          </div>
        ) : filteredSupplies.length === 0 ? (
          <div className="neuro-card rounded-3xl">
            {supplies.length === 0 ? (
              <EmptyState
                icon={Package}
                title="Track Your Supplies"
                description="Never run out of essentials! Track soil, fertilizers, pots, and other supplies. Get low stock alerts and monitor usage patterns to maintain optimal inventory levels."
                actionText="Add Your First Supply"
                actionLink="AddSupply"
                variant="default"
                size="large"
              />
            ) : (
              <EmptyState
                icon={Search}
                title="No Supplies Found"
                description="No supplies match your current search or filter criteria. Try different keywords or adjust your filters."
                actionText="Clear Filters"
                onAction={() => {
                  setSearchQuery("");
                  setCategoryFilter("all");
                  setShowLowStockOnly(false);
                }}
                variant="info"
                size="medium"
              />
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSupplies.map(supply => (
              <SupplyCard key={supply.id} supply={supply} />
            ))}
          </div>
        )}
      </div>
      
      <BackToTop />
    </div>
  );
}
