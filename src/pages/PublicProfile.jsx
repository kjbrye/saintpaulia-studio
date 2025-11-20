
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { serviceRoleClient, supabase } from "@/lib/custom-sdk";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, User, Leaf, Beaker, MessageCircle, TrendingUp, Activity, Heart } from "lucide-react";
import { createPageUrl } from "@/utils";
import PostCard from "../components/community/PostCard";
import RecentActivityItem from "../components/profile/RecentActivityItem";
import PlantCard from "../components/plants/PlantCard";

const LOGO_URL = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/690e3cd78523fb5fba0a8466/632f6e485_PlantLogos.png";

export default function PublicProfile() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const userEmail = urlParams.get('email');
  const [activeTab, setActiveTab] = useState("posts");

  const { data: profileUser, isLoading: userLoading } = useQuery({
    queryKey: ['publicProfile', userEmail],
    queryFn: async () => {
      if (!userEmail) return null;

      // Use service role client to bypass RLS for public profile viewing
      const client = serviceRoleClient || supabase;
      const { data, error } = await client
        .from('users')
        .select('*')
        .eq('email', userEmail)
        .maybeSingle();

      if (error) {
        console.error('Error fetching public profile:', error);
        return null;
      }

      if (!data) {
        console.warn('No user found with email:', userEmail);
      }

      return data;
    },
    enabled: !!userEmail
  });

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: userPosts = [] } = useQuery({
    queryKey: ['userPosts', userEmail],
    queryFn: () => base44.entities.CommunityPost.filter({ 
      created_by: userEmail,
      moderation_status: "active"
    }, '-created_date'),
    enabled: !!userEmail,
    initialData: []
  });

  const { data: userComments = [] } = useQuery({
    queryKey: ['userComments', userEmail],
    queryFn: () => base44.entities.PostComment.filter({ 
      created_by: userEmail,
      moderation_status: "active"
    }, '-created_date', 10),
    enabled: !!userEmail,
    initialData: []
  });

  const { data: userLikes = [] } = useQuery({
    queryKey: ['userLikes', userEmail],
    queryFn: () => base44.entities.PostLike.filter({ 
      created_by: userEmail
    }, '-created_date'),
    enabled: !!userEmail,
    initialData: []
  });

  // Get stats if viewing own profile
  const isOwnProfile = currentUser?.email === userEmail;

  const { data: plants = [] } = useQuery({
    queryKey: ['plants'],
    queryFn: () => base44.entities.Plant.list('-updated_date'),
    enabled: isOwnProfile,
    initialData: []
  });

  const { data: projects = [] } = useQuery({
    queryKey: ['hybridizationProjects'],
    queryFn: () => base44.entities.HybridizationProject.list('-updated_date'),
    enabled: isOwnProfile,
    initialData: []
  });

  // Fetch posts for liked posts content
  const { data: allPosts = [] } = useQuery({
    queryKey: ['communityPosts'],
    queryFn: () => base44.entities.CommunityPost.filter({ moderation_status: "active" }),
    enabled: isOwnProfile,
    initialData: []
  });

  if (userLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="glass-card w-16 h-16 rounded-2xl flex items-center justify-center animate-pulse glow-violet p-2">
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

  if (!profileUser) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="glass-card rounded-3xl p-12 text-center">
          <p style={{ color: "var(--text-primary)" }} className="font-medium">User not found</p>
        </div>
      </div>
    );
  }

  const displayName = profileUser.username || profileUser.full_name || profileUser.email?.split('@')[0] || 'User';
  const totalLikes = userPosts.reduce((sum, post) => sum + (post.like_count || 0), 0);
  const totalComments = userPosts.reduce((sum, post) => sum + (post.comment_count || 0), 0);

  // Get liked posts
  const likedPosts = userLikes
    .map(like => allPosts.find(p => p.id === like.post_id))
    .filter(post => post !== undefined);

  // Build recent activity timeline
  const recentActivity = [
    ...userPosts.slice(0, 5).map(post => ({
      type: 'post',
      date: post.created_date,
      content: post.title,
      postId: post.id
    })),
    ...userComments.map(comment => ({
      type: 'comment',
      date: comment.created_date,
      content: comment.comment,
      postId: comment.post_id
    })),
    ...userLikes.slice(0, 5).map(like => {
      const post = allPosts.find(p => p.id === like.post_id);
      return {
        type: 'like',
        date: like.created_date,
        content: post ? `${post.title}` : 'A post',
        postId: like.post_id
      };
    })
  ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 10);

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate(createPageUrl("CommunityFeed"))}
            className="glass-button w-12 h-12 rounded-2xl flex items-center justify-center"
            style={{ color: "var(--accent)" }}
          >
            <ArrowLeft className="w-5 h-5" style={{ strokeWidth: 2 }} />
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left: Profile Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Profile Card */}
            <div className="glass-card rounded-3xl p-6">
              <div className="text-center mb-6">
                <div className="w-32 h-32 rounded-full mx-auto mb-4 overflow-hidden glass-card"
                  style={{
                    boxShadow: "inset 0 2px 8px rgba(32, 24, 51, 0.4), 0 4px 16px rgba(32, 24, 51, 0.3)"
                  }}>
                  {profileUser.profile_picture ? (
                    <img 
                      src={profileUser.profile_picture} 
                      alt={displayName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center"
                      style={{
                        background: "linear-gradient(135deg, rgba(168, 159, 239, 0.15) 0%, rgba(154, 226, 211, 0.12) 100%)"
                      }}>
                      <User className="w-16 h-16" style={{ color: "#C4B5FD", opacity: 0.5 }} />
                    </div>
                  )}
                </div>

                <h1 className="text-2xl font-bold mb-1" style={{ 
                  color: "var(--text-primary)",
                  textShadow: "var(--heading-shadow)",
                  fontFamily: "'Playfair Display', Georgia, serif"
                }}>
                  {displayName}
                </h1>

                {profileUser.bio && (
                  <p className="text-sm mt-3 whitespace-pre-wrap" style={{ color: "var(--text-secondary)" }}>
                    {profileUser.bio}
                  </p>
                )}
              </div>

              {isOwnProfile && (
                <button
                  onClick={() => navigate(createPageUrl("ProfileSettings"))}
                  className="glass-button w-full px-4 py-3 rounded-2xl font-semibold hover:opacity-90 transition-opacity"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Edit Profile
                </button>
              )}
            </div>

            {/* Community Stats */}
            <div className="glass-card rounded-3xl p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ 
                color: "var(--text-primary)",
                textShadow: "var(--heading-shadow)",
                fontFamily: "'Playfair Display', Georgia, serif"
              }}>
                <TrendingUp className="w-5 h-5" style={{ color: "#C4B5FD", strokeWidth: 1.5 }} />
                Community Stats
              </h3>

              <div className="space-y-3">
                <div className="glass-button rounded-2xl p-3 flex items-center justify-between">
                  <span className="text-sm" style={{ color: "var(--text-secondary)" }}>Posts</span>
                  <span className="text-lg font-bold" style={{ 
                    color: "var(--text-primary)",
                    fontFamily: "'Playfair Display', Georgia, serif"
                  }}>
                    {userPosts.length}
                  </span>
                </div>

                <div className="glass-button rounded-2xl p-3 flex items-center justify-between">
                  <span className="text-sm" style={{ color: "var(--text-secondary)" }}>Total Likes</span>
                  <span className="text-lg font-bold" style={{ 
                    color: "#FCA5A5",
                    fontFamily: "'Playfair Display', Georgia, serif"
                  }}>
                    {totalLikes}
                  </span>
                </div>

                <div className="glass-button rounded-2xl p-3 flex items-center justify-between">
                  <span className="text-sm" style={{ color: "var(--text-secondary)" }}>Comments</span>
                  <span className="text-lg font-bold" style={{ 
                    color: "#C4B5FD",
                    fontFamily: "'Playfair Display', Georgia, serif"
                  }}>
                    {totalComments}
                  </span>
                </div>
              </div>
            </div>

            {/* Collection Stats (Own Profile Only) */}
            {isOwnProfile && (
              <div className="glass-card rounded-3xl p-6">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ 
                  color: "var(--text-primary)",
                  textShadow: "var(--heading-shadow)",
                  fontFamily: "'Playfair Display', Georgia, serif"
                }}>
                  <Leaf className="w-5 h-5" style={{ color: "#A7F3D0", strokeWidth: 1.5 }} />
                  My Collection
                </h3>

                <div className="space-y-3">
                  <button
                    onClick={() => setActiveTab("plants")}
                    className={`glass-button rounded-2xl p-3 flex items-center justify-between w-full hover:opacity-80 transition-opacity ${
                      activeTab === "plants" ? "ring-2 ring-offset-0" : ""
                    }`}
                    style={{ 
                      ringColor: activeTab === "plants" ? "rgba(154, 226, 211, 0.5)" : undefined
                    }}
                  >
                    <span className="text-sm" style={{ color: "var(--text-secondary)" }}>Total Plants</span>
                    <span className="text-lg font-bold" style={{ 
                      color: "#A7F3D0",
                      fontFamily: "'Playfair Display', Georgia, serif"
                    }}>
                      {plants.length}
                    </span>
                  </button>

                  <button
                    onClick={() => setActiveTab("projects")}
                    className={`glass-button rounded-2xl p-3 flex items-center justify-between w-full hover:opacity-80 transition-opacity ${
                      activeTab === "projects" ? "ring-2 ring-offset-0" : ""
                    }`}
                    style={{ 
                      ringColor: activeTab === "projects" ? "rgba(154, 226, 211, 0.5)" : undefined
                    }}
                  >
                    <span className="text-sm" style={{ color: "var(--text-secondary)" }}>Projects</span>
                    <span className="text-lg font-bold" style={{ 
                      color: "#A7F3D0",
                      fontFamily: "'Playfair Display', Georgia, serif"
                    }}>
                      {projects.length}
                    </span>
                  </button>

                  <button
                    onClick={() => setActiveTab("liked")}
                    className={`glass-button rounded-2xl p-3 flex items-center justify-between w-full hover:opacity-80 transition-opacity ${
                      activeTab === "liked" ? "ring-2 ring-offset-0" : ""
                    }`}
                    style={{ 
                      ringColor: activeTab === "liked" ? "rgba(252, 165, 165, 0.5)" : undefined
                    }}
                  >
                    <span className="text-sm" style={{ color: "var(--text-secondary)" }}>Liked Posts</span>
                    <span className="text-lg font-bold" style={{ 
                      color: "#FCA5A5",
                      fontFamily: "'Playfair Display', Georgia, serif"
                    }}>
                      {likedPosts.length}
                    </span>
                  </button>
                </div>
              </div>
            )}

            {/* Recent Activity */}
            {recentActivity.length > 0 && (
              <div className="glass-card rounded-3xl p-6">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ 
                  color: "var(--text-primary)",
                  textShadow: "var(--heading-shadow)",
                  fontFamily: "'Playfair Display', Georgia, serif"
                }}>
                  <Activity className="w-5 h-5" style={{ color: "#C4B5FD", strokeWidth: 1.5 }} />
                  Recent Activity
                </h3>

                <div className="space-y-3 max-h-[500px] overflow-y-auto">
                  {recentActivity.map((activity, index) => (
                    <RecentActivityItem key={index} activity={activity} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: Content based on active tab */}
          <div className="lg:col-span-2">
            {/* Posts Tab */}
            {activeTab === "posts" && (
              <>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold flex items-center gap-2" style={{ 
                    color: "var(--text-primary)",
                    textShadow: "var(--heading-shadow)",
                    fontFamily: "'Playfair Display', Georgia, serif"
                  }}>
                    <MessageCircle className="w-6 h-6" style={{ color: "#C4B5FD", strokeWidth: 1.5 }} />
                    {isOwnProfile ? "My Posts" : `${displayName}'s Posts`}
                  </h2>
                </div>

                {userPosts.length === 0 ? (
                  <div className="glass-card rounded-[32px] p-12 text-center">
                    <div className="glass-accent-lavender w-20 h-20 rounded-[28px] flex items-center justify-center mx-auto mb-6 glow-violet p-3">
                      <MessageCircle className="w-10 h-10" style={{ color: "#F0EBFF", strokeWidth: 1.5 }} />
                    </div>
                    <h3 className="text-xl font-bold mb-2" style={{ 
                      color: 'var(--text-primary)',
                      fontFamily: "'Playfair Display', Georgia, serif"
                    }}>
                      No Posts Yet
                    </h3>
                    <p style={{ color: 'var(--text-secondary)' }}>
                      {isOwnProfile ? "Share your first plant with the community" : "This user hasn't shared any posts yet"}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {userPosts.map(post => (
                      <PostCard 
                        key={post.id} 
                        post={post} 
                        currentUser={currentUser}
                      />
                    ))}
                  </div>
                )}
              </>
            )}

            {/* Plants Tab (Own Profile Only) */}
            {activeTab === "plants" && isOwnProfile && (
              <>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold flex items-center gap-2" style={{ 
                    color: "var(--text-primary)",
                    textShadow: "var(--heading-shadow)",
                    fontFamily: "'Playfair Display', Georgia, serif"
                  }}>
                    <Leaf className="w-6 h-6" style={{ color: "#A7F3D0", strokeWidth: 1.5 }} />
                    My Plant Collection
                  </h2>
                  <p className="text-sm mt-2" style={{ color: "var(--text-secondary)" }}>
                    {plants.length} {plants.length === 1 ? 'plant' : 'plants'} in your collection
                  </p>
                </div>

                {plants.length === 0 ? (
                  <div className="glass-card rounded-[32px] p-12 text-center">
                    <div className="glass-accent-moss w-20 h-20 rounded-[28px] flex items-center justify-center mx-auto mb-6">
                      <Leaf className="w-10 h-10" style={{ color: "#A7F3D0", strokeWidth: 1.5 }} />
                    </div>
                    <h3 className="text-xl font-bold mb-2" style={{ 
                      color: 'var(--text-primary)',
                      fontFamily: "'Playfair Display', Georgia, serif"
                    }}>
                      No Plants Yet
                    </h3>
                    <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>
                      Start building your collection
                    </p>
                    <button
                      onClick={() => navigate(createPageUrl("AddPlant"))}
                      className="glass-accent-lavender px-6 py-3 rounded-2xl font-semibold"
                      style={{ color: "var(--text-primary)" }}
                    >
                      Add Your First Plant
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {plants.map(plant => (
                      <PlantCard key={plant.id} plant={plant} />
                    ))}
                  </div>
                )}
              </>
            )}

            {/* Projects Tab (Own Profile Only) */}
            {activeTab === "projects" && isOwnProfile && (
              <>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold flex items-center gap-2" style={{ 
                    color: "var(--text-primary)",
                    textShadow: "var(--heading-shadow)",
                    fontFamily: "'Playfair Display', Georgia, serif"
                  }}>
                    <Beaker className="w-6 h-6" style={{ color: "#A7F3D0", strokeWidth: 1.5 }} />
                    My Hybridization Projects
                  </h2>
                  <p className="text-sm mt-2" style={{ color: "var(--text-secondary)" }}>
                    {projects.length} {projects.length === 1 ? 'project' : 'projects'} in progress
                  </p>
                </div>

                {projects.length === 0 ? (
                  <div className="glass-card rounded-[32px] p-12 text-center">
                    <div className="glass-accent-moss w-20 h-20 rounded-[28px] flex items-center justify-center mx-auto mb-6">
                      <Beaker className="w-10 h-10" style={{ color: "#A7F3D0", strokeWidth: 1.5 }} />
                    </div>
                    <h3 className="text-xl font-bold mb-2" style={{ 
                      color: 'var(--text-primary)',
                      fontFamily: "'Playfair Display', Georgia, serif"
                    }}>
                      No Projects Yet
                    </h3>
                    <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>
                      Start your first hybridization project
                    </p>
                    <button
                      onClick={() => navigate(createPageUrl("AddProject"))}
                      className="glass-accent-lavender px-6 py-3 rounded-2xl font-semibold"
                      style={{ color: "var(--text-primary)" }}
                    >
                      Create First Project
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {projects.map(project => (
                      <Link 
                        key={project.id} 
                        to={createPageUrl(`ProjectDetail?id=${project.id}`)}
                      >
                        <div className="glass-card rounded-3xl p-6 hover:shadow-2xl transition-all">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h3 className="text-lg font-bold mb-1" style={{ 
                                color: "var(--text-primary)",
                                textShadow: "var(--heading-shadow)",
                                fontFamily: "'Playfair Display', Georgia, serif"
                              }}>
                                {project.project_name}
                              </h3>
                              {project.goal_description && (
                                <p className="text-sm line-clamp-2" style={{ color: "var(--text-secondary)" }}>
                                  {project.goal_description}
                                </p>
                              )}
                            </div>
                            <span
                              className="px-3 py-1 rounded-xl text-xs font-semibold backdrop-blur-xl ml-3"
                              style={{
                                background: project.status === "active" 
                                  ? "rgba(154, 226, 211, 0.2)"
                                  : "rgba(196, 181, 253, 0.2)",
                                border: project.status === "active"
                                  ? "1px solid rgba(154, 226, 211, 0.4)"
                                  : "1px solid rgba(196, 181, 253, 0.4)",
                                color: project.status === "active" ? "#A7F3D0" : "#C4B5FD"
                              }}
                            >
                              {project.status}
                            </span>
                          </div>
                          {Array.isArray(project.expected_traits) && project.expected_traits.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-3">
                              {project.expected_traits.slice(0, 4).map((trait, idx) => (
                                <span
                                  key={idx}
                                  className="px-2 py-0.5 rounded-lg text-xs backdrop-blur-xl"
                                  style={{
                                    background: "rgba(168, 159, 239, 0.15)",
                                    border: "1px solid rgba(168, 159, 239, 0.3)",
                                    color: "#C4B5FD"
                                  }}
                                >
                                  {trait}
                                </span>
                              ))}
                              {project.expected_traits.length > 4 && (
                                <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
                                  +{project.expected_traits.length - 4}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* Liked Posts Tab (Own Profile Only) */}
            {activeTab === "liked" && isOwnProfile && (
              <>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold flex items-center gap-2" style={{ 
                    color: "var(--text-primary)",
                    textShadow: "var(--heading-shadow)",
                    fontFamily: "'Playfair Display', Georgia, serif"
                  }}>
                    <Heart className="w-6 h-6" style={{ color: "#FCA5A5", strokeWidth: 1.5 }} />
                    Liked Posts
                  </h2>
                  <p className="text-sm mt-2" style={{ color: "var(--text-secondary)" }}>
                    {likedPosts.length} {likedPosts.length === 1 ? 'post' : 'posts'} you've liked
                  </p>
                </div>

                {likedPosts.length === 0 ? (
                  <div className="glass-card rounded-[32px] p-12 text-center">
                    <div className="w-20 h-20 rounded-[28px] flex items-center justify-center mx-auto mb-6"
                      style={{
                        background: "linear-gradient(135deg, rgba(252, 165, 165, 0.2) 0%, rgba(248, 113, 113, 0.15) 100%)",
                        border: "1px solid rgba(252, 165, 165, 0.4)"
                      }}>
                      <Heart className="w-10 h-10" style={{ color: "#FCA5A5", strokeWidth: 1.5 }} />
                    </div>
                    <h3 className="text-xl font-bold mb-2" style={{ 
                      color: 'var(--text-primary)',
                      fontFamily: "'Playfair Display', Georgia, serif"
                    }}>
                      No Liked Posts
                    </h3>
                    <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>
                      Start exploring the community and like posts that inspire you
                    </p>
                    <button
                      onClick={() => navigate(createPageUrl("CommunityFeed"))}
                      className="glass-accent-lavender px-6 py-3 rounded-2xl font-semibold"
                      style={{ color: "var(--text-primary)" }}
                    >
                      Explore Community
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {likedPosts.map(post => (
                      <PostCard 
                        key={post.id} 
                        post={post} 
                        currentUser={currentUser}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
