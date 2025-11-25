
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Heart, MessageCircle, Star, User, Trash2, Send, X } from "lucide-react";
import { createPageUrl } from "@/utils";
import { format } from "date-fns";

const LOGO_URL = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/690e3cd78523fb5fba0a8466/632f6e485_PlantLogos.png";

export default function PostDetail() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const postId = urlParams.get('id');
  const [commentText, setCommentText] = useState("");
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);

  const { data: post, isLoading } = useQuery({
    queryKey: ['communityPost', postId],
    queryFn: () => base44.entities.CommunityPost.filter({ id: postId }).then(posts => posts[0]),
    enabled: !!postId
  });

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: comments = [] } = useQuery({
    queryKey: ['postComments', postId],
    queryFn: () => base44.entities.PostComment.filter({ post_id: postId }, '-created_date'),
    enabled: !!postId,
    initialData: []
  });

  const { data: userLike } = useQuery({
    queryKey: ['postLike', postId, currentUser?.email],
    queryFn: () => base44.entities.PostLike.filter({ 
      post_id: postId, 
      created_by: currentUser?.email 
    }).then(likes => likes[0]),
    enabled: !!currentUser && !!postId,
  });

  const likeMutation = useMutation({
    mutationFn: async () => {
      if (userLike) {
        await base44.entities.PostLike.delete(userLike.id);
        await base44.entities.CommunityPost.update(postId, {
          like_count: Math.max(0, (post.like_count || 0) - 1)
        });
      } else {
        await base44.entities.PostLike.create({ post_id: postId });
        await base44.entities.CommunityPost.update(postId, {
          like_count: (post.like_count || 0) + 1
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['postLike', postId] });
      queryClient.invalidateQueries({ queryKey: ['communityPost', postId] });
      queryClient.invalidateQueries({ queryKey: ['communityPosts'] });
    }
  });

  const commentMutation = useMutation({
    mutationFn: async (comment) => {
      await base44.entities.PostComment.create({ post_id: postId, comment });
      await base44.entities.CommunityPost.update(postId, {
        comment_count: (post.comment_count || 0) + 1
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['postComments', postId] });
      queryClient.invalidateQueries({ queryKey: ['communityPost', postId] });
      queryClient.invalidateQueries({ queryKey: ['communityPosts'] });
      setCommentText("");
    }
  });

  const deleteCommentMutation = useMutation({
    mutationFn: async (commentId) => {
      await base44.entities.PostComment.delete(commentId);
      await base44.entities.CommunityPost.update(postId, {
        comment_count: Math.max(0, (post.comment_count || 0) - 1)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['postComments', postId] });
      queryClient.invalidateQueries({ queryKey: ['communityPost', postId] });
      queryClient.invalidateQueries({ queryKey: ['communityPosts'] });
    }
  });

  const deletePostMutation = useMutation({
    mutationFn: () => base44.entities.CommunityPost.delete(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communityPosts'] });
      navigate(createPageUrl("CommunityFeed"));
    }
  });

  const addToWishlistMutation = useMutation({
    mutationFn: (wishlistData) => base44.entities.Wishlist.create(wishlistData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      alert('Added to wishlist!');
    }
  });

  const handleLike = () => {
    if (!currentUser) {
      alert('Please log in to like posts');
      return;
    }
    likeMutation.mutate();
  };

  const handleComment = (e) => {
    e.preventDefault();
    if (!currentUser) {
      alert('Please log in to comment');
      return;
    }
    if (commentText.trim()) {
      commentMutation.mutate(commentText.trim());
    }
  };

  const handleDeleteComment = (commentId) => {
    if (window.confirm('Delete this comment?')) {
      deleteCommentMutation.mutate(commentId);
    }
  };

  const handleDeletePost = () => {
    if (window.confirm('Delete this post? This action cannot be undone.')) {
      deletePostMutation.mutate();
    }
  };

  const handleAddToWishlist = () => {
    if (!currentUser?.id) {
      alert('Please log in to add to wishlist');
      return;
    }

    const wishlistData = {
      user_id: currentUser.id,
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

  if (isLoading) {
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

  if (!post) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="glass-card rounded-3xl p-12 text-center">
          <p style={{ color: "var(--text-primary)" }} className="font-medium">Post not found</p>
        </div>
      </div>
    );
  }

  const isOwnPost = currentUser?.email === post.created_by;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8 flex-wrap">
        <button
          onClick={() => navigate(createPageUrl("CommunityFeed"))}
          className="glass-button w-12 h-12 rounded-2xl flex items-center justify-center"
          style={{ color: "var(--accent)" }}
        >
          <ArrowLeft className="w-5 h-5" style={{ strokeWidth: 2 }} />
        </button>
        <div className="flex-1 min-w-[200px]">
          <h1 className="text-3xl font-bold" style={{ 
            color: "var(--text-primary)",
            textShadow: "var(--heading-shadow)",
            fontFamily: "'Playfair Display', Georgia, serif"
          }}>
            {post.title}
          </h1>
        </div>
        {isOwnPost && (
          <button
            onClick={handleDeletePost}
            className="w-12 h-12 rounded-2xl flex items-center justify-center backdrop-blur-md"
            style={{
              background: "linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(220, 38, 38, 0.15) 100%)",
              border: "1px solid rgba(239, 68, 68, 0.45)",
              color: "#FCA5A5"
            }}
          >
            <Trash2 className="w-5 h-5" style={{ strokeWidth: 2 }} />
          </button>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - Photo Gallery */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card rounded-3xl overflow-hidden">
            {/* Main Photo */}
            <div className="aspect-square relative overflow-hidden"
              style={{
                boxShadow: "inset 0 2px 12px rgba(32, 24, 51, 0.4)"
              }}>
              {post.photos && post.photos[selectedPhotoIndex] ? (
                <img 
                  src={post.photos[selectedPhotoIndex]} 
                  alt={post.cultivar_name}
                  className="w-full h-full object-cover"
                  style={{ filter: "contrast(1.05) saturate(1.1)" }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center p-12"
                  style={{
                    background: "linear-gradient(135deg, rgba(168, 159, 239, 0.15) 0%, rgba(154, 226, 211, 0.12) 100%)"
                  }}>
                  <img 
                    src={LOGO_URL} 
                    alt="No photo" 
                    className="w-full h-full object-contain opacity-40"
                  />
                </div>
              )}
            </div>

            {/* Thumbnail Gallery */}
            {post.photos && post.photos.length > 1 && (
              <div className="p-4 grid grid-cols-5 gap-2">
                {post.photos.map((photo, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedPhotoIndex(index)}
                    className={`aspect-square rounded-xl overflow-hidden ${
                      selectedPhotoIndex === index ? "ring-2 ring-offset-0" : ""
                    }`}
                    style={{
                      ringColor: "rgba(168, 159, 239, 0.6)",
                      boxShadow: "inset 0 2px 8px rgba(32, 24, 51, 0.4)"
                    }}
                  >
                    <img src={photo} alt={`View ${index + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Comments Section */}
          <div className="glass-card rounded-3xl p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ 
              color: "var(--text-primary)",
              textShadow: "var(--heading-shadow)",
              fontFamily: "'Playfair Display', Georgia, serif"
            }}>
              <MessageCircle className="w-5 h-5" style={{ color: "#C4B5FD", strokeWidth: 2 }} />
              Comments ({comments.length})
            </h3>

            {/* Comment Form */}
            {currentUser && (
              <form onSubmit={handleComment} className="mb-6">
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Add a comment..."
                    className="glass-input flex-1 px-4 py-3 rounded-2xl"
                    style={{ color: "var(--text-primary)" }}
                  />
                  <button
                    type="submit"
                    disabled={!commentText.trim() || commentMutation.isPending}
                    className="glass-accent-lavender px-6 py-3 rounded-2xl font-semibold flex items-center gap-2 disabled:opacity-50"
                    style={{ color: "#F0EBFF" }}
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </form>
            )}

            {/* Comments List */}
            <div className="space-y-3">
              {comments.length === 0 ? (
                <p className="text-center py-8 text-sm" style={{ color: "var(--text-secondary)" }}>
                  No comments yet. Be the first to comment!
                </p>
              ) : (
                comments.map(comment => (
                  <div key={comment.id} className="glass-button rounded-2xl p-4 group">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center glass-card">
                        <User className="w-4 h-4" style={{ color: "#C4B5FD", strokeWidth: 2 }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                            {comment.created_by?.split('@')[0]}
                          </p>
                          <div className="flex items-center gap-2">
                            <p className="text-xs" style={{ color: "var(--text-secondary)", opacity: 0.6 }}>
                              {format(new Date(comment.created_date), "MMM d, h:mm a")}
                            </p>
                            {currentUser?.email === comment.created_by && (
                              <button
                                onClick={() => handleDeleteComment(comment.id)}
                                className="opacity-0 group-hover:opacity-100 transition-opacity"
                                style={{ color: "#FCA5A5" }}
                              >
                                <X className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                          {comment.comment}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Details */}
        <div className="lg:col-span-1 space-y-6">
          {/* Post Info */}
          <div className="glass-card rounded-3xl p-6 space-y-4">
            <div>
              <h2 className="text-2xl font-bold mb-1" style={{ 
                color: "var(--text-primary)",
                textShadow: "var(--heading-shadow)",
                fontFamily: "'Playfair Display', Georgia, serif"
              }}>
                {post.cultivar_name}
              </h2>
              {post.hybridizer && (
                <p className="text-sm" style={{ color: "var(--text-secondary)", opacity: 0.8 }}>
                  by {post.hybridizer}
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-3" 
              style={{ borderTop: "1px solid rgba(227, 201, 255, 0.2)" }}>
              <button
                onClick={handleLike}
                disabled={likeMutation.isPending}
                className="flex items-center gap-2 glass-button px-4 py-3 rounded-2xl hover:opacity-80 transition-opacity"
              >
                <Heart 
                  className="w-5 h-5" 
                  style={{ 
                    color: userLike ? "#FCA5A5" : "var(--text-secondary)",
                    fill: userLike ? "#FCA5A5" : "none",
                    strokeWidth: 2
                  }} 
                />
                <span className="text-sm font-semibold" style={{ color: "var(--text-secondary)" }}>
                  {post.like_count || 0}
                </span>
              </button>

              <button
                onClick={handleAddToWishlist}
                disabled={addToWishlistMutation.isPending}
                className="flex-1 glass-accent-moss px-4 py-3 rounded-2xl font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
                style={{ color: "#A7F3D0" }}
              >
                <Star className="w-4 h-4" style={{ strokeWidth: 2 }} />
                Add to Wishlist
              </button>
            </div>

            {/* Posted By */}
            <div className="pt-3" style={{ borderTop: "1px solid rgba(227, 201, 255, 0.2)" }}>
              <p className="text-xs font-semibold mb-2" style={{ color: "var(--text-secondary)", opacity: 0.8 }}>
                Posted By
              </p>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full flex items-center justify-center glass-button">
                  <User className="w-5 h-5" style={{ color: "#C4B5FD", strokeWidth: 2 }} />
                </div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                    {post.created_by?.split('@')[0]}
                  </p>
                  <p className="text-xs" style={{ color: "var(--text-secondary)", opacity: 0.6 }}>
                    {format(new Date(post.created_date), "MMMM d, yyyy")}
                  </p>
                </div>
              </div>
            </div>

            {/* Description */}
            {post.description && (
              <div className="pt-3" style={{ borderTop: "1px solid rgba(227, 201, 255, 0.2)" }}>
                <p className="text-sm whitespace-pre-wrap" style={{ color: "var(--text-secondary)" }}>
                  {post.description}
                </p>
              </div>
            )}

            {/* Plant Details */}
            {(post.blossom_type || post.blossom_color || post.leaf_type) && (
              <div className="pt-3" style={{ borderTop: "1px solid rgba(227, 201, 255, 0.2)" }}>
                <p className="text-xs font-semibold mb-2" style={{ color: "var(--text-secondary)", opacity: 0.8 }}>
                  Plant Details
                </p>
                <div className="space-y-1 text-sm" style={{ color: "var(--text-secondary)" }}>
                  {post.blossom_color && <p>Color: {post.blossom_color}</p>}
                  {post.blossom_type && <p>Blossom: {post.blossom_type}</p>}
                  {post.leaf_type && <p>Foliage: {post.leaf_type}</p>}
                </div>
              </div>
            )}

            {/* Care Tips */}
            {post.care_tips && (
              <div className="pt-3" style={{ borderTop: "1px solid rgba(227, 201, 255, 0.2)" }}>
                <p className="text-xs font-semibold mb-2" style={{ color: "var(--text-secondary)", opacity: 0.8 }}>
                  Care Tips
                </p>
                <p className="text-sm whitespace-pre-wrap" style={{ color: "var(--text-secondary)" }}>
                  {post.care_tips}
                </p>
              </div>
            )}

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="pt-3" style={{ borderTop: "1px solid rgba(227, 201, 255, 0.2)" }}>
                <div className="flex flex-wrap gap-1.5">
                  {post.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 rounded-lg text-xs font-medium backdrop-blur-xl"
                      style={{
                        background: "rgba(154, 226, 211, 0.15)",
                        border: "1px solid rgba(154, 226, 211, 0.3)",
                        color: "#A7F3D0"
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
