
import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Search, Filter, Plus, Folder, ArrowLeft, GitCompare, Grid3x3, List, Tag, ArrowUpDown, X, ChevronDown, ChevronUp, AlertCircle, Heart, Clock, MapPin, Library, CheckSquare, Square, Droplets, Sparkles, Scissors, Loader2 } from "lucide-react";
import PlantCard from "../components/plants/PlantCard";
import PlantListItem from "../components/plants/PlantListItem";
import CollectionManager from "../components/collections/CollectionManager";
import LocationManager from "../components/locations/LocationManager";
import EmptyState from "../components/shared/EmptyState";
import BackToTop from "../components/shared/BackToTop";
import { toast } from "sonner";

const LOGO_URL = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/690e3cd78523fb5fba0a8466/632f6e485_PlantLogos.png";

const getCareStatus = (lastCareDate, daysThreshold) => {
  if (!lastCareDate) return { status: "overdue", days: null };
  const daysSince = Math.floor((new Date() - new Date(lastCareDate)) / (1000 * 60 * 60 * 24));
  if (daysSince >= daysThreshold) return { status: "overdue", days: daysSince };
  if (daysSince >= daysThreshold * 0.8) return { status: "soon", days: daysSince };
  return { status: "good", days: daysSince };
};

export default function PlantLibrary() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [showCollectionManager, setShowCollectionManager] = useState(false);
  const [showLocationManager, setShowLocationManager] = useState(false);
  const [compareMode, setCompareMode] = useState(false);
  const [selectedForCompare, setSelectedForCompare] = useState([]);
  const [viewMode, setViewMode] = useState("grid");
  const [sortBy, setSortBy] = useState("updated");
  const [sortOrder, setSortOrder] = useState("desc");
  const [expandedFilterSections, setExpandedFilterSections] = useState({
    basic: true,
    care: false,
    characteristics: false
  });
  
  // Bulk selection state
  const [bulkMode, setBulkMode] = useState(false);
  const [selectedForBulk, setSelectedForBulk] = useState([]);
  const [bulkActionInProgress, setBulkActionInProgress] = useState(false);

  // Infinite scroll state
  const [displayCount, setDisplayCount] = useState(viewMode === "grid" ? 12 : 20);
  const loadMoreRef = useRef(null);
  const itemsPerLoad = viewMode === "grid" ? 12 : 20;

  const [filters, setFilters] = useState({
    blossom_type: "",
    leaf_type: "",
    location: "",
    blossom_color: "",
    collection_id: "",
    hybridizer: "",
    needs_watering: false,
    needs_fertilizing: false,
    needs_grooming: false,
    has_issues: false,
    favorites_only: false,
    variegated_only: false,
    year_min: "",
    year_max: ""
  });

  const { data: plants = [], isLoading } = useQuery({
    queryKey: ['plants'],
    queryFn: () => base44.entities.Plant.list('-updated_date'),
    initialData: [],
  });

  const { data: collections = [] } = useQuery({
    queryKey: ['plantCollections'],
    queryFn: () => base44.entities.PlantCollection.list('-updated_date'),
    initialData: [],
  });

  const { data: locations = [] } = useQuery({
    queryKey: ['locations'],
    queryFn: () => base44.entities.Location.list('-updated_date'),
    initialData: [],
  });

  const { data: allPestDiseaseLogs = [] } = useQuery({
    queryKey: ['allPestDiseaseLogs'],
    queryFn: () => base44.entities.PestDiseaseLog.list('-date_observed', 500),
    initialData: [],
  });

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me().catch(() => null),
  });

  const currentTheme = currentUser?.theme || "glassmorphism";

  // Enhanced filter and search - MOVED BEFORE useEffect hooks
  let filteredPlants = plants.filter(plant => {
    const searchMatch = 
      plant.cultivar_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plant.nickname?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plant.hybridizer?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plant.source?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plant.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plant.notes?.toLowerCase().includes(searchQuery.toLowerCase());

    const blossomTypeMatch = !filters.blossom_type || plant.blossom_type === filters.blossom_type;
    const leafTypeMatch = !filters.leaf_type || (plant.leaf_types && plant.leaf_types.includes(filters.leaf_type));
    
    let locationMatch = true;
    if (filters.location) {
      locationMatch = plant.location_id === filters.location;
    }
    
    const colorMatch = !filters.blossom_color || plant.blossom_color?.toLowerCase().includes(filters.blossom_color.toLowerCase());
    const hybridizerMatch = !filters.hybridizer || plant.hybridizer === filters.hybridizer;
    
    let collectionMatch = true;
    if (filters.collection_id) {
      const collection = collections.find(c => c.id === filters.collection_id);
      collectionMatch = collection?.plant_ids?.includes(plant.id) || false;
    }

    const wateringMatch = !filters.needs_watering || getCareStatus(plant.last_watered, 7).status === "overdue";
    const fertilizingMatch = !filters.needs_fertilizing || getCareStatus(plant.last_fertilized, 14).status === "overdue";
    const groomingMatch = !filters.needs_grooming || getCareStatus(plant.last_groomed, 7).status === "overdue";
    
    let hasIssuesMatch = true;
    if (filters.has_issues) {
      hasIssuesMatch = allPestDiseaseLogs.some(log => 
        log.plant_id === plant.id && (log.status === "active" || log.status === "treating")
      );
    }

    const favoritesMatch = !filters.favorites_only || plant.is_favorite === true;
    const variegationMatch = !filters.variegated_only || (plant.variegation && plant.variegation.trim() !== "");
    const yearMinMatch = !filters.year_min || (plant.year && plant.year >= filters.year_min);
    const yearMaxMatch = !filters.year_max || (plant.year && plant.year <= filters.year_max);

    return searchMatch && blossomTypeMatch && leafTypeMatch && locationMatch && colorMatch && 
           hybridizerMatch && collectionMatch && wateringMatch && fertilizingMatch && 
           groomingMatch && hasIssuesMatch && favoritesMatch && variegationMatch &&
           yearMinMatch && yearMaxMatch;
  });

  // Enhanced sorting
  filteredPlants.sort((a, b) => {
    let comparison = 0;

    switch (sortBy) {
      case "name": {
        const nameA = a.nickname || a.cultivar_name || "";
        const nameB = b.nickname || b.cultivar_name || "";
        comparison = nameA.localeCompare(nameB);
        break;
      }

      case "acquired": {
        const dateA = a.acquisition_date ? new Date(a.acquisition_date) : new Date(0);
        const dateB = b.acquisition_date ? new Date(b.acquisition_date) : new Date(0);
        comparison = dateA.getTime() - dateB.getTime();
        break;
      }

      case "last_watered": {
        const waterA = a.last_watered ? new Date(a.last_watered) : new Date(0);
        const waterB = b.last_watered ? new Date(b.last_watered) : new Date(0);
        comparison = waterA.getTime() - waterB.getTime();
        break;
      }

      case "last_fertilized": {
        const fertA = a.last_fertilized ? new Date(a.last_fertilized) : new Date(0);
        const fertB = b.last_fertilized ? new Date(b.last_fertilized) : new Date(0);
        comparison = fertA.getTime() - fertB.getTime();
        break;
      }

      case "hybridizer": {
        const hybA = a.hybridizer || "";
        const hybB = b.hybridizer || "";
        comparison = hybA.localeCompare(hybB);
        break;
      }

      case "location": {
        const locA = a.location || "";
        const locB = b.location || "";
        comparison = locA.localeCompare(locB);
        break;
      }

      case "updated":
      default: {
        const updatedA = new Date(a.updated_date || a.created_date);
        const updatedB = new Date(b.updated_date || b.created_date);
        comparison = updatedA.getTime() - updatedB.getTime();
        break;
      }
    }

    return sortOrder === "asc" ? comparison : -comparison;
  });

  // Infinite scroll - only show plants up to displayCount
  const visiblePlants = filteredPlants.slice(0, displayCount);
  const hasMore = displayCount < filteredPlants.length;

  // Get unique values for filters
  const uniqueBlossomTypes = [...new Set(plants.map(p => p.blossom_type).filter(Boolean))].sort();
  const uniqueLeafTypes = [...new Set(plants.flatMap(p => p.leaf_types || []))].sort();
  const uniqueHybridizers = [...new Set(plants.map(p => p.hybridizer).filter(Boolean))].sort();
  const uniqueColors = [...new Set(plants.map(p => p.blossom_color).filter(Boolean))].sort();

  // Reset display count when view mode changes
  useEffect(() => {
    setDisplayCount(viewMode === "grid" ? 12 : 20);
  }, [viewMode]);

  // Reset display count when filters or search change
  useEffect(() => {
    setDisplayCount(viewMode === "grid" ? 12 : 20);
  }, [filters, searchQuery, sortBy, sortOrder, viewMode]);

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && displayCount < filteredPlants.length) {
          setDisplayCount(prev => prev + itemsPerLoad);
        }
      },
      { threshold: 0.1 }
    );

    const currentRef = loadMoreRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [displayCount, filteredPlants.length, itemsPerLoad]);

  const bulkCareLogMutation = useMutation({
    mutationFn: async ({ careType, notes }) => {
      const careDate = new Date().toISOString();
      const careLogs = selectedForBulk.map(plantId => ({
        plant_id: plantId,
        care_type: careType,
        care_date: careDate,
        notes: notes || `Bulk ${careType}`
      }));
      
      await base44.entities.CareLog.bulkCreate(careLogs);
      
      const updateField = `last_${careType === 'watering' ? 'watered' : careType === 'fertilizing' ? 'fertilized' : careType === 'grooming' ? 'groomed' : 'repotted'}`;
      await Promise.all(
        selectedForBulk.map(plantId => 
          base44.entities.Plant.update(plantId, { [updateField]: careDate })
        )
      );
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['plants'] });
      queryClient.invalidateQueries({ queryKey: ['careLogs'] });
      queryClient.invalidateQueries({ queryKey: ['recentCareLogs'] });
      toast.success(`Bulk ${variables.careType} logged!`, {
        description: `${selectedForBulk.length} plants updated successfully.`
      });
      setSelectedForBulk([]);
      setBulkMode(false);
    },
    onError: (error) => {
      toast.error("Bulk action failed", {
        description: error.message || "Please try again."
      });
    }
  });

  const handleBulkCareAction = async (careType) => {
    if (selectedForBulk.length === 0) return;
    
    const notes = prompt(`Add optional notes for this bulk ${careType} (or leave blank):`);
    if (notes === null) return;
    
    setBulkActionInProgress(true);
    await bulkCareLogMutation.mutateAsync({ careType, notes });
    setBulkActionInProgress(false);
  };

  const toggleBulkSelection = (plantId) => {
    if (selectedForBulk.includes(plantId)) {
      setSelectedForBulk(selectedForBulk.filter(id => id !== plantId));
    } else {
      setSelectedForBulk([...selectedForBulk, plantId]);
    }
  };

  const selectAllVisible = () => {
    const visiblePlantIds = visiblePlants.map(p => p.id);
    setSelectedForBulk(visiblePlantIds);
  };

  const toggleCompareSelection = (plantId) => {
    if (selectedForCompare.includes(plantId)) {
      setSelectedForCompare(selectedForCompare.filter(id => id !== plantId));
    } else if (selectedForCompare.length < 4) {
      setSelectedForCompare([...selectedForCompare, plantId]);
    }
  };

  const handleCompare = () => {
    if (selectedForCompare.length >= 2) {
      navigate(createPageUrl(`ComparePlants?plants=${selectedForCompare.join(',')}`));
    }
  };

  const toggleFilterSection = (section) => {
    setExpandedFilterSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const clearFilters = () => {
    setFilters({
      blossom_type: "",
      leaf_type: "",
      location: "",
      blossom_color: "",
      collection_id: "",
      hybridizer: "",
      needs_watering: false,
      needs_fertilizing: false,
      needs_grooming: false,
      has_issues: false,
      favorites_only: false,
      variegated_only: false,
      year_min: "",
      year_max: ""
    });
    setSearchQuery("");
  };

  const hasActiveFilters =
    Object.entries(filters).some(([, value]) => {
      if (typeof value === 'boolean') return value === true;
      return value !== "";
    }) || searchQuery !== "";

  const activeFilterCount =
    Object.entries(filters).filter(([, value]) => {
      if (typeof value === 'boolean') return value === true;
      return value !== "";
    }).length + (searchQuery ? 1 : 0);

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
                  alt="Plant Library" 
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h1 className="text-4xl font-bold" style={{ 
                  color: 'var(--text-primary)',
                  textShadow: '0 2px 4px rgba(32, 24, 51, 0.4)',
                  fontFamily: "'Playfair Display', Georgia, serif"
                }}>
                  Plant Library
                </h1>
                <p className="text-muted" style={{ color: (currentTheme === 'light' || currentTheme === 'minimal') ? 'var(--text-secondary)' : '#DDD6FE' }}>
                  {filteredPlants.length} {filteredPlants.length === 1 ? 'plant' : 'plants'} 
                  {filteredPlants.length !== plants.length && ` of ${plants.length}`}
                  {visiblePlants.length < filteredPlants.length && ` • Showing ${visiblePlants.length}`}
                </p>
              </div>
            </div>
          </div>

          {/* Search Bar - Full Width Row */}
          <div className="mb-3">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5" 
                style={{ color: 'var(--text-muted)', opacity: 0.7, strokeWidth: 1.5 }} />
              <input
                type="text"
                placeholder="Search by name, nickname, hybridizer, location, source, or notes..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); }}
                className="neuro-input w-full pl-12 pr-12 py-4 rounded-3xl"
                style={{ color: 'var(--text-primary)' }}
              />
              {searchQuery && (
                <button
                  onClick={() => { setSearchQuery(""); }}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 neuro-button w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Controls Row */}
          <div className="flex gap-3 flex-wrap mb-4">
            {/* View Toggle */}
            <div className="neuro-surface rounded-3xl p-1 flex gap-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`px-4 py-3 rounded-2xl font-semibold transition-all ${
                  viewMode === "grid" ? "neuro-accent-raised" : ""
                }`}
                style={{ color: viewMode === "grid" 
                  ? ((currentTheme === 'light' || currentTheme === 'minimal') ? "#FFFFFF" : "#F0EBFF")
                  : ((currentTheme === 'light' || currentTheme === 'minimal') ? 'var(--text-secondary)' : "#DDD6FE") }}
              >
                <Grid3x3 className="w-5 h-5" style={{ strokeWidth: 2 }} />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`px-4 py-3 rounded-2xl font-semibold transition-all ${
                  viewMode === "list" ? "neuro-accent-raised" : ""
                }`}
                style={{ color: viewMode === "list" 
                  ? ((currentTheme === 'light' || currentTheme === 'minimal') ? "#FFFFFF" : "#F0EBFF")
                  : ((currentTheme === 'light' || currentTheme === 'minimal') ? 'var(--text-secondary)' : "#DDD6FE") }}
              >
                <List className="w-5 h-5" style={{ strokeWidth: 2 }} />
              </button>
            </div>

            {/* Sort Dropdown */}
            <div className="neuro-surface rounded-3xl p-1 flex gap-1">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="neuro-input px-4 py-3 rounded-2xl text-sm border-0"
                style={{ color: (currentTheme === 'light' || currentTheme === 'minimal') ? 'var(--text-primary)' : "#F5F3FF", background: "transparent" }}
              >
                <option value="updated">Recently Updated</option>
                <option value="name">Name (A-Z)</option>
                <option value="acquired">Date Acquired</option>
                <option value="last_watered">Last Watered</option>
                <option value="last_fertilized">Last Fertilized</option>
                <option value="hybridizer">Hybridizer</option>
                <option value="location">Location</option>
              </select>
              <button
                onClick={() => setSortOrder(prev => prev === "asc" ? "desc" : "asc")}
                className="px-3 py-3 rounded-2xl"
                style={{ color: (currentTheme === 'light' || currentTheme === 'minimal') ? 'var(--text-secondary)' : "#DDD6FE" }}
                title={sortOrder === "asc" ? "Ascending" : "Descending"}
              >
                <ArrowUpDown className="w-5 h-5" style={{ strokeWidth: 2 }} />
              </button>
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`neuro-button px-6 py-4 rounded-3xl font-semibold flex items-center justify-center gap-2 ${
                hasActiveFilters ? "neuro-accent-raised" : ""
              }`}
              style={{ color: hasActiveFilters 
                ? ((currentTheme === 'light' || currentTheme === 'minimal') ? "#FFFFFF" : "#A7F3D0")
                : ((currentTheme === 'light' || currentTheme === 'minimal') ? 'var(--text-secondary)' : "#DDD6FE") }}
            >
              <Filter className="w-5 h-5" style={{ strokeWidth: 2 }} />
              <span className="hidden sm:inline">Filters</span>
              {activeFilterCount > 0 && (
                <span className="neuro-badge px-2 py-0.5 rounded-full text-xs font-bold"
                  style={{ 
                    background: (currentTheme === 'light' || currentTheme === 'minimal') 
                      ? "rgba(99, 102, 241, 0.3)" 
                      : "rgba(167, 243, 208, 0.3)",
                    color: (currentTheme === 'light' || currentTheme === 'minimal') 
                      ? "#6366F1" 
                      : "#A7F3D0",
                    minWidth: "20px"
                  }}>
                  {activeFilterCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setShowCollectionManager(true)}
              className="neuro-button px-6 py-4 rounded-3xl font-semibold flex items-center justify-center gap-2"
              style={{ color: (currentTheme === 'light' || currentTheme === 'minimal') ? 'var(--text-secondary)' : "#DDD6FE" }}
            >
              <Folder className="w-5 h-5" style={{ strokeWidth: 2 }} />
              <span className="hidden sm:inline">Collections</span>
            </button>
            <button
              onClick={() => setShowLocationManager(true)}
              className="neuro-button px-6 py-4 rounded-3xl font-semibold flex items-center justify-center gap-2"
              style={{ color: (currentTheme === 'light' || currentTheme === 'minimal') ? 'var(--text-secondary)' : "#DDD6FE" }}
            >
              <MapPin className="w-5 h-5" style={{ strokeWidth: 2 }} />
              <span className="hidden sm:inline">Locations</span>
            </button>
            <button
              onClick={() => {
                setCompareMode(!compareMode);
                setSelectedForCompare([]);
                if (bulkMode) {
                  setBulkMode(false);
                  setSelectedForBulk([]);
                }
              }}
              className={`neuro-button px-6 py-4 rounded-3xl font-semibold flex items-center justify-center gap-2 ${
                compareMode ? "neuro-accent-raised" : ""
              }`}
              style={{ color: compareMode 
                ? ((currentTheme === 'light' || currentTheme === 'minimal') ? "#FFFFFF" : "#F0EBFF")
                : ((currentTheme === 'light' || currentTheme === 'minimal') ? 'var(--text-secondary)' : "#DDD6FE") }}
            >
              <GitCompare className="w-5 h-5" style={{ strokeWidth: 2 }} />
              <span className="hidden sm:inline">Compare</span>
            </button>
            <button
              onClick={() => {
                setBulkMode(!bulkMode);
                setSelectedForBulk([]);
                if (compareMode) {
                  setCompareMode(false);
                  setSelectedForCompare([]);
                }
              }}
              className={`neuro-button px-6 py-4 rounded-3xl font-semibold flex items-center justify-center gap-2 ${
                bulkMode ? "neuro-accent-raised" : ""
              }`}
              style={{ color: bulkMode 
                ? ((currentTheme === 'light' || currentTheme === 'minimal') ? "#FFFFFF" : "#A7F3D0")
                : ((currentTheme === 'light' || currentTheme === 'minimal') ? 'var(--text-secondary)' : "#DDD6FE") }}
            >
              <CheckSquare className="w-5 h-5" style={{ strokeWidth: 2 }} />
              <span className="hidden sm:inline">Bulk Care</span>
            </button>
            <Link to={createPageUrl("PrintLabels")}>
              <button className="neuro-button px-6 py-4 rounded-3xl font-semibold flex items-center justify-center gap-2"
                style={{ color: (currentTheme === 'light' || currentTheme === 'minimal') ? 'var(--text-secondary)' : "#DDD6FE" }}>
                <Tag className="w-5 h-5" style={{ strokeWidth: 2 }} />
                <span className="hidden sm:inline">Print Labels</span>
              </button>
            </Link>
            <Link to={createPageUrl("AddPlant")}>
              <button className="neuro-accent-raised w-full sm:w-auto px-6 py-4 rounded-3xl font-semibold flex items-center justify-center gap-2 hover:shadow-lg transition-all"
                style={{ color: (currentTheme === 'light' || currentTheme === 'minimal') ? '#FFFFFF' : '#F0EBFF' }}>
                <Plus className="w-5 h-5" style={{ strokeWidth: 2 }} />
                <span className="hidden sm:inline">Add Plant</span>
              </button>
            </Link>
          </div>

          {/* Compare Mode Banner */}
          {compareMode && (
            <div className="neuro-accent-raised rounded-3xl p-4 mb-4">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <p className="font-semibold mb-1" style={{ color: (currentTheme === 'light' || currentTheme === 'minimal') ? "#FFFFFF" : "#F0EBFF" }}>
                    Compare Mode Active
                  </p>
                  <p className="text-sm" style={{ color: (currentTheme === 'light' || currentTheme === 'minimal') ? "#FFFFFF" : "#F0EBFF", opacity: 0.8 }}>
                    {selectedForCompare.length === 0 
                      ? "Select 2-4 plants to compare" 
                      : `${selectedForCompare.length} selected • ${selectedForCompare.length < 2 ? 'Select at least 2' : 'Ready to compare'}`}
                  </p>
                </div>
                <div className="flex gap-2">
                  {selectedForCompare.length >= 2 && (
                    <button
                      onClick={handleCompare}
                      className="neuro-button px-5 py-2.5 rounded-2xl font-semibold"
                      style={{ 
                        background: "rgba(255, 255, 255, 0.15)",
                        color: (currentTheme === 'light' || currentTheme === 'minimal') ? 'var(--text-primary)' : "#F0EBFF",
                        border: "1px solid rgba(255, 255, 255, 0.3)"
                      }}
                    >
                      Compare Now
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setCompareMode(false);
                      setSelectedForCompare([]);
                    }}
                    className="neuro-button px-5 py-2.5 rounded-2xl font-semibold"
                    style={{ 
                      background: "rgba(255, 255, 255, 0.1)",
                      color: (currentTheme === 'light' || currentTheme === 'minimal') ? 'var(--text-primary)' : "#F0EBFF",
                      border: "1px solid rgba(255, 255, 255, 0.2)"
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Bulk Mode Banner */}
          {bulkMode && (
            <div className="rounded-3xl p-5 mb-4 backdrop-blur-md"
              style={{
                background: (currentTheme === 'light' || currentTheme === 'minimal')
                  ? "linear-gradient(135deg, rgba(147, 51, 234, 0.2) 0%, rgba(126, 34, 206, 0.15) 100%)"
                  : "linear-gradient(135deg, rgba(154, 226, 211, 0.2) 0%, rgba(110, 231, 183, 0.15) 100%)",
                border: (currentTheme === 'light' || currentTheme === 'minimal')
                  ? "1px solid rgba(147, 51, 234, 0.4)"
                  : "1px solid rgba(154, 226, 211, 0.4)",
                boxShadow: (currentTheme === 'light' || currentTheme === 'minimal')
                  ? "0 4px 20px rgba(147, 51, 234, 0.3)"
                  : "0 4px 20px rgba(154, 226, 211, 0.3)"
              }}>
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <p className="font-semibold mb-1" style={{ 
                    color: (currentTheme === 'light' || currentTheme === 'minimal') ? "#7C3AED" : "#A7F3D0" 
                  }}>
                    Bulk Care Mode Active
                  </p>
                  <p className="text-sm" style={{ 
                    color: (currentTheme === 'light' || currentTheme === 'minimal') ? "#7C3AED" : "#A7F3D0", 
                    opacity: 0.9 
                  }}>
                    {selectedForBulk.length === 0 
                      ? "Select plants to perform bulk care actions" 
                      : `${selectedForBulk.length} ${selectedForBulk.length === 1 ? 'plant' : 'plants'} selected`}
                  </p>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {selectedForBulk.length > 0 && (
                    <>
                      <button
                        onClick={selectAllVisible}
                        className="neuro-button px-4 py-2.5 rounded-2xl text-sm font-semibold"
                        style={{ 
                          background: "rgba(255, 255, 255, 0.1)",
                          color: (currentTheme === 'light' || currentTheme === 'minimal') ? "#7C3AED" : "#A7F3D0",
                          border: (currentTheme === 'light' || currentTheme === 'minimal')
                            ? "1px solid rgba(147, 51, 234, 0.3)"
                            : "1px solid rgba(154, 226, 211, 0.3)"
                        }}
                      >
                        Select All ({visiblePlants.length})
                      </button>
                      <button
                        onClick={() => setSelectedForBulk([])}
                        className="neuro-button px-4 py-2.5 rounded-2xl text-sm font-semibold"
                        style={{ 
                          background: "rgba(255, 255, 255, 0.1)",
                          color: (currentTheme === 'light' || currentTheme === 'minimal') ? "#7C3AED" : "#A7F3D0",
                          border: (currentTheme === 'light' || currentTheme === 'minimal')
                            ? "1px solid rgba(147, 51, 234, 0.3)"
                            : "1px solid rgba(154, 226, 211, 0.3)"
                        }}
                      >
                        Clear ({selectedForBulk.length})
                      </button>
                      <button
                        onClick={() => handleBulkCareAction("watering")}
                        disabled={bulkActionInProgress}
                        className="neuro-button px-4 py-2.5 rounded-2xl text-sm font-semibold flex items-center gap-2"
                        style={{ 
                          background: "rgba(125, 211, 252, 0.2)",
                          color: "#7DD3FC",
                          border: "1px solid rgba(125, 211, 252, 0.4)"
                        }}
                      >
                        {bulkActionInProgress ? <Loader2 className="w-4 h-4 animate-spin" /> : <Droplets className="w-4 h-4" />}
                        Water
                      </button>
                      <button
                        onClick={() => handleBulkCareAction("fertilizing")}
                        disabled={bulkActionInProgress}
                        className="neuro-button px-4 py-2.5 rounded-2xl text-sm font-semibold flex items-center gap-2"
                        style={{ 
                          background: (currentTheme === 'light' || currentTheme === 'minimal')
                            ? "rgba(147, 51, 234, 0.2)"
                            : "rgba(167, 243, 208, 0.2)",
                          color: (currentTheme === 'light' || currentTheme === 'minimal')
                            ? "#7C3AED"
                            : "#A7F3D0",
                          border: (currentTheme === 'light' || currentTheme === 'minimal')
                            ? "1px solid rgba(147, 51, 234, 0.4)"
                            : "1px solid rgba(167, 243, 208, 0.4)"
                        }}
                      >
                        {bulkActionInProgress ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                        Fertilize
                      </button>
                      <button
                        onClick={() => handleBulkCareAction("grooming")}
                        disabled={bulkActionInProgress}
                        className="neuro-button px-4 py-2.5 rounded-2xl text-sm font-semibold flex items-center gap-2"
                        style={{ 
                          background: (currentTheme === 'light' || currentTheme === 'minimal')
                            ? "rgba(139, 92, 246, 0.2)"
                            : "rgba(196, 181, 253, 0.2)",
                          color: (currentTheme === 'light' || currentTheme === 'minimal')
                            ? "#8B5CF6"
                            : "#C4B5FD",
                          border: (currentTheme === 'light' || currentTheme === 'minimal')
                            ? "1px solid rgba(139, 92, 246, 0.4)"
                            : "1px solid rgba(196, 181, 253, 0.4)"
                        }}
                      >
                        {bulkActionInProgress ? <Loader2 className="w-4 h-4 animate-spin" /> : <Scissors className="w-4 h-4" />}
                        Groom
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => {
                      setBulkMode(false);
                      setSelectedForBulk([]);
                    }}
                    className="neuro-button px-4 py-2.5 rounded-2xl text-sm font-semibold"
                    style={{ 
                      background: "rgba(255, 255, 255, 0.1)",
                      color: (currentTheme === 'light' || currentTheme === 'minimal') ? "#7C3AED" : "#A7F3D0",
                      border: (currentTheme === 'light' || currentTheme === 'minimal')
                        ? "1px solid rgba(147, 51, 234, 0.3)"
                        : "1px solid rgba(154, 226, 211, 0.3)"
                    }}
                  >
                    Exit
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Enhanced Filter Panel */}
          {showFilters && (
            <div className="neuro-card rounded-3xl p-6 space-y-4 mb-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold" style={{ 
                  color: (currentTheme === 'light' || currentTheme === 'minimal') ? 'var(--text-primary)' : "#F5F3FF",
                  fontFamily: "'Playfair Display', Georgia, serif"
                }}>
                  Advanced Filters
                </h3>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="neuro-button px-4 py-2 rounded-2xl text-sm font-semibold flex items-center gap-2"
                    style={{ color: (currentTheme === 'light' || currentTheme === 'minimal') ? 'var(--text-secondary)' : "#DDD6FE" }}
                  >
                    <X className="w-4 h-4" />
                    Clear All ({activeFilterCount})
                  </button>
                )}
              </div>

              {/* Basic Filters Section */}
              <div className="neuro-surface rounded-2xl p-4">
                <button
                  onClick={() => toggleFilterSection('basic')}
                  className="w-full flex items-center justify-between mb-3"
                >
                  <h4 className="text-sm font-bold" style={{ color: (currentTheme === 'light' || currentTheme === 'minimal') ? 'var(--text-primary)' : "#F5F3FF" }}>
                    Basic Filters
                  </h4>
                  {expandedFilterSections.basic ? 
                    <ChevronUp className="w-4 h-4" style={{ color: (currentTheme === 'light' || currentTheme === 'minimal') ? 'var(--text-secondary)' : "#DDD6FE" }} /> :
                    <ChevronDown className="w-4 h-4" style={{ color: (currentTheme === 'light' || currentTheme === 'minimal') ? 'var(--text-secondary)' : "#DDD6FE" }} />
                  }
                </button>
                
                {expandedFilterSections.basic && (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-semibold mb-2" style={{ color: (currentTheme === 'light' || currentTheme === 'minimal') ? 'var(--text-primary)' : "#F5F3FF" }}>
                        Collection
                      </label>
                      <select
                        value={filters.collection_id}
                        onChange={(e) => { setFilters({...filters, collection_id: e.target.value}); }}
                        className="neuro-input w-full px-4 py-3 rounded-2xl"
                        style={{ color: "var(--text-primary)" }}
                      >
                        <option value="">All Collections</option>
                        {collections.map(collection => (
                          <option key={collection.id} value={collection.id}>{collection.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2" style={{ color: (currentTheme === 'light' || currentTheme === 'minimal') ? 'var(--text-primary)' : "#F5F3FF" }}>
                        Location
                      </label>
                      <select
                        value={filters.location}
                        onChange={(e) => { setFilters({...filters, location: e.target.value}); }}
                        className="neuro-input w-full px-4 py-3 rounded-2xl"
                        style={{ color: "var(--text-primary)" }}
                      >
                        <option value="">All Locations</option>
                        {locations.map(location => (
                          <option key={location.id} value={location.id}>{location.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2" style={{ color: (currentTheme === 'light' || currentTheme === 'minimal') ? 'var(--text-primary)' : "#F5F3FF" }}>
                        Hybridizer
                      </label>
                      <select
                        value={filters.hybridizer}
                        onChange={(e) => { setFilters({...filters, hybridizer: e.target.value}); }}
                        className="neuro-input w-full px-4 py-3 rounded-2xl"
                        style={{ color: "var(--text-primary)" }}
                      >
                        <option value="">All Hybridizers</option>
                        {uniqueHybridizers.map(hybridizer => (
                          <option key={hybridizer} value={hybridizer}>{hybridizer}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2" style={{ color: (currentTheme === 'light' || currentTheme === 'minimal') ? 'var(--text-primary)' : "#F5F3FF" }}>
                        Year Range (Min)
                      </label>
                      <input
                        type="number"
                        value={filters.year_min}
                        onChange={(e) => { setFilters({...filters, year_min: e.target.value}); }}
                        placeholder="e.g., 2000"
                        className="neuro-input w-full px-4 py-3 rounded-2xl"
                        style={{ color: "var(--text-primary)" }}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2" style={{ color: (currentTheme === 'light' || currentTheme === 'minimal') ? 'var(--text-primary)' : "#F5F3FF" }}>
                        Year Range (Max)
                      </label>
                      <input
                        type="number"
                        value={filters.year_max}
                        onChange={(e) => { setFilters({...filters, year_max: e.target.value}); }}
                        placeholder="e.g., 2024"
                        className="neuro-input w-full px-4 py-3 rounded-2xl"
                        style={{ color: "var(--text-primary)" }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Characteristics Section */}
              <div className="neuro-surface rounded-2xl p-4">
                <button
                  onClick={() => toggleFilterSection('characteristics')}
                  className="w-full flex items-center justify-between mb-3"
                >
                  <h4 className="text-sm font-bold" style={{ color: (currentTheme === 'light' || currentTheme === 'minimal') ? 'var(--text-primary)' : "#F5F3FF" }}>
                    Characteristics
                  </h4>
                  {expandedFilterSections.characteristics ? 
                    <ChevronUp className="w-4 h-4" style={{ color: (currentTheme === 'light' || currentTheme === 'minimal') ? 'var(--text-secondary)' : "#DDD6FE" }} /> :
                    <ChevronDown className="w-4 h-4" style={{ color: (currentTheme === 'light' || currentTheme === 'minimal') ? 'var(--text-secondary)' : "#DDD6FE" }} />
                  }
                </button>
                
                {expandedFilterSections.characteristics && (
                  <div className="space-y-4">
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-semibold mb-2" style={{ color: (currentTheme === 'light' || currentTheme === 'minimal') ? 'var(--text-primary)' : "#F5F3FF" }}>
                          Blossom Type
                        </label>
                        <select
                          value={filters.blossom_type}
                          onChange={(e) => { setFilters({...filters, blossom_type: e.target.value}); }}
                          className="neuro-input w-full px-4 py-3 rounded-2xl"
                          style={{ color: "var(--text-primary)" }}
                        >
                          <option value="">All Types</option>
                          {uniqueBlossomTypes.map(type => (
                            <option key={type} value={type}>{type}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold mb-2" style={{ color: (currentTheme === 'light' || currentTheme === 'minimal') ? 'var(--text-primary)' : "#F5F3FF" }}>
                          Blossom Color
                        </label>
                        <select
                          value={filters.blossom_color}
                          onChange={(e) => { setFilters({...filters, blossom_color: e.target.value}); }}
                          className="neuro-input w-full px-4 py-3 rounded-2xl"
                          style={{ color: "var(--text-primary)" }}
                        >
                          <option value="">All Colors</option>
                          {uniqueColors.map(color => (
                            <option key={color} value={color}>{color}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold mb-2" style={{ color: (currentTheme === 'light' || currentTheme === 'minimal') ? 'var(--text-primary)' : "#F5F3FF" }}>
                          Leaf Type
                        </label>
                        <select
                          value={filters.leaf_type}
                          onChange={(e) => { setFilters({...filters, leaf_type: e.target.value}); }}
                          className="neuro-input w-full px-4 py-3 rounded-2xl"
                          style={{ color: "var(--text-primary)" }}
                        >
                          <option value="">All Types</option>
                          {uniqueLeafTypes.map(type => (
                            <option key={type} value={type}>{type}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Toggle Filters */}
                    <div className="grid sm:grid-cols-2 gap-3">
                      <button
                        onClick={() => { setFilters({...filters, favorites_only: !filters.favorites_only}); }}
                        className={`px-4 py-3 rounded-2xl font-medium text-sm flex items-center gap-2 transition-all ${
                          filters.favorites_only ? "neuro-accent-raised" : "neuro-button"
                        }`}
                        style={{ color: filters.favorites_only 
                          ? ((currentTheme === 'light' || currentTheme === 'minimal') ? "#FFFFFF" : "#F0EBFF")
                          : ((currentTheme === 'light' || currentTheme === 'minimal') ? 'var(--text-secondary)' : "#DDD6FE") }}
                      >
                        <Heart className="w-4 h-4" style={{ 
                          strokeWidth: 2, 
                          fill: filters.favorites_only 
                            ? ((currentTheme === 'light' || currentTheme === 'minimal') ? "#FFFFFF" : "#F0EBFF")
                            : "none" 
                        }} />
                        Favorites Only
                      </button>

                      <button
                        onClick={() => { setFilters({...filters, variegated_only: !filters.variegated_only}); }}
                        className={`px-4 py-3 rounded-2xl font-medium text-sm transition-all ${
                          filters.variegated_only ? "neuro-accent-raised" : "neuro-button"
                        }`}
                        style={{ color: filters.variegated_only 
                          ? ((currentTheme === 'light' || currentTheme === 'minimal') ? "#FFFFFF" : "#F0EBFF")
                          : ((currentTheme === 'light' || currentTheme === 'minimal') ? 'var(--text-secondary)' : "#DDD6FE") }}
                      >
                        Variegated Only
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Care Needs Section */}
              <div className="neuro-surface rounded-2xl p-4">
                <button
                  onClick={() => toggleFilterSection('care')}
                  className="w-full flex items-center justify-between mb-3"
                >
                  <h4 className="text-sm font-bold" style={{ color: (currentTheme === 'light' || currentTheme === 'minimal') ? 'var(--text-primary)' : "#F5F3FF" }}>
                    Care Needs & Status
                  </h4>
                  {expandedFilterSections.care ? 
                    <ChevronUp className="w-4 h-4" style={{ color: (currentTheme === 'light' || currentTheme === 'minimal') ? 'var(--text-secondary)' : "#DDD6FE" }} /> :
                    <ChevronDown className="w-4 h-4" style={{ color: (currentTheme === 'light' || currentTheme === 'minimal') ? 'var(--text-secondary)' : "#DDD6FE" }} />
                  }
                </button>
                
                {expandedFilterSections.care && (
                  <div className="grid sm:grid-cols-2 gap-3">
                    <button
                      onClick={() => { setFilters({...filters, needs_watering: !filters.needs_watering}); }}
                      className={`px-4 py-3 rounded-2xl font-medium text-sm flex items-center gap-2 transition-all ${
                        filters.needs_watering ? "neuro-accent-raised" : "neuro-button"
                      }`}
                      style={{ color: filters.needs_watering 
                        ? ((currentTheme === 'light' || currentTheme === 'minimal') ? "#FFFFFF" : "#A7F3D0")
                        : ((currentTheme === 'light' || currentTheme === 'minimal') ? 'var(--text-secondary)' : "#DDD6FE") }}
                    >
                      <Clock className="w-4 h-4" style={{ strokeWidth: 2 }} />
                      Needs Watering
                    </button>

                    <button
                      onClick={() => { setFilters({...filters, needs_fertilizing: !filters.needs_fertilizing}); }}
                      className={`px-4 py-3 rounded-2xl font-medium text-sm flex items-center gap-2 transition-all ${
                        filters.needs_fertilizing ? "neuro-accent-raised" : "neuro-button"
                      }`}
                      style={{ color: filters.needs_fertilizing 
                        ? ((currentTheme === 'light' || currentTheme === 'minimal') ? "#FFFFFF" : "#A7F3D0")
                        : ((currentTheme === 'light' || currentTheme === 'minimal') ? 'var(--text-secondary)' : "#DDD6FE") }}
                    >
                      <Clock className="w-4 h-4" style={{ strokeWidth: 2 }} />
                      Needs Fertilizing
                    </button>

                    <button
                      onClick={() => { setFilters({...filters, needs_grooming: !filters.needs_grooming}); }}
                      className={`px-4 py-3 rounded-2xl font-medium text-sm flex items-center gap-2 transition-all ${
                        filters.needs_grooming ? "neuro-accent-raised" : "neuro-button"
                      }`}
                      style={{ color: filters.needs_grooming 
                        ? ((currentTheme === 'light' || currentTheme === 'minimal') ? "#FFFFFF" : "#A7F3D0")
                        : ((currentTheme === 'light' || currentTheme === 'minimal') ? 'var(--text-secondary)' : "#DDD6FE") }}
                    >
                      <Clock className="w-4 h-4" style={{ strokeWidth: 2 }} />
                      Needs Grooming
                    </button>

                    <button
                      onClick={() => { setFilters({...filters, has_issues: !filters.has_issues}); }}
                      className={`px-4 py-3 rounded-2xl font-medium text-sm flex items-center gap-2 transition-all ${
                        filters.has_issues ? "" : "neuro-button"
                      }`}
                      style={{ 
                        background: filters.has_issues 
                          ? "linear-gradient(135deg, rgba(239, 68, 68, 0.25) 0%, rgba(220, 38, 38, 0.2) 100%)"
                          : undefined,
                        color: filters.has_issues ? "#FCA5A5" : ((currentTheme === 'light' || currentTheme === 'minimal') ? 'var(--text-secondary)' : "#DDD6FE"),
                        border: filters.has_issues ? "1px solid rgba(239, 68, 68, 0.4)" : undefined
                      }}
                    >
                      <AlertCircle className="w-4 h-4" style={{ strokeWidth: 2 }} />
                      Has Active Issues
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Plants Grid or List */}
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
        ) : filteredPlants.length === 0 ? (
          <div className="neuro-card rounded-3xl">
            {plants.length === 0 ? (
              <EmptyState
                icon={Library}
                title="Your Collection Awaits"
                description="Start your African violet journey by adding your first plant. Track care, document growth, and watch your collection flourish."
                actionText="Add Your First Plant"
                actionLink="AddPlant"
                secondaryActionText="Browse Care Guide"
                secondaryActionLink="CareGuide"
                variant="default"
                size="large"
              />
            ) : hasActiveFilters ? (
              <EmptyState
                icon={Filter}
                title="No Plants Match Your Filters"
                description="Try adjusting your search criteria or clearing some filters to see more plants from your collection."
                actionText="Clear All Filters"
                onAction={clearFilters}
                variant="info"
                size="medium"
              />
            ) : (
              <EmptyState
                icon={Search}
                title="No Plants Found"
                description="No plants match your search query. Try different keywords or browse all plants."
                actionText="Clear Search"
                onAction={() => setSearchQuery("")}
                variant="info"
                size="medium"
              />
            )}
          </div>
        ) : (
          <>
            {viewMode === "grid" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {visiblePlants.map(plant => (
                  <div key={plant.id} className="relative">
                    {compareMode && (
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          toggleCompareSelection(plant.id);
                        }}
                        className={`absolute top-3 right-3 z-20 w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-xl transition-all ${
                          selectedForCompare.includes(plant.id) 
                            ? "neuro-accent-raised" 
                            : "neuro-button"
                        }`}
                        style={{ 
                          color: selectedForCompare.includes(plant.id) 
                            ? ((currentTheme === 'light' || currentTheme === 'minimal') ? "#FFFFFF" : "#F0EBFF") 
                            : ((currentTheme === 'light' || currentTheme === 'minimal') ? 'var(--text-secondary)' : "#DDD6FE"),
                          border: selectedForCompare.includes(plant.id) 
                            ? ((currentTheme === 'light' || currentTheme === 'minimal') ? "2px solid rgba(124, 58, 237, 0.6)" : "2px solid rgba(227, 201, 255, 0.6)") 
                            : ((currentTheme === 'light' || currentTheme === 'minimal') ? "1px solid rgba(124, 58, 237, 0.3)" : "1px solid rgba(227, 201, 255, 0.3)")
                        }}
                      >
                        {selectedForCompare.includes(plant.id) ? (
                          <GitCompare className="w-5 h-5" style={{ strokeWidth: 2.5 }} />
                        ) : (
                          <GitCompare className="w-5 h-5" style={{ strokeWidth: 2 }} />
                        )}
                      </button>
                    )}
                    {bulkMode && (
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          toggleBulkSelection(plant.id);
                        }}
                        className={`absolute top-3 left-3 z-20 w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-xl transition-all ${
                          selectedForBulk.includes(plant.id) 
                            ? "neuro-accent-raised" 
                            : "neuro-button"
                        }`}
                        style={{ 
                          background: selectedForBulk.includes(plant.id) 
                            ? ((currentTheme === 'light' || currentTheme === 'minimal') ? "linear-gradient(135deg, rgba(147, 51, 234, 0.35) 0%, rgba(126, 34, 206, 0.3) 100%)" : "linear-gradient(135deg, rgba(154, 226, 211, 0.35) 0%, rgba(110, 231, 183, 0.3) 100%)")
                            : undefined,
                          color: selectedForBulk.includes(plant.id) 
                            ? ((currentTheme === 'light' || currentTheme === 'minimal') ? "#7C3AED" : "#A7F3D0") 
                            : ((currentTheme === 'light' || currentTheme === 'minimal') ? 'var(--text-secondary)' : "#DDD6FE"),
                          border: selectedForBulk.includes(plant.id) 
                            ? ((currentTheme === 'light' || currentTheme === 'minimal') ? "2px solid rgba(147, 51, 234, 0.6)" : "2px solid rgba(154, 226, 211, 0.6)") 
                            : ((currentTheme === 'light' || currentTheme === 'minimal') ? "1px solid rgba(147, 51, 234, 0.3)" : "1px solid rgba(227, 201, 255, 0.3)")
                        }}
                      >
                        {selectedForBulk.includes(plant.id) ? (
                          <CheckSquare className="w-5 h-5" style={{ strokeWidth: 2.5 }} />
                        ) : (
                          <Square className="w-5 h-5" style={{ strokeWidth: 2 }} />
                        )}
                      </button>
                    )}
                    <PlantCard plant={plant} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {visiblePlants.map(plant => (
                  <PlantListItem 
                    key={plant.id} 
                    plant={plant}
                    compareMode={compareMode}
                    isSelected={selectedForCompare.includes(plant.id)}
                    onToggleCompare={toggleCompareSelection}
                    bulkMode={bulkMode}
                    isBulkSelected={selectedForBulk.includes(plant.id)}
                    onToggleBulk={toggleBulkSelection}
                  />
                ))}
              </div>
            )}

            {/* Loading More Indicator */}
            {hasMore && (
              <div ref={loadMoreRef} className="flex items-center justify-center py-12">
                <div className="neuro-icon-well w-12 h-12 rounded-2xl flex items-center justify-center animate-pulse p-2">
                  <Loader2 className="w-6 h-6 animate-spin" style={{ color: "#C4B5FD" }} />
                </div>
              </div>
            )}

            {/* End of Results */}
            {!hasMore && filteredPlants.length > itemsPerLoad && (
              <div className="text-center py-8">
                <p className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
                  You've reached the end • {filteredPlants.length} total {filteredPlants.length === 1 ? 'plant' : 'plants'}
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {showCollectionManager && (
        <CollectionManager onClose={() => setShowCollectionManager(false)} />
      )}

      {showLocationManager && (
        <LocationManager onClose={() => setShowLocationManager(false)} />
      )}
      
      <BackToTop />
    </div>
  );
}
