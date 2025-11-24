import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ArrowLeft, MessageSquare, ThumbsUp, Reply, CheckCircle, Trash2, Pin, Lock, User } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import ReactMarkdown from "react-markdown";

const LOGO_URL = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/690e3cd78523fb5fba0a8466/632f6e485_PlantLogos.png";

const CATEGORIES = {
  care_and_growing: { label: "Care & Growing", icon: "🌱", color: "#A7F3D0" },
  pests_and_diseases: { label: "Pests & Diseases", icon: "🐛", color: "#FCA5A5" },
  hybridizing_and_propagation: { label: "Hybridizing & Propagation", icon: "🧪", color: "#E9D5FF" },
  cultivar_discussion: { label: "Cultivar Discussion", icon: "🌸", color: "#F0ABFC" },
  show_and_tell: { label: "Show & Tell", icon: "📸", color: "#FCD34D" },
  equipment_and_supplies: { label: "Equipment & Supplies", icon: "🛠️", color: "#7DD3FC" },
  general_discussion: { label: "General Discussion", icon: "💬", color: "#C4B5FD" }
};

function ReplyItem({ reply, topicOwnerId, onMarkSolution, onDelete, level = 0, currentUser }) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const queryClient = useQueryClient();

  const { data: helpfulVotes = [] } = useQuery({
    queryKey: ['helpfulVotes', reply.id],
    queryFn: () => base44.entities.ForumHelpful.filter({ reply_id: reply.id }),
    initialData: []
  });

  const { data: nestedReplies = [] } = useQuery({
    queryKey: ['nestedReplies', reply.id],
    queryFn: () => base44.entities.ForumReply.filter({ parent_reply_id: reply.id }, 'created_date'),
    initialData: []
  });

  const createReplyMutation = useMutation({
    mutationFn: (data) => base44.entities.ForumReply.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forumReplies'] });
      queryClient.invalidateQueries({ queryKey: ['nestedReplies'] });
      setReplyContent("");
      setShowReplyForm(false);
    }
  });

  const toggleHelpfulMutation = useMutation({
    mutationFn: async () => {
      const existing = helpfulVotes.find(v => v.created_by === currentUser?.email);
      if (existing) {
        await base44.entities.ForumHelpful.delete(existing.id);
      } else {
        await base44.entities.ForumHelpful.create({ reply_id: reply.id });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['helpfulVotes', reply.id] });
    }
  });

  const hasVoted = helpfulVotes.some(v => v.created_by === currentUser?.email);
  const isOwner = reply.created_by === currentUser?.email;
  const currentTheme = currentUser?.theme || "glassmorphism";

  return (
    <div className={`${level > 0 ? 'ml-8 mt-3' : ''}`}>
      <div className={`neuro-card rounded-3xl p-6 ${reply.is_solution ? 'ring-2 ring-green-500' : ''}`}>
        <div className="flex items-start gap-4">
          <div className="neuro-icon-well w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0">
            <User className="w-5 h-5" style={{ color: "#C4B5FD", strokeWidth: 1.8 }} />
          </div>

          <div className="flex-1">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="font-semibold" style={{ color: "var(--text-primary)" }}>
                  {reply.created_by?.split('@')[0]}
                </p>
                <p className="text-xs" style={{ color: "var(--text-secondary)", opacity: 0.7 }}>
                  {formatDistanceToNow(new Date(reply.created_date), { addSuffix: true })}
                </p>
              </div>

              {reply.is_solution && (
                <div className="flex items-center gap-1 px-3 py-1 rounded-xl backdrop-blur-xl"
                  style={{
                    background: "rgba(167, 243, 208, 0.2)",
                    border: "1px solid rgba(167, 243, 208, 0.4)"
                  }}>
                  <CheckCircle className="w-4 h-4" style={{ color: "#A7F3D0", strokeWidth: 2 }} />
                  <span className="text-xs font-semibold" style={{ color: "#A7F3D0" }}>Solution</span>
                </div>
              )}
            </div>

            <div className="prose prose-sm max-w-none mb-4" style={{ color: "var(--text-secondary)" }}>
              <ReactMarkdown>{reply.content}</ReactMarkdown>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <button
                onClick={() => toggleHelpfulMutation.mutate()}
                className={`neuro-button px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 ${
                  hasVoted ? "neuro-accent-raised" : ""
                }`}
                style={{ color: hasVoted 
                  ? ((currentTheme === 'light' || currentTheme === 'minimal') ? "#FFFFFF" : "#A7F3D0")
                  : "var(--text-secondary)" }}
              >
                <ThumbsUp className="w-3 h-3" style={{ strokeWidth: 2 }} />
                Helpful ({helpfulVotes.length})
              </button>

              <button
                onClick={() => setShowReplyForm(!showReplyForm)}
                className="neuro-button px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1"
                style={{ color: "var(--text-secondary)" }}
              >
                <Reply className="w-3 h-3" style={{ strokeWidth: 2 }} />
                Reply
              </button>

              {topicOwnerId === currentUser?.email && !reply.is_solution && (
                <button
                  onClick={() => onMarkSolution(reply.id)}
                  className="neuro-button px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1"
                  style={{ color: "#A7F3D0" }}
                >
                  <CheckCircle className="w-3 h-3" style={{ strokeWidth: 2 }} />
                  Mark as Solution
                </button>
              )}

              {isOwner && (
                <button
                  onClick={() => onDelete(reply.id)}
                  className="neuro-button px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1"
                  style={{ color: "#FCA5A5" }}
                >
                  <Trash2 className="w-3 h-3" style={{ strokeWidth: 2 }} />
                  Delete
                </button>
              )}
            </div>

            {showReplyForm && (
              <div className="mt-4 neuro-surface rounded-2xl p-4">
                <textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="Write your reply..."
                  className="neuro-input w-full px-4 py-3 rounded-2xl mb-3 min-h-[100px]"
                  style={{ color: "var(--text-primary)" }}
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => createReplyMutation.mutate({
                      topic_id: reply.topic_id,
                      content: replyContent,
                      parent_reply_id: reply.id
                    })}
                    disabled={!replyContent.trim()}
                    className="neuro-accent-raised px-4 py-2 rounded-xl text-sm font-semibold"
                    style={{ color: (currentTheme === 'light' || currentTheme === 'minimal') ? '#FFFFFF' : '#F0EBFF' }}
                  >
                    Post Reply
                  </button>
                  <button
                    onClick={() => setShowReplyForm(false)}
                    className="neuro-button px-4 py-2 rounded-xl text-sm font-semibold"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {nestedReplies.map(nested => (
        <ReplyItem
          key={nested.id}
          reply={nested}
          topicOwnerId={topicOwnerId}
          onMarkSolution={onMarkSolution}
          onDelete={onDelete}
          level={level + 1}
          currentUser={currentUser}
        />
      ))}
    </div>
  );
}

