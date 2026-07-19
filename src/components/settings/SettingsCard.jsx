/**
 * SettingsCard
 *
 * Sage card with a strong section label and optional description. Used as the
 * building block for every pane so labels and descriptions stay consistent and
 * high-contrast.
 */

export default function SettingsCard({ label, description, className = '', children }) {
  return (
    <section className={`card p-6 ${className}`}>
      {label && <h2 className="settings-label mb-1">{label}</h2>}
      {description && <p className="settings-desc mb-4">{description}</p>}
      {!description && label && <div className="mb-4" />}
      {children}
    </section>
  );
}
