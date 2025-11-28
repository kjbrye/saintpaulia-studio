
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Download, FileDown, Image, CheckCircle2, Loader2 } from "lucide-react";
import { createPageUrl } from "@/utils";
import { toast } from "sonner";

const LOGO_URL = "/wax seal.svg";

export default function ExportData() {
  const navigate = useNavigate();
  const [exporting, setExporting] = useState(false);
  const [exportOptions, setExportOptions] = useState({
    plants: true,
    careLogs: true,
    healthLogs: true,
    journalEntries: true,
    bloomLogs: true,
    hybridizationProjects: false,
    wishlist: false
  });

  const { data: plants = [] } = useQuery({
    queryKey: ['plants'],
    queryFn: () => base44.entities.Plant.list(),
    initialData: []
  });

  const { data: careLogs = [] } = useQuery({
    queryKey: ['allCareLogs'],
    queryFn: () => base44.entities.CareLog.list(),
    initialData: []
  });

  const { data: healthLogs = [] } = useQuery({
    queryKey: ['allHealthLogs'],
    queryFn: () => base44.entities.HealthLog.list(),
    initialData: []
  });

  const { data: journalEntries = [] } = useQuery({
    queryKey: ['allJournalEntries'],
    queryFn: () => base44.entities.JournalEntry.list(),
    initialData: []
  });

  const { data: bloomLogs = [] } = useQuery({
    queryKey: ['allBloomLogs'],
    queryFn: () => base44.entities.BloomLog.list(),
    initialData: []
  });

  const { data: projects = [] } = useQuery({
    queryKey: ['allProjects'],
    queryFn: () => base44.entities.HybridizationProject.list(),
    initialData: []
  });

  const { data: wishlist = [] } = useQuery({
    queryKey: ['wishlist'],
    queryFn: () => base44.entities.Wishlist.list(),
    initialData: []
  });

  const toggleOption = (key) => {
    setExportOptions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const arrayToCSV = (data, headers) => {
    if (data.length === 0) return '';
    
    const csvHeaders = headers.join(',');
    const csvRows = data.map(row => {
      return headers.map(header => {
        let value = row[header];
        
        // Handle arrays
        if (Array.isArray(value)) {
          value = value.join('; ');
        }
        
        // Handle objects
        if (value && typeof value === 'object') {
          value = JSON.stringify(value);
        }
        
        // Handle null/undefined
        if (value === null || value === undefined) {
          value = '';
        }
        
        // Convert to string and escape quotes
        value = String(value).replace(/"/g, '""');
        
        // Wrap in quotes if contains comma, newline, or quote
        if (value.includes(',') || value.includes('\n') || value.includes('"')) {
          value = `"${value}"`;
        }
        
        return value;
      }).join(',');
    });
    
    return [csvHeaders, ...csvRows].join('\n');
  };

  const downloadCSV = (csvContent, filename) => {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getPlantName = (plantId) => {
    const plant = plants.find(p => p.id === plantId);
    return plant?.cultivar_name || 'Unknown';
  };

  const handleExportAll = async () => {
    setExporting(true);
    
    try {
      let filesExported = 0;

      // Export Plants
      if (exportOptions.plants && plants.length > 0) {
        const plantsHeaders = [
          'cultivar_name', 'nickname', 'hybridizer', 'year', 'blossom_type', 
          'blossom_color', 'leaf_type', 'variegation', 'acquisition_date', 
          'source', 'location', 'pot_size', 'soil_mix', 'watering_interval',
          'fertilizer_interval', 'fertilizer_npk', 'fertilizer_method', 'notes',
          'last_watered', 'last_fertilized', 'last_repotted', 'last_groomed',
          'created_date', 'id'
        ];
        const plantsCSV = arrayToCSV(plants, plantsHeaders);
        downloadCSV(plantsCSV, 'plants.csv');
        filesExported++;
      }

      // Export Care Logs
      if (exportOptions.careLogs && careLogs.length > 0) {
        const careLogsWithPlantNames = careLogs.map(log => ({
          ...log,
          plant_name: getPlantName(log.plant_id)
        }));
        const careHeaders = [
          'plant_name', 'plant_id', 'care_type', 'care_date', 'watering_method',
          'fertilizer_type', 'new_pot_size', 'new_soil_mix', 'notes', 'created_date', 'id'
        ];
        const careCSV = arrayToCSV(careLogsWithPlantNames, careHeaders);
        downloadCSV(careCSV, 'care-logs.csv');
        filesExported++;
      }

      // Export Health Logs
      if (exportOptions.healthLogs && healthLogs.length > 0) {
        const healthLogsWithPlantNames = healthLogs.map(log => ({
          ...log,
          plant_name: getPlantName(log.plant_id)
        }));
        const healthHeaders = [
          'plant_name', 'plant_id', 'observation_date', 'health_status', 
          'symptoms', 'notes', 'ai_analysis', 'created_date', 'id'
        ];
        const healthCSV = arrayToCSV(healthLogsWithPlantNames, healthHeaders);
        downloadCSV(healthCSV, 'health-logs.csv');
        filesExported++;
      }

      // Export Journal Entries
      if (exportOptions.journalEntries && journalEntries.length > 0) {
        const journalWithPlantNames = journalEntries.map(entry => ({
          ...entry,
          plant_name: getPlantName(entry.plant_id)
        }));
        const journalHeaders = [
          'plant_name', 'plant_id', 'entry_date', 'title', 'content', 
          'tags', 'created_date', 'id'
        ];
        const journalCSV = arrayToCSV(journalWithPlantNames, journalHeaders);
        downloadCSV(journalCSV, 'journal-entries.csv');
        filesExported++;
      }

      // Export Bloom Logs
      if (exportOptions.bloomLogs && bloomLogs.length > 0) {
        const bloomLogsWithPlantNames = bloomLogs.map(log => ({
          ...log,
          plant_name: getPlantName(log.plant_id)
        }));
        const bloomHeaders = [
          'plant_name', 'plant_id', 'bloom_start_date', 'bloom_end_date', 
          'flower_count', 'bloom_quality', 'notes', 'created_date', 'id'
        ];
        const bloomCSV = arrayToCSV(bloomLogsWithPlantNames, bloomHeaders);
        downloadCSV(bloomCSV, 'bloom-logs.csv');
        filesExported++;
      }

      // Export Hybridization Projects
      if (exportOptions.hybridizationProjects && projects.length > 0) {
        const projectsWithPlantNames = projects.map(project => ({
          ...project,
          seed_parent_name: project.seed_parent_id ? getPlantName(project.seed_parent_id) : '',
          pollen_parent_name: project.pollen_parent_id ? getPlantName(project.pollen_parent_id) : ''
        }));
        const projectHeaders = [
          'project_name', 'project_type', 'goal_description', 'seed_parent_name',
          'seed_parent_id', 'pollen_parent_name', 'pollen_parent_id', 'cross_date',
          'expected_traits', 'growing_conditions', 'notes', 'status', 'created_date', 'id'
        ];
        const projectsCSV = arrayToCSV(projectsWithPlantNames, projectHeaders);
        downloadCSV(projectsCSV, 'hybridization-projects.csv');
        filesExported++;
      }

      // Export Wishlist
      if (exportOptions.wishlist && wishlist.length > 0) {
        const wishlistHeaders = [
          'cultivar_name', 'hybridizer', 'priority', 'desired_traits',
          'blossom_type', 'blossom_color', 'leaf_type', 'price_range',
          'sources', 'notes', 'date_added', 'desired_purchase_date',
          'acquired', 'acquired_date', 'id'
        ];
        const wishlistCSV = arrayToCSV(wishlist, wishlistHeaders);
        downloadCSV(wishlistCSV, 'wishlist.csv');
        filesExported++;
      }

      toast.success("Export complete!", {
        description: `${filesExported} ${filesExported === 1 ? 'file' : 'files'} downloaded successfully.`
      });
    } catch (error) {
      console.error('Export error:', error);
      toast.error("Export failed", {
        description: error.message || "Please try again."
      });
    } finally {
      setExporting(false);
    }
  };

  const handleExportPhotos = async () => {
    setExporting(true);
    
    try {
      // Collect all photo URLs from plants
      const allPhotos = [];
      plants.forEach(plant => {
        if (plant.photos && plant.photos.length > 0) {
          plant.photos.forEach((photoUrl, index) => {
            allPhotos.push({
              plantName: plant.cultivar_name,
              photoUrl,
              photoIndex: index + 1
            });
          });
        }
      });

      if (allPhotos.length === 0) {
        toast.error("No photos to export", {
          description: "Your plants don't have any photos yet."
        });
        setExporting(false);
        return;
      }

      // Create a CSV with photo URLs for reference
      const photosCSV = arrayToCSV(
        allPhotos.map(p => ({
          plant_name: p.plantName,
          photo_number: p.photoIndex,
          photo_url: p.photoUrl
        })),
        ['plant_name', 'photo_number', 'photo_url']
      );
      downloadCSV(photosCSV, 'plant-photos-urls.csv');

      toast.success("Photo URLs exported!", {
        description: `${allPhotos.length} photo URLs exported. You can download them individually from the URLs in the CSV file.`
      });
    } catch (error) {
      console.error('Photo export error:', error);
      toast.error("Photo export failed", {
        description: error.message || "Please try again."
      });
    } finally {
      setExporting(false);
    }
  };

  const selectedCount = Object.values(exportOptions).filter(Boolean).length;
  const totalRecords = 
    (exportOptions.plants ? plants.length : 0) +
    (exportOptions.careLogs ? careLogs.length : 0) +
    (exportOptions.healthLogs ? healthLogs.length : 0) +
    (exportOptions.journalEntries ? journalEntries.length : 0) +
    (exportOptions.bloomLogs ? bloomLogs.length : 0) +
    (exportOptions.hybridizationProjects ? projects.length : 0) +
    (exportOptions.wishlist ? wishlist.length : 0);

  // Count total photos
  const totalPhotos = plants.reduce((count, plant) => 
    count + (plant.photos?.length || 0), 0
  );

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate(createPageUrl("Collection"))}
            className="glass-button w-12 h-12 rounded-2xl flex items-center justify-center"
            style={{ color: "var(--accent)" }}
          >
            <ArrowLeft className="w-5 h-5" style={{ strokeWidth: 2 }} />
          </button>
          <div className="flex items-center gap-4">
            <div className="glass-card w-16 h-16 rounded-3xl flex items-center justify-center glow-violet p-2">
              <img 
                src={LOGO_URL} 
                alt="Export Data" 
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h1 className="text-4xl font-bold" style={{ 
                color: 'var(--text-primary)',
                textShadow: 'var(--heading-shadow)',
                fontFamily: "'Playfair Display', Georgia, serif"
              }}>
                Export Data
              </h1>
              <p className="text-muted" style={{ color: 'var(--text-secondary)' }}>
                Download your plant collection data
              </p>
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="glass-accent-moss rounded-3xl p-6 mb-6">
          <div className="flex items-start gap-3">
            <FileDown className="w-6 h-6 flex-shrink-0 mt-0.5" style={{ color: "#A7F3D0", strokeWidth: 1.8 }} />
            <div>
              <h3 className="font-bold mb-2" style={{ color: "#A7F3D0" }}>
                About Data Export
              </h3>
              <p className="text-sm" style={{ color: "#A7F3D0", opacity: 0.9 }}>
                Export your data as CSV (Comma-Separated Values) files that can be opened in Excel, Google Sheets, or any spreadsheet application. 
                Your data remains private and secure - exports are generated locally in your browser.
              </p>
            </div>
          </div>
        </div>

        {/* Export Options */}
        <div className="glass-card rounded-3xl p-6 mb-6">
          <h2 className="text-xl font-bold mb-4" style={{ 
            color: "#F5F3FF",
            textShadow: "0 1px 3px rgba(32, 24, 51, 0.4)",
            fontFamily: "'Playfair Display', Georgia, serif"
          }}>
            Select Data to Export
          </h2>

          <div className="space-y-3">
            <button
              onClick={() => toggleOption('plants')}
              className={`w-full rounded-2xl p-4 flex items-center justify-between transition-all ${
                exportOptions.plants ? "glass-accent-lavender" : "glass-button"
              }`}
            >
              <div className="flex items-center gap-3">
                {exportOptions.plants && (
                  <CheckCircle2 className="w-5 h-5" style={{ 
                    color: "#F0EBFF", 
                    strokeWidth: 2 
                  }} />
                )}
                <div className="text-left">
                  <p className="font-semibold" style={{ 
                    color: exportOptions.plants ? "#F0EBFF" : "#F5F3FF" 
                  }}>
                    Plant Collection
                  </p>
                  <p className="text-xs" style={{ 
                    color: exportOptions.plants ? "#F0EBFF" : "#DDD6FE",
                    opacity: 0.8
                  }}>
                    All plant details, cultivar info, and care settings
                  </p>
                </div>
              </div>
              <span className="text-sm font-semibold" style={{ 
                color: exportOptions.plants ? "#F0EBFF" : "#DDD6FE" 
              }}>
                {plants.length} {plants.length === 1 ? 'plant' : 'plants'}
              </span>
            </button>

            <button
              onClick={() => toggleOption('careLogs')}
              className={`w-full rounded-2xl p-4 flex items-center justify-between transition-all ${
                exportOptions.careLogs ? "glass-accent-lavender" : "glass-button"
              }`}
            >
              <div className="flex items-center gap-3">
                {exportOptions.careLogs && (
                  <CheckCircle2 className="w-5 h-5" style={{ 
                    color: "#F0EBFF", 
                    strokeWidth: 2 
                  }} />
                )}
                <div className="text-left">
                  <p className="font-semibold" style={{ 
                    color: exportOptions.careLogs ? "#F0EBFF" : "#F5F3FF" 
                  }}>
                    Care Logs
                  </p>
                  <p className="text-xs" style={{ 
                    color: exportOptions.careLogs ? "#F0EBFF" : "#DDD6FE",
                    opacity: 0.8
                  }}>
                    Watering, fertilizing, repotting, and grooming records
                  </p>
                </div>
              </div>
              <span className="text-sm font-semibold" style={{ 
                color: exportOptions.careLogs ? "#F0EBFF" : "#DDD6FE" 
              }}>
                {careLogs.length} {careLogs.length === 1 ? 'record' : 'records'}
              </span>
            </button>

            <button
              onClick={() => toggleOption('healthLogs')}
              className={`w-full rounded-2xl p-4 flex items-center justify-between transition-all ${
                exportOptions.healthLogs ? "glass-accent-lavender" : "glass-button"
              }`}
            >
              <div className="flex items-center gap-3">
                {exportOptions.healthLogs && (
                  <CheckCircle2 className="w-5 h-5" style={{ 
                    color: "#F0EBFF", 
                    strokeWidth: 2 
                  }} />
                )}
                <div className="text-left">
                  <p className="font-semibold" style={{ 
                    color: exportOptions.healthLogs ? "#F0EBFF" : "#F5F3FF" 
                  }}>
                    Health Observations
                  </p>
                  <p className="text-xs" style={{ 
                    color: exportOptions.healthLogs ? "#F0EBFF" : "#DDD6FE",
                    opacity: 0.8
                  }}>
                    Health status, symptoms, and AI analysis
                  </p>
                </div>
              </div>
              <span className="text-sm font-semibold" style={{ 
                color: exportOptions.healthLogs ? "#F0EBFF" : "#DDD6FE" 
              }}>
                {healthLogs.length} {healthLogs.length === 1 ? 'log' : 'logs'}
              </span>
            </button>

            <button
              onClick={() => toggleOption('journalEntries')}
              className={`w-full rounded-2xl p-4 flex items-center justify-between transition-all ${
                exportOptions.journalEntries ? "glass-accent-lavender" : "glass-button"
              }`}
            >
              <div className="flex items-center gap-3">
                {exportOptions.journalEntries && (
                  <CheckCircle2 className="w-5 h-5" style={{ 
                    color: "#F0EBFF", 
                    strokeWidth: 2 
                  }} />
                )}
                <div className="text-left">
                  <p className="font-semibold" style={{ 
                    color: exportOptions.journalEntries ? "#F0EBFF" : "#F5F3FF" 
                  }}>
                    Journal Entries
                  </p>
                  <p className="text-xs" style={{ 
                    color: exportOptions.journalEntries ? "#F0EBFF" : "#DDD6FE",
                    opacity: 0.8
                  }}>
                    Personal notes and observations
                  </p>
                </div>
              </div>
              <span className="text-sm font-semibold" style={{ 
                color: exportOptions.journalEntries ? "#F0EBFF" : "#DDD6FE" 
              }}>
                {journalEntries.length} {journalEntries.length === 1 ? 'entry' : 'entries'}
              </span>
            </button>

            <button
              onClick={() => toggleOption('bloomLogs')}
              className={`w-full rounded-2xl p-4 flex items-center justify-between transition-all ${
                exportOptions.bloomLogs ? "glass-accent-lavender" : "glass-button"
              }`}
            >
              <div className="flex items-center gap-3">
                {exportOptions.bloomLogs && (
                  <CheckCircle2 className="w-5 h-5" style={{ 
                    color: "#F0EBFF", 
                    strokeWidth: 2 
                  }} />
                )}
                <div className="text-left">
                  <p className="font-semibold" style={{ 
                    color: exportOptions.bloomLogs ? "#F0EBFF" : "#F5F3FF" 
                  }}>
                    Bloom Cycles
                  </p>
                  <p className="text-xs" style={{ 
                    color: exportOptions.bloomLogs ? "#F0EBFF" : "#DDD6FE",
                    opacity: 0.8
                  }}>
                    Flowering records and bloom quality
                  </p>
                </div>
              </div>
              <span className="text-sm font-semibold" style={{ 
                color: exportOptions.bloomLogs ? "#F0EBFF" : "#DDD6FE" 
              }}>
                {bloomLogs.length} {bloomLogs.length === 1 ? 'cycle' : 'cycles'}
              </span>
            </button>

            <button
              onClick={() => toggleOption('hybridizationProjects')}
              className={`w-full rounded-2xl p-4 flex items-center justify-between transition-all ${
                exportOptions.hybridizationProjects ? "glass-accent-lavender" : "glass-button"
              }`}
            >
              <div className="flex items-center gap-3">
                {exportOptions.hybridizationProjects && (
                  <CheckCircle2 className="w-5 h-5" style={{ 
                    color: "#F0EBFF", 
                    strokeWidth: 2 
                  }} />
                )}
                <div className="text-left">
                  <p className="font-semibold" style={{ 
                    color: exportOptions.hybridizationProjects ? "#F0EBFF" : "#F5F3FF" 
                  }}>
                    Hybridization Projects
                  </p>
                  <p className="text-xs" style={{ 
                    color: exportOptions.hybridizationProjects ? "#F0EBFF" : "#DDD6FE",
                    opacity: 0.8
                  }}>
                    Breeding projects and expected traits
                  </p>
                </div>
              </div>
              <span className="text-sm font-semibold" style={{ 
                color: exportOptions.hybridizationProjects ? "#F0EBFF" : "#DDD6FE" 
              }}>
                {projects.length} {projects.length === 1 ? 'project' : 'projects'}
              </span>
            </button>

            <button
              onClick={() => toggleOption('wishlist')}
              className={`w-full rounded-2xl p-4 flex items-center justify-between transition-all ${
                exportOptions.wishlist ? "glass-accent-lavender" : "glass-button"
              }`}
            >
              <div className="flex items-center gap-3">
                {exportOptions.wishlist && (
                  <CheckCircle2 className="w-5 h-5" style={{ 
                    color: "#F0EBFF", 
                    strokeWidth: 2 
                  }} />
                )}
                <div className="text-left">
                  <p className="font-semibold" style={{ 
                    color: exportOptions.wishlist ? "#F0EBFF" : "#F5F3FF" 
                  }}>
                    Wishlist
                  </p>
                  <p className="text-xs" style={{ 
                    color: exportOptions.wishlist ? "#F0EBFF" : "#DDD6FE",
                    opacity: 0.8
                  }}>
                    Plants you're planning to acquire
                  </p>
                </div>
              </div>
              <span className="text-sm font-semibold" style={{ 
                color: exportOptions.wishlist ? "#F0EBFF" : "#DDD6FE" 
              }}>
                {wishlist.length} {wishlist.length === 1 ? 'item' : 'items'}
              </span>
            </button>
          </div>
        </div>

        {/* Summary */}
        <div className="glass-card rounded-3xl p-6 mb-6">
          <h3 className="font-bold mb-3" style={{ color: "var(--text-primary)" }}>
            Export Summary
          </h3>
          <div className="space-y-2 text-sm" style={{ color: "var(--text-secondary)" }}>
            <div className="flex justify-between">
              <span>Selected categories:</span>
              <span className="font-semibold" style={{ color: "var(--text-primary)" }}>
                {selectedCount}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Total records:</span>
              <span className="font-semibold" style={{ color: "var(--text-primary)" }}>
                {totalRecords}
              </span>
            </div>
            <div className="flex justify-between">
              <span>File format:</span>
              <span className="font-semibold" style={{ color: "var(--text-primary)" }}>
                CSV (Spreadsheet)
              </span>
            </div>
          </div>
        </div>

        {/* Export Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleExportAll}
            disabled={exporting || selectedCount === 0}
            className="glass-accent-lavender w-full px-6 py-4 rounded-3xl font-semibold flex items-center justify-center gap-3 hover:shadow-lg transition-all disabled:opacity-50"
            style={{ color: "#F0EBFF" }}
          >
            {exporting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" style={{ strokeWidth: 2 }} />
                Exporting...
              </>
            ) : (
              <>
                <Download className="w-5 h-5" style={{ strokeWidth: 2 }} />
                Export Selected Data
              </>
            )}
          </button>

          {totalPhotos > 0 && (
            <button
              onClick={handleExportPhotos}
              disabled={exporting}
              className="glass-accent-moss w-full px-6 py-4 rounded-3xl font-semibold flex items-center justify-center gap-3 hover:shadow-lg transition-all disabled:opacity-50"
              style={{ color: "#A7F3D0" }}
            >
              {exporting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" style={{ strokeWidth: 2 }} />
                  Exporting...
                </>
              ) : (
                <>
                  <Image className="w-5 h-5" style={{ strokeWidth: 2 }} />
                  Export Photo URLs ({totalPhotos} photos)
                </>
              )}
            </button>
          )}
        </div>

        {/* Help Text */}
        <div className="mt-6 text-center text-xs" style={{ color: "var(--text-secondary)", opacity: 0.7 }}>
          <p>
            Files will download to your default downloads folder.
            <br />
            Open CSV files with Excel, Google Sheets, or any spreadsheet app.
          </p>
        </div>
      </div>
    </div>
  );
}