export default function ForumTopic() {
  const urlParams = new URLSearchParams(window.location.search);
  const topicId = urlParams.get('id');
  const [replyContent, setReplyContent] = useState("");
  const queryClient = useQueryClient();

  const { data: topic, isLoading } = useQuery({
    queryKey: ['forumTopic', topicId],
    queryFn: () => base44.entities.ForumTopic.filter({ id: topicId }).then(topics => topics[0]),
    enabled: !!topicId
  });

  const { data: replies = [] } = useQuery({
    queryKey: ['forumReplies', topicId],
    queryFn: () => base44.entities.ForumReply.filter({ topic_id: topicId, parent_reply_id: null }, 'created_date'),
    enabled: !!topicId,
    initialData: []
  });

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me().catch(() => null)
  });

  const incrementViewMutation = useMutation({
    mutationFn: () => base44.entities.ForumTopic.update(topicId, {
      view_count: (topic?.view_count || 0) + 1
    })
  });

  const createReplyMutation = useMutation({
    mutationFn: (data) => base44.entities.ForumReply.create(data),
    onSuccess: async () => {
      await base44.entities.ForumTopic.update(topicId, {
        reply_count: (topic?.reply_count || 0) + 1,
        last_activity_date: new Date().toISOString()
      });
      queryClient.invalidateQueries({ queryKey: ['forumReplies'] });
      queryClient.invalidateQueries({ queryKey: ['forumTopic'] });
      setReplyContent("");
    }
  });

  const markSolutionMutation = useMutation({
    mutationFn: async (replyId) => {
      await base44.entities.ForumReply.update(replyId, { is_solution: true });
      await base44.entities.ForumTopic.update(topicId, { is_solved: true });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forumReplies'] });
      queryClient.invalidateQueries({ queryKey: ['forumTopic'] });
    }
  });

  const deleteReplyMutation = useMutation({
    mutationFn: async (replyId) => {
      await base44.entities.ForumReply.delete(replyId);
      await base44.entities.ForumTopic.update(topicId, {
        reply_count: Math.max(0, (topic?.reply_count || 0) - 1)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forumReplies'] });
      queryClient.invalidateQueries({ queryKey: ['forumTopic'] });
    }
  });

  useEffect(() => {
    if (topic && !sessionStorage.getItem(`viewed_topic_${topicId}`)) {
      incrementViewMutation.mutate();
      sessionStorage.setItem(`viewed_topic_${topicId}`, 'true');
    }
  }, [topic, topicId, incrementViewMutation]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="neuro-icon-well w-16 h-16 rounded-3xl flex items-center justify-center animate-pulse p-2">
          <img src={LOGO_URL} alt="Loading" className="w-full h-full object-contain" style={{ opacity: 0.6 }} />
        </div>
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-xl mb-4" style={{ color: "var(--text-primary)" }}>Topic not found</p>
          <Link to={createPageUrl("Forum")}>
            <button className="neuro-button px-6 py-3 rounded-2xl font-semibold"
              style={{ color: "var(--text-secondary)" }}>
              Back to Forum
            </button>
          </Link>
        </div>
      </div>
    );
  }

  const category = CATEGORIES[topic.category];
  const currentTheme = currentUser?.theme || "glassmorphism";

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link to={createPageUrl("Forum")}>
            <button className="neuro-button w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{ color: (currentTheme === 'light' || currentTheme === 'minimal') ? "#7C3AED" : "#E3C9FF" }}>
              <ArrowLeft className="w-5 h-5" style={{ strokeWidth: 2 }} />
            </button>
          </Link>
          <div>
            <span className="text-xs px-3 py-1 rounded-xl backdrop-blur-xl inline-block mb-2"
              style={{
                background: `${category.color}20`,
                border: `1px solid ${category.color}40`,
                color: category.color
              }}>
              {category.icon} {category.label}
            </span>
            <h1 className="text-3xl font-bold" style={{
              color: 'var(--text-primary)',
              textShadow: 'var(--heading-shadow)',
              fontFamily: "'Playfair Display', Georgia, serif"
            }}>
              {topic.title}
            </h1>
          </div>
        </div>

        {/* Original Post */}
        <div className="neuro-card rounded-3xl p-8 mb-6">
          <div className="flex items-start gap-4 mb-6">
            <div className="neuro-icon-well w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0">
              <User className="w-6 h-6" style={{ color: "#C4B5FD", strokeWidth: 1.8 }} />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="font-bold" style={{ color: "var(--text-primary)" }}>
                    {topic.created_by?.split('@')[0]}
                  </p>
                  <p className="text-xs" style={{ color: "var(--text-secondary)", opacity: 0.7 }}>
                    {formatDistanceToNow(new Date(topic.created_date), { addSuffix: true })}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {topic.is_pinned && (
                    <span className="px-2 py-1 rounded-lg text-xs font-semibold backdrop-blur-xl"
                      style={{ background: "rgba(252, 211, 77, 0.2)", border: "1px solid rgba(252, 211, 77, 0.4)", color: "#FCD34D" }}>
                      <Pin className="w-3 h-3 inline mr-1" />
                      Pinned
                    </span>
                  )}
                  {topic.is_solved && (
                    <span className="px-2 py-1 rounded-lg text-xs font-semibold backdrop-blur-xl"
                      style={{ background: "rgba(167, 243, 208, 0.2)", border: "1px solid rgba(167, 243, 208, 0.4)", color: "#A7F3D0" }}>
                      <CheckCircle className="w-3 h-3 inline mr-1" />
                      Solved
                    </span>
                  )}
                  {topic.is_locked && (
                    <span className="px-2 py-1 rounded-lg text-xs font-semibold backdrop-blur-xl"
                      style={{ background: "rgba(252, 165, 165, 0.2)", border: "1px solid rgba(252, 165, 165, 0.4)", color: "#FCA5A5" }}>
                      <Lock className="w-3 h-3 inline mr-1" />
                      Locked
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="prose prose-lg max-w-none mb-6" style={{ color: "var(--text-secondary)" }}>
            <ReactMarkdown>{topic.content}</ReactMarkdown>
          </div>

          {topic.tags && topic.tags.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              {topic.tags.map((tag, idx) => (
                <span key={idx} className="text-xs px-2 py-1 rounded-lg backdrop-blur-xl"
                  style={{
                    background: (currentTheme === 'light' || currentTheme === 'minimal') 
                      ? "rgba(147, 51, 234, 0.15)" 
                      : "rgba(167, 243, 208, 0.15)",
                    border: (currentTheme === 'light' || currentTheme === 'minimal')
                      ? "1px solid rgba(147, 51, 234, 0.3)"
                      : "1px solid rgba(167, 243, 208, 0.3)",
                    color: (currentTheme === 'light' || currentTheme === 'minimal')
                      ? "#7C3AED"
                      : "#A7F3D0"
                  }}>
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Replies */}
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2" style={{
            color: "var(--text-primary)",
            fontFamily: "'Playfair Display', Georgia, serif"
          }}>
            <MessageSquare className="w-5 h-5" style={{ color: "#C4B5FD", strokeWidth: 1.8 }} />
            {replies.length} {replies.length === 1 ? 'Reply' : 'Replies'}
          </h2>

          <div className="space-y-4">
            {replies.map(reply => (
              <ReplyItem
                key={reply.id}
                reply={reply}
                topicOwnerId={topic.created_by}
                onMarkSolution={(replyId) => markSolutionMutation.mutate(replyId)}
                onDelete={(replyId) => {
                  if (window.confirm('Delete this reply?')) {
                    deleteReplyMutation.mutate(replyId);
                  }
                }}
                currentUser={currentUser}
              />
            ))}
          </div>
        </div>

        {/* Reply Form */}
        {!topic.is_locked && (
          <div className="neuro-card rounded-3xl p-6">
            <h3 className="text-lg font-bold mb-4" style={{
              color: "var(--text-primary)",
              fontFamily: "'Playfair Display', Georgia, serif"
            }}>
              Post a Reply
            </h3>
            <textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="Share your thoughts, advice, or experience..."
              className="neuro-input w-full px-4 py-3 rounded-2xl mb-4 min-h-[150px]"
              style={{ color: "var(--text-primary)" }}
            />
            <button
              onClick={() => createReplyMutation.mutate({ topic_id: topicId, content: replyContent })}
              disabled={!replyContent.trim() || createReplyMutation.isPending}
              className="neuro-accent-raised px-6 py-3 rounded-2xl font-semibold"
              style={{ color: (currentTheme === 'light' || currentTheme === 'minimal') ? '#FFFFFF' : '#F0EBFF' }}
            >
              {createReplyMutation.isPending ? 'Posting...' : 'Post Reply'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}