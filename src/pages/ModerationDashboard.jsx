
import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Shield, AlertTriangle, EyeOff, Trash2, CheckCircle, XCircle, MessageCircle, FileText, ArrowLeft, Filter, TrendingUp } from "lucide-react";
import { format } from "date-fns";

export default function ModerationDashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [filterStatus, setFilterStatus] = useState("pending");
  const [filterType, setFilterType] = useState("all");
  const [expandedReport, setExpandedReport] = useState(null);
  const [adminNotes, setAdminNotes] = useState("");

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  // Redirect if not admin
  React.useEffect(() => {
    if (currentUser && currentUser.role !== 'admin') {
      alert('Access denied: Admin privileges required');
      navigate(createPageUrl("Collection"));
    }
  }, [currentUser, navigate]);

  const { data: postReports = [] } = useQuery({
    queryKey: ['postReports', filterStatus],
    queryFn: () => {
      if (filterStatus === "all") {
        return base44.entities.PostReport.list('-created_date');
      }
      return base44.entities.PostReport.filter({ status: filterStatus }, '-created_date');
    },
    initialData: []
  });

  const { data: commentReports = [] } = useQuery({
    queryKey: ['commentReports', filterStatus],
    queryFn: () => {
      if (filterStatus === "all") {
        return base44.entities.CommentReport.list('-created_date');
      }
      return base44.entities.CommentReport.filter({ status: filterStatus }, '-created_date');
    },
    initialData: []
  });

  const { data: allPosts = [] } = useQuery({
    queryKey: ['allCommunityPosts'],
    queryFn: () => base44.entities.CommunityPost.list(),
    initialData: []
  });

  const { data: allComments = [] } = useQuery({
    queryKey: ['allPostComments'],
    queryFn: () => base44.entities.PostComment.list(),
    initialData: []
  });

  const { data: moderationActions = [] } = useQuery({
    queryKey: ['moderationActions'],
    queryFn: () => base44.entities.ModerationAction.list('-created_date', 50),
    initialData: []
  });

  const updateReportMutation = useMutation({
    mutationFn: ({ reportId, reportType, data }) => {
      if (reportType === 'post') {
        return base44.entities.PostReport.update(reportId, data);
      } else {
        return base44.entities.CommentReport.update(reportId, data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['postReports'] });
      queryClient.invalidateQueries({ queryKey: ['commentReports'] });
    }
  });

  const createModerationActionMutation = useMutation({
    mutationFn: (actionData) => base44.entities.ModerationAction.create(actionData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['moderationActions'] });
    }
  });

  const updateContentMutation = useMutation({
    mutationFn: ({ contentType, contentId, data }) => {
      if (contentType === 'post') {
        return base44.entities.CommunityPost.update(contentId, data);
      } else {
        return base44.entities.PostComment.update(contentId, data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allCommunityPosts'] });
      queryClient.invalidateQueries({ queryKey: ['allPostComments'] });
    }
  });

  const analyzeContentWithAI = async (content, reportReason) => {
    const prompt = `Analyze this community post/comment for content moderation:

Content: "${content}"
Reported Reason: ${reportReason}

Assess:
1. Is this content appropriate for a plant enthusiast community?
2. Does it contain spam, harassment, or misleading information?
3. Risk level (low/medium/high)
4. Recommended action

Provide a brief analysis and risk assessment.`;

    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            is_appropriate: { type: "boolean" },
            risk_level: { type: "string", enum: ["low", "medium", "high"] },
            analysis: { type: "string" },
            recommended_action: { type: "string" }
          }
        }
      });
      return response;
    } catch {
      return null;
    }
  };

  const handleAnalyzeWithAI = async (report, reportType) => {
    const content = reportType === 'post' 
      ? allPosts.find(p => p.id === report.post_id)
      : allComments.find(c => c.id === report.comment_id);

    if (!content) return;

    const contentText = reportType === 'post' 
      ? `${content.title}\n${content.description || ''}`
      : content.comment;

    const aiResult = await analyzeContentWithAI(contentText, report.reason);

    if (aiResult) {
      updateReportMutation.mutate({
        reportId: report.id,
        reportType,
        data: {
          ai_analysis: aiResult.analysis,
          ai_risk_level: aiResult.risk_level
        }
      });
    }
  };

  const handleTakeAction = async (report, reportType, actionType) => {
    const content = reportType === 'post' 
      ? allPosts.find(p => p.id === report.post_id)
      : allComments.find(c => c.id === report.comment_id);

    if (!content) return;

    const contentId = reportType === 'post' ? report.post_id : report.comment_id;

    // Update content status
    if (actionType === 'hide') {
      await updateContentMutation.mutateAsync({
        contentType: reportType,
        contentId,
        data: { moderation_status: 'hidden' }
      });
    } else if (actionType === 'delete') {
      await updateContentMutation.mutateAsync({
        contentType: reportType,
        contentId,
        data: { moderation_status: 'deleted' }
      });
    }

    // Create moderation action record
    await createModerationActionMutation.mutateAsync({
      content_type: reportType,
      content_id: contentId,
      report_id: report.id,
      action_type: actionType,
      reason: report.reason,
      target_user_email: content.created_by,
      notes: adminNotes
    });

    // Update report status
    await updateReportMutation.mutateAsync({
      reportId: report.id,
      reportType,
      data: {
        status: actionType === 'no_action' ? 'dismissed' : 'action_taken',
        admin_notes: adminNotes,
        reviewed_by: currentUser.email,
        reviewed_date: new Date().toISOString()
      }
    });

    setAdminNotes("");
    setExpandedReport(null);
  };

  if (!currentUser || currentUser.role !== 'admin') {
    return null;
  }

  const allReports = [
    ...postReports.map(r => ({ ...r, type: 'post' })),
    ...commentReports.map(r => ({ ...r, type: 'comment' }))
  ].sort((a, b) => new Date(b.created_date) - new Date(a.created_date));

  const filteredReports = filterType === 'all' 
    ? allReports 
    : allReports.filter(r => r.type === filterType);

  const pendingCount = allReports.filter(r => r.status === 'pending').length;
  const actionTakenCount = moderationActions.length;
  const highRiskCount = allReports.filter(r => r.ai_risk_level === 'high').length;

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate(createPageUrl("Collection"))}
            className="glass-button w-12 h-12 rounded-2xl flex items-center justify-center"
            style={{ color: "var(--accent)" }}
          >
            <ArrowLeft className="w-5 h-5" style={{ strokeWidth: 2 }} />
          </button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold flex items-center gap-3" style={{ 
              color: "var(--text-primary)",
              textShadow: "var(--heading-shadow)",
              fontFamily: "'Playfair Display', Georgia, serif"
            }}>
              <Shield className="w-8 h-8" style={{ color: "#C4B5FD", strokeWidth: 1.5 }} />
              Content Moderation
            </h1>
            <p style={{ color: "var(--text-secondary)" }}>Review and manage reported content</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="glass-card rounded-3xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Pending Reviews</p>
                <p className="text-3xl font-bold" style={{ 
                  color: "#FCD34D",
                  fontFamily: "'Playfair Display', Georgia, serif"
                }}>
                  {pendingCount}
                </p>
              </div>
              <AlertTriangle className="w-12 h-12" style={{ color: "#FCD34D", opacity: 0.3 }} />
            </div>
          </div>

          <div className="glass-card rounded-3xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium mb-1" style={{ color: "#DDD6FE" }}>Actions Taken</p>
                <p className="text-3xl font-bold" style={{ 
                  color: "#A7F3D0",
                  fontFamily: "'Playfair Display', Georgia, serif"
                }}>
                  {actionTakenCount}
                </p>
              </div>
              <CheckCircle className="w-12 h-12" style={{ color: "#A7F3D0", opacity: 0.3 }} />
            </div>
          </div>

          <div className="glass-card rounded-3xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium mb-1" style={{ color: "#DDD6FE" }}>High Risk</p>
                <p className="text-3xl font-bold" style={{ 
                  color: "#FCA5A5",
                  fontFamily: "'Playfair Display', Georgia, serif"
                }}>
                  {highRiskCount}
                </p>
              </div>
              <TrendingUp className="w-12 h-12" style={{ color: "#FCA5A5", opacity: 0.3 }} />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="glass-card rounded-3xl p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5" style={{ color: "#C4B5FD" }} />
            <h3 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>Filters</h3>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
                Status
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="glass-input w-full px-4 py-3 rounded-2xl"
                style={{ color: "var(--text-primary)" }}
              >
                <option value="all">All</option>
                <option value="pending">Pending</option>
                <option value="reviewed">Reviewed</option>
                <option value="action_taken">Action Taken</option>
                <option value="dismissed">Dismissed</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
                Content Type
              </label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="glass-input w-full px-4 py-3 rounded-2xl"
                style={{ color: "var(--text-primary)" }}
              >
                <option value="all">All</option>
                <option value="post">Posts</option>
                <option value="comment">Comments</option>
              </select>
            </div>
          </div>
        </div>

        {/* Reports List */}
        <div className="space-y-4">
          {filteredReports.length === 0 ? (
            <div className="glass-card rounded-3xl p-12 text-center">
              <CheckCircle className="w-16 h-16 mx-auto mb-4" style={{ color: "#A7F3D0", opacity: 0.5 }} />
              <p style={{ color: "var(--text-secondary)" }}>No reports to review</p>
            </div>
          ) : (
            filteredReports.map(report => {
              const content = report.type === 'post' 
                ? allPosts.find(p => p.id === report.post_id)
                : allComments.find(c => c.id === report.comment_id);

              const isExpanded = expandedReport === report.id;

              const statusColors = {
                pending: { bg: "rgba(252, 211, 77, 0.2)", border: "rgba(252, 211, 77, 0.4)", text: "#FCD34D" },
                reviewed: { bg: "rgba(196, 181, 253, 0.2)", border: "rgba(196, 181, 253, 0.4)", text: "#C4B5FD" },
                action_taken: { bg: "rgba(167, 243, 208, 0.2)", border: "rgba(167, 243, 208, 0.4)", text: "#A7F3D0" },
                dismissed: { bg: "rgba(156, 163, 175, 0.2)", border: "rgba(156, 163, 175, 0.4)", text: "#9CA3AF" }
              };

              const riskColors = {
                high: "#FCA5A5",
                medium: "#FCD34D",
                low: "#A7F3D0"
              };

              const statusStyle = statusColors[report.status];

              return (
                <div key={report.id} className="glass-card rounded-3xl p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center glass-button">
                        {report.type === 'post' ? (
                          <FileText className="w-6 h-6" style={{ color: "#C4B5FD" }} />
                        ) : (
                          <MessageCircle className="w-6 h-6" style={{ color: "#C4B5FD" }} />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <span className="px-3 py-1 rounded-lg text-xs font-semibold backdrop-blur-xl"
                            style={{
                              background: statusStyle.bg,
                              border: `1px solid ${statusStyle.border}`,
                              color: statusStyle.text
                            }}>
                            {report.status}
                          </span>
                          <span className="px-3 py-1 rounded-lg text-xs font-semibold backdrop-blur-xl capitalize"
                            style={{
                              background: "rgba(227, 201, 255, 0.15)",
                              border: "1px solid rgba(227, 201, 255, 0.3)",
                              color: "#E3C9FF"
                            }}>
                            {report.type}
                          </span>
                          <span className="px-3 py-1 rounded-lg text-xs font-semibold backdrop-blur-xl capitalize"
                            style={{
                              background: "rgba(168, 159, 239, 0.15)",
                              border: "1px solid rgba(168, 159, 239, 0.3)",
                              color: "#C4B5FD"
                            }}>
                            {report.reason}
                          </span>
                          {report.ai_risk_level && (
                            <span className="px-3 py-1 rounded-lg text-xs font-semibold backdrop-blur-xl capitalize"
                              style={{
                                background: `${riskColors[report.ai_risk_level]}20`,
                                border: `1px solid ${riskColors[report.ai_risk_level]}40`,
                                color: riskColors[report.ai_risk_level]
                              }}>
                              {report.ai_risk_level} risk
                            </span>
                          )}
                        </div>
                        <p className="text-sm mb-2" style={{ color: "var(--text-secondary)" }}>
                          Reported by <span className="font-semibold">{report.created_by?.split('@')[0]}</span> on{' '}
                          {format(new Date(report.created_date), "MMM d, yyyy 'at' h:mm a")}
                        </p>
                        {content && (
                          <div className="glass-button rounded-2xl p-4 mb-3">
                            <p className="text-sm font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
                              Reported Content:
                            </p>
                            <p className="text-sm line-clamp-3" style={{ color: "var(--text-secondary)" }}>
                              {report.type === 'post' 
                                ? `${content.title}: ${content.description || ''}`
                                : content.comment}
                            </p>
                            {content.moderation_status !== 'active' && (
                              <p className="text-xs mt-2 font-semibold" style={{ color: "#FCA5A5" }}>
                                Status: {content.moderation_status}
                              </p>
                            )}
                          </div>
                        )}
                        {report.details && (
                          <p className="text-sm italic" style={{ color: "var(--text-secondary)", opacity: 0.8 }}>
                            Reporter notes: {report.details}
                          </p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => setExpandedReport(isExpanded ? null : report.id)}
                      className="glass-button px-4 py-2 rounded-2xl text-sm font-semibold"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {isExpanded ? 'Collapse' : 'Review'}
                    </button>
                  </div>

                  {isExpanded && (
                    <div className="glass-button rounded-2xl p-6 mt-4 space-y-4">
                      {/* AI Analysis */}
                      {report.ai_analysis ? (
                        <div className="p-4 rounded-2xl" style={{
                          background: "rgba(154, 226, 211, 0.1)",
                          border: "1px solid rgba(154, 226, 211, 0.3)"
                        }}>
                          <p className="text-sm font-semibold mb-2" style={{ color: "#A7F3D0" }}>
                            AI Analysis:
                          </p>
                          <p className="text-sm whitespace-pre-wrap" style={{ color: "var(--text-secondary)" }}>
                            {report.ai_analysis}
                          </p>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleAnalyzeWithAI(report, report.type)}
                          className="glass-accent-moss px-4 py-2 rounded-2xl font-semibold"
                          style={{ color: "#A7F3D0" }}
                        >
                          Analyze with AI
                        </button>
                      )}

                      {/* Admin Notes */}
                      <div>
                        <label className="block text-sm font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
                          Admin Notes
                        </label>
                        <textarea
                          value={adminNotes}
                          onChange={(e) => setAdminNotes(e.target.value)}
                          placeholder="Add notes about your decision..."
                          rows={3}
                          className="glass-input w-full px-4 py-3 rounded-2xl resize-none"
                          style={{ color: "var(--text-primary)" }}
                        />
                      </div>

                      {/* Actions */}
                      {report.status === 'pending' && (
                        <div className="flex flex-wrap gap-3">
                          <button
                            onClick={() => handleTakeAction(report, report.type, 'hide')}
                            className="glass-button px-4 py-2 rounded-2xl font-semibold flex items-center gap-2"
                            style={{ color: "#FCD34D" }}
                          >
                            <EyeOff className="w-4 h-4" />
                            Hide Content
                          </button>
                          <button
                            onClick={() => handleTakeAction(report, report.type, 'delete')}
                            className="glass-button px-4 py-2 rounded-2xl font-semibold flex items-center gap-2"
                            style={{ color: "#FCA5A5" }}
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete Content
                          </button>
                          <button
                            onClick={() => handleTakeAction(report, report.type, 'warn_user')}
                            className="glass-button px-4 py-2 rounded-2xl font-semibold flex items-center gap-2"
                            style={{ color: "#C4B5FD" }}
                          >
                            <AlertTriangle className="w-4 h-4" />
                            Warn User
                          </button>
                          <button
                            onClick={() => handleTakeAction(report, report.type, 'no_action')}
                            className="glass-button px-4 py-2 rounded-2xl font-semibold flex items-center gap-2"
                            style={{ color: "#A7F3D0" }}
                          >
                            <XCircle className="w-4 h-4" />
                            Dismiss
                          </button>
                        </div>
                      )}

                      {/* Review History */}
                      {report.reviewed_by && (
                        <div className="pt-4" style={{ borderTop: "1px solid rgba(227, 201, 255, 0.2)" }}>
                          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                            Reviewed by <span className="font-semibold">{report.reviewed_by?.split('@')[0]}</span> on{' '}
                            {format(new Date(report.reviewed_date), "MMM d, yyyy 'at' h:mm a")}
                          </p>
                          {report.admin_notes && (
                            <p className="text-sm mt-2" style={{ color: "var(--text-secondary)" }}>
                              Notes: {report.admin_notes}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
