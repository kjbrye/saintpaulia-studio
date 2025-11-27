
import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Plus, Search, Filter, Star, ExternalLink, Edit, Trash2, ChevronDown, ArrowLeft, ShoppingCart, Calendar } from "lucide-react";
import PurchaseWishlistModal from "../components/wishlist/PurchaseWishlistModal";
import EmptyState from "../components/shared/EmptyState";
import BackToTop from "../components/shared/BackToTop";

const LOGO_URL = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/690e3cd78523fb5fba0a8466/632f6e485_PlantLogos.png";

const PRIORITY_CONFIG = {
  low: { color: "#C4B5FD", bg: "rgba(196, 181, 253, 0.2)", border: "rgba(196, 181, 253, 0.4)", label: "Low" },
  medium: { color: "#FCD34D", bg: "rgba(252, 211, 77, 0.2)", border: "rgba(252, 211, 77, 0.4)", label: "Medium" },
  high: { color: "#FCA5A5", bg: "rgba(252, 165, 165, 0.2)", border: "rgba(252, 165, 165, 0.4)", label: "High" },
  urgent: { color: "#F87171", bg: "rgba(248, 113, 113, 0.25)", border: "rgba(248, 113, 113, 0.5)", label: "Urgent" }
};

export default function Wishlist() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filterPriority, setFilterPriority] = useState("");
  const [showAcquired, setShowAcquired] = useState(false);
  const [sortBy, setSortBy] = useState("priority");
  const [expandedItem, setExpandedItem] = useState(null);
  const [purchasingItem, setPurchasingItem] = useState(null);

  const { data: wishlistItems = [], isLoading } = useQuery({
    queryKey: ['wishlist'],
    queryFn: () => base44.entities.Wishlist.list('-date_added'),
    initialData: [],
  });

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me().catch(() => null),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Wishlist.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
    }
  });

  const handleDelete = (item) => {
    if (window.confirm(`Remove "${item.cultivar_name}" from wishlist?`)) {
      deleteMutation.mutate(item.id);
    }
  };

  const handlePurchase = (item) => {
    setPurchasingItem(item);
  };

  // Filter and sort
  let filteredItems = wishlistItems.filter(item => {
    if (!showAcquired && item.acquired) return false;
    
    const searchMatch = 
      item.cultivar_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.hybridizer?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.notes?.toLowerCase().includes(searchQuery.toLowerCase());

    const priorityMatch = !filterPriority || item.priority === filterPriority;

    return searchMatch && priorityMatch;
  });

  // Sort
  if (sortBy === "priority") {
    const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
    filteredItems = filteredItems.sort((a, b) => 
      (priorityOrder[a.priority] || 99) - (priorityOrder[b.priority] || 99)
    );
  } else if (sortBy === "date") {
    filteredItems = filteredItems.sort((a, b) => 
      new Date(b.date_added) - new Date(a.date_added)
    );
  } else if (sortBy === "name") {
    filteredItems = filteredItems.sort((a, b) => 
      (a.cultivar_name || "").localeCompare(b.cultivar_name || "")
    );
  }

  const activeCount = wishlistItems.filter(i => !i.acquired).length;
  const acquiredCount = wishlistItems.filter(i => i.acquired).length;

  // Check if purchase date is coming up soon
  const isPurchaseDateSoon = (date) => {
    if (!date) return false;
    const target = new Date(date);
    const now = new Date();
    const daysUntil = Math.ceil((target - now) / (1000 * 60 * 60 * 24));
    return daysUntil > 0 && daysUntil <= 30;
  };

  const isPurchaseDateOverdue = (date) => {
    if (!date) return false;
    const target = new Date(date);
    const now = new Date();
    return target < now;
  };

  const currentTheme = currentUser?.theme || "glassmorphism";

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <Link to={createPageUrl("Collection")}>
              <button className="neuro-button w-12 h-12 rounded-2xl flex items-center justify-center"
                style={{ color: (currentTheme === 'light' || currentTheme === 'minimal') ? "#7C3AED" : "#E3C9FF" }}>
                <ArrowLeft className="w-5 h-5" style={{ strokeWidth: 2 }} />
              </button>
            </Link>
            <div className="flex items-center gap-4">
              <div className="neuro-icon-well w-16 h-16 rounded-3xl flex items-center justify-center p-2">
                <img 
                  src={LOGO_URL} 
                  alt="Wishlist" 
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h1 className="text-4xl font-bold" style={{ 
                  color: (currentTheme === 'light' || currentTheme === 'minimal') ? 'var(--text-primary)' : '#F5F3FF',
                  textShadow: '0 2px 4px rgba(32, 24, 51, 0.4)',
                  fontFamily: "'Playfair Display', Georgia, serif"
                }}>
                  Wishlist
                </h1>
                <p className="text-muted" style={{ color: (currentTheme === 'light' || currentTheme === 'minimal') ? 'var(--text-secondary)' : '#DDD6FE' }}>
                  {activeCount} {activeCount === 1 ? 'plant' : 'plants'} on your wishlist
                  {acquiredCount > 0 && ` • ${acquiredCount} acquired`}
                </p>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex gap-3 flex-col sm:flex-row mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5" 
                style={{ color: (currentTheme === 'light' || currentTheme === 'minimal') ? 'var(--text-muted)' : '#DDD6FE', opacity: 0.7, strokeWidth: 1.5 }} />
              <input
                type="text"
                placeholder="Search wishlist..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="neuro-input w-full pl-12 pr-4 py-4 rounded-3xl"
                style={{ color: (currentTheme === 'light' || currentTheme === 'minimal') ? 'var(--text-primary)' : '#F5F3FF' }}
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`neuro-button px-6 py-4 rounded-3xl font-semibold flex items-center justify-center gap-2 ${
                filterPriority ? "neuro-accent-raised" : ""
              }`}
              style={{ color: filterPriority 
                ? ((currentTheme === 'light' || currentTheme === 'minimal') ? "#FFFFFF" : "#A7F3D0")
                : ((currentTheme === 'light' || currentTheme === 'minimal') ? 'var(--text-secondary)' : "#DDD6FE") }}
            >
              <Filter className="w-5 h-5" style={{ strokeWidth: 2 }} />
              <span className="hidden sm:inline">Filters</span>
            </button>
            <Link to={createPageUrl("AddWishlistItem")}>
              <button className="neuro-accent-raised w-full sm:w-auto px-6 py-4 rounded-3xl font-semibold flex items-center justify-center gap-2 hover:shadow-lg transition-all"
                style={{ color: (currentTheme === 'light' || currentTheme === 'minimal') ? '#FFFFFF' : '#F0EBFF' }}>
                <Plus className="w-5 h-5" style={{ strokeWidth: 2 }} />
                <span className="hidden sm:inline">Add to Wishlist</span>
              </button>
            </Link>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="neuro-card rounded-3xl p-6 space-y-4">
              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: (currentTheme === 'light' || currentTheme === 'minimal') ? 'var(--text-primary)' : "#F5F3FF" }}>
                    Priority
                  </label>
                  <select
                    value={filterPriority}
                    onChange={(e) => setFilterPriority(e.target.value)}
                    className="neuro-input w-full px-4 py-3 rounded-2xl"
                    style={{ color: (currentTheme === 'light' || currentTheme === 'minimal') ? 'var(--text-primary)' : "#F5F3FF" }}
                  >
                    <option value="">All Priorities</option>
                    <option value="urgent">Urgent</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: (currentTheme === 'light' || currentTheme === 'minimal') ? 'var(--text-primary)' : "#F5F3FF" }}>
                    Sort By
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="neuro-input w-full px-4 py-3 rounded-2xl"
                    style={{ color: (currentTheme === 'light' || currentTheme === 'minimal') ? 'var(--text-primary)' : "#F5F3FF" }}
                  >
                    <option value="priority">Priority</option>
                    <option value="date">Date Added</option>
                    <option value="name">Name</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showAcquired}
                      onChange={(e) => setShowAcquired(e.target.checked)}
                      className="w-5 h-5 rounded"
                    />
                    <span className="text-sm font-semibold" style={{ color: (currentTheme === 'light' || currentTheme === 'minimal') ? 'var(--text-primary)' : "#F5F3FF" }}>
                      Show purchased plants
                    </span>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Wishlist Items */}
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
        ) : filteredItems.length === 0 ? (
          <div className="neuro-card rounded-3xl">
            {wishlistItems.length === 0 ? (
              <EmptyState
                icon={Star}
                title="Build Your Dream Collection"
                description="Keep track of cultivars you want to acquire. Add notes about desired traits, set priorities, track potential sources, and mark items when purchased."
                actionText="Add Wishlist Item"
                actionLink="AddWishlistItem"
                variant="warning"
                size="large"
              />
            ) : (
              <EmptyState
                icon={Search}
                title="No Items Found"
                description="No wishlist items match your current search or filter criteria. Try different keywords or adjust your filters."
                actionText="Clear Filters"
                onAction={() => {
                  setSearchQuery("");
                  setFilterPriority("");
                  setShowAcquired(false);
                }}
                variant="info"
                size="medium"
              />
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredItems.map(item => {
              const priorityConfig = PRIORITY_CONFIG[item.priority] || PRIORITY_CONFIG.medium;
              const isExpanded = expandedItem === item.id;
              const purchaseSoon = isPurchaseDateSoon(item.desired_purchase_date);
              const purchaseOverdue = isPurchaseDateOverdue(item.desired_purchase_date);

              return (
                <div
                  key={item.id}
                  className={`neuro-card rounded-3xl p-6 transition-all ${
                    item.acquired ? "opacity-70" : ""
                  }`}
                >
                  <div className="flex items-start gap-4 mb-4">
                    {/* Photo */}
                    <div className="neuro-icon-well rounded-2xl overflow-hidden w-24 h-24 flex-shrink-0">
                      {item.photo_url ? (
                        <img src={item.photo_url} alt={item.cultivar_name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center"
                          style={{ background: "linear-gradient(135deg, rgba(168, 159, 239, 0.15) 0%, rgba(154, 226, 211, 0.12) 100%)" }}>
                          <img src={LOGO_URL} alt="No photo" className="w-12 h-12 object-contain opacity-40" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-bold mb-1" style={{ 
                            color: (currentTheme === 'light' || currentTheme === 'minimal') ? 'var(--text-primary)' : "#F5F3FF",
                            textShadow: "0 1px 3px rgba(32, 24, 51, 0.4)",
                            fontFamily: "'Playfair Display', Georgia, serif"
                          }}>
                            {item.cultivar_name}
                          </h3>
                          {item.hybridizer && (
                            <p className="text-xs" style={{ color: (currentTheme === 'light' || currentTheme === 'minimal') ? 'var(--text-secondary)' : "#DDD6FE", opacity: 0.8 }}>
                              by {item.hybridizer}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {!item.acquired && (
                            <button
                              onClick={() => handlePurchase(item)}
                              className="neuro-accent-raised w-9 h-9 rounded-xl flex items-center justify-center"
                              style={{ color: (currentTheme === 'light' || currentTheme === 'minimal') ? "#FFFFFF" : "#F0EBFF" }}
                              title="Purchase and add to collection"
                            >
                              <ShoppingCart className="w-4 h-4" style={{ strokeWidth: 2 }} />
                            </button>
                          )}
                          <Link to={createPageUrl(`EditWishlistItem?id=${item.id}`)}>
                            <button className="neuro-button w-9 h-9 rounded-xl flex items-center justify-center"
                              style={{ color: (currentTheme === 'light' || currentTheme === 'minimal') ? "#7C3AED" : "#C4B5FD" }}>
                              <Edit className="w-4 h-4" />
                            </button>
                          </Link>
                          <button
                            onClick={() => handleDelete(item)}
                            className="neuro-button w-9 h-9 rounded-xl flex items-center justify-center"
                            style={{ color: "#FCA5A5" }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Badges */}
                      <div className="flex items-center gap-2 mb-3 flex-wrap">
                        <span
                          className="px-3 py-1 rounded-xl text-xs font-semibold backdrop-blur-xl"
                          style={{
                            background: priorityConfig.bg,
                            border: `1px solid ${priorityConfig.border}`,
                            color: priorityConfig.color
                          }}
                        >
                          <Star className="w-3 h-3 inline mr-1" style={{ strokeWidth: 2 }} />
                          {priorityConfig.label} Priority
                        </span>
                        {item.acquired && (
                          <span
                            className="px-3 py-1 rounded-xl text-xs font-semibold backdrop-blur-xl"
                            style={{
                              background: "rgba(154, 226, 211, 0.2)",
                              border: "1px solid rgba(154, 226, 211, 0.4)",
                              color: "#A7F3D0"
                            }}
                          >
                            Purchased
                          </span>
                        )}
                        {purchaseOverdue && !item.acquired && (
                          <span
                            className="px-3 py-1 rounded-xl text-xs font-semibold backdrop-blur-xl"
                            style={{
                              background: "rgba(252, 165, 165, 0.2)",
                              border: "1px solid rgba(252, 165, 165, 0.4)",
                              color: "#FCA5A5"
                            }}
                          >
                            <Calendar className="w-3 h-3 inline mr-1" />
                            Target Date Passed
                          </span>
                        )}
                        {purchaseSoon && !item.acquired && (
                          <span
                            className="px-3 py-1 rounded-xl text-xs font-semibold backdrop-blur-xl"
                            style={{
                              background: "rgba(252, 211, 77, 0.2)",
                              border: "1px solid rgba(252, 211, 77, 0.4)",
                              color: "#FCD34D"
                            }}
                          >
                            <Calendar className="w-3 h-3 inline mr-1" />
                            Coming Up Soon
                          </span>
                        )}
                      </div>

                      {/* Quick Info */}
                      {(item.blossom_color || item.blossom_type || item.leaf_type) && (
                        <p className="text-sm mb-2" style={{ color: (currentTheme === 'light' || currentTheme === 'minimal') ? 'var(--text-secondary)' : "#DDD6FE" }}>
                          {item.blossom_color && `${item.blossom_color} `}
                          {item.blossom_type && `${item.blossom_type} `}
                          {item.leaf_type && `• ${item.leaf_type} foliage`}
                        </p>
                      )}

                      {/* Desired Traits */}
                      {item.desired_traits && item.desired_traits.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {item.desired_traits.slice(0, 3).map((trait, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded-lg text-xs backdrop-blur-xl"
                              style={{
                                background: (currentTheme === 'light' || currentTheme === 'minimal')
                                  ? "rgba(147, 51, 234, 0.15)"
                                  : "rgba(154, 226, 211, 0.15)",
                                border: (currentTheme === 'light' || currentTheme === 'minimal')
                                  ? "1px solid rgba(147, 51, 234, 0.3)"
                                  : "1px solid rgba(154, 226, 211, 0.3)",
                                color: (currentTheme === 'light' || currentTheme === 'minimal')
                                  ? "#7C3AED"
                                  : "#A7F3D0"
                              }}
                            >
                              {trait}
                            </span>
                          ))}
                          {item.desired_traits.length > 3 && (
                            <span className="text-xs" style={{ color: (currentTheme === 'light' || currentTheme === 'minimal') ? 'var(--text-secondary)' : "#DDD6FE" }}>
                              +{item.desired_traits.length - 3}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Expand/Collapse Button */}
                      {(item.notes || item.sources?.length > 0 || item.price_range || item.desired_purchase_date) && (
                        <button
                          onClick={() => setExpandedItem(isExpanded ? null : item.id)}
                          className="neuro-button px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1"
                          style={{ color: (currentTheme === 'light' || currentTheme === 'minimal') ? 'var(--text-secondary)' : "#DDD6FE" }}
                        >
                          {isExpanded ? "Hide" : "Show"} Details
                          <ChevronDown className={`w-3 h-3 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="neuro-surface rounded-2xl p-4 mt-4 space-y-3">
                      {item.price_range && (
                        <div>
                          <p className="text-xs font-semibold mb-1" style={{ color: (currentTheme === 'light' || currentTheme === 'minimal') ? 'var(--text-muted)' : "#C7C9E6", opacity: 0.8 }}>
                            Price Range
                          </p>
                          <p className="text-sm" style={{ color: (currentTheme === 'light' || currentTheme === 'minimal') ? 'var(--text-primary)' : "#F5F3FF" }}>{item.price_range}</p>
                        </div>
                      )}

                      {item.desired_purchase_date && (
                        <div>
                          <p className="text-xs font-semibold mb-1" style={{ color: (currentTheme === 'light' || currentTheme === 'minimal') ? 'var(--text-muted)' : "#C7C9E6", opacity: 0.8 }}>
                            Target Purchase Date
                          </p>
                          <p className="text-sm" style={{ color: (currentTheme === 'light' || currentTheme === 'minimal') ? 'var(--text-secondary)' : "#DDD6FE" }}>
                            {new Date(item.desired_purchase_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                          </p>
                        </div>
                      )}

                      {item.notes && (
                        <div>
                          <p className="text-xs font-semibold mb-1" style={{ color: (currentTheme === 'light' || currentTheme === 'minimal') ? 'var(--text-muted)' : "#C7C9E6", opacity: 0.8 }}>
                            Notes
                          </p>
                          <p className="text-sm whitespace-pre-wrap" style={{ color: (currentTheme === 'light' || currentTheme === 'minimal') ? 'var(--text-secondary)' : "#DDD6FE" }}>
                            {item.notes}
                          </p>
                        </div>
                      )}

                      {item.sources && item.sources.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold mb-2" style={{ color: (currentTheme === 'light' || currentTheme === 'minimal') ? 'var(--text-muted)' : "#C7C9E6", opacity: 0.8 }}>
                            Where to Buy
                          </p>
                          <div className="space-y-1.5">
                            {item.sources.map((source, idx) => (
                              <a
                                key={idx}
                                href={source.startsWith('http') ? source : `https://${source}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 text-sm hover:opacity-80 transition-opacity"
                                style={{ color: (currentTheme === 'light' || currentTheme === 'minimal') ? "#7C3AED" : "#C4B5FD" }}
                              >
                                <ExternalLink className="w-3 h-3" />
                                {source}
                              </a>
                            ))}
                          </div>
                        </div>
                      )}

                      {item.date_added && (
                        <div>
                          <p className="text-xs font-semibold mb-1" style={{ color: (currentTheme === 'light' || currentTheme === 'minimal') ? 'var(--text-muted)' : "#C7C9E6", opacity: 0.8 }}>
                            Added to Wishlist
                          </p>
                          <p className="text-sm" style={{ color: (currentTheme === 'light' || currentTheme === 'minimal') ? 'var(--text-secondary)' : "#DDD6FE" }}>
                            {new Date(item.date_added).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Purchase Modal */}
      {purchasingItem && (
        <PurchaseWishlistModal
          item={purchasingItem}
          onClose={() => setPurchasingItem(null)}
        />
      )}
      
      <BackToTop />
    </div>
  );
}
