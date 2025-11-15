
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Edit, Trash2, Heart, Activity, BarChart3, BookOpen, Flower2, Image as ImageIcon, Clock, Users, Sparkles, Info, Bug, Package } from "lucide-react";
import { createPageUrl } from "@/utils";
import QuickCareButtons from "../components/plants/QuickCareButtons";
import ContextualTooltip from "../components/onboarding/ContextualTooltip";
import { useTooltips } from "../components/onboarding/TooltipManager";
import HealthStatusBadge from "../components/health/HealthStatusBadge";
import HealthLogForm from "../components/health/HealthLogForm";
import JournalEntryForm from "../components/journal/JournalEntryForm";
import CollectionBadges from "../components/collections/CollectionBadges";
import PlantTimeline from "../components/plants/PlantTimeline";
import PlantPhotoGallery from "../components/plants/PlantPhotoGallery";
import BloomLogForm from "../components/plants/BloomLogForm";
import CareFrequencyStats from "../components/insights/CareFrequencyStats";
import WateringFrequencyChart from "../components/insights/WateringFrequencyChart";
import HealthSummary from "../components/insights/HealthSummary";
import PlantAge from "../components/insights/PlantAge";
import CareLogItem from "../components/plants/CareLogItem";
import PestDiseaseLogForm from "../components/pestdisease/PestDiseaseLogForm";
import PestDiseaseTimeline from "../components/pestdisease/PestDiseaseTimeline";
import LocationBadge from "../components/locations/LocationBadge";
import EmptyState from "../components/shared/EmptyState";
import BackToTop from "../components/shared/BackToTop";

const LOGO_URL = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/690e3cd78523fb5fba0a8466/632f6e485_PlantLogos.png";

