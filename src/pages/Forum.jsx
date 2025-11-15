import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ArrowLeft, Plus, MessageSquare, Users, TrendingUp, Clock, Pin, Lock, CheckCircle, Search, Filter } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const LOGO_URL = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/690e3cd78523fb5fba0a8466/632f6e485_PlantLogos.png";

const CATEGORIES = {
  care_and_growing: { 
    label: "Care & Growing", 
    icon: "🌱", 
    color: "#A7F3D0",
    description: "Tips and advice for African violet care"
  },
  pests_and_diseases: { 
    label: "Pests & Diseases", 
    icon: "🐛", 
    color: "#FCA5A5",
    description: "Identify and treat common issues"
  },
  hybridizing_and_propagation: { 
    label: "Hybridizing & Propagation", 
    icon: "🧪", 
    color: "#E9D5FF",
    description: "Breeding projects and propagation techniques"
  },
  cultivar_discussion: { 
    label: "Cultivar Discussion", 
    icon: "🌸", 
    color: "#F0ABFC",
    description: "Discuss specific cultivars and varieties"
  },
  show_and_tell: { 
    label: "Show & Tell", 
    icon: "📸", 
    color: "#FCD34D",
    description: "Share your beautiful violets"
  },
  equipment_and_supplies: { 
    label: "Equipment & Supplies", 
    icon: "🛠️", 
    color: "#7DD3FC",
    description: "Discuss tools, supplies, and equipment"
  },
  general_discussion: { 
    label: "General Discussion", 
    icon: "💬", 
    color: "#C4B5FD",
    description: "Everything else about African violets"
  }
};

