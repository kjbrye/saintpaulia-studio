import React from "react";

export default function StatsCard({ title, value }) {
  return (
    <div className="crystal-glass-widget rounded-3xl p-8">
      <p className="text-sm font-semibold mb-3" style={{ color: "var(--text-secondary)" }}>
        {title}
      </p>
      <p className="text-4xl font-bold" style={{
        color: "var(--text-primary)",
        fontFamily: "'Playfair Display', Georgia, serif"
      }}>
        {value}
      </p>
    </div>
  );
}