export default function PlantDetail() {
  const { isTooltipDismissed, dismissTooltip } = useTooltips();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const plantId = urlParams.get('id');
  const [showHealthForm, setShowHealthForm] = useState(false);
  const [showJournalForm, setShowJournalForm] = useState(false);
  const [showPhotoGallery, setShowPhotoGallery] = useState(false);
  const [showBloomForm, setShowBloomForm] = useState(false);
  const [editingJournalEntry, setEditingJournalEntry] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [showPestDiseaseForm, setShowPestDiseaseForm] = useState(false);
  const [editingPestDiseaseLog, setEditingPestDiseaseLog] = useState(null);
  const [careFilterType, setCareFilterType] = useState("all");
  const [careSortBy, setCareSortBy] = useState("date-desc");
  const [careDateRange, setCareDateRange] = useState({ start: "", end: "" });

  const { data: plant, isLoading } = useQuery({
    queryKey: ['plant', plantId],
    queryFn: () => base44.entities.Plant.filter({ id: plantId }).then(plants => plants[0]),
    enabled: !!plantId
  });

  const { data: careLogs = [] } = useQuery({
    queryKey: ['careLogs', plantId],
    queryFn: () => base44.entities.CareLog.filter({ plant_id: plantId }, '-care_date'),
    enabled: !!plantId
  });

  const { data: healthLogs = [] } = useQuery({
    queryKey: ['healthLogs', plantId],
    queryFn: () => base44.entities.HealthLog.filter({ plant_id: plantId }, '-observation_date'),
    enabled: !!plantId
  });

  const { data: journalEntries = [] } = useQuery({
    queryKey: ['journalEntries', plantId],
    queryFn: () => base44.entities.JournalEntry.filter({ plant_id: plantId }, '-entry_date'),
    enabled: !!plantId
  });

  const { data: bloomLogs = [] } = useQuery({
    queryKey: ['bloomLogs', plantId],
    queryFn: () => base44.entities.BloomLog.filter({ plant_id: plantId }, '-bloom_start_date'),
    enabled: !!plantId
  });

  const { data: allPlants = [] } = useQuery({
    queryKey: ['plants'],
    queryFn: () => base44.entities.Plant.list(),
    initialData: []
  });

  const { data: pestDiseaseLogs = [] } = useQuery({
    queryKey: ['pestDiseaseLogs', plantId],
    queryFn: () => base44.entities.PestDiseaseLog.filter({ plant_id: plantId }, '-date_observed'),
    enabled: !!plantId
  });

  const { data: plantSupplyUsage = [] } = useQuery({
    queryKey: ['plantSupplyUsage', plantId],
    queryFn: () => base44.entities.SupplyUsageLog.filter({ plant_id: plantId }, '-usage_date'),
    enabled: !!plantId
  });

  const { data: supplies = [] } = useQuery({
    queryKey: ['supplies'],
    queryFn: () => base44.entities.Supply.list(),
    initialData: []
  });

  const latestHealthStatus = healthLogs[0]?.health_status;

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const careLogsToDelete = await base44.entities.CareLog.filter({ plant_id: plantId });
      const healthLogsToDelete = await base44.entities.HealthLog.filter({ plant_id: plantId });
      const journalEntriesToDelete = await base44.entities.JournalEntry.filter({ plant_id: plantId });
      const bloomLogsToDelete = await base44.entities.BloomLog.filter({ plant_id: plantId });
      const pestDiseaseLogsToDelete = await base44.entities.PestDiseaseLog.filter({ plant_id: plantId });
      const supplyUsageLogsToDelete = await base44.entities.SupplyUsageLog.filter({ plant_id: plantId });

      await Promise.all(careLogsToDelete.map(log => base44.entities.CareLog.delete(log.id)));
      await Promise.all(healthLogsToDelete.map(log => base44.entities.HealthLog.delete(log.id)));
      await Promise.all(journalEntriesToDelete.map(entry => base44.entities.JournalEntry.delete(entry.id)));
      await Promise.all(bloomLogsToDelete.map(log => base44.entities.BloomLog.delete(log.id)));
      await Promise.all(pestDiseaseLogsToDelete.map(log => base44.entities.PestDiseaseLog.delete(log.id)));
      await Promise.all(supplyUsageLogsToDelete.map(log => base44.entities.SupplyUsageLog.delete(log.id)));

      await base44.entities.Plant.delete(plantId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plants'] });
      queryClient.invalidateQueries({ queryKey: ['careLogs'] });
      queryClient.invalidateQueries({ queryKey: ['recentCareLogs'] });
      queryClient.invalidateQueries({ queryKey: ['healthLogs'] });
      queryClient.invalidateQueries({ queryKey: ['journalEntries'] });
      queryClient.invalidateQueries({ queryKey: ['bloomLogs'] });
      queryClient.invalidateQueries({ queryKey: ['recentBloomLogs'] });
      queryClient.invalidateQueries({ queryKey: ['pestDiseaseLogs'] });
      queryClient.invalidateQueries({ queryKey: ['plantSupplyUsage'] });
      navigate(createPageUrl("Collection"));
    }
  });

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to remove ${plant.cultivar_name} from your collection?`)) {
      deleteMutation.mutate();
    }
  };

  const handleEditJournal = (entry) => {
    setEditingJournalEntry(entry);
    setShowJournalForm(true);
  };

  const handleCloseJournalForm = () => {
    setShowJournalForm(false);
    setEditingJournalEntry(null);
  };

  const handleEditPestDiseaseLog = (log) => {
    setEditingPestDiseaseLog(log);
    setShowPestDiseaseForm(true);
  };

  const handleClosePestDiseaseForm = () => {
    setShowPestDiseaseForm(false);
    setEditingPestDiseaseLog(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="neuro-icon-well w-16 h-16 rounded-2xl flex items-center justify-center animate-pulse p-2">
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

  if (!plant) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="neuro-card rounded-3xl p-12 text-center">
          <p style={{ color: "var(--text-primary)" }} className="font-medium">Plant not found</p>
        </div>
      </div>
    );
  }

  const seedParent = plant.seed_parent_id ? allPlants.find(p => p.id === plant.seed_parent_id) : null;
  const pollenParent = plant.pollen_parent_id ? allPlants.find(p => p.id === plant.pollen_parent_id) : null;
  const photos = plant.photos || [];
  const primaryPhoto = photos[0];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-4 mb-8 flex-wrap">
        <button
          onClick={() => navigate(createPageUrl("Collection"))}
          className="neuro-button w-12 h-12 rounded-2xl flex items-center justify-center"
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
              {plant.cultivar_name}
            </h1>
            {latestHealthStatus && <HealthStatusBadge status={latestHealthStatus} size="md" />}
          </div>
          {plant.blossom_color && (
            <p style={{ color: "var(--text-secondary)" }}>{plant.blossom_color} blooms</p>
          )}
          <div className="mt-2">
            <CollectionBadges plantId={plant.id} maxDisplay={3} />
          </div>
        </div>
        <button
          onClick={() => navigate(createPageUrl(`EditPlant?id=${plantId}`))}
          className="neuro-accent-raised w-12 h-12 rounded-2xl flex items-center justify-center"
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
        <div className="lg:col-span-1 space-y-6">
          <div 
            onClick={() => setShowPhotoGallery(true)}
            className="neuro-card rounded-3xl overflow-hidden aspect-square cursor-pointer hover:ring-2 hover:ring-offset-0 transition-all group relative"
            style={{ 
              ringColor: "rgba(168, 159, 239, 0.5)"
            }}>
            {primaryPhoto ? (
              <>
                <img 
                  src={primaryPhoto} 
                  alt={plant.cultivar_name}
                  className="w-full h-full object-cover"
                  style={{ filter: "contrast(1.05) saturate(1.1)" }}
                />
                {photos.length > 1 && (
                  <div className="absolute bottom-3 right-3 px-3 py-1.5 rounded-xl text-sm font-semibold backdrop-blur-xl flex items-center gap-2"
                    style={{
                      background: "rgba(0, 0, 0, 0.7)",
                      border: "1px solid rgba(255, 255, 255, 0.2)",
                      color: "#FFF"
                    }}>
                    <ImageIcon className="w-4 h-4" />
                    {photos.length}
                  </div>
                )}
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="neuro-accent-raised px-4 py-2 rounded-2xl font-semibold" style={{ color: "#F0EBFF" }}>
                    View Gallery
                  </div>
                </div>
              </>
            ) : (
              <div 
                className="w-full h-full flex items-center justify-center p-12"
                style={{
                  background: "linear-gradient(135deg, rgba(168, 159, 239, 0.15) 0%, rgba(154, 226, 211, 0.12) 100%)"
                }}
              >
                <img 
                  src={LOGO_URL} 
                  alt="No photo" 
                  className="w-full h-full object-contain"
                  style={{ opacity: 0.4 }}
                />
              </div>
            )}
          </div>

          <div className="neuro-card rounded-3xl p-6">
            <h2 className="text-lg font-bold mb-4" style={{ 
              color: "var(--text-primary)",
              textShadow: "0 1px 3px rgba(32, 24, 51, 0.4)",
              fontFamily: "'Playfair Display', Georgia, serif"
            }}>
              Quick Care
            </h2>
            {!isTooltipDismissed('quick-care-buttons') && careLogs.length === 0 ? (
              <ContextualTooltip
                id="quick-care-buttons"
                title="Log Care Activities"
                description="Quick access buttons for logging watering, fertilizing, grooming, and repotting. Your care history helps track plant health patterns."
                position="top"
                onDismiss={dismissTooltip}
              >
                <QuickCareButtons plantId={plantId} />
              </ContextualTooltip>
            ) : (
              <QuickCareButtons plantId={plantId} />
            )}
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="neuro-card rounded-3xl p-3">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              <button
                onClick={() => setActiveTab("overview")}
                className={`px-4 py-3 rounded-2xl font-semibold transition-all backdrop-blur-md ${
                  activeTab === "overview" ? "neuro-accent-raised" : "neuro-button"
                }`}
                style={{ color: activeTab === "overview" ? "#F0EBFF" : "var(--text-secondary)" }}
              >
                <Info className="w-4 h-4 inline mr-2" style={{ strokeWidth: 2 }} />
                Overview
              </button>
              
              <button
                onClick={() => setActiveTab("care")}
                className={`px-4 py-3 rounded-2xl font-semibold transition-all backdrop-blur-md ${
                  activeTab === "care" ? "neuro-accent-raised" : "neuro-button"
                }`}
                style={{ color: activeTab === "care" ? "#F0EBFF" : "var(--text-secondary)" }}
              >
                <Sparkles className="w-4 h-4 inline mr-2" style={{ strokeWidth: 2 }} />
                Care
              </button>
              
              <button
                onClick={() => setActiveTab("blooms")}
                className={`px-4 py-3 rounded-2xl font-semibold transition-all backdrop-blur-md ${
                  activeTab === "blooms" ? "neuro-accent-raised" : "neuro-button"
                }`}
                style={{ color: activeTab === "blooms" ? "#A7F3D0" : "var(--text-secondary)" }}
              >
                <Flower2 className="w-4 h-4 inline mr-2" style={{ strokeWidth: 2 }} />
                Blooms
              </button>
              
              <button
                onClick={() => setActiveTab("health")}
                className={`px-4 py-3 rounded-2xl font-semibold transition-all backdrop-blur-md ${
                  activeTab === "health" ? "neuro-accent-raised" : "neuro-button"
                }`}
                style={{ color: activeTab === "health" ? "#A7F3D0" : "var(--text-secondary)" }}
              >
                <Activity className="w-4 h-4 inline mr-2" style={{ strokeWidth: 2 }} />
                Health
              </button>
              
              <button
                onClick={() => setActiveTab("pests")}
                className={`px-4 py-3 rounded-2xl font-semibold transition-all backdrop-blur-md ${
                  activeTab === "pests" ? "neuro-button" : "neuro-button"
                }`}
                style={{ 
                  background: activeTab === "pests" 
                    ? "linear-gradient(135deg, rgba(239, 68, 68, 0.25) 0%, rgba(220, 38, 38, 0.2) 100%)"
                    : undefined,
                  color: activeTab === "pests" ? "#FCA5A5" : "var(--text-secondary)",
                  border: activeTab === "pests" ? "1px solid rgba(239, 68, 68, 0.4)" : undefined
                }}
              >
                <Bug className="w-4 h-4 inline mr-2" style={{ strokeWidth: 2 }} />
                Pests
              </button>
              
              <button
                onClick={() => setActiveTab("supplies")}
                className={`px-4 py-3 rounded-2xl font-semibold transition-all backdrop-blur-md ${
                  activeTab === "supplies" ? "neuro-button" : "neuro-button"
                }`}
                style={{ 
                  background: activeTab === "supplies" 
                    ? "linear-gradient(135deg, rgba(251, 146, 60, 0.25) 0%, rgba(249, 115, 22, 0.18) 100%)"
                    : undefined,
                  color: activeTab === "supplies" ? "#FCD34D" : "var(--text-secondary)",
                  border: activeTab === "supplies" ? "1px solid rgba(251, 146, 60, 0.4)" : undefined
                }}
              >
                <Package className="w-4 h-4 inline mr-2" style={{ strokeWidth: 2 }} />
                Supplies
              </button>
              
              <button
                onClick={() => setActiveTab("journal")}
                className={`px-4 py-3 rounded-2xl font-semibold transition-all backdrop-blur-md ${
                  activeTab === "journal" ? "neuro-accent-raised" : "neuro-button"
                }`}
                style={{ color: activeTab === "journal" ? "#F0EBFF" : "var(--text-secondary)" }}
              >
                <BookOpen className="w-4 h-4 inline mr-2" style={{ strokeWidth: 2 }} />
                Journal
              </button>
              
              <button
                onClick={() => setActiveTab("insights")}
                className={`px-4 py-3 rounded-2xl font-semibold transition-all backdrop-blur-md ${
                  activeTab === "insights" ? "neuro-accent-raised" : "neuro-button"
                }`}
                style={{ color: activeTab === "insights" ? "#F0EBFF" : "var(--text-secondary)" }}
              >
                <BarChart3 className="w-4 h-4 inline mr-2" style={{ strokeWidth: 2 }} />
                Insights
              </button>
            </div>
          </div>

          {activeTab === "overview" && (
            <div className="space-y-6">
              <div className="neuro-card rounded-3xl p-6">
                <h2 className="text-xl font-bold mb-6" style={{ 
                  color: "var(--text-primary)",
                  textShadow: "0 1px 3px rgba(32, 24, 51, 0.4)",
                  fontFamily: "'Playfair Display', Georgia, serif"
                }}>
                  Cultivar Information
                </h2>

                <div className="grid sm:grid-cols-2 gap-4">
                  {plant.nickname && (
                    <div>
                      <p className="text-xs font-medium mb-1" style={{ color: "var(--text-muted)", opacity: 0.8 }}>Nickname</p>
                      <p className="font-semibold" style={{ color: "var(--text-primary)" }}>{plant.nickname}</p>
                    </div>
                  )}

                  {plant.avsa_number && (
                    <div>
                      <p className="text-xs font-medium mb-1" style={{ color: "var(--text-muted)", opacity: 0.8 }}>AVSA Number</p>
                      <p className="font-semibold" style={{ color: "var(--text-primary)" }}>#{plant.avsa_number}</p>
                    </div>
                  )}

                  {plant.hybridizer && (
                    <div>
                      <p className="text-xs font-medium mb-1" style={{ color: "var(--text-muted)", opacity: 0.8 }}>Hybridizer</p>
                      <p className="font-semibold" style={{ color: "var(--text-primary)" }}>{plant.hybridizer}</p>
                    </div>
                  )}

                  {plant.year && (
                    <div>
                      <p className="text-xs font-medium mb-1" style={{ color: "var(--text-muted)", opacity: 0.8 }}>Year Introduced</p>
                      <p className="font-semibold" style={{ color: "var(--text-primary)" }}>{plant.year}</p>
                    </div>
                  )}

                  {plant.blossom_type && (
                    <div>
                      <p className="text-xs font-medium mb-1" style={{ color: "var(--text-muted)", opacity: 0.8 }}>Blossom Type</p>
                      <p className="font-semibold capitalize" style={{ color: "#F5F3FF" }}>{plant.blossom_type}</p>
                    </div>
                  )}

                  {plant.blossom_color && (
                    <div>
                      <p className="text-xs font-medium mb-1" style={{ color: "var(--text-muted)", opacity: 0.8 }}>Blossom Color</p>
                      <p className="font-semibold" style={{ color: "var(--text-primary)" }}>{plant.blossom_color}</p>
                    </div>
                  )}

                  {plant.leaf_types && plant.leaf_types.length > 0 && (
                    <div className="sm:col-span-2">
                      <p className="text-xs font-medium mb-2" style={{ color: "#C7C9E6", opacity: 0.8 }}>Leaf Types & Characteristics</p>
                      <div className="flex flex-wrap gap-2">
                        {plant.leaf_types.map((type, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1.5 rounded-xl text-xs font-medium backdrop-blur-xl"
                            style={{
                              background: "linear-gradient(135deg, rgba(168, 159, 239, 0.2) 0%, rgba(154, 226, 211, 0.15) 100%)",
                              border: "1px solid rgba(168, 159, 239, 0.35)",
                              color: "#E9D5FF"
                            }}
                          >
                            {type.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join('-')}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {plant.variegation && (
                    <div>
                      <p className="text-xs font-medium mb-1" style={{ color: "var(--text-muted)", opacity: 0.8 }}>Variegation</p>
                      <p className="font-semibold" style={{ color: "var(--text-primary)" }}>{plant.variegation}</p>
                    </div>
                  )}

                  {plant.acquisition_date && (
                    <div>
                      <p className="text-xs font-medium mb-1" style={{ color: "var(--text-muted)", opacity: 0.8 }}>Acquired</p>
                      <p className="font-semibold" style={{ color: "var(--text-primary)" }}>
                        {new Date(plant.acquisition_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                  )}

                  {plant.source && (
                    <div>
                      <p className="text-xs font-medium mb-1" style={{ color: "var(--text-muted)", opacity: 0.8 }}>Source</p>
                      <p className="font-semibold" style={{ color: "var(--text-primary)" }}>{plant.source}</p>
                    </div>
                  )}

                  {plant.location_id && (
                    <div>
                      <p className="text-xs font-medium mb-2" style={{ color: "#C7C9E6", opacity: 0.8 }}>Location</p>
                      <LocationBadge locationId={plant.location_id} />
                    </div>
                  )}
                </div>
              </div>

              {(seedParent || pollenParent) && (
                <div className="neuro-card rounded-3xl p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Users className="w-5 h-5" style={{ color: "#C4B5FD", strokeWidth: 1.8 }} />
                    <h2 className="text-lg font-bold" style={{ 
                      color: "var(--text-primary)",
                      textShadow: "0 1px 3px rgba(32, 24, 51, 0.4)",
                      fontFamily: "'Playfair Display', Georgia, serif"
                    }}>
                      Lineage
                    </h2>
                  </div>
                  <div className="space-y-3">
                    {seedParent && (
                      <Link to={createPageUrl(`PlantDetail?id=${seedParent.id}`)}>
                        <div className="neuro-button rounded-2xl p-3">
                          <p className="text-xs font-medium mb-1" style={{ color: "var(--text-muted)", opacity: 0.8 }}>
                            Seed Parent (♀)
                          </p>
                          <p className="font-semibold" style={{ color: "var(--text-primary)" }}>
                            {seedParent.cultivar_name}
                          </p>
                        </div>
                      </Link>
                    )}
                    {pollenParent && (
                      <Link to={createPageUrl(`PlantDetail?id=${pollenParent.id}`)}>
                        <div className="neuro-button rounded-2xl p-3">
                          <p className="text-xs font-medium mb-1" style={{ color: "var(--text-muted)", opacity: 0.8 }}>
                            Pollen Parent (♂)
                          </p>
                          <p className="font-semibold" style={{ color: "var(--text-primary)" }}>
                            {pollenParent.cultivar_name}
                          </p>
                        </div>
                      </Link>
                    )}
                  </div>
                </div>
              )}

              <div className="neuro-card rounded-3xl p-6">
                <h2 className="text-xl font-bold mb-6" style={{ 
                  color: "var(--text-primary)",
                  textShadow: "0 1px 3px rgba(32, 24, 51, 0.4)",
                  fontFamily: "'Playfair Display', Georgia, serif"
                }}>
                  Care Settings
                </h2>

                <div className="grid sm:grid-cols-2 gap-4">
                  {plant.pot_size && (
                    <div>
                      <p className="text-xs font-medium mb-1" style={{ color: "var(--text-muted)", opacity: 0.8 }}>Pot Size</p>
                      <p className="font-semibold" style={{ color: "var(--text-primary)" }}>{plant.pot_size}" diameter</p>
                    </div>
                  )}

                  {plant.soil_mix && (
                    <div>
                      <p className="text-xs font-medium mb-1" style={{ color: "var(--text-muted)", opacity: 0.8 }}>Soil Mix</p>
                      <p className="font-semibold" style={{ color: "var(--text-primary)" }}>{plant.soil_mix}</p>
                    </div>
                  )}

                  {plant.watering_interval && (
                    <div>
                      <p className="text-xs font-medium mb-1" style={{ color: "var(--text-muted)", opacity: 0.8 }}>Watering Interval</p>
                      <p className="font-semibold" style={{ color: "var(--text-primary)" }}>Every {plant.watering_interval} days</p>
                    </div>
                  )}

                  {plant.fertilizer_interval && (
                    <div>
                      <p className="text-xs font-medium mb-1" style={{ color: "var(--text-muted)", opacity: 0.8 }}>Fertilizing Interval</p>
                      <p className="font-semibold" style={{ color: "var(--text-primary)" }}>Every {plant.fertilizer_interval} days</p>
                    </div>
                  )}

                  {plant.fertilizer_npk && (
                    <div>
                      <p className="text-xs font-medium mb-1" style={{ color: "var(--text-muted)", opacity: 0.8 }}>Fertilizer (NPK)</p>
                      <p className="font-semibold" style={{ color: "var(--text-primary)" }}>{plant.fertilizer_npk}</p>
                    </div>
                  )}

                  {plant.fertilizer_method && (
                    <div>
                      <p className="text-xs font-medium mb-1" style={{ color: "var(--text-muted)", opacity: 0.8 }}>Fertilizer Method</p>
                      <p className="font-semibold capitalize" style={{ color: "#F5F3FF" }}>{plant.fertilizer_method}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="neuro-card rounded-3xl p-6">
                <h2 className="text-xl font-bold mb-6" style={{ 
                  color: "var(--text-primary)",
                  textShadow: "0 1px 3px rgba(32, 24, 51, 0.4)",
                  fontFamily: "'Playfair Display', Georgia, serif"
                }}>
                  Last Care Activities
                </h2>

                <div className="grid sm:grid-cols-2 gap-4">
                  {plant.last_watered && (
                    <div>
                      <p className="text-xs font-medium mb-1" style={{ color: "var(--text-muted)", opacity: 0.8 }}>Last Watered</p>
                      <p className="font-semibold" style={{ color: "var(--text-primary)" }}>
                        {new Date(plant.last_watered).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                  )}

                  {plant.last_fertilized && (
                    <div>
                      <p className="text-xs font-medium mb-1" style={{ color: "var(--text-muted)", opacity: 0.8 }}>Last Fertilized</p>
                      <p className="font-semibold" style={{ color: "var(--text-primary)" }}>
                        {new Date(plant.last_fertilized).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                  )}

                  {plant.last_repotted && (
                    <div>
                      <p className="text-xs font-medium mb-1" style={{ color: "var(--text-muted)", opacity: 0.8 }}>Last Repotted</p>
                      <p className="font-semibold" style={{ color: "var(--text-primary)" }}>
                        {new Date(plant.last_repotted).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                  )}

                  {plant.last_groomed && (
                    <div>
                      <p className="text-xs font-medium mb-1" style={{ color: "var(--text-muted)", opacity: 0.8 }}>Last Groomed</p>
                      <p className="font-semibold" style={{ color: "var(--text-primary)" }}>
                        {new Date(plant.last_groomed).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {plant.notes && (
                <div className="neuro-card rounded-3xl p-6">
                  <h2 className="text-xl font-bold mb-4" style={{ 
                    color: "var(--text-primary)",
                    textShadow: "0 1px 3px rgba(32, 24, 51, 0.4)",
                    fontFamily: "'Playfair Display', Georgia, serif"
                  }}>
                    Notes
                  </h2>
                  <p className="text-sm whitespace-pre-wrap" style={{ color: "var(--text-secondary)" }}>{plant.notes}</p>
                </div>
              )}

              <button
                onClick={() => navigate(createPageUrl(`EditPlant?id=${plantId}`))}
                className="neuro-accent-raised w-full px-6 py-4 rounded-3xl font-semibold flex items-center justify-center gap-2"
                style={{ color: "#F0EBFF" }}
              >
                <Edit className="w-5 h-5" style={{ strokeWidth: 2 }} />
                Edit Plant Details
              </button>
            </div>
          )}

          {activeTab === "care" && (
            <>
              <div className="neuro-card rounded-3xl p-6">
                <h2 className="text-xl font-bold mb-6" style={{ 
                  color: "var(--text-primary)",
                  textShadow: "0 1px 3px rgba(32, 24, 51, 0.4)",
                  fontFamily: "'Playfair Display', Georgia, serif"
                }}>
                  Activity Timeline
                </h2>
                <PlantTimeline 
                  careLogs={careLogs}
                  healthLogs={healthLogs}
                  bloomLogs={bloomLogs}
                />
              </div>

              <div className="neuro-card rounded-3xl p-6">
                <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                  <h2 className="text-xl font-bold" style={{ 
                    color: "var(--text-primary)",
                    textShadow: "0 1px 3px rgba(32, 24, 51, 0.4)",
                    fontFamily: "'Playfair Display', Georgia, serif"
                  }}>
                    Care History
                  </h2>
                  {careLogs.length > 0 && (
                    <div className="flex items-center gap-2 text-sm" style={{ color: "var(--text-secondary)" }}>
                      {(() => {
                        const filteredCount = careLogs.filter(log => {
                          const typeMatch = careFilterType === "all" || log.care_type === careFilterType;
                          const dateMatch = (!careDateRange.start || new Date(log.care_date) >= new Date(careDateRange.start)) &&
                                          (!careDateRange.end || new Date(log.care_date) <= new Date(careDateRange.end));
                          return typeMatch && dateMatch;
                        }).length;
                        return `${filteredCount} of ${careLogs.length} logs`;
                      })()}
                    </div>
                  )}
                </div>

                {careLogs.length === 0 ? (
                  <EmptyState
                    icon={Sparkles}
                    title="No Care Logs Yet"
                    description="Use the Quick Care buttons above to start logging your care activities."
                    variant="default"
                    size="small"
                  />
                ) : (
                  <>
                    {/* Filters and Sort */}
                    <div className="mb-6 space-y-3">
                      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        <div>
                          <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-muted)" }}>
                            Care Type
                          </label>
                          <select
                            value={careFilterType}
                            onChange={(e) => setCareFilterType(e.target.value)}
                            className="neuro-input w-full px-3 py-2 rounded-xl text-sm"
                            style={{ color: "var(--text-primary)" }}
                          >
                            <option value="all">All Types</option>
                            <option value="watering">Watering</option>
                            <option value="fertilizing">Fertilizing</option>
                            <option value="repotting">Repotting</option>
                            <option value="grooming">Grooming</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-muted)" }}>
                            Start Date
                          </label>
                          <input
                            type="date"
                            value={careDateRange.start}
                            onChange={(e) => setCareDateRange(prev => ({ ...prev, start: e.target.value }))}
                            className="neuro-input w-full px-3 py-2 rounded-xl text-sm"
                            style={{ color: "var(--text-primary)" }}
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-muted)" }}>
                            End Date
                          </label>
                          <input
                            type="date"
                            value={careDateRange.end}
                            onChange={(e) => setCareDateRange(prev => ({ ...prev, end: e.target.value }))}
                            className="neuro-input w-full px-3 py-2 rounded-xl text-sm"
                            style={{ color: "var(--text-primary)" }}
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-muted)" }}>
                            Sort By
                          </label>
                          <select
                            value={careSortBy}
                            onChange={(e) => setCareSortBy(e.target.value)}
                            className="neuro-input w-full px-3 py-2 rounded-xl text-sm"
                            style={{ color: "var(--text-primary)" }}
                          >
                            <option value="date-desc">Newest First</option>
                            <option value="date-asc">Oldest First</option>
                            <option value="type-asc">Type (A-Z)</option>
                            <option value="type-desc">Type (Z-A)</option>
                          </select>
                        </div>
                      </div>

                      {(careFilterType !== "all" || careDateRange.start || careDateRange.end) && (
                        <button
                          onClick={() => {
                            setCareFilterType("all");
                            setCareDateRange({ start: "", end: "" });
                          }}
                          className="mt-3 text-sm font-medium hover:opacity-80 transition-opacity"
                          style={{ color: "var(--accent)" }}
                        >
                          Clear Filters
                        </button>
                      )}
                    </div>

                    {/* Care Logs List */}
                    <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                      {(() => {
                        const filtered = careLogs.filter(log => {
                          const typeMatch = careFilterType === "all" || log.care_type === careFilterType;
                          const dateMatch = (!careDateRange.start || new Date(log.care_date) >= new Date(careDateRange.start)) &&
                                          (!careDateRange.end || new Date(log.care_date) <= new Date(careDateRange.end));
                          return typeMatch && dateMatch;
                        });

                        const sorted = [...filtered].sort((a, b) => {
                          if (careSortBy === "date-desc") {
                            return new Date(b.care_date) - new Date(a.care_date);
                          } else if (careSortBy === "date-asc") {
                            return new Date(a.care_date) - new Date(b.care_date);
                          } else if (careSortBy === "type-asc") {
                            return a.care_type.localeCompare(b.care_type);
                          } else if (careSortBy === "type-desc") {
                            return b.care_type.localeCompare(a.care_type);
                          }
                          return 0;
                        });

                        if (sorted.length === 0) {
                          return (
                            <div className="text-center py-12">
                              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                                No care logs match your filters
                              </p>
                              <button
                                onClick={() => {
                                  setCareFilterType("all");
                                  setCareDateRange({ start: "", end: "" });
                                }}
                                className="mt-3 text-sm font-medium hover:opacity-80 transition-opacity"
                                style={{ color: "var(--accent)" }}
                              >
                                Clear Filters
                              </button>
                            </div>
                          );
                        }

                        return sorted.map(log => (
                          <CareLogItem key={log.id} log={log} plantId={plantId} />
                        ));
                      })()}
                    </div>
                  </>
                )}
              </div>
            </>
          )}

          {activeTab === "blooms" && (
            <div className="neuro-card rounded-3xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold" style={{ 
                  color: "var(--text-primary)",
                  textShadow: "0 1px 3px rgba(32, 24, 51, 0.4)",
                  fontFamily: "'Playfair Display', Georgia, serif"
                }}>
                  Bloom Cycles
                </h2>
                <button
                  onClick={() => setShowBloomForm(true)}
                  className="neuro-accent-raised px-5 py-2.5 rounded-2xl font-semibold flex items-center gap-2"
                  style={{ color: "#A7F3D0" }}
                >
                  <Flower2 className="w-4 h-4" style={{ strokeWidth: 2 }} />
                  <span className="hidden sm:inline">Log Bloom</span>
                </button>
              </div>

              {bloomLogs.length === 0 ? (
                <EmptyState
                  icon={Flower2}
                  title="No Bloom Cycles"
                  description="Document your plant's blooming cycles to track patterns and quality over time."
                  actionText="Log Bloom Cycle"
                  onAction={() => setShowBloomForm(true)}
                  variant="success"
                  size="small"
                />
              ) : (
                <PlantTimeline bloomLogs={bloomLogs} careLogs={[]} healthLogs={[]} />
              )}
            </div>
          )}

          {activeTab === "health" && (
            <div className="neuro-card rounded-3xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold" style={{ 
                  color: "var(--text-primary)",
                  textShadow: "0 1px 3px rgba(32, 24, 51, 0.4)",
                  fontFamily: "'Playfair Display', Georgia, serif"
                }}>
                  Health Observations
                </h2>
                <button
                  onClick={() => setShowHealthForm(true)}
                  className="neuro-accent-raised px-5 py-2.5 rounded-2xl font-semibold flex items-center gap-2"
                  style={{ color: "#A7F3D0" }}
                >
                  <Heart className="w-4 h-4" style={{ strokeWidth: 2 }} />
                  <span className="hidden sm:inline">Log Observation</span>
                </button>
              </div>
              
              {healthLogs.length === 0 ? (
                <EmptyState
                  icon={Heart}
                  title="No Health Observations"
                  description="Track your plant's health status, symptoms, and treatments to monitor its wellbeing."
                  actionText="Add Observation"
                  onAction={() => setShowHealthForm(true)}
                  variant="success"
                  size="small"
                />
              ) : (
                <PlantTimeline healthLogs={healthLogs} careLogs={[]} bloomLogs={[]} />
              )}
            </div>
          )}

          {activeTab === "pests" && (
            <div className="neuro-card rounded-3xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold" style={{ 
                  color: "var(--text-primary)",
                  textShadow: "0 1px 3px rgba(32, 24, 51, 0.4)",
                  fontFamily: "'Playfair Display', Georgia, serif"
                }}>
                  Pests & Diseases
                </h2>
                <button
                  onClick={() => setShowPestDiseaseForm(true)}
                  className="px-5 py-2.5 rounded-2xl font-semibold flex items-center gap-2 backdrop-blur-md"
                  style={{
                    background: "linear-gradient(135deg, rgba(239, 68, 68, 0.3) 0%, rgba(220, 38, 38, 0.2) 100%)",
                    border: "1px solid rgba(239, 68, 68, 0.5)",
                    color: "#FCA5A5",
                    boxShadow: "0 2px 12px rgba(239, 68, 68, 0.3)"
                  }}
                >
                  <Bug className="w-4 h-4" style={{ strokeWidth: 2 }} />
                  <span className="hidden sm:inline">Log Issue</span>
                </button>
              </div>

              <PestDiseaseTimeline logs={pestDiseaseLogs} onEdit={handleEditPestDiseaseLog} />
            </div>
          )}

          {activeTab === "supplies" && (
            <div className="neuro-card rounded-3xl p-6">
              <h2 className="text-xl font-bold mb-6" style={{ 
                color: "var(--text-primary)",
                textShadow: "0 1px 3px rgba(32, 24, 51, 0.4)",
                fontFamily: "'Playfair Display', Georgia, serif"
              }}>
                Supply Usage History
              </h2>

              {plantSupplyUsage.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="w-12 h-12 mx-auto mb-3" style={{ color: "#C4B5FD", opacity: 0.5 }} />
                  <p style={{ color: "var(--text-secondary)" }}>No supply usage recorded yet</p>
                  <p className="text-sm mt-2" style={{ color: "var(--text-secondary)", opacity: 0.7 }}>
                    Track supplies when logging care actions
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {plantSupplyUsage.map(log => {
                    const supply = supplies.find(s => s.id === log.supply_id);
                    return (
                      <div key={log.id} className="neuro-button rounded-2xl p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <Link to={createPageUrl(`SupplyDetail?id=${log.supply_id}`)}>
                              <h4 className="font-semibold hover:opacity-80 transition-opacity" style={{ color: "var(--text-primary)" }}>
                                {supply?.name || "Unknown Supply"}
                              </h4>
                            </Link>
                            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                              Used {log.quantity_used} {supply?.unit || ''}
                            </p>
                          </div>
                          <p className="text-xs" style={{ color: "var(--text-secondary)", opacity: 0.8 }}>
                            {new Date(log.usage_date).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric', 
                              year: 'numeric'
                            })}
                          </p>
                        </div>
                        {log.purpose && (
                          <p className="text-sm" style={{ color: "var(--text-secondary)", opacity: 0.8 }}>
                            {log.purpose}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === "journal" && (
            <div className="neuro-card rounded-3xl p-6">
              <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
                <h2 className="text-xl font-bold" style={{ 
                  color: "var(--text-primary)",
                  textShadow: "0 1px 3px rgba(32, 24, 51, 0.4)",
                  fontFamily: "'Playfair Display', Georgia, serif"
                }}>
                  Plant Journal
                </h2>
                <button
                  onClick={() => setShowJournalForm(true)}
                  className="neuro-accent-raised px-5 py-2.5 rounded-2xl font-semibold flex items-center gap-2"
                  style={{ color: "#F0EBFF" }}
                >
                  <BookOpen className="w-4 h-4" style={{ strokeWidth: 2 }} />
                  <span className="hidden sm:inline">New Entry</span>
                </button>
              </div>
              
              {journalEntries.length === 0 ? (
                <EmptyState
                  icon={BookOpen}
                  title="Start Your Plant Journal"
                  description="Document growth milestones, observations, and experiments for this plant."
                  actionText="Write First Entry"
                  onAction={() => setShowJournalForm(true)}
                  variant="default"
                  size="small"
                />
              ) : (
                <div className="space-y-4">
                  {journalEntries.map(entry => (
                    <div key={entry.id} className="neuro-card rounded-3xl p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          {entry.title && (
                            <h3 className="font-bold mb-1" style={{ color: "var(--text-primary)" }}>
                              {entry.title}
                            </h3>
                          )}
                          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                            {new Date(entry.entry_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                          </p>
                        </div>
                        <button
                          onClick={() => handleEditJournal(entry)}
                          className="neuro-button w-9 h-9 rounded-xl flex items-center justify-center"
                          style={{ color: "#C4B5FD" }}
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-sm whitespace-pre-wrap" style={{ color: "var(--text-secondary)" }}>
                        {entry.content}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "insights" && (
            <>
              <PlantAge plant={plant} careLogs={careLogs} />
              
              <div className="neuro-card rounded-3xl p-6">
                <h2 className="text-xl font-bold mb-4" style={{ 
                  color: "var(--text-primary)",
                  textShadow: "0 1px 3px rgba(32, 24, 51, 0.4)",
                  fontFamily: "'Playfair Display', Georgia, serif"
                }}>
                  Care Frequency Analysis
                </h2>
                <CareFrequencyStats careLogs={careLogs} />
              </div>

              <WateringFrequencyChart careLogs={careLogs} />

              <HealthSummary healthLogs={healthLogs} />
            </>
          )}
        </div>
      </div>

      {showHealthForm && (
        <HealthLogForm
          plantId={plantId}
          onClose={() => setShowHealthForm(false)}
        />
      )}

      {showJournalForm && (
        <JournalEntryForm
          plantId={plantId}
          entry={editingJournalEntry}
          onClose={handleCloseJournalForm}
        />
      )}

      {showPhotoGallery && (
        <PlantPhotoGallery
          plant={plant}
          onClose={() => setShowPhotoGallery(false)}
        />
      )}

      {showBloomForm && (
        <BloomLogForm
          plantId={plantId}
          onClose={() => setShowBloomForm(false)}
        />
      )}

      {showPestDiseaseForm && (
        <PestDiseaseLogForm
          plantId={plantId}
          log={editingPestDiseaseLog}
          onClose={handleClosePestDiseaseForm}
        />
      )}
      
      <BackToTop threshold={300} />
    </div>
  );
}
