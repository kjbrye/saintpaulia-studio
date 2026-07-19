/**
 * ToggleRow
 *
 * Label + helper text on the left, an accessible switch on the right. Behavior
 * is unchanged from the previous build (role="switch" + `.a11y-toggle`).
 */

export default function ToggleRow({ label, description, checked, onChange }) {
  return (
    <div className="flex items-center justify-between gap-4 py-4">
      <div className="flex-1">
        <span className="text-body">{label}</span>
        {description && <p className="settings-desc">{description}</p>}
      </div>
      <button
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className="a11y-toggle"
        data-checked={checked ? 'true' : 'false'}
      >
        <span className="a11y-toggle-thumb" />
      </button>
    </div>
  );
}
