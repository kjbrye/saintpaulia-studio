/**
 * StatCard - Dashboard stat display
 */

export default function StatCard({ label, value, color = 'sage-700', icon: Icon, accent }) {
  const accentClass = accent ? `stat-card-${accent}` : '';

  return (
    <div className={`card p-6 relative ${accentClass}`}>
      {/* Icon in top-right */}
      {Icon && (
        <div className="absolute top-4 right-4">
          <div className="icon-container icon-container-sm">
            <Icon size={16} style={{ color: `var(--${color})` }} />
          </div>
        </div>
      )}

      {/* Label */}
      <p className="text-label mb-2">{label}</p>

      {/* Value */}
      <p className="stat-number" style={{ color: `var(--${color})` }}>
        {value}
      </p>
    </div>
  );
}
