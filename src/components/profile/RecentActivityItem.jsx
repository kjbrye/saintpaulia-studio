import React from "react";
import { MessageCircle, Heart, FileText } from "lucide-react";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function RecentActivityItem({ activity }) {
  const getActivityIcon = () => {
    switch (activity.type) {
      case 'post':
        return <FileText className="w-5 h-5" style={{ color: "#C4B5FD", strokeWidth: 1.8 }} />;
      case 'comment':
        return <MessageCircle className="w-5 h-5" style={{ color: "#7DD3FC", strokeWidth: 1.8 }} />;
      case 'like':
        return <Heart className="w-5 h-5" style={{ color: "#FCA5A5", strokeWidth: 1.8, fill: "#FCA5A5" }} />;
      default:
        return null;
    }
  };

  const getActivityColor = () => {
    switch (activity.type) {
      case 'post':
        return { bg: "rgba(196, 181, 253, 0.2)", border: "rgba(196, 181, 253, 0.4)" };
      case 'comment':
        return { bg: "rgba(125, 211, 252, 0.2)", border: "rgba(125, 211, 252, 0.4)" };
      case 'like':
        return { bg: "rgba(252, 165, 165, 0.2)", border: "rgba(252, 165, 165, 0.4)" };
      default:
        return { bg: "rgba(227, 201, 255, 0.15)", border: "rgba(227, 201, 255, 0.3)" };
    }
  };

  const colors = getActivityColor();

  return (
    <div className="glass-button rounded-2xl p-4 hover:opacity-90 transition-all">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 backdrop-blur-xl"
          style={{
            background: colors.bg,
            border: `1px solid ${colors.border}`
          }}>
          {getActivityIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <p className="text-sm font-semibold" style={{ color: "#F5F3FF" }}>
              {activity.type === 'post' && 'Created a post'}
              {activity.type === 'comment' && 'Commented'}
              {activity.type === 'like' && 'Liked a post'}
            </p>
            <p className="text-xs" style={{ color: "#DDD6FE", opacity: 0.6 }}>
              {format(new Date(activity.date), "MMM d")}
            </p>
          </div>
          <p className="text-sm line-clamp-2" style={{ color: "#DDD6FE" }}>
            {activity.content}
          </p>
          {activity.postId && (
            <Link 
              to={createPageUrl(`CommunityFeed`)}
              className="text-xs mt-2 inline-block hover:opacity-80 transition-opacity"
              style={{ color: "#C4B5FD" }}
            >
              View post →
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}