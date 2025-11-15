import React, { useState } from "react";
import { format } from "date-fns";
import { BookOpen, Tag, Image as ImageIcon, Calendar, Edit, Trash2, Filter, FileText, Sprout, Bug, Scissors, TrendingUp, AlertTriangle, Eye, Beaker, Sparkles, Plus, X } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const ENTRY_TYPE_CONFIG = {
  general: { label: "General", icon: FileText, color: "#C4B5FD" },
  repotting: { label: "Repotting", icon: Sprout, color: "#A7F3D0" },
  pest_treatment: { label: "Pest Treatment", icon: Bug, color: "#FCA5A5" },
  propagation: { label: "Propagation", icon: Scissors, color: "#9AE2D3" },
  milestone: { label: "Milestone", icon: TrendingUp, color: "#FCD34D" },
  care_change: { label: "Care Change", icon: Sparkles, color: "#E9D5FF" },
  problem: { label: "Problem", icon: AlertTriangle, color: "#FB923C" },
  observation: { label: "Observation", icon: Eye, color: "#7DD3FC" },
  experiment: { label: "Experiment", icon: Beaker, color: "#C084FC" },
  custom: { label: "Custom", icon: Plus, color: "#DDD6FE" }
};

export default function JournalTimeline({ entries, onEdit }) {
  const queryClient = useQueryClient();
  const [selectedTag, setSelectedTag] = useState(null);
  const [selectedType, setSelectedType] = useState(null);
  const [expandedPhotos, setExpandedPhotos] = useState({});

  const deleteMutation = useMutation({
    mutationFn: (entryId) => base44.entities.JournalEntry.delete(entryId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journalEntries'] });
    }
  });

  const handleDelete = (entry) => {
    if (window.confirm("Delete this journal entry?")) {
      deleteMutation.mutate(entry.id);
    }
  };

  // Get all unique tags and types from entries
  const allTags = [...new Set(entries.flatMap(entry => entry.tags || []))];
  const allTypes = [...new Set(entries.map(entry => entry.entry_type || 'general'))];

  // Filter entries by selected tag and type
  const filteredEntries = entries.filter(entry => {
    const tagMatch = !selectedTag || entry.tags?.includes(selectedTag);
    const typeMatch = !selectedType || entry.entry_type === selectedType;
    return tagMatch && typeMatch;
  });

  const togglePhotoExpansion = (entryId) => {
    setExpandedPhotos(prev => ({
      ...prev,
      [entryId]: !prev[entryId]
    }));
  };

  if (entries.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="glass-accent-lavender w-20 h-20 rounded-[28px] flex items-center justify-center mx-auto mb-6 glow-violet">
          <BookOpen className="w-10 h-10" style={{ color: "#F0EBFF", strokeWidth: 1.5 }} />
        </div>
        <h3 className="text-xl font-bold mb-2" style={{ 
          color: "#F5F3FF",
          textShadow: "0 2px 4px rgba(32, 24, 51, 0.4)",
          fontFamily: "'Playfair Display', Georgia, serif"
        }}>
          Start Your Plant Journal
        </h3>
        <p style={{ color: "#DDD6FE" }}>
          Document your plant's journey, track progress, and capture special moments
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="glass-card rounded-3xl p-5">
        {/* Type Filter */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="w-4 h-4" style={{ color: "#C4B5FD", strokeWidth: 1.8 }} />
            <span className="text-sm font-semibold" style={{ color: "#F5F3FF" }}>Filter by type:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedType(null)}
              className={`px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                selectedType === null ? "glass-accent-lavender" : "glass-button"
              }`}
              style={{ color: selectedType === null ? "#F0EBFF" : "#DDD6FE" }}
            >
              All Types ({entries.length})
            </button>
            {allTypes.map(type => {
              const config = ENTRY_TYPE_CONFIG[type] || ENTRY_TYPE_CONFIG.custom;
              const Icon = config.icon;
              const count = entries.filter(e => e.entry_type === type).length;
              
              return (
                <button
                  key={type}
                  onClick={() => setSelectedType(type === selectedType ? null : type)}
                  className={`px-3 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-all ${
                    selectedType === type ? "glass-accent-moss" : "glass-button"
                  }`}
                  style={{ 
                    color: selectedType === type ? config.color : "#DDD6FE",
                    border: selectedType === type ? `1px solid ${config.color}40` : undefined
                  }}
                >
                  <Icon className="w-4 h-4" style={{ strokeWidth: 1.8 }} />
                  {config.label} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Tag Filter */}
        {allTags.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Tag className="w-4 h-4" style={{ color: "#C4B5FD", strokeWidth: 1.8 }} />
              <span className="text-sm font-semibold" style={{ color: "#F5F3FF" }}>Filter by tag:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedTag(null)}
                className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-all ${
                  selectedTag === null ? "glass-accent-lavender" : "glass-button"
                }`}
                style={{ color: selectedTag === null ? "#F0EBFF" : "#DDD6FE" }}
              >
                All Tags
              </button>
              {allTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
                  className={`px-3 py-1.5 rounded-xl text-sm font-medium flex items-center gap-1.5 transition-all ${
                    selectedTag === tag ? "glass-accent-moss" : "glass-button"
                  }`}
                  style={{ color: selectedTag === tag ? "#A7F3D0" : "#DDD6FE" }}
                >
                  <Tag className="w-3 h-3" />
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Active Filters Display */}
        {(selectedTag || selectedType) && (
          <div className="mt-4 pt-4 border-t" style={{ borderColor: "rgba(227, 201, 255, 0.2)" }}>
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold" style={{ color: "#F5F3FF" }}>
                Showing {filteredEntries.length} of {entries.length} entries
              </span>
              <button
                onClick={() => {
                  setSelectedTag(null);
                  setSelectedType(null);
                }}
                className="glass-button px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1"
                style={{ color: "#DDD6FE" }}
              >
                <X className="w-3 h-3" />
                Clear Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Entries */}
      <div className="space-y-4">
        {filteredEntries.length === 0 ? (
          <div className="glass-card rounded-3xl p-12 text-center">
            <p className="text-sm" style={{ color: "#DDD6FE" }}>
              No entries match your filters
            </p>
          </div>
        ) : (
          filteredEntries.map((entry, index) => {
            const isLatest = index === 0 && !selectedTag && !selectedType;
            const entryType = entry.entry_type || 'general';
            const typeConfig = ENTRY_TYPE_CONFIG[entryType] || ENTRY_TYPE_CONFIG.custom;
            const TypeIcon = typeConfig.icon;
            const photoCount = entry.photos?.length || 0;
            const isPhotoExpanded = expandedPhotos[entry.id];

            return (
              <div
                key={entry.id}
                className={`glass-card rounded-3xl overflow-hidden transition-all ${
                  isLatest ? "ring-2 ring-offset-0" : ""
                }`}
                style={{
                  ringColor: isLatest ? "rgba(168, 159, 239, 0.5)" : undefined
                }}
              >
                <div className="p-5">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        {/* Entry Type Badge */}
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl backdrop-blur-xl"
                          style={{
                            background: `${typeConfig.color}20`,
                            border: `1px solid ${typeConfig.color}40`
                          }}>
                          <TypeIcon className="w-4 h-4" style={{ color: typeConfig.color, strokeWidth: 1.8 }} />
                          <span className="text-xs font-semibold" style={{ color: typeConfig.color }}>
                            {entryType === 'custom' && entry.custom_type ? entry.custom_type : typeConfig.label}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" style={{ color: "#C4B5FD", strokeWidth: 1.8 }} />
                          <span className="text-sm font-semibold" style={{ color: "#DDD6FE" }}>
                            {format(new Date(entry.entry_date), "MMMM d, yyyy")}
                          </span>
                        </div>
                        {isLatest && (
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-xl glass-accent-lavender"
                            style={{ color: "#F0EBFF" }}>
                            Latest
                          </span>
                        )}
                      </div>
                      
                      {entry.title && (
                        <h3 className="text-lg font-bold mb-2" style={{ 
                          color: "#F5F3FF",
                          textShadow: "0 1px 3px rgba(32, 24, 51, 0.4)",
                          fontFamily: "'Playfair Display', Georgia, serif"
                        }}>
                          {entry.title}
                        </h3>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onEdit(entry)}
                        className="glass-button w-9 h-9 rounded-xl flex items-center justify-center"
                        style={{ color: "#C4B5FD" }}
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(entry)}
                        className="glass-button w-9 h-9 rounded-xl flex items-center justify-center"
                        style={{ color: "#FCA5A5" }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="mb-4">
                    <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: "#DDD6FE" }}>
                      {entry.content}
                    </p>
                  </div>

                  {/* Photos */}
                  {photoCount > 0 && (
                    <div className="mb-4">
                      <button
                        onClick={() => togglePhotoExpansion(entry.id)}
                        className="flex items-center gap-2 mb-3 glass-button px-3 py-2 rounded-xl hover:opacity-90 transition-opacity"
                      >
                        <ImageIcon className="w-4 h-4" style={{ color: "#C4B5FD", strokeWidth: 1.8 }} />
                        <span className="text-xs font-semibold" style={{ color: "#DDD6FE" }}>
                          {photoCount} {photoCount === 1 ? "Photo" : "Photos"}
                        </span>
                        {isPhotoExpanded ? 
                          <Eye className="w-3 h-3" style={{ color: "#A7F3D0" }} /> :
                          <Eye className="w-3 h-3" style={{ color: "#DDD6FE" }} />
                        }
                      </button>
                      
                      {isPhotoExpanded && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                          {entry.photos.map((photo, i) => (
                            <a
                              key={i}
                              href={photo}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="glass-card rounded-2xl overflow-hidden aspect-square hover:ring-2 hover:ring-offset-0 transition-all group relative"
                              style={{
                                ringColor: "rgba(168, 159, 239, 0.5)",
                                boxShadow: "inset 0 2px 8px rgba(32, 24, 51, 0.4), 0 4px 16px rgba(32, 24, 51, 0.3)"
                              }}
                            >
                              <img 
                                src={photo} 
                                alt={`Journal entry ${i + 1}`} 
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                style={{ filter: "contrast(1.05) saturate(1.1)" }}
                              />
                              <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-lg text-xs font-bold backdrop-blur-xl"
                                style={{
                                  background: "rgba(0, 0, 0, 0.6)",
                                  color: "#FFF"
                                }}>
                                {i + 1}
                              </div>
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Tags */}
                  {entry.tags && entry.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {entry.tags.map(tag => (
                        <button
                          key={tag}
                          onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all ${
                            selectedTag === tag ? "glass-accent-moss" : "glass-button"
                          }`}
                          style={{ color: selectedTag === tag ? "#A7F3D0" : "#DDD6FE" }}
                        >
                          <Tag className="w-3 h-3" />
                          {tag}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}