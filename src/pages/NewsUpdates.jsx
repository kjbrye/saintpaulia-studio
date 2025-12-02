import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ArrowLeft, Newspaper, Sparkles, Wrench, Megaphone, Calendar } from "lucide-react";

const NEWS_ITEMS = [
  {
    date: "2024-12-01",
    type: "feature",
    title: "Welcome to Saintpaulia Studio!",
    description: "We're excited to launch the first version of Saintpaulia Studio, your comprehensive companion for African violet care. Track your collection, document care routines, manage breeding projects, and connect with other growers.",
    icon: Sparkles,
    color: "#C4B5FD"
  },
  {
    date: "2024-12-01",
    type: "feature",
    title: "Cultivar Database Now Available",
    description: "Explore the complete AVSA registry with over 19,000 registered African violet cultivars. Search by name, hybridizer, or characteristics to discover new varieties for your collection.",
    icon: Sparkles,
    color: "#A7F3D0"
  },
  {
    date: "2024-12-01",
    type: "announcement",
    title: "Community Features Coming Soon",
    description: "We're working on enhanced community features including the ability to share your collection, post updates, and connect with fellow enthusiasts. Stay tuned for updates!",
    icon: Megaphone,
    color: "#FCD34D"
  }
];

const TYPE_LABELS = {
  feature: "New Feature",
  fix: "Bug Fix",
  improvement: "Improvement",
  announcement: "Announcement"
};

const TYPE_ICONS = {
  feature: Sparkles,
  fix: Wrench,
  improvement: Wrench,
  announcement: Megaphone
};

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
}

export default function NewsUpdates() {
  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link to={createPageUrl("Collection")}>
            <button className="glass-button w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{ color: "var(--accent)" }}>
              <ArrowLeft className="w-5 h-5" style={{ strokeWidth: 2 }} />
            </button>
          </Link>
          <div className="flex items-center gap-4">
            <div className="glass-card w-16 h-16 rounded-3xl flex items-center justify-center glow-violet p-2">
              <Newspaper className="w-8 h-8" style={{ color: "#C4B5FD", strokeWidth: 1.5 }} />
            </div>
            <div>
              <h1 className="text-4xl font-bold" style={{
                color: 'var(--text-primary)',
                textShadow: 'var(--heading-shadow)',
                fontFamily: "'Playfair Display', Georgia, serif"
              }}>
                News & Updates
              </h1>
              <p className="text-muted" style={{ color: 'var(--text-secondary)' }}>
                Latest announcements and updates from Saintpaulia Studio
              </p>
            </div>
          </div>
        </div>

        {/* News Timeline */}
        <div className="space-y-6">
          {NEWS_ITEMS.map((item, idx) => {
            const Icon = item.icon || TYPE_ICONS[item.type];
            return (
              <div key={idx} className="glass-card rounded-3xl p-6">
                <div className="flex items-start gap-4">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                    style={{
                      background: `${item.color}20`,
                      border: `1px solid ${item.color}40`
                    }}
                  >
                    <Icon className="w-6 h-6" style={{ color: item.color, strokeWidth: 1.8 }} />
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                      <span
                        className="text-xs font-semibold px-3 py-1 rounded-full"
                        style={{
                          background: `${item.color}20`,
                          color: item.color,
                          border: `1px solid ${item.color}40`
                        }}
                      >
                        {TYPE_LABELS[item.type]}
                      </span>
                      <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                        <Calendar className="w-3 h-3" />
                        {formatDate(item.date)}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold mb-2" style={{
                      color: 'var(--text-primary)',
                      fontFamily: "'Playfair Display', Georgia, serif"
                    }}>
                      {item.title}
                    </h3>
                    <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                      {item.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State / Future Updates Notice */}
        <div className="glass-card rounded-3xl p-6 mt-8 text-center">
          <Megaphone className="w-10 h-10 mx-auto mb-3" style={{ color: '#FCD34D', strokeWidth: 1.5 }} />
          <h3 className="text-lg font-bold mb-2" style={{
            color: 'var(--text-primary)',
            fontFamily: "'Playfair Display', Georgia, serif"
          }}>
            Stay Tuned
          </h3>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            We're constantly working on new features and improvements. Check back regularly for the latest updates!
          </p>
        </div>

        {/* Back to Info */}
        <div className="mt-6 text-center">
          <Link to={createPageUrl("Info")}>
            <button className="glass-button px-6 py-3 rounded-2xl font-semibold"
              style={{ color: "var(--text-secondary)" }}>
              ← Back to Info & Help
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
