
import React, { useState } from "react";
import { X, Heart, MessageCircle, Star, User, Bookmark, Send, ChevronLeft, ChevronRight, Shield, Trash2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { format } from "date-fns";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { toast } from "sonner";

const LOGO_URL = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/690e3cd78523fb5fba0a8466/632f6e485_PlantLogos.png";

export default function PostDetailModal({ post, currentUser, onClose }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [commentText, setCommentText] = useState("");
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);

  // Check if this is the current user's post
  const isOwnPost = currentUser?.email === post.created_by;
  const isAdmin = currentUser?.role === 'admin';

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

  const { data: comments = [] } = useQuery({
    queryKey: ['postComments', post.id],
    queryFn: () => base44.entities.PostComment.filter({ 
      post_id: post.id,
      moderation_status: "active"
    }, '-created_date'),
    initialData: []
  });

  // Fetch all unique comment authors
  const commentAuthors = [...new Set(comments.map(c => c.created_by))].filter(email => email !== currentUser?.email);
  const { data: commentAuthorProfiles = [] } = useQuery({
    queryKey: ['commentAuthors', commentAuthors],
    queryFn: async () => {
      if (commentAuthors.length === 0) return [];
      try {
        const allUsers = await base44.entities.User.list();
        return commentAuthors.map(email => 
          allUsers.find(u => u.email === email)
        ).filter(p => p);
      } catch (error) {
        console.error('Error fetching comment authors:', error);
        return [];
      }
    },
    enabled: commentAuthors.length > 0,
    staleTime: 5 * 60 * 1000,
  });

  const { data: userLike } = useQuery({
    queryKey: ['postLike', post.id, currentUser?.email],
    queryFn: () => base44.entities.PostLike.filter({ 
      post_id: post.id, 
      created_by: currentUser?.email 
    }).then(likes => likes[0]),
    enabled: !!currentUser,
  });

  const { data: userSaved } = useQuery({
    queryKey: ['savedPost', post.id, currentUser?.email],
    queryFn: () => base44.entities.SavedPost.filter({ 
      post_id: post.id, 
      created_by: currentUser?.email 
    }).then(saves => saves[0]),
    enabled: !!currentUser,
  });

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
      toast.success(userSaved ? "Removed from saved" : "Post saved!", {
        description: userSaved ? "Post removed from your saved collection." : "You can view this later in your saved posts."
      });
    }
  });

  const commentMutation = useMutation({
    mutationFn: async (comment) => {
      await base44.entities.PostComment.create({ 
        post_id: post.id, 
        comment,
        moderation_status: "active"
      });
      await base44.entities.CommunityPost.update(post.id, {
        comment_count: (post.comment_count || 0) + 1
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['postComments', post.id] });
      queryClient.invalidateQueries({ queryKey: ['communityPosts'] });
      queryClient.invalidateQueries({ queryKey: ['userComments'] });
      setCommentText("");
      toast.success("Comment posted!", {
        description: "Your comment has been added to the discussion."
      });
    },
    onError: (error) => {
      toast.error("Failed to post comment", {
        description: error.message || "Please try again."
      });
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
      onClose();
      navigate(createPageUrl("CommunityFeed"));
    },
    onError: (error) => {
      toast.error("Failed to delete post", {
        description: error.message || "Please try again."
      });
    }
  });

  const deleteCommentMutation = useMutation({
    mutationFn: async (commentId) => {
      await base44.entities.PostComment.delete(commentId);
      await base44.entities.CommunityPost.update(post.id, {
        comment_count: Math.max(0, (post.comment_count || 0) - 1)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['postComments', post.id] });
      queryClient.invalidateQueries({ queryKey: ['communityPosts'] });
      queryClient.invalidateQueries({ queryKey: ['userComments'] });
      toast.success("Comment deleted", {
        description: "The comment has been removed."
      });
    },
    onError: (error) => {
      toast.error("Failed to delete comment", {
        description: error.message || "Please try again."
      });
    }
  });

  const addToWishlistMutation = useMutation({
    mutationFn: (wishlistData) => base44.entities.Wishlist.create(wishlistData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      toast.success("Added to wishlist!", {
        description: "This plant has been added to your wishlist."
      });
    },
    onError: (error) => {
      toast.error("Failed to add to wishlist", {
        description: error.message || "Please try again."
      });
    }
  });

  const handleLike = () => {
    if (!currentUser) {
      toast.error("Login required", {
        description: "Please log in to like posts."
      });
      return;
    }
    likeMutation.mutate();
  };

  const handleSave = () => {
    if (!currentUser) {
      toast.error("Login required", {
        description: "Please log in to save posts."
      });
      return;
    }
    saveMutation.mutate();
  };

  const handleComment = (e) => {
    e.preventDefault();
    if (!currentUser) {
      toast.error("Login required", {
        description: "Please log in to comment."
      });
      return;
    }
    if (commentText.trim()) {
      commentMutation.mutate(commentText.trim());
    }
  };

  const handleDeletePost = () => {
    if (window.confirm('Delete this post? This action cannot be undone.')) {
      deleteMutation.mutate();
    }
  };

  const handleDeleteComment = (commentId) => {
    if (window.confirm('Delete this comment?')) {
      deleteCommentMutation.mutate(commentId);
    }
  };

  const handleAddToWishlist = () => {
    if (!currentUser) {
      toast.error("Login required", {
        description: "Please log in to add plants to your wishlist."
      });
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

  const getCommentAuthor = (email) => {
    // Return current user if it's their comment
    if (email === currentUser?.email) return currentUser;
    return commentAuthorProfiles.find(p => p.email === email);
  };

  const photos = post.photos || [];
  const hasPhotos = photos.length > 0;
  const displayName = (isOwnPost || !authorLoading)
    ? (author?.username || author?.full_name || post.created_by?.split('@')[0] || 'User')
    : "Loading...";

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="glass-card rounded-[32px] w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="backdrop-blur-2xl rounded-t-[32px] p-6 flex items-center justify-between"
          style={{
            background: "linear-gradient(135deg, rgba(227, 201, 255, 0.2) 0%, rgba(168, 159, 239, 0.15) 100%)",
            borderBottom: "1px solid rgba(227, 201, 255, 0.2)"
          }}>
          <h2 className="text-2xl font-bold" style={{ 
            color: "#F5F3FF",
            textShadow: "0 2px 4px rgba(32, 24, 51, 0.4)",
            fontFamily: "'Playfair Display', Georgia, serif"
          }}>
            {post.title}
          </h2>
          <div className="flex items-center gap-2">
            {/* Admin Delete Post Button */}
            {isAdmin && (
              <button
                onClick={handleDeletePost}
                disabled={deleteMutation.isPending}
                className="w-10 h-10 rounded-2xl flex items-center justify-center backdrop-blur-md"
                style={{
                  background: "linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(220, 38, 38, 0.15) 100%)",
                  border: "1px solid rgba(239, 68, 68, 0.45)",
                  color: "#FCA5A5",
                  boxShadow: "0 2px 12px rgba(239, 68, 68, 0.35), inset 0 0.5px 0 rgba(255, 255, 255, 0.2)"
                }}
                title="Delete post (Admin)"
              >
                <Trash2 className="w-5 h-5" style={{ strokeWidth: 2 }} />
              </button>
            )}
            <button
              onClick={onClose}
              className="glass-button w-10 h-10 rounded-2xl flex items-center justify-center"
              style={{ color: "#FCA5A5" }}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Left: Photo or Text Content */}
            <div>
              {hasPhotos ? (
                <div className="glass-card rounded-3xl overflow-hidden">
                  <div className="aspect-square relative overflow-hidden"
                    style={{
                      boxShadow: "inset 0 2px 12px rgba(32, 24, 51, 0.4)"
                    }}>
                    <img 
                      src={photos[selectedPhotoIndex]} 
                      alt={post.cultivar_name}
                      className="w-full h-full object-cover"
                      style={{ filter: "contrast(1.05) saturate(1.1)" }}
                    />
                    
                    {photos.length > 1 && (
                      <>
                        <button
                          onClick={() => setSelectedPhotoIndex((selectedPhotoIndex - 1 + photos.length) % photos.length)}
                          className="absolute left-3 top-1/2 -translate-y-1/2 glass-button w-10 h-10 rounded-full flex items-center justify-center"
                          style={{ color: "#F5F3FF" }}
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => setSelectedPhotoIndex((selectedPhotoIndex + 1) % photos.length)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 glass-button w-10 h-10 rounded-full flex items-center justify-center"
                          style={{ color: "#F5F3FF" }}
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>
                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                          {photos.map((_, index) => (
                            <button
                              key={index}
                              onClick={() => setSelectedPhotoIndex(index)}
                              className={`w-2 h-2 rounded-full transition-all ${
                                selectedPhotoIndex === index ? "w-6 glass-accent-lavender" : "glass-button"
                              }`}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ) : (
                <div className="glass-card rounded-3xl p-8 text-center">
                  <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 glass-accent-lavender p-3">
                    <img src={LOGO_URL} alt="Text post" className="w-full h-full object-contain" />
                  </div>
                  <p className="text-sm" style={{ color: "#DDD6FE", opacity: 0.8 }}>
                    Text-only post
                  </p>
                </div>
              )}

              {/* Post Info Card */}
              <div className="glass-card rounded-3xl p-6 mt-4 space-y-4">
                <div>
                  <h2 className="text-2xl font-bold mb-1" style={{ 
                    color: "#F5F3FF",
                    textShadow: "0 2px 4px rgba(32, 24, 51, 0.4)",
                    fontFamily: "'Playfair Display', Georgia, serif"
                  }}>
                    {post.cultivar_name}
                  </h2>
                  {post.hybridizer && (
                    <p className="text-sm" style={{ color: "#DDD6FE", opacity: 0.8 }}>
                      by {post.hybridizer}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-wrap pt-3" 
                  style={{ borderTop: "1px solid rgba(227, 201, 255, 0.2)" }}>
                  <button
                    onClick={handleLike}
                    disabled={likeMutation.isPending}
                    className="flex items-center gap-2 glass-button px-4 py-2.5 rounded-2xl hover:opacity-80 transition-opacity"
                  >
                    <Heart 
                      className="w-4 h-4" 
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

                  <div className="flex items-center gap-2 glass-button px-4 py-2.5 rounded-2xl">
                    <MessageCircle className="w-4 h-4" style={{ color: "#C4B5FD", strokeWidth: 2 }} />
                    <span className="text-sm font-semibold" style={{ color: "#DDD6FE" }}>
                      {post.comment_count || 0}
                    </span>
                  </div>

                  <button
                    onClick={handleSave}
                    disabled={saveMutation.isPending}
                    className="flex items-center gap-2 glass-button px-4 py-2.5 rounded-2xl hover:opacity-80 transition-opacity"
                  >
                    <Bookmark 
                      className="w-4 h-4" 
                      style={{ 
                        color: userSaved ? "#A7F3D0" : "#DDD6FE",
                        fill: userSaved ? "#A7F3D0" : "none",
                        strokeWidth: 2
                      }} 
                    />
                  </button>

                  <button
                    onClick={handleAddToWishlist}
                    disabled={addToWishlistMutation.isPending}
                    className="flex-1 glass-accent-moss px-4 py-2.5 rounded-2xl font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
                    style={{ color: "#A7F3D0" }}
                  >
                    <Star className="w-4 h-4" style={{ strokeWidth: 2 }} />
                    Wishlist
                  </button>
                </div>

                {/* Posted By */}
                <div className="pt-3" style={{ borderTop: "1px solid rgba(227, 201, 255, 0.2)" }}>
                  <Link 
                    to={createPageUrl(`PublicProfile?email=${post.created_by}`)}
                    className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                  >
                    <div className="w-10 h-10 rounded-full overflow-hidden glass-button">
                      {author?.profile_picture ? (
                        <img 
                          src={author.profile_picture} 
                          alt={displayName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <User className="w-5 h-5" style={{ color: "#C4B5FD", strokeWidth: 2 }} />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-semibold" style={{ color: "#F5F3FF" }}>
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
                      <p className="text-xs" style={{ color: "#DDD6FE", opacity: 0.6 }}>
                        {format(new Date(post.created_date), "MMMM d, yyyy")}
                      </p>
                    </div>
                  </Link>
                </div>

                {post.description && (
                  <div className="pt-3" style={{ borderTop: "1px solid rgba(227, 201, 255, 0.2)" }}>
                    <p className="text-sm whitespace-pre-wrap" style={{ color: "#DDD6FE" }}>
                      {post.description}
                    </p>
                  </div>
                )}

                {(post.blossom_type || post.blossom_color || post.leaf_type) && (
                  <div className="pt-3" style={{ borderTop: "1px solid rgba(227, 201, 255, 0.2)" }}>
                    <p className="text-xs font-semibold mb-2" style={{ color: "#C7C9E6", opacity: 0.8 }}>
                      Plant Details
                    </p>
                    <div className="space-y-1 text-sm" style={{ color: "#DDD6FE" }}>
                      {post.blossom_color && <p>Color: {post.blossom_color}</p>}
                      {post.blossom_type && <p>Blossom: {post.blossom_type}</p>}
                      {post.leaf_type && <p>Foliage: {post.leaf_type}</p>}
                    </div>
                  </div>
                )}

                {post.care_tips && (
                  <div className="pt-3" style={{ borderTop: "1px solid rgba(227, 201, 255, 0.2)" }}>
                    <p className="text-xs font-semibold mb-2" style={{ color: "#C7C9E6", opacity: 0.8 }}>
                      Care Tips
                    </p>
                    <p className="text-sm whitespace-pre-wrap" style={{ color: "#DDD6FE" }}>
                      {post.care_tips}
                    </p>
                  </div>
                )}

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

            {/* Right: Comments */}
            <div>
              <div className="glass-card rounded-3xl p-6">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ 
                  color: "#F5F3FF",
                  textShadow: "0 1px 3px rgba(32, 24, 51, 0.4)",
                  fontFamily: "'Playfair Display', Georgia, serif"
                }}>
                  <MessageCircle className="w-5 h-5" style={{ color: "#C4B5FD", strokeWidth: 2 }} />
                  Comments ({comments.length})
                </h3>

                {currentUser && (
                  <form onSubmit={handleComment} className="mb-6">
                    <div className="flex gap-3">
                      <input
                        type="text"
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder="Add a comment..."
                        className="glass-input flex-1 px-4 py-3 rounded-2xl"
                        style={{ color: "#F5F3FF" }}
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

                <div className="space-y-3 max-h-[400px] overflow-y-auto">
                  {comments.length === 0 ? (
                    <p className="text-center py-8 text-sm" style={{ color: "#DDD6FE" }}>
                      No comments yet. Be the first to comment!
                    </p>
                  ) : (
                    comments.map(comment => {
                      const commentAuthor = getCommentAuthor(comment.created_by);
                      const authorDisplayName = commentAuthor?.username || commentAuthor?.full_name || comment.created_by?.split('@')[0] || 'User';
                      const canDeleteComment = currentUser?.email === comment.created_by || isAdmin;
                      
                      return (
                        <div key={comment.id} className="glass-button rounded-2xl p-4 group">
                          <div className="flex items-start gap-3">
                            <Link to={createPageUrl(`PublicProfile?email=${comment.created_by}`)}>
                              <div className="w-8 h-8 rounded-full overflow-hidden glass-card cursor-pointer hover:opacity-80 transition-opacity">
                                {commentAuthor?.profile_picture ? (
                                  <img 
                                    src={commentAuthor.profile_picture} 
                                    alt={authorDisplayName}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <User className="w-4 h-4" style={{ color: "#C4B5FD", strokeWidth: 2 }} />
                                  </div>
                                )}
                              </div>
                            </Link>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <Link to={createPageUrl(`PublicProfile?email=${comment.created_by}`)}>
                                  <div className="flex items-center gap-1.5 hover:opacity-80 transition-opacity">
                                    <p className="text-sm font-semibold" style={{ color: "#F5F3FF" }}>
                                      {authorDisplayName}
                                    </p>
                                    {commentAuthor?.role === 'admin' && (
                                      <div 
                                        className="px-1.5 py-0.5 rounded flex items-center gap-0.5"
                                        style={{
                                          background: "linear-gradient(135deg, rgba(252, 211, 77, 0.25) 0%, rgba(251, 191, 36, 0.2) 100%)",
                                          border: "1px solid rgba(252, 211, 77, 0.4)"
                                        }}
                                        title="Administrator"
                                      >
                                        <Shield className="w-2.5 h-2.5" style={{ color: "#FCD34D", strokeWidth: 2 }} />
                                      </div>
                                    )}
                                  </div>
                                </Link>
                                <div className="flex items-center gap-2">
                                  <p className="text-xs" style={{ color: "#DDD6FE", opacity: 0.6 }}>
                                    {format(new Date(comment.created_date), "MMM d, h:mm a")}
                                  </p>
                                  {canDeleteComment && (
                                    <button
                                      onClick={() => handleDeleteComment(comment.id)}
                                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                                      style={{ color: "#FCA5A5" }}
                                      title={isAdmin && currentUser?.email !== comment.created_by ? "Delete comment (Admin)" : "Delete comment"}
                                    >
                                      <X className="w-4 h-4" />
                                    </button>
                                  )}
                                </div>
                              </div>
                              <p className="text-sm" style={{ color: "#DDD6FE" }}>
                                {comment.comment}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
