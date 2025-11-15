
import React, { useState } from "react";
import { Heart, MessageCircle, Star, User, Bookmark, Shield, Trash2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import PostDetailModal from "./PostDetailModal";
import { toast } from "sonner";

const LOGO_URL = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/690e3cd78523fb5fba0a8466/632f6e485_PlantLogos.png";

export default function PostCard({ post, currentUser }) {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);

  // Check if this is the current user's post
  const isOwnPost = currentUser?.email === post.created_by;
  const isAdmin = currentUser?.role === 'admin';

  // Check if current user liked this post
  const { data: userLike } = useQuery({
    queryKey: ['postLike', post.id, currentUser?.email],
    queryFn: () => base44.entities.PostLike.filter({ 
      post_id: post.id, 
      created_by: currentUser?.email 
    }).then(likes => likes[0]),
    enabled: !!currentUser,
  });

  // Check if current user saved this post
  const { data: userSaved } = useQuery({
    queryKey: ['savedPost', post.id, currentUser?.email],
    queryFn: () => base44.entities.SavedPost.filter({ 
      post_id: post.id, 
      created_by: currentUser?.email 
    }).then(saves => saves[0]),
    enabled: !!currentUser,
  });

  // Fetch post author's profile (skip if it's current user)
  const { data: postAuthor, isLoading: authorLoading } = useQuery({
    queryKey: ['userProfile', post.created_by],
    queryFn: async () => {
      try {
        const users = await base44.entities.User.list();
        const found = users.find(u => u.email === post.created_by);
        console.log('Found user for', post.created_by, ':', found);
        return found;
      } catch (error) {
        console.error('Error fetching user profile:', error);
        return null;
      }
    },
    enabled: !!post.created_by && !isOwnPost,
    staleTime: 5 * 60 * 1000,
  });

  // Use currentUser data if this is their own post
  const author = isOwnPost ? currentUser : postAuthor;

  const likeMutation = useMutation({
    mutationFn: async () => {
      if (userLike) {
        await base44.entities.PostLike.delete(userLike.id);
        await base44.entities.CommunityPost.update(post.id, {
          like_count: Math.max(0, (post.like_count || 0) - 1)
        });
      } else {
        await base44.entities.PostLike.create({ post_id: post.id });
        await base44.entities.CommunityPost.update(post.id, {
          like_count: (post.like_count || 0) + 1
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['postLike', post.id] });
      queryClient.invalidateQueries({ queryKey: ['communityPosts'] });
    }
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (userSaved) {
        await base44.entities.SavedPost.delete(userSaved.id);
      } else {
        await base44.entities.SavedPost.create({ post_id: post.id });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savedPost', post.id] });
    }
  });

  const addToWishlistMutation = useMutation({
    mutationFn: (wishlistData) => base44.entities.Wishlist.create(wishlistData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      toast.success("Added to wishlist!");
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      await base44.entities.CommunityPost.delete(post.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communityPosts'] });
      queryClient.invalidateQueries({ queryKey: ['userPosts'] });
      toast.success("Post deleted", {
        description: "The post has been removed from the community."
      });
    },
    onError: (error) => {
      toast.error("Failed to delete post", {
        description: error.message || "Please try again."
      });
    }
  });

  const handleLike = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!currentUser) {
      toast.warning('Please log in to like posts');
      return;
    }
    likeMutation.mutate();
  };

  const handleSave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!currentUser) {
      toast.warning('Please log in to save posts');
      return;
    }
    saveMutation.mutate();
  };

  const handleAddToWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!currentUser) {
      toast.warning('Please log in to add to wishlist');
      return;
    }

    const wishlistData = {
      cultivar_name: post.cultivar_name,
      hybridizer: post.hybridizer || "",
      priority: "medium",
      desired_traits: post.tags || [],
      blossom_type: post.blossom_type || "",
      blossom_color: post.blossom_color || "",
      leaf_type: post.leaf_type || "",
      photo_url: post.photos?.[0] || "",
      notes: `From community post by ${post.created_by}\n\n${post.description || ""}`,
      date_added: new Date().toISOString().split('T')[0]
    };

    addToWishlistMutation.mutate(wishlistData);
  };

  const handleDeletePost = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm('Delete this post? This action cannot be undone.')) {
      deleteMutation.mutate();
    }
  };

  const handleCardClick = () => {
    setShowModal(true);
  };

  const primaryPhoto = post.photos?.[0];
  const hasPhotos = post.photos && post.photos.length > 0;
  
  const displayName = (isOwnPost || !authorLoading) 
    ? (author?.username || author?.full_name || post.created_by?.split('@')[0] || 'User')
    : "Loading...";

  return (
    <>
      <div onClick={handleCardClick} className="cursor-pointer">
        <div className="glass-card rounded-[32px] overflow-hidden hover:shadow-2xl transition-all duration-500 group">
          {/* Photo or Text Placeholder */}
          <div className="relative aspect-square overflow-hidden"
            style={{
              boxShadow: "inset 0 2px 12px rgba(32, 24, 51, 0.4)"
            }}>
            {hasPhotos ? (
              <>
                <img 
                  src={primaryPhoto} 
                  alt={post.cultivar_name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  style={{ filter: "contrast(1.05) saturate(1.1)" }}
                />

                {post.photos.length > 1 && (
                  <div className="absolute top-3 right-3 px-3 py-1.5 rounded-xl text-sm font-semibold backdrop-blur-xl"
                    style={{
                      background: "rgba(0, 0, 0, 0.6)",
                      border: "1px solid rgba(255, 255, 255, 0.2)",
                      color: "#FFF"
                    }}>
                    +{post.photos.length - 1}
                  </div>
                )}
              </>
            ) : (
              <div 
                className="w-full h-full flex items-center justify-center p-12"
                style={{
                  background: "linear-gradient(135deg, rgba(168, 159, 239, 0.15) 0%, rgba(154, 226, 211, 0.12) 100%)"
                }}
              >
                <div className="text-center">
                  <img 
                    src={LOGO_URL} 
                    alt="Text post" 
                    className="w-20 h-20 object-contain opacity-40 mx-auto mb-3"
                  />
                  <p className="text-sm font-semibold" style={{ color: "#C4B5FD" }}>
                    Text Post
                  </p>
                </div>
              </div>
            )}

            <div className="absolute top-3 left-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={handleAddToWishlist}
                disabled={addToWishlistMutation.isPending}
                className="w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-xl"
                style={{
                  background: "rgba(227, 201, 255, 0.9)",
                  border: "1px solid rgba(255, 255, 255, 0.3)",
                  color: "#4F3F73",
                  boxShadow: "0 2px 8px rgba(227, 201, 255, 0.5)"
                }}
              >
                <Star className="w-5 h-5" style={{ strokeWidth: 2 }} />
              </button>
              <button
                onClick={handleSave}
                disabled={saveMutation.isPending}
                className="w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-xl"
                style={{
                  background: userSaved ? "rgba(154, 226, 211, 0.9)" : "rgba(227, 201, 255, 0.9)",
                  border: "1px solid rgba(255, 255, 255, 0.3)",
                  color: userSaved ? "#059669" : "#4F3F73",
                  boxShadow: userSaved ? "0 2px 8px rgba(154, 226, 211, 0.5)" : "0 2px 8px rgba(227, 201, 255, 0.5)"
                }}
              >
                <Bookmark 
                  className="w-5 h-5" 
                  style={{ 
                    strokeWidth: 2,
                    fill: userSaved ? "currentColor" : "none"
                  }} 
                />
              </button>
              {/* Admin Delete Button */}
              {isAdmin && (
                <button
                  onClick={handleDeletePost}
                  disabled={deleteMutation.isPending}
                  className="w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-xl"
                  style={{
                    background: "rgba(239, 68, 68, 0.9)",
                    border: "1px solid rgba(255, 255, 255, 0.3)",
                    color: "#FFF",
                    boxShadow: "0 2px 8px rgba(239, 68, 68, 0.5)"
                  }}
                  title="Delete post (Admin)"
                >
                  <Trash2 className="w-5 h-5" style={{ strokeWidth: 2 }} />
                </button>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="p-5 space-y-3">
            {/* Title & Cultivar */}
            <div>
              <h3 className="text-lg font-bold mb-1 line-clamp-1" style={{ 
                color: "#F5F3FF",
                textShadow: "0 1px 3px rgba(32, 24, 51, 0.4)",
                fontFamily: "'Playfair Display', Georgia, serif"
              }}>
                {post.title}
              </h3>
              <p className="text-sm font-semibold" style={{ color: "#C4B5FD" }}>
                {post.cultivar_name}
              </p>
              {post.hybridizer && (
                <p className="text-xs" style={{ color: "#DDD6FE", opacity: 0.8 }}>
                  by {post.hybridizer}
                </p>
              )}
            </div>

            {post.description && (
              <p className="text-sm line-clamp-2" style={{ color: "#DDD6FE" }}>
                {post.description}
              </p>
            )}

            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {post.tags.slice(0, 3).map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded-lg text-xs backdrop-blur-xl"
                    style={{
                      background: "rgba(154, 226, 211, 0.15)",
                      border: "1px solid rgba(154, 226, 211, 0.3)",
                      color: "#A7F3D0"
                    }}
                  >
                    {tag}
                  </span>
                ))}
                {post.tags.length > 3 && (
                  <span className="text-xs" style={{ color: "#DDD6FE" }}>
                    +{post.tags.length - 3}
                  </span>
                )}
              </div>
            )}

            {/* User & Engagement */}
            <div className="flex items-center justify-between pt-2" 
              style={{ borderTop: "1px solid rgba(227, 201, 255, 0.2)" }}>
              <Link 
                to={createPageUrl(`PublicProfile?email=${post.created_by}`)}
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-2 hover:opacity-80 transition-opacity"
              >
                <div className="w-8 h-8 rounded-full overflow-hidden glass-button">
                  {author?.profile_picture ? (
                    <img 
                      src={author.profile_picture} 
                      alt={displayName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="w-4 h-4" style={{ color: "#C4B5FD", strokeWidth: 2 }} />
                    </div>
                  )}
                </div>
                <div className="text-xs">
                  <div className="flex items-center gap-1.5">
                    <p className="font-semibold" style={{ color: "#F5F3FF" }}>
                      {displayName}
                    </p>
                    {author?.role === 'admin' && (
                      <div 
                        className="px-1.5 py-0.5 rounded flex items-center gap-0.5"
                        style={{
                          background: "linear-gradient(135deg, rgba(252, 211, 77, 0.25) 0%, rgba(251, 191, 36, 0.2) 100%)",
                          border: "1px solid rgba(252, 211, 77, 0.4)"
                        }}
                        title="Administrator"
                      >
                        <Shield className="w-3 h-3" style={{ color: "#FCD34D", strokeWidth: 2 }} />
                      </div>
                    )}
                  </div>
                  <p style={{ color: "#DDD6FE", opacity: 0.6 }}>
                    {format(new Date(post.created_date), "MMM d")}
                  </p>
                </div>
              </Link>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleLike}
                  disabled={likeMutation.isPending}
                  className="flex items-center gap-1 hover:opacity-80 transition-opacity"
                >
                  <Heart 
                    className="w-5 h-5" 
                    style={{ 
                      color: userLike ? "#FCA5A5" : "#DDD6FE",
                      fill: userLike ? "#FCA5A5" : "none",
                      strokeWidth: 2
                    }} 
                  />
                  <span className="text-sm font-semibold" style={{ color: "#DDD6FE" }}>
                    {post.like_count || 0}
                  </span>
                </button>

                <div className="flex items-center gap-1">
                  <MessageCircle className="w-5 h-5" style={{ color: "#DDD6FE", strokeWidth: 2 }} />
                  <span className="text-sm font-semibold" style={{ color: "#DDD6FE" }}>
                    {post.comment_count || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <PostDetailModal 
          post={post} 
          currentUser={currentUser}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}
