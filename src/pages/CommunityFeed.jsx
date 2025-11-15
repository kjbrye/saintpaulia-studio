import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Plus, Search, Filter, TrendingUp, Clock, ArrowLeft, Users, MessageSquare, Image } from "lucide-react";
import PostCard from "../components/community/PostCard";
import EmptyState from "../components/shared/EmptyState";
import { formatDistanceToNow } from "date-fns";

const LOGO_URL = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/690e3cd78523fb5fba0a8466/632f6e485_PlantLogos.png";

const FORUM_CATEGORIES = {
  care_and_growing: { label: "Care & Growing", icon: "🌱", color: "#A7F3D0" },
  pests_and_diseases: { label: "Pests & Diseases", icon: "🐛", color: "#FCA5A5" },
  hybridizing_and_propagation: { label: "Hybridizing & Propagation", icon: "🧪", color: "#E9D5FF" },
  cultivar_discussion: { label: "Cultivar Discussion", icon: "🌸", color: "#F0ABFC" },
  show_and_tell: { label: "Show & Tell", icon: "📸", color: "#FCD34D" },
  equipment_and_supplies: { label: "Equipment & Supplies", icon: "🛠️", color: "#7DD3FC" },
  general_discussion: { label: "General Discussion", icon: "💬", color: "#C4B5FD" }
};

