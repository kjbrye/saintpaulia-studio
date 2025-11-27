
import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Beaker, Library, ArrowRight, Star, TrendingUp, Calendar, Droplets, Plus, User, BarChart3, Bug, Package, Flower2, Info } from "lucide-react";
import StatsCard from "../components/plants/StatsCard";
import RecentActivityWidget from "../components/dashboard/RecentActivityWidget";
import ContextualTooltip from "../components/onboarding/ContextualTooltip";
import { useTooltips } from "../components/onboarding/TooltipManager";
import EmptyState from "../components/shared/EmptyState";

const LOGO_URL = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/690e3cd78523fb5fba0a8466/632f6e485_PlantLogos.png";

const getCareStatus = (lastCareDate, daysThreshold) => {
  if (!lastCareDate) return { status: "overdue", days: null };
  const daysSince = Math.floor((new Date() - new Date(lastCareDate)) / (1000 * 60 * 60 * 24));
  if (daysSince >= daysThreshold) return { status: "overdue", days: daysSince };
  if (daysSince >= daysThreshold * 0.8) return { status: "soon", days: daysSince };
  return { status: "good", days: daysSince };
};

export default function Collection() {
  const { isTooltipDismissed, dismissTooltip } = useTooltips();

  const { data: plants = [] } = useQuery({
    queryKey: ['plants'],
    queryFn: () => base44.entities.Plant.list('-updated_date'),
    initialData: []
  });

  const { data: projects = [] } = useQuery({
    queryKey: ['hybridizationProjects'],
    queryFn: () => base44.entities.HybridizationProject.list(),
    initialData: []
  });

  const { data: careLogs = [] } = useQuery({
    queryKey: ['recentCareLogs'],
    queryFn: () => base44.entities.CareLog.list('-care_date', 30),
    initialData: []
  });

  const { data: bloomLogs = [] } = useQuery({
    queryKey: ['recentBloomLogs'],
    queryFn: () => base44.entities.BloomLog.list('-bloom_start_date', 10),
    initialData: []
  });

  const { data: healthLogs = [] } = useQuery({
    queryKey: ['recentHealthLogs'],
    queryFn: () => base44.entities.HealthLog.list('-observation_date', 20),
    initialData: []
  });

  const { data: journalEntries = [] } = useQuery({
    queryKey: ['recentJournalEntries'],
    queryFn: () => base44.entities.JournalEntry.list('-entry_date', 20),
    initialData: []
  });

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: allPestDiseaseLogs = [] } = useQuery({
    queryKey: ['allPestDiseaseLogs'],
    queryFn: () => base44.entities.PestDiseaseLog.list('-date_observed', 50),
    initialData: []
  });

  const { data: supplies = [] } = useQuery({
    queryKey: ['supplies'],
    queryFn: () => base44.entities.Supply.list(),
    initialData: []
  });

  const widgets = currentUser?.dashboard_widgets || {
    collection_stats: true,
    care_overview: true,
    plants_needing_care: true,
    active_issues: true,
    low_stock_supplies: true,
    currently_blooming: true,
    recent_activity: true,
    quick_actions: true,
    care_calendar: false,
    collection_growth: false
  };

  const plantsNeedingCare = plants.filter((plant) => {
    const wateringStatus = getCareStatus(plant.last_watered, 7);
    const fertilizingStatus = getCareStatus(plant.last_fertilized, 14);
    const groomingStatus = getCareStatus(plant.last_groomed, 7);

    return wateringStatus.status === "overdue" ||
    fertilizingStatus.status === "overdue" ||
    groomingStatus.status === "overdue";
  });

  const plantsWithActiveIssues = plants.filter((plant) => {
    return allPestDiseaseLogs.some((log) =>
    log.plant_id === plant.id && (
    log.status === "active" || log.status === "treating")
    );
  }).map((plant) => {
    const plantIssues = allPestDiseaseLogs.filter((log) =>
    log.plant_id === plant.id && (
    log.status === "active" || log.status === "treating")
    );
    return { plant, issues: plantIssues };
  });

  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const careThisMonth = careLogs.filter((log) =>
  new Date(log.care_date) >= firstDayOfMonth
  ).length;

  const currentlyBlooming = bloomLogs.filter((log) => {
    if (!log.bloom_start_date) return false;
    const startDate = new Date(log.bloom_start_date);
    const endDate = log.bloom_end_date ? new Date(log.bloom_end_date) : null;
    return startDate <= now && (!endDate || endDate >= now);
  });

  const activeProjects = projects.filter((p) => p.status === "active").length;
  const displayName = currentUser?.username || currentUser?.full_name || currentUser?.email?.split('@')[0] || 'User';
  const lowStockSupplies = supplies.filter((s) => s.quantity <= s.minimum_quantity);

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12">
          <div className="flex items-center justify-between gap-6 mb-8">
            <div className="flex items-center gap-6">
              <div className="neuro-icon-well w-20 h-20 rounded-3xl flex items-center justify-center p-2">
                <img
                  src={LOGO_URL}
                  alt="Saintpaulia Studio Logo"
                  className="w-full h-full object-contain" />

              </div>
              <div className="flex-1">
                <h1 className="text-4xl font-bold" style={{
                  color: 'var(--text-primary)',
                  textShadow: '0 2px 4px rgba(32, 24, 51, 0.4)',
                  fontFamily: "'Playfair Display', Georgia, serif"
                }}>
                  Saintpaulia Studio
                </h1>
                <p className="text-muted mt-1" style={{ color: 'var(--text-secondary)' }}>
                  Your African violet collection & breeding studio
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <Link to={createPageUrl("ProfileSettings")}>
                <button className="neuro-button px-5 py-4 rounded-2xl font-semibold flex items-center gap-3 group">
                  <div className="w-11 h-11 rounded-full overflow-hidden neuro-icon-well">
                    {currentUser?.profile_picture ?
                    <img
                      src={currentUser.profile_picture}
                      alt={displayName}
                      className="w-full h-full object-cover" /> :


                    <div className="w-full h-full flex items-center justify-center">
                        <User className="w-5 h-5" style={{ color: "#C4B5FD", strokeWidth: 2 }} />
                      </div>
                    }
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                      {displayName}
                    </p>
                    <p className="text-xs" style={{ color: "var(--text-muted)", opacity: 0.7 }}>Profile and Settings

                    </p>
                  </div>
                </button>
              </Link>

            </div>
          </div>

          <div className="mb-8 h-px backdrop-blur-xl"
          style={{
            background: "linear-gradient(90deg, rgba(227, 201, 255, 0) 0%, rgba(227, 201, 255, 0.4) 50%, rgba(227, 201, 255, 0) 100%)",
            boxShadow: "0 1px 2px rgba(168, 159, 239, 0.1), 0 -1px 2px rgba(168, 159, 239, 0.05)"
          }} />


          {widgets.quick_actions &&
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-4">
              {!isTooltipDismissed('library-button') && plants.length >= 3 ?
            <ContextualTooltip
              id="library-button"
              title="Your Plant Library"
              description="View, search, filter, and manage all your plants in one place. Perfect for large collections!"
              position="bottom"
              onDismiss={dismissTooltip}
              delay={1000}>

                  <Link to={createPageUrl("PlantLibrary")}>
                <button className="neuro-button w-full px-6 py-5 rounded-3xl font-semibold flex items-center justify-between gap-2"
                style={{ color: 'var(--text-secondary)' }}>
                  <div className="flex items-center gap-3">
                    <Library className="w-5 h-5" style={{ strokeWidth: 2 }} />
                    <span>Library</span>
                  </div>
                  <ArrowRight className="w-5 h-5" style={{ strokeWidth: 2 }} />
                </button>
              </Link>
                </ContextualTooltip> :

            <Link to={createPageUrl("PlantLibrary")}>
                <button className="neuro-button w-full px-6 py-5 rounded-3xl font-semibold flex items-center justify-between gap-2"
              style={{ color: 'var(--text-secondary)' }}>
                  <div className="flex items-center gap-3">
                    <Library className="w-5 h-5" style={{ strokeWidth: 2 }} />
                    <span>Library</span>
                  </div>
                  <ArrowRight className="w-5 h-5" style={{ strokeWidth: 2 }} />
                </button>
              </Link>
            }
              
              {!isTooltipDismissed('calendar-button') && careLogs.length >= 5 ?
            <ContextualTooltip
              id="calendar-button"
              title="Care Calendar"
              description="See all your upcoming and past care tasks in a beautiful calendar view. Never miss a watering day!"
              position="bottom"
              onDismiss={dismissTooltip}
              delay={1500}>

                  <Link to={createPageUrl("CareCalendar")}>
                <button className="neuro-button w-full px-6 py-5 rounded-3xl font-semibold flex items-center justify-between gap-2"
                style={{ color: 'var(--text-secondary)' }}>
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5" style={{ strokeWidth: 2 }} />
                    <span>Calendar</span>
                  </div>
                  <ArrowRight className="w-5 h-5" style={{ strokeWidth: 2 }} />
                </button>
              </Link>
                </ContextualTooltip> :

            <Link to={createPageUrl("CareCalendar")}>
                <button className="neuro-button w-full px-6 py-5 rounded-3xl font-semibold flex items-center justify-between gap-2"
              style={{ color: 'var(--text-secondary)' }}>
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5" style={{ strokeWidth: 2 }} />
                    <span>Calendar</span>
                  </div>
                  <ArrowRight className="w-5 h-5" style={{ strokeWidth: 2 }} />
                </button>
              </Link>
            }
              
              <Link to={createPageUrl("Projects")}>
                <button className="neuro-button w-full px-6 py-5 rounded-3xl font-semibold flex items-center justify-between gap-2"
              style={{ color: 'var(--text-secondary)' }}>
                  <div className="flex items-center gap-3">
                    <Beaker className="w-5 h-5" style={{ strokeWidth: 2 }} />
                    <span>Projects</span>
                  </div>
                  <ArrowRight className="w-5 h-5" style={{ strokeWidth: 2 }} />
                </button>
              </Link>
              <Link to={createPageUrl("AnalyticsDashboard")}>
                <button className="neuro-button w-full px-6 py-5 rounded-3xl font-semibold flex items-center justify-between gap-2"
              style={{ color: 'var(--text-secondary)' }}>
                  <div className="flex items-center gap-3">
                    <BarChart3 className="w-5 h-5" style={{ strokeWidth: 2 }} />
                    <span>Analytics</span>
                  </div>
                  <ArrowRight className="w-5 h-5" style={{ strokeWidth: 2 }} />
                </button>
              </Link>
              <Link to={createPageUrl("Wishlist")}>
                <button className="neuro-button w-full px-6 py-5 rounded-3xl font-semibold flex items-center justify-between gap-2"
              style={{ color: 'var(--text-secondary)' }}>
                  <div className="flex items-center gap-3">
                    <Star className="w-5 h-5" style={{ strokeWidth: 2 }} />
                    <span>Wishlist</span>
                  </div>
                  <ArrowRight className="w-5 h-5" style={{ strokeWidth: 2 }} />
                </button>
              </Link>
              <Link to={createPageUrl("SupplyInventory")}>
                <button className="neuro-button w-full px-6 py-5 rounded-3xl font-semibold flex items-center justify-between gap-2"
              style={{ color: 'var(--text-secondary)' }}>
                  <div className="flex items-center gap-3">
                    <Package className="w-5 h-5" style={{ strokeWidth: 2 }} />
                    <span>Supplies</span>
                  </div>
                  <ArrowRight className="w-5 h-5" style={{ strokeWidth: 2 }} />
                </button>
              </Link>
              <Link to={createPageUrl("Info")}>
                <button className="neuro-button w-full px-6 py-5 rounded-3xl font-semibold flex items-center justify-between gap-2"
              style={{ color: 'var(--text-secondary)' }}>
                  <div className="flex items-center gap-3">
                    <Info className="w-5 h-5" style={{ strokeWidth: 2 }} />
                    <span>Info</span>
                  </div>
                  <ArrowRight className="w-5 h-5" style={{ strokeWidth: 2 }} />
                </button>
              </Link>
            </div>
          }
        </div>

        {/* Stats Cards */}
        {widgets.collection_stats &&
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <StatsCard
            title="Total Plants"
            value={plants.length}
            gradient="lavender" />

            <StatsCard
            title="Hybrid Projects"
            value={projects.length}
            gradient="lavender" />

            
            {!isTooltipDismissed('add-plant-card') && plants.length === 0 ?
          <ContextualTooltip
            id="add-plant-card"
            title="Add Your First Plant"
            description="Start your African violet journey by adding your first plant. Track cultivar details, photos, and care schedules all in one place."
            position="bottom"
            actionText="Add Plant Now"
            onAction={() => window.location.href = createPageUrl("AddPlant")}
            onDismiss={dismissTooltip}>

                <Link to={createPageUrl("AddPlant")}>
                  <div className="neuro-accent-raised rounded-3xl p-8 cursor-pointer group h-full flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 neuro-icon-well group-hover:scale-110 transition-transform"
                style={{
                  background: "rgba(255, 255, 255, 0.1)",
                  border: "1px solid rgba(255, 255, 255, 0.2)"
                }}>
                      <Plus className="w-8 h-8" style={{ color: "#F0EBFF", strokeWidth: 2.5 }} />
                    </div>
                    <p className="text-lg font-bold" style={{
                  color: "#F0EBFF",
                  fontFamily: "'Playfair Display', Georgia, serif"
                }}>
                      Add Violet
                    </p>
                    <p className="text-xs mt-1" style={{ color: "#F0EBFF", opacity: 0.8 }}>
                      Expand your collection
                    </p>
                  </div>
                </Link>
              </ContextualTooltip> :

          <Link to={createPageUrl("AddPlant")}>
                <div className="neuro-accent-raised rounded-3xl p-8 cursor-pointer group h-full flex flex-col items-center justify-center text-center">
                  <div className="mb-4 opacity-70 rounded-2xl w-16 h-16 flex items-center justify-center neuro-icon-well group-hover:scale-110 transition-transform"
              style={{
                background: "rgba(255, 255, 255, 0.1)",
                border: "1px solid rgba(255, 255, 255, 0.2)"
              }}>
                    <Plus className="w-8 h-8" style={{ color: "#F0EBFF", strokeWidth: 2.5 }} />
                  </div>
                  <p className="text-lg font-bold" style={{
                color: "#F0EBFF",
                fontFamily: "'Playfair Display', Georgia, serif"
              }}>
                    Add Violet
                  </p>
                  <p className="text-xs mt-1" style={{ color: "#F0EBFF", opacity: 0.8 }}>
                    Expand your collection
                  </p>
                </div>
              </Link>
          }
          </div>
        }

        {/* Main Dashboard Widgets */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Collection Overview */}
          {widgets.care_overview &&
          <div className="neuro-card rounded-3xl p-8">
              <h2 className="text-xl font-bold mb-8 flex items-center gap-2" style={{
              color: "var(--text-primary)",
              textShadow: "var(--heading-shadow)",
              fontFamily: "'Playfair Display', Georgia, serif"
            }}>
                <TrendingUp className="w-6 h-6" style={{ color: "var(--accent-glow)", strokeWidth: 1.5 }} />
                Collection Overview
              </h2>

              <div className="space-y-5">
                <div className="neuro-button rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Droplets className="w-5 h-5" style={{ color: "#7DD3FC", strokeWidth: 1.8 }} />
                      <span className="font-semibold" style={{ color: "var(--text-primary)" }}>
                        Care Actions This Month
                      </span>
                    </div>
                    <span className="text-2xl font-bold" style={{
                    color: "var(--accent-secondary)",
                    fontFamily: "'Playfair Display', Georgia, serif"
                  }}>
                      {careThisMonth}
                    </span>
                  </div>
                  <p className="text-xs" style={{ color: "var(--text-secondary)", opacity: 0.8 }}>
                    {careThisMonth === 0 ? "Start caring for your plants to track progress" :
                  careThisMonth < 10 ? "Good start! Keep up the care routine" :
                  careThisMonth < 30 ? "Excellent care activity this month!" :
                  "Amazing dedication to your plants!"}
                  </p>
                </div>

                {widgets.currently_blooming && currentlyBlooming.length > 0 &&
              <div className="neuro-button rounded-2xl p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">🌸</span>
                        <span className="font-semibold" style={{ color: "var(--text-primary)" }}>
                          Currently Blooming
                        </span>
                      </div>
                      <span className="text-2xl font-bold" style={{
                    color: "var(--accent-primary)",
                    fontFamily: "'Playfair Display', Georgia, serif"
                  }}>
                        {currentlyBlooming.length}
                      </span>
                    </div>
                    <p className="text-xs" style={{ color: "var(--text-secondary)", opacity: 0.8 }}>
                      {currentlyBlooming.length === 1 ? "One plant showing beautiful blooms" :
                  `${currentlyBlooming.length} plants showing beautiful blooms`}
                    </p>
                  </div>
              }

                {activeProjects > 0 &&
              <div className="neuro-button rounded-2xl p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Beaker className="w-5 h-5" style={{ color: "var(--accent-secondary)", strokeWidth: 1.8 }} />
                        <span className="font-semibold" style={{ color: "var(--text-primary)" }}>
                          Active Hybridization
                        </span>
                      </div>
                      <span className="text-2xl font-bold" style={{
                    color: "var(--accent-secondary)",
                    fontFamily: "'Playfair Display', Georgia, serif"
                  }}>
                        {activeProjects}
                      </span>
                    </div>
                    <p className="text-xs" style={{ color: "var(--text-secondary)", opacity: 0.8 }}>
                      {activeProjects === 1 ? "One project in progress" :
                  `${activeProjects} projects in progress`}
                    </p>
                  </div>
              }

                {plants.length === 0 &&
              <EmptyState
                icon={Library}
                title="Begin Your Collection"
                description="Welcome to Saintpaulia Studio! Add your first African violet to start tracking care, growth, and blooming cycles."
                actionText="Add Your First Plant"
                actionLink="AddPlant"
                secondaryActionText="Learn More"
                secondaryActionLink="Info"
                variant="default"
                size="medium" />

              }
              </div>
            </div>
          }

          {/* Plants Needing Attention */}
          {widgets.plants_needing_care &&
          <div className="neuro-card rounded-3xl p-8">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-bold flex items-center gap-2" style={{
                color: "var(--text-primary)",
                textShadow: "0 1px 3px rgba(32, 24, 51, 0.4)",
                fontFamily: "'Playfair Display', Georgia, serif"
              }}>
                  <Calendar className="w-6 h-6" style={{ color: "#FCD34D", strokeWidth: 1.5 }} />
                  Need Attention
                </h2>
                {plantsNeedingCare.length > 0 &&
              <span className="px-3 py-1 rounded-xl text-sm font-semibold neuro-badge"
              style={{ color: "#A7F3D0" }}>
                    {plantsNeedingCare.length}
                  </span>
              }
              </div>

              <div className="space-y-4 max-h-[400px] overflow-y-auto">
                {plantsNeedingCare.length === 0 ?
              <div className="text-center py-14">
                    <div className="neuro-accent-raised w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <span className="text-3xl">✅</span>
                    </div>
                    <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                      All plants are well cared for!
                    </p>
                    <p className="text-xs mt-2" style={{ color: "var(--text-secondary)", opacity: 0.7 }}>
                      Keep up the great work
                    </p>
                  </div> :

              plantsNeedingCare.map((plant) => {
                const wateringStatus = getCareStatus(plant.last_watered, 7);
                const fertilizingStatus = getCareStatus(plant.last_fertilized, 14);
                const groomingStatus = getCareStatus(plant.last_groomed, 7);

                const overdueItems = [];
                if (wateringStatus.status === "overdue") overdueItems.push("Water");
                if (fertilizingStatus.status === "overdue") overdueItems.push("Fertilize");
                if (groomingStatus.status === "overdue") overdueItems.push("Groom");

                return (
                  <Link key={plant.id} to={createPageUrl(`PlantDetail?id=${plant.id}`)}>
                        <div className="neuro-button rounded-2xl p-5">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold" style={{ color: "var(--text-primary)" }}>
                              {plant.nickname || plant.cultivar_name}
                            </h3>
                            <span className="text-xs px-2 py-1 rounded-lg backdrop-blur-xl font-medium"
                        style={{
                          background: "rgba(252, 211, 77, 0.2)",
                          border: "1px solid rgba(252, 211, 77, 0.4)",
                          color: "#FCD34D"
                        }}>
                              {overdueItems.length} overdue
                            </span>
                          </div>
                          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                            {overdueItems.join(", ")}
                          </p>
                        </div>
                      </Link>);

              })
              }
              </div>

              {plantsNeedingCare.length > 0 &&
            <div className="mt-6 pt-6" style={{ borderTop: "1px solid rgba(227, 201, 255, 0.2)" }}>
                  <Link to={createPageUrl("PlantLibrary")}>
                    <button className="neuro-button w-full px-4 py-3 rounded-2xl font-semibold"
                style={{ color: "var(--text-secondary)" }}>
                      View All Plants
                    </button>
                  </Link>
                </div>
            }
            </div>
          }

          {/* Recent Activity Widget */}
          {widgets.recent_activity &&
          <RecentActivityWidget
            careLogs={careLogs}
            healthLogs={healthLogs}
            journalEntries={journalEntries}
            bloomLogs={bloomLogs}
            plants={plants} />

          }

          {/* Currently Blooming Widget */}
          {widgets.currently_blooming && currentlyBlooming.length > 0 &&
          <div className="neuro-card rounded-3xl p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold flex items-center gap-2" style={{
                color: "var(--text-primary)",
                textShadow: "var(--heading-shadow)",
                fontFamily: "'Playfair Display', Georgia, serif"
              }}>
                  <Flower2 className="w-6 h-6" style={{ color: "#F0ABFC", strokeWidth: 1.5 }} />
                  Currently Blooming
                </h2>
                <span className="px-3 py-1 rounded-xl text-sm font-semibold neuro-badge"
              style={{ color: "var(--accent-secondary)" }}>
                  {currentlyBlooming.length}
                </span>
              </div>

              <div className="space-y-3">
                {currentlyBlooming.slice(0, 5).map((bloomLog) => {
                const plant = plants.find((p) => p.id === bloomLog.plant_id);
                if (!plant) return null;

                return (
                  <Link key={bloomLog.id} to={createPageUrl(`PlantDetail?id=${plant.id}`)}>
                      <div className="neuro-button rounded-2xl p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold" style={{ color: "var(--text-primary)" }}>
                            {plant.nickname || plant.cultivar_name}
                          </h3>
                          <span className="text-2xl">🌸</span>
                        </div>
                        <p className="text-sm" style={{ color: "var(--text-secondary)", opacity: 0.8 }}>
                          Started {new Date(bloomLog.bloom_start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          {bloomLog.flower_count && ` • ${bloomLog.flower_count} flowers`}
                        </p>
                      </div>
                    </Link>);

              })}
              </div>
            </div>
          }
        </div>

        {/* Low Stock Supplies Widget */}
        {widgets.low_stock_supplies && lowStockSupplies.length > 0 &&
        <div className="mt-8">
            <div className="rounded-3xl p-8 backdrop-blur-md"
          style={{
            background: "linear-gradient(135deg, rgba(251, 146, 60, 0.15) 0%, rgba(249, 115, 22, 0.1) 100%)",
            border: "1px solid rgba(251, 146, 60, 0.3)",
            boxShadow: "0 4px 16px rgba(251, 146, 60, 0.2)"
          }}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold flex items-center gap-2" style={{
                color: "#FCD34D",
                fontFamily: "'Playfair Display', Georgia, serif"
              }}>
                  <Package className="w-6 h-6" style={{ strokeWidth: 1.5 }} />
                  Supplies Running Low
                </h2>
                <span className="px-3 py-1 rounded-xl text-sm font-semibold backdrop-blur-xl"
              style={{
                background: "rgba(251, 146, 60, 0.3)",
                border: "1px solid rgba(251, 146, 60, 0.5)",
                color: "#FCD34D"
              }}>
                  {lowStockSupplies.length}
                </span>
              </div>

              <div className="space-y-3">
                {lowStockSupplies.slice(0, 5).map((supply) =>
              <Link key={supply.id} to={createPageUrl(`SupplyDetail?id=${supply.id}`)}>
                    <div className="neuro-button rounded-2xl p-5"
                style={{
                  background: "rgba(0, 0, 0, 0.2)",
                  border: "1px solid rgba(251, 146, 60, 0.3)"
                }}>
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold" style={{ color: "var(--text-primary)" }}>
                          {supply.name}
                        </h3>
                        <span className="text-xs px-2 py-1 rounded-lg backdrop-blur-xl font-medium"
                    style={{
                      background: "rgba(251, 146, 60, 0.3)",
                      border: "1px solid rgba(251, 146, 60, 0.5)",
                      color: "#FCD34D"
                    }}>
                          {supply.quantity} {supply.unit} left
                        </span>
                      </div>
                      <p className="text-sm" style={{ color: "var(--text-secondary)", opacity: 0.8 }}>
                        {supply.category?.replace(/_/g, ' ') || 'General'} • Min: {supply.minimum_quantity} {supply.unit}
                      </p>
                    </div>
                  </Link>
              )}
              </div>

              {lowStockSupplies.length > 5 &&
            <div className="mt-6 pt-6" style={{ borderTop: "1px solid rgba(251, 146, 60, 0.2)" }}>
                  <Link to={createPageUrl("SupplyInventory")}>
                    <button className="neuro-button w-full px-4 py-3 rounded-2xl font-semibold"
                style={{ color: "var(--text-secondary)" }}>
                      View All Low Stock Items ({lowStockSupplies.length})
                    </button>
                  </Link>
                </div>
            }
            </div>
          </div>
        }

        {/* Plants with Active Issues Widget */}
        {widgets.active_issues && plantsWithActiveIssues.length > 0 &&
        <div className="mt-8">
            <div className="rounded-3xl p-8 backdrop-blur-md"
          style={{
            background: "linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(220, 38, 38, 0.1) 100%)",
            border: "1px solid rgba(239, 68, 68, 0.3)",
            boxShadow: "0 4px 16px rgba(239, 68, 68, 0.2)"
          }}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold flex items-center gap-2" style={{
                color: "#FCA5A5",
                fontFamily: "'Playfair Display', Georgia, serif"
              }}>
                  <Bug className="w-6 h-6" style={{ strokeWidth: 1.5 }} />
                  Plants with Active Issues
                </h2>
                <span className="px-3 py-1 rounded-xl text-sm font-semibold backdrop-blur-xl"
              style={{
                background: "rgba(239, 68, 68, 0.3)",
                border: "1px solid rgba(239, 68, 68, 0.5)",
                color: "#FCA5A5"
              }}>
                  {plantsWithActiveIssues.length}
                </span>
              </div>

              <div className="space-y-3">
                {plantsWithActiveIssues.map(({ plant, issues }) =>
              <Link key={plant.id} to={createPageUrl(`PlantDetail?id=${plant.id}`)}>
                    <div className="neuro-button rounded-2xl p-5"
                style={{
                  background: "rgba(0, 0, 0, 0.2)",
                  border: "1px solid rgba(239, 68, 68, 0.3)"
                }}>
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold" style={{ color: "var(--text-primary)" }}>
                          {plant.nickname || plant.cultivar_name}
                        </h3>
                        <span className="text-xs px-2 py-1 rounded-lg backdrop-blur-xl font-medium"
                    style={{
                      background: "rgba(239, 68, 68, 0.3)",
                      border: "1px solid rgba(239, 68, 68, 0.5)",
                      color: "#FCA5A5"
                    }}>
                          {issues.length} {issues.length === 1 ? 'issue' : 'issues'}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {issues.map((issue, idx) =>
                    <span
                      key={idx}
                      className="text-xs px-2 py-1 rounded-lg backdrop-blur-xl"
                      style={{
                        background: "rgba(168, 159, 239, 0.15)",
                        border: "1px solid rgba(168, 159, 239, 0.3)",
                        color: "var(--accent-glow)"
                      }}>

                            {issue.name}
                            {issue.status === "treating" && " (treating)"}
                          </span>
                    )}
                      </div>
                    </div>
                  </Link>
              )}
              </div>
            </div>
          </div>
        }
      </div>
    </div>);

}