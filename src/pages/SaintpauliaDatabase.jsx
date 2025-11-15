
import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ArrowLeft, Search, Database, Sparkles, Loader2, Filter, X, ChevronDown, ChevronUp, BookOpen, Star, Heart } from "lucide-react";
import { toast } from "sonner";

const LOGO_URL = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/690e3cd78523fb5fba0a8466/632f6e485_PlantLogos.png";

export default function SaintpauliaDatabase() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const [displayCount, setDisplayCount] = useState(50);
  const [showFilters, setShowFilters] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const loadMoreRef = useRef(null);
  const itemsPerPage = 50;

  const [filters, setFilters] = useState({
    blossom_type: "",
    plant_type: "",
    hybridizer: "",
    year_min: "",
    year_max: "",
    blossom_color: ""
  });

  // Fetch existing wishlist items
  const { data: wishlistItems = [] } = useQuery({
    queryKey: ['wishlist'],
    queryFn: () => base44.entities.Wishlist.list(),
    initialData: []
  });

  // Add to wishlist mutation
  const addToWishlistMutation = useMutation({
    mutationFn: async (cultivar) => {
      return base44.entities.Wishlist.create({
        cultivar_name: cultivar.cultivar_name,
        hybridizer: cultivar.hybridizer || "",
        blossom_type: cultivar.blossom_type || "",
        blossom_color: cultivar.blossom_color || "",
        leaf_type: cultivar.leaf_type || "",
        photo_url: cultivar.photo_url || "",
        date_added: new Date().toISOString().split('T')[0],
        priority: "medium",
        notes: `From AVSA Database${cultivar.avsa_number ? ` - AVSA #${cultivar.avsa_number}` : ''}`,
        desired_traits: cultivar.blossom_type || cultivar.blossom_color ?
        [cultivar.blossom_type, cultivar.blossom_color].filter(Boolean) : []
      });
    },
    onSuccess: (_, cultivar) => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      toast.success("Added to Wishlist!", {
        description: `${cultivar.cultivar_name} has been added to your wishlist.`
      });
    },
    onError: (error) => {
      toast.error("Failed to add to wishlist", {
        description: error.message || "Please try again."
      });
    }
  });

  // Check if cultivar is already in wishlist
  const isInWishlist = (cultivarName) => {
    return wishlistItems.some((item) =>
    item.cultivar_name.toLowerCase() === cultivarName.toLowerCase()
    );
  };

  // Only fetch when user has searched or applied filters
  const shouldFetch = hasSearched || Object.values(filters).some((v) => v !== "");

  const { data: cultivars = [], isLoading, isFetching } = useQuery({
    queryKey: ['cultivars', searchQuery, filters, page],
    queryFn: async () => {
      // Build filter query for server-side filtering
      const filterQuery = {};

      if (filters.blossom_type) filterQuery.blossom_type = filters.blossom_type;
      if (filters.plant_type) filterQuery.plant_type = filters.plant_type;
      if (filters.hybridizer) filterQuery.hybridizer = filters.hybridizer;

      // For initial load, get total count
      // For subsequent pages, just get the data
      let results;
      let count;

      if (page === 1) {
        // First, get the total count with filters applied
        const countQuery = { ...filterQuery };
        const allResults = await base44.entities.Cultivar.filter(countQuery, 'cultivar_name', 10000);

        // Apply client-side filters for search and additional criteria
        const filtered = allResults.filter((c) => {
          const searchMatch = !searchQuery ||
          c.cultivar_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.hybridizer?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.avsa_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.description?.toLowerCase().includes(searchQuery.toLowerCase());

          const colorMatch = !filters.blossom_color ||
          c.blossom_color?.toLowerCase().includes(filters.blossom_color.toLowerCase());

          const yearMinMatch = !filters.year_min || c.year && c.year >= filters.year_min;
          const yearMaxMatch = !filters.year_max || c.year && c.year <= filters.year_max;

          return searchMatch && colorMatch && yearMinMatch && yearMaxMatch;
        });

        // Set total count
        count = filtered.length;
        setTotalCount(count);

        // Return first page of results
        results = filtered.slice(0, itemsPerPage);
      } else {
        // For subsequent pages, fetch all and filter, then paginate
        const allResults = await base44.entities.Cultivar.filter(filterQuery, 'cultivar_name', 10000);

        const filtered = allResults.filter((c) => {
          const searchMatch = !searchQuery ||
          c.cultivar_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.hybridizer?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.avsa_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.description?.toLowerCase().includes(searchQuery.toLowerCase());

          const colorMatch = !filters.blossom_color ||
          c.blossom_color?.toLowerCase().includes(filters.blossom_color.toLowerCase());

          const yearMinMatch = !filters.year_min || c.year && c.year >= filters.year_min;
          const yearMaxMatch = !filters.year_max || c.year && c.year <= filters.year_max;

          return searchMatch && colorMatch && yearMinMatch && yearMaxMatch;
        });

        // Return the requested page
        const startIdx = (page - 1) * itemsPerPage;
        results = filtered.slice(startIdx, startIdx + itemsPerPage);
      }

      return results;
    },
    enabled: shouldFetch,
    initialData: [],
    keepPreviousData: true
  });

  // Get unique hybridizers for filter
  const { data: allCultivarsForFilters = [] } = useQuery({
    queryKey: ['cultivarsForFilters'],
    queryFn: () => base44.entities.Cultivar.list('cultivar_name', 500),
    initialData: []
  });

  const uniqueHybridizers = [...new Set(allCultivarsForFilters.map((c) => c.hybridizer).filter(Boolean))].sort().slice(0, 100);

  // Accumulate cultivars across pages
  const [accumulatedCultivars, setAccumulatedCultivars] = useState([]);

  useEffect(() => {
    if (page === 1) {
      setAccumulatedCultivars(cultivars);
    } else {
      setAccumulatedCultivars((prev) => [...prev, ...cultivars]);
    }
  }, [cultivars, page]);

  // Infinite scroll observer
  useEffect(() => {
    if (!shouldFetch || !hasSearched) return;
    if (isFetching) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && accumulatedCultivars.length < totalCount) {
          setPage((prev) => prev + 1);
        }
      },
      { threshold: 0.1 }
    );

    const currentRef = loadMoreRef.current;
    if (currentRef && accumulatedCultivars.length < totalCount) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [accumulatedCultivars.length, totalCount, shouldFetch, hasSearched, isFetching]);

  // Reset when filters change
  useEffect(() => {
    setPage(1);
    setAccumulatedCultivars([]);
    setDisplayCount(50);
  }, [searchQuery, filters]);

  const handleSearch = (e) => {
    e.preventDefault();
    setHasSearched(true);
    setPage(1);
    setAccumulatedCultivars([]);
    setDisplayCount(50);
  };

  const clearAllFilters = () => {
    setSearchQuery("");
    setFilters({
      blossom_type: "",
      plant_type: "",
      hybridizer: "",
      year_min: "",
      year_max: "",
      blossom_color: ""
    });
    setHasSearched(false);
    setPage(1);
    setAccumulatedCultivars([]);
    setDisplayCount(50);
    setTotalCount(0);
  };

  const hasActiveFilters =
  searchQuery !== "" ||
  Object.values(filters).some((v) => v !== "");

  const visibleCultivars = accumulatedCultivars.slice(0, displayCount);
  const hasMore = accumulatedCultivars.length < totalCount;

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link to={createPageUrl("Info")}>
            <button className="glass-button w-12 h-12 rounded-2xl flex items-center justify-center"
            style={{ color: "var(--accent)" }}>
              <ArrowLeft className="w-5 h-5" style={{ strokeWidth: 2 }} />
            </button>
          </Link>
          <div className="flex items-center gap-4">
            <div className="glass-card w-16 h-16 rounded-3xl flex items-center justify-center glow-violet p-2">
              <Database className="w-8 h-8" style={{ color: "#C4B5FD", strokeWidth: 1.5 }} />
            </div>
            <div>
              <h1 className="text-4xl font-bold" style={{
                color: 'var(--text-primary)',
                textShadow: 'var(--heading-shadow)',
                fontFamily: "'Playfair Display', Georgia, serif"
              }}>
                Saintpaulia Database
              </h1>
              <p className="text-muted" style={{ color: 'var(--text-secondary)' }}>Explore 10,000+ registered African violet cultivars

              </p>
            </div>
          </div>
        </div>

        {/* Search Introduction */}
        {!hasSearched && !hasActiveFilters &&
        <div className="glass-card rounded-3xl p-12 mb-8 text-center">
            <div className="glass-accent-lavender w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-6 glow-violet p-4">
              <Database className="w-12 h-12" style={{ color: "#F0EBFF", strokeWidth: 1.5 }} />
            </div>
            <h2 className="text-2xl font-bold mb-3" style={{
            color: 'var(--text-primary)',
            fontFamily: "'Playfair Display', Georgia, serif"
          }}>
              Welcome to the Cultivar Database
            </h2>
            <p className="text-lg mb-6" style={{ color: 'var(--text-secondary)' }}>
              Access the complete* AVSA registry of African violet cultivars
            </p>
            <div className="max-w-2xl mx-auto space-y-4 text-left">
              <div className="glass-button rounded-2xl p-4 flex items-start gap-3">
                <Sparkles className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "#C4B5FD" }} />
                <div>
                  <p className="font-semibold mb-1" style={{ color: "var(--text-primary)" }}>
                    Search by Name or Hybridizer
                  </p>
                  <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                    Type keywords to find specific cultivars or browse by breeder
                  </p>
                </div>
              </div>
              <div className="glass-button rounded-2xl p-4 flex items-start gap-3">
                <Filter className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "#A7F3D0" }} />
                <div>
                  <p className="font-semibold mb-1" style={{ color: "var(--text-primary)" }}>
                    Apply Filters
                  </p>
                  <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                    Narrow results by blossom type, color, plant size, or introduction year
                  </p>
                </div>
              </div>
              <div className="glass-button rounded-2xl p-4 flex items-start gap-3">
                <Heart className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "#FCA5A5" }} />
                <div>
                  <p className="font-semibold mb-1" style={{ color: "var(--text-primary)" }}>
                    Add to Wishlist
                  </p>
                  <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                    Find cultivars you love and add them to your wishlist for future reference
                  </p>
                </div>
              </div>
            </div>
          </div>
        }

        {/* Search and Filter Section */}
        <div className="glass-card rounded-3xl p-6 mb-6">
          <form onSubmit={handleSearch} className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5"
              style={{ color: 'var(--text-muted)', opacity: 0.7, strokeWidth: 1.5 }} />
              <input
                type="text"
                placeholder="Search by cultivar name, hybridizer, or AVSA number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="glass-input w-full pl-12 pr-32 py-4 rounded-3xl text-lg"
                style={{ color: 'var(--text-primary)' }} />

              <button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 glass-accent-lavender px-6 py-2.5 rounded-2xl font-semibold"
                style={{ color: '#F0EBFF' }}>

                Search
              </button>
            </div>

            {/* Filter Toggle */}
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className={`glass-button px-5 py-3 rounded-2xl font-semibold flex items-center gap-2 ${
                hasActiveFilters ? "glass-accent-moss" : ""}`
                }
                style={{ color: hasActiveFilters ? "#A7F3D0" : "var(--text-secondary)" }}>

                <Filter className="w-5 h-5" style={{ strokeWidth: 2 }} />
                Advanced Filters
                {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {hasActiveFilters &&
              <button
                type="button"
                onClick={clearAllFilters}
                className="glass-button px-4 py-2 rounded-2xl text-sm font-semibold flex items-center gap-2"
                style={{ color: "var(--text-secondary)" }}>

                  <X className="w-4 h-4" />
                  Clear All
                </button>
              }
            </div>

            {/* Advanced Filters Panel */}
            {showFilters &&
            <div className="neuro-surface rounded-2xl p-5 space-y-4">
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
                      Blossom Type
                    </label>
                    <select
                    value={filters.blossom_type}
                    onChange={(e) => setFilters({ ...filters, blossom_type: e.target.value })}
                    className="glass-input w-full px-4 py-3 rounded-2xl"
                    style={{ color: "var(--text-primary)" }}>

                      <option value="">All Types</option>
                      <option value="single">Single</option>
                      <option value="double">Double</option>
                      <option value="semi-double">Semi-Double</option>
                      <option value="star">Star</option>
                      <option value="frilled">Frilled</option>
                      <option value="fantasy">Fantasy</option>
                      <option value="chimera">Chimera</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
                      Plant Type
                    </label>
                    <select
                    value={filters.plant_type}
                    onChange={(e) => setFilters({ ...filters, plant_type: e.target.value })}
                    className="glass-input w-full px-4 py-3 rounded-2xl"
                    style={{ color: "var(--text-primary)" }}>

                      <option value="">All Sizes</option>
                      <option value="standard">Standard</option>
                      <option value="miniature">Miniature</option>
                      <option value="semi-miniature">Semi-Miniature</option>
                      <option value="trailing">Trailing</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
                      Blossom Color
                    </label>
                    <input
                    type="text"
                    value={filters.blossom_color}
                    onChange={(e) => setFilters({ ...filters, blossom_color: e.target.value })}
                    placeholder="e.g., purple, pink, blue"
                    className="glass-input w-full px-4 py-3 rounded-2xl"
                    style={{ color: "var(--text-primary)" }} />

                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
                      Hybridizer
                    </label>
                    <select
                    value={filters.hybridizer}
                    onChange={(e) => setFilters({ ...filters, hybridizer: e.target.value })}
                    className="glass-input w-full px-4 py-3 rounded-2xl"
                    style={{ color: "var(--text-primary)" }}>

                      <option value="">All Hybridizers</option>
                      {uniqueHybridizers.map((hybridizer) =>
                    <option key={hybridizer} value={hybridizer}>{hybridizer}</option>
                    )}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
                      Year (Min)
                    </label>
                    <input
                    type="number"
                    value={filters.year_min}
                    onChange={(e) => setFilters({ ...filters, year_min: e.target.value })}
                    placeholder="e.g., 1990"
                    className="glass-input w-full px-4 py-3 rounded-2xl"
                    style={{ color: "var(--text-primary)" }} />

                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
                      Year (Max)
                    </label>
                    <input
                    type="number"
                    value={filters.year_max}
                    onChange={(e) => setFilters({ ...filters, year_max: e.target.value })}
                    placeholder="e.g., 2024"
                    className="glass-input w-full px-4 py-3 rounded-2xl"
                    style={{ color: "var(--text-primary)" }} />

                  </div>
                </div>

                <button
                type="submit"
                className="glass-accent-moss w-full px-6 py-3 rounded-2xl font-semibold"
                style={{ color: "#A7F3D0" }}>

                  Apply Filters & Search
                </button>
              </div>
            }
          </form>
        </div>

        {/* Results Section */}
        {isLoading && page === 1 &&
        <div className="flex items-center justify-center py-20">
            <div className="glass-card w-16 h-16 rounded-3xl flex items-center justify-center animate-pulse glow-violet p-2">
              <Loader2 className="w-8 h-8 animate-spin" style={{ color: "#C4B5FD" }} />
            </div>
          </div>
        }

        {!isLoading && hasSearched && totalCount === 0 &&
        <div className="glass-card rounded-3xl p-12 text-center">
            <BookOpen className="w-16 h-16 mx-auto mb-4" style={{ color: "#C4B5FD", opacity: 0.5 }} />
            <h3 className="text-xl font-bold mb-2" style={{
            color: 'var(--text-primary)',
            fontFamily: "'Playfair Display', Georgia, serif"
          }}>
              No Cultivars Found
            </h3>
            <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>
              No cultivars match your search criteria. Try different keywords or filters.
            </p>
            <button
            onClick={clearAllFilters}
            className="glass-button px-6 py-3 rounded-2xl font-semibold"
            style={{ color: "var(--text-secondary)" }}>

              Clear All Filters
            </button>
          </div>
        }

        {!isLoading && hasSearched && totalCount > 0 &&
        <>
            {/* Results Count */}
            <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
              <p className="text-sm font-semibold" style={{ color: "var(--text-secondary)" }}>
                {totalCount.toLocaleString()} {totalCount === 1 ? 'cultivar' : 'cultivars'} found
                {accumulatedCultivars.length < totalCount && ` • Loaded ${accumulatedCultivars.length.toLocaleString()}`}
              </p>
              <Link to={createPageUrl("Wishlist")}>
                <button className="glass-button px-4 py-2 rounded-2xl text-sm font-semibold flex items-center gap-2"
              style={{ color: "var(--text-secondary)" }}>
                  <Star className="w-4 h-4" />
                  View Wishlist ({wishlistItems.length})
                </button>
              </Link>
            </div>

            {/* Results Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {visibleCultivars.map((cultivar) => {
              const inWishlist = isInWishlist(cultivar.cultivar_name);

              return (
                <div key={cultivar.id} className="glass-card rounded-3xl p-5 hover:shadow-2xl transition-all">
                    <div className="flex items-start gap-3 mb-3">
                      {cultivar.photo_url ?
                    <div className="w-20 h-20 rounded-2xl overflow-hidden glass-card flex-shrink-0">
                          <img
                        src={cultivar.photo_url}
                        alt={cultivar.cultivar_name}
                        className="w-full h-full object-cover" />

                        </div> :

                    <div className="w-20 h-20 rounded-2xl glass-card flex items-center justify-center flex-shrink-0 p-3"
                    style={{
                      background: "linear-gradient(135deg, rgba(168, 159, 239, 0.15) 0%, rgba(154, 226, 211, 0.12) 100%)"
                    }}>
                          <img
                        src={LOGO_URL}
                        alt="No photo"
                        className="w-full h-full object-contain"
                        style={{ opacity: 0.4 }} />

                        </div>
                    }
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-lg mb-1" style={{
                        color: "var(--text-primary)",
                        fontFamily: "'Playfair Display', Georgia, serif"
                      }}>
                          {cultivar.cultivar_name}
                        </h3>
                        {cultivar.avsa_number &&
                      <p className="text-xs mb-1" style={{ color: "var(--text-secondary)", opacity: 0.8 }}>
                            AVSA #{cultivar.avsa_number}
                          </p>
                      }
                      </div>
                    </div>

                    <div className="space-y-2 text-sm mb-4">
                      {cultivar.hybridizer &&
                    <div className="flex items-start gap-2">
                          <span className="text-xs font-medium" style={{ color: "var(--text-muted)", opacity: 0.8, minWidth: "80px" }}>
                            Hybridizer:
                          </span>
                          <span style={{ color: "var(--text-secondary)" }}>{cultivar.hybridizer}</span>
                        </div>
                    }

                      {cultivar.year &&
                    <div className="flex items-start gap-2">
                          <span className="text-xs font-medium" style={{ color: "var(--text-muted)", opacity: 0.8, minWidth: "80px" }}>
                            Year:
                          </span>
                          <span style={{ color: "var(--text-secondary)" }}>{cultivar.year}</span>
                        </div>
                    }

                      {cultivar.blossom_type &&
                    <div className="flex items-start gap-2">
                          <span className="text-xs font-medium" style={{ color: "var(--text-muted)", opacity: 0.8, minWidth: "80px" }}>
                            Blossom:
                          </span>
                          <span style={{ color: "var(--text-secondary)" }}>
                            {cultivar.blossom_type}
                            {cultivar.blossom_color && ` • ${cultivar.blossom_color}`}
                          </span>
                        </div>
                    }

                      {cultivar.plant_type &&
                    <div className="flex items-start gap-2">
                          <span className="text-xs font-medium" style={{ color: "var(--text-muted)", opacity: 0.8, minWidth: "80px" }}>
                            Plant Type:
                          </span>
                          <span className="capitalize" style={{ color: "var(--text-secondary)" }}>
                            {cultivar.plant_type}
                          </span>
                        </div>
                    }

                      {cultivar.leaf_type &&
                    <div className="flex items-start gap-2">
                          <span className="text-xs font-medium" style={{ color: "var(--text-muted)", opacity: 0.8, minWidth: "80px" }}>
                            Leaf Type:
                          </span>
                          <span style={{ color: "var(--text-secondary)" }}>{cultivar.leaf_type}</span>
                        </div>
                    }

                      {cultivar.description &&
                    <div className="pt-2 mt-2" style={{ borderTop: "1px solid rgba(227, 201, 255, 0.2)" }}>
                          <p className="text-xs line-clamp-3" style={{ color: "var(--text-secondary)", opacity: 0.9 }}>
                            {cultivar.description}
                          </p>
                        </div>
                    }
                    </div>

                    {/* Add to Wishlist Button */}
                    {inWishlist ?
                  <div className="glass-button rounded-2xl p-3 flex items-center justify-center gap-2"
                  style={{
                    background: "rgba(252, 211, 77, 0.15)",
                    border: "1px solid rgba(252, 211, 77, 0.3)"
                  }}>
                        <Star className="w-4 h-4" style={{ color: "#FCD34D", fill: "#FCD34D" }} />
                        <span className="text-sm font-semibold" style={{ color: "#FCD34D" }}>
                          In Wishlist
                        </span>
                      </div> :

                  <button
                    onClick={() => addToWishlistMutation.mutate(cultivar)}
                    disabled={addToWishlistMutation.isPending}
                    className="glass-accent-lavender w-full px-4 py-3 rounded-2xl font-semibold flex items-center justify-center gap-2 hover:shadow-lg transition-all disabled:opacity-50"
                    style={{ color: "#F0EBFF" }}>

                        <Star className="w-4 h-4" style={{ strokeWidth: 2 }} />
                        Add to Wishlist
                      </button>
                  }
                  </div>);

            })}
            </div>

            {/* Loading More Indicator */}
            {hasMore &&
          <div ref={loadMoreRef} className="flex items-center justify-center py-12">
                <div className="glass-card w-14 h-14 rounded-2xl flex items-center justify-center animate-pulse glow-violet p-2">
                  <Loader2 className="w-7 h-7 animate-spin" style={{ color: "#C4B5FD" }} />
                </div>
              </div>
          }

            {/* End of Results */}
            {!hasMore && totalCount > 50 &&
          <div className="text-center py-8">
                <p className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
                  You've reached the end • {totalCount.toLocaleString()} total {totalCount === 1 ? 'cultivar' : 'cultivars'}
                </p>
              </div>
          }
          </>
        }

        {/* Help Text */}
        {!hasSearched && !hasActiveFilters &&
        <div className="glass-card rounded-3xl p-6 text-center">
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              <strong>Note:</strong> The database contains thousands of cultivars. 
              Please use the search bar or filters above to begin exploring.
            </p>
          </div>
        }

        {/* Footnote */}
        <div className="mt-8 glass-button rounded-2xl p-4">
          <p className="text-xs" style={{ color: "var(--text-muted)", opacity: 0.8 }}>* The Saintpaulia Studio database is updated biannually to include the latest AVSA registrations. Searches may not yield results for cultivars registered within the past 6 months. The database is a work in progress and may be missing cultivars. If you do not see one listed, contact us and we will ensure it is added with the next update.


          </p>
        </div>
      </div>
    </div>);

}