export default function CommunityFeed() {
  const [activeTab, setActiveTab] = useState("feed"); // feed or forum
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("recent");
  const [filterTag, setFilterTag] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");

  const { data: posts = [], isLoading: postsLoading } = useQuery({
    queryKey: ['communityPosts', sortBy],
    queryFn: async () => {
      const allPosts = await base44.entities.CommunityPost.filter(
        { moderation_status: "active" },
        sortBy === "popular" ? '-like_count' : '-created_date'
      );
      return allPosts;
    },
    initialData: [],
  });

  const { data: forumTopics = [], isLoading: topicsLoading } = useQuery({
    queryKey: ['forumTopics', selectedCategory, sortBy],
    queryFn: async () => {
      const allTopics = await base44.entities.ForumTopic.list('-last_activity_date');
      
      let filtered = allTopics;
      if (selectedCategory !== "all") {
        filtered = filtered.filter(t => t.category === selectedCategory);
      }

      if (sortBy === "popular") {
        filtered.sort((a, b) => (b.reply_count || 0) - (a.reply_count || 0));
      }

      const pinned = filtered.filter(t => t.is_pinned);
      const regular = filtered.filter(t => !t.is_pinned);
      
      return [...pinned, ...regular];
    },
    initialData: []
  });

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const allTags = [...new Set(posts.flatMap(post => post.tags || []))];

  const filteredPosts = posts.filter(post => {
    const searchMatch = 
      post.cultivar_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.hybridizer?.toLowerCase().includes(searchQuery.toLowerCase());

    const tagMatch = !filterTag || (post.tags && post.tags.includes(filterTag));

    return searchMatch && tagMatch;
  });

  const filteredTopics = forumTopics.filter(topic =>
    topic.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    topic.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    topic.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const isLoading = activeTab === "feed" ? postsLoading : topicsLoading;

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <Link to={createPageUrl("Collection")}>
              <button className="glass-button w-12 h-12 rounded-2xl flex items-center justify-center"
                style={{ color: "var(--accent)" }}>
                <ArrowLeft className="w-5 h-5" style={{ strokeWidth: 2 }} />
              </button>
            </Link>
            <div className="flex items-center gap-4">
              <div className="glass-card w-16 h-16 rounded-3xl flex items-center justify-center glow-violet p-2">
                <Users className="w-8 h-8" style={{ color: "#F0EBFF", strokeWidth: 1.5 }} />
              </div>
              <div>
                <h1 className="text-4xl font-bold" style={{ 
                  color: 'var(--text-primary)',
                  textShadow: 'var(--heading-shadow)',
                  fontFamily: "'Playfair Display', Georgia, serif"
                }}>
                  Community
                </h1>
                <p className="text-muted" style={{ color: 'var(--text-secondary)' }}>
                  Discover, share, and discuss African violets
                </p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-3 mb-6">
            <button
              onClick={() => setActiveTab("feed")}
              className={`flex-1 px-6 py-4 rounded-3xl font-semibold flex items-center justify-center gap-2 transition-all ${
                activeTab === "feed" ? "glass-accent-lavender" : "glass-button"
              }`}
              style={{ color: activeTab === "feed" ? "#F0EBFF" : "var(--text-secondary)" }}
            >
              <Image className="w-5 h-5" style={{ strokeWidth: 2 }} />
              Photo Feed
            </button>
            <button
              onClick={() => setActiveTab("forum")}
              className={`flex-1 px-6 py-4 rounded-3xl font-semibold flex items-center justify-center gap-2 transition-all ${
                activeTab === "forum" ? "glass-accent-lavender" : "glass-button"
              }`}
              style={{ color: activeTab === "forum" ? "#F0EBFF" : "var(--text-secondary)" }}
            >
              <MessageSquare className="w-5 h-5" style={{ strokeWidth: 2 }} />
              Forum
            </button>
          </div>

          {/* Controls */}
          <div className="flex gap-3 flex-col sm:flex-row mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5" 
                style={{ color: 'var(--text-muted)', opacity: 0.7, strokeWidth: 1.5 }} />
              <input
                type="text"
                placeholder={activeTab === "feed" ? "Search posts..." : "Search topics..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="glass-input w-full pl-12 pr-4 py-4 rounded-3xl"
                style={{ color: 'var(--text-primary)' }}
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`glass-button px-6 py-4 rounded-3xl font-semibold flex items-center justify-center gap-2 ${
                (filterTag || selectedCategory !== "all") ? "glass-accent-moss" : ""
              }`}
              style={{ color: (filterTag || selectedCategory !== "all") ? "#A7F3D0" : "var(--text-secondary)" }}
            >
              <Filter className="w-5 h-5" style={{ strokeWidth: 2 }} />
              <span className="hidden sm:inline">Filters</span>
            </button>
            <Link to={createPageUrl(activeTab === "feed" ? "CreatePost" : "CreateForumTopic")}>
              <button className="glass-accent-lavender w-full sm:w-auto px-6 py-4 rounded-3xl font-semibold flex items-center justify-center gap-2 hover:shadow-lg transition-all"
                style={{ color: '#F0EBFF' }}>
                <Plus className="w-5 h-5" style={{ strokeWidth: 2 }} />
                <span className="hidden sm:inline">{activeTab === "feed" ? "Share Plant" : "New Topic"}</span>
              </button>
            </Link>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="glass-card rounded-3xl p-6 space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
                    Sort By
                  </label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSortBy("recent")}
                      className={`flex-1 px-4 py-3 rounded-2xl font-semibold transition-all ${
                        sortBy === "recent" ? "glass-accent-lavender" : "glass-button"
                      }`}
                      style={{ color: sortBy === "recent" ? "#F0EBFF" : "var(--text-secondary)" }}
                    >
                      <Clock className="w-4 h-4 inline mr-2" />
                      Recent
                    </button>
                    <button
                      onClick={() => setSortBy("popular")}
                      className={`flex-1 px-4 py-3 rounded-2xl font-semibold transition-all ${
                        sortBy === "popular" ? "glass-accent-lavender" : "glass-button"
                      }`}
                      style={{ color: sortBy === "popular" ? "#F0EBFF" : "var(--text-secondary)" }}
                    >
                      <TrendingUp className="w-4 h-4 inline mr-2" />
                      Popular
                    </button>
                  </div>
                </div>

                {activeTab === "feed" && allTags.length > 0 && (
                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
                      Filter by Tag
                    </label>
                    <select
                      value={filterTag}
                      onChange={(e) => setFilterTag(e.target.value)}
                      className="glass-input w-full px-4 py-3 rounded-2xl"
                      style={{ color: "var(--text-primary)" }}
                    >
                      <option value="">All Tags</option>
                      {allTags.map(tag => (
                        <option key={tag} value={tag}>{tag}</option>
                      ))}
                    </select>
                  </div>
                )}

                {activeTab === "forum" && (
                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
                      Category
                    </label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="glass-input w-full px-4 py-3 rounded-2xl"
                      style={{ color: "var(--text-primary)" }}
                    >
                      <option value="all">All Categories</option>
                      {Object.entries(FORUM_CATEGORIES).map(([key, cat]) => (
                        <option key={key} value={key}>
                          {cat.icon} {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="glass-card w-16 h-16 rounded-3xl flex items-center justify-center animate-pulse glow-violet p-2">
              <img 
                src={LOGO_URL} 
                alt="Loading" 
                className="w-full h-full object-contain"
                style={{ opacity: 0.6 }}
              />
            </div>
          </div>
        ) : activeTab === "feed" ? (
          filteredPosts.length === 0 ? (
            <div className="glass-card rounded-3xl">
              {posts.length === 0 ? (
                <EmptyState
                  icon={Users}
                  title="Community Feed is Quiet"
                  description="Be the first to share! Post photos of your beautiful blooms, share care tips, or showcase rare cultivars with fellow enthusiasts."
                  actionText="Create Your First Post"
                  actionLink="CreatePost"
                  secondaryActionText="Explore Care Guide"
                  secondaryActionLink="CareGuide"
                  variant="default"
                  size="large"
                />
              ) : (
                <EmptyState
                  icon={Search}
                  title="No Posts Found"
                  description="No posts match your search or selected tag. Try different keywords or browse all posts."
                  actionText="Clear Filters"
                  onAction={() => {
                    setSearchQuery("");
                    setFilterTag("");
                  }}
                  variant="info"
                  size="medium"
                />
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPosts.map(post => (
                <PostCard 
                  key={post.id} 
                  post={post} 
                  currentUser={currentUser}
                />
              ))}
            </div>
          )
        ) : (
          filteredTopics.length === 0 ? (
            <div className="glass-card rounded-3xl">
              {forumTopics.length === 0 ? (
                <EmptyState
                  icon={MessageSquare}
                  title="Start a Discussion"
                  description="Be the first to start a conversation! Ask questions, share advice, or discuss your favorite cultivars with the community."
                  actionText="Create First Topic"
                  actionLink="CreateForumTopic"
                  variant="default"
                  size="large"
                />
              ) : (
                <EmptyState
                  icon={Search}
                  title="No Topics Found"
                  description="No topics match your search or selected category. Try different keywords or browse all topics."
                  actionText="Clear Filters"
                  onAction={() => {
                    setSearchQuery("");
                    setSelectedCategory("all");
                  }}
                  variant="info"
                  size="medium"
                />
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTopics.map(topic => {
                const category = FORUM_CATEGORIES[topic.category];
                return (
                  <Link key={topic.id} to={createPageUrl(`ForumTopic?id=${topic.id}`)}>
                    <div className="glass-card rounded-3xl p-6 hover:shadow-xl transition-all">
                      <div className="flex items-start gap-4">
                        <div className="glass-button w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0">
                          <span className="text-2xl">{category.icon}</span>
                        </div>

                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-bold mb-2" style={{
                            color: "var(--text-primary)",
                            fontFamily: "'Playfair Display', Georgia, serif"
                          }}>
                            {topic.title}
                          </h3>

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
          )
        )}
      </div>
    </div>
  );
}