export default function Forum() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("recent");
  const [showFilters, setShowFilters] = useState(false);

  const { data: topics = [], isLoading } = useQuery({
    queryKey: ['forumTopics', selectedCategory, sortBy],
    queryFn: async () => {
      const allTopics = await base44.entities.ForumTopic.list('-last_activity_date');
      
      let filtered = allTopics;
      if (selectedCategory !== "all") {
        filtered = filtered.filter(t => t.category === selectedCategory);
      }

      if (sortBy === "popular") {
        filtered.sort((a, b) => (b.reply_count || 0) - (a.reply_count || 0));
      } else if (sortBy === "views") {
        filtered.sort((a, b) => (b.view_count || 0) - (a.view_count || 0));
      }

      const pinned = filtered.filter(t => t.is_pinned);
      const regular = filtered.filter(t => !t.is_pinned);
      
      return [...pinned, ...regular];
    },
    initialData: []
  });

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me().catch(() => null)
  });

  const filteredTopics = topics.filter(topic =>
    topic.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    topic.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    topic.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const currentTheme = currentUser?.theme || "glassmorphism";
  const totalTopics = topics.length;
  const totalReplies = topics.reduce((sum, t) => sum + (t.reply_count || 0), 0);

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Link to={createPageUrl("Collection")}>
              <button className="neuro-button w-12 h-12 rounded-2xl flex items-center justify-center"
                style={{ color: (currentTheme === 'light' || currentTheme === 'minimal') ? "#7C3AED" : "#E3C9FF" }}>
                <ArrowLeft className="w-5 h-5" style={{ strokeWidth: 2 }} />
              </button>
            </Link>
            <div className="flex items-center gap-4">
              <div className="neuro-icon-well w-16 h-16 rounded-3xl flex items-center justify-center p-2">
                <img src={LOGO_URL} alt="Forum" className="w-full h-full object-contain" />
              </div>
              <div>
                <h1 className="text-4xl font-bold" style={{
                  color: 'var(--text-primary)',
                  textShadow: 'var(--heading-shadow)',
                  fontFamily: "'Playfair Display', Georgia, serif"
                }}>
                  Community Forum
                </h1>
                <p className="text-muted" style={{ color: 'var(--text-secondary)' }}>
                  {totalTopics} discussions • {totalReplies} replies
                </p>
              </div>
            </div>
          </div>

          <Link to={createPageUrl("CreateForumTopic")}>
            <button className="neuro-accent-raised px-6 py-4 rounded-3xl font-semibold flex items-center gap-2"
              style={{ color: (currentTheme === 'light' || currentTheme === 'minimal') ? '#FFFFFF' : '#F0EBFF' }}>
              <Plus className="w-5 h-5" style={{ strokeWidth: 2 }} />
              <span className="hidden sm:inline">New Topic</span>
            </button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="neuro-card rounded-3xl p-6">
            <div className="flex items-center gap-3">
              <div className="neuro-icon-well w-12 h-12 rounded-2xl flex items-center justify-center">
                <MessageSquare className="w-6 h-6" style={{ color: "#C4B5FD", strokeWidth: 1.8 }} />
              </div>
              <div>
                <p className="text-2xl font-bold" style={{ color: "var(--text-primary)", fontFamily: "'Playfair Display', Georgia, serif" }}>
                  {totalTopics}
                </p>
                <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Active Topics</p>
              </div>
            </div>
          </div>

          <div className="neuro-card rounded-3xl p-6">
            <div className="flex items-center gap-3">
              <div className="neuro-icon-well w-12 h-12 rounded-2xl flex items-center justify-center">
                <Users className="w-6 h-6" style={{ color: "#A7F3D0", strokeWidth: 1.8 }} />
              </div>
              <div>
                <p className="text-2xl font-bold" style={{ color: "var(--text-primary)", fontFamily: "'Playfair Display', Georgia, serif" }}>
                  {totalReplies}
                </p>
                <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Total Replies</p>
              </div>
            </div>
          </div>

          <div className="neuro-card rounded-3xl p-6">
            <div className="flex items-center gap-3">
              <div className="neuro-icon-well w-12 h-12 rounded-2xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6" style={{ color: "#FCD34D", strokeWidth: 1.8 }} />
              </div>
              <div>
                <p className="text-2xl font-bold" style={{ color: "var(--text-primary)", fontFamily: "'Playfair Display', Georgia, serif" }}>
                  {topics.filter(t => new Date(t.created_date) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length}
                </p>
                <p className="text-sm" style={{ color: "var(--text-secondary)" }}>This Week</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex gap-3 flex-col sm:flex-row mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5"
              style={{ color: 'var(--text-muted)', opacity: 0.7, strokeWidth: 1.5 }} />
            <input
              type="text"
              placeholder="Search topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="neuro-input w-full pl-12 pr-4 py-4 rounded-3xl"
              style={{ color: 'var(--text-primary)' }}
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`neuro-button px-6 py-4 rounded-3xl font-semibold flex items-center gap-2 ${
              selectedCategory !== "all" || sortBy !== "recent" ? "neuro-accent-raised" : ""
            }`}
            style={{ color: selectedCategory !== "all" || sortBy !== "recent" 
              ? ((currentTheme === 'light' || currentTheme === 'minimal') ? "#FFFFFF" : "#A7F3D0")
              : 'var(--text-secondary)' }}
          >
            <Filter className="w-5 h-5" style={{ strokeWidth: 2 }} />
            <span className="hidden sm:inline">Filters</span>
          </button>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="neuro-card rounded-3xl p-6 mb-6">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                  Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="neuro-input w-full px-4 py-3 rounded-2xl"
                  style={{ color: 'var(--text-primary)' }}
                >
                  <option value="all">All Categories</option>
                  {Object.entries(CATEGORIES).map(([key, cat]) => (
                    <option key={key} value={key}>
                      {cat.icon} {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                  Sort By
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="neuro-input w-full px-4 py-3 rounded-2xl"
                  style={{ color: 'var(--text-primary)' }}
                >
                  <option value="recent">Recent Activity</option>
                  <option value="popular">Most Replies</option>
                  <option value="views">Most Views</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Categories Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {Object.entries(CATEGORIES).map(([key, cat]) => {
            const categoryCount = topics.filter(t => t.category === key).length;
            return (
              <button
                key={key}
                onClick={() => {
                  setSelectedCategory(key);
                  setShowFilters(false);
                }}
                className={`neuro-card rounded-3xl p-5 text-left hover:shadow-xl transition-all ${
                  selectedCategory === key ? "ring-2" : ""
                }`}
                style={{ 
                  ringColor: selectedCategory === key ? cat.color : undefined
                }}
              >
                <div className="flex items-start gap-3">
                  <div className="text-3xl">{cat.icon}</div>
                  <div className="flex-1">
                    <h3 className="font-bold mb-1" style={{ color: "var(--text-primary)" }}>
                      {cat.label}
                    </h3>
                    <p className="text-xs mb-2" style={{ color: "var(--text-secondary)", opacity: 0.8 }}>
                      {cat.description}
                    </p>
                    <p className="text-xs font-semibold" style={{ color: cat.color }}>
                      {categoryCount} {categoryCount === 1 ? 'topic' : 'topics'}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Topics List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="neuro-icon-well w-16 h-16 rounded-3xl flex items-center justify-center animate-pulse p-2">
              <img src={LOGO_URL} alt="Loading" className="w-full h-full object-contain" style={{ opacity: 0.6 }} />
            </div>
          </div>
        ) : filteredTopics.length === 0 ? (
          <div className="neuro-card rounded-3xl p-12 text-center">
            <div className="neuro-icon-well w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 p-3">
              <MessageSquare className="w-full h-full" style={{ color: "#C4B5FD", strokeWidth: 1.5 }} />
            </div>
            <h3 className="text-xl font-bold mb-3" style={{ color: "var(--text-primary)", fontFamily: "'Playfair Display', Georgia, serif" }}>
              {searchQuery ? "No Topics Found" : "Start a Discussion"}
            </h3>
            <p className="mb-6" style={{ color: "var(--text-secondary)" }}>
              {searchQuery ? "Try different keywords or clear filters" : "Be the first to start a conversation in this category"}
            </p>
            <Link to={createPageUrl("CreateForumTopic")}>
              <button className="neuro-accent-raised px-6 py-3 rounded-2xl font-semibold"
                style={{ color: (currentTheme === 'light' || currentTheme === 'minimal') ? '#FFFFFF' : '#F0EBFF' }}>
                Create First Topic
              </button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTopics.map(topic => {
              const category = CATEGORIES[topic.category];
              return (
                <Link key={topic.id} to={createPageUrl(`ForumTopic?id=${topic.id}`)}>
                  <div className="neuro-card rounded-3xl p-6 hover:shadow-xl transition-all">
                    <div className="flex items-start gap-4">
                      <div className="neuro-icon-well w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0">
                        <span className="text-2xl">{category.icon}</span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-2 mb-2">
                          <h3 className="text-lg font-bold flex-1" style={{
                            color: "var(--text-primary)",
                            fontFamily: "'Playfair Display', Georgia, serif"
                          }}>
                            {topic.title}
                          </h3>
                          {topic.is_pinned && (
                            <Pin className="w-4 h-4 flex-shrink-0" style={{ color: "#FCD34D", strokeWidth: 2 }} />
                          )}
                          {topic.is_locked && (
                            <Lock className="w-4 h-4 flex-shrink-0" style={{ color: "#FCA5A5", strokeWidth: 2 }} />
                          )}
                          {topic.is_solved && (
                            <CheckCircle className="w-4 h-4 flex-shrink-0" style={{ color: "#A7F3D0", strokeWidth: 2, fill: "#A7F3D0" }} />
                          )}
                        </div>

                        <p className="text-sm mb-3 line-clamp-2" style={{ color: "var(--text-secondary)" }}>
                          {topic.content}
                        </p>

                        <div className="flex items-center gap-4 flex-wrap">
                          <span className="text-xs px-3 py-1 rounded-xl backdrop-blur-xl"
                            style={{
                              background: `${category.color}20`,
                              border: `1px solid ${category.color}40`,
                              color: category.color
                            }}>
                            {category.label}
                          </span>

                          <div className="flex items-center gap-1 text-xs" style={{ color: "var(--text-secondary)" }}>
                            <MessageSquare className="w-3 h-3" />
                            <span>{topic.reply_count || 0}</span>
                          </div>

                          <div className="flex items-center gap-1 text-xs" style={{ color: "var(--text-secondary)" }}>
                            <Clock className="w-3 h-3" />
                            <span>
                              {topic.last_activity_date 
                                ? formatDistanceToNow(new Date(topic.last_activity_date), { addSuffix: true })
                                : formatDistanceToNow(new Date(topic.created_date), { addSuffix: true })}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}