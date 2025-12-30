/**
 * EditableField - Toggles between display text and input based on edit mode
 */

import FormField from './FormField';

export default function EditableField({
  label,
  value,
  displayValue,
  isEditing,
  onChange,
  type = 'text',
  placeholder,
  required,
  options,
  multiline,
}) {
  // View mode - display as text
  if (!isEditing) {
    return (
      <div>
        <span className="text-label block mb-1">{label}</span>
        <span className="text-body">
          {displayValue || value || (
            <span className="text-muted">Not set</span>
          )}
        </span>
      </div>
    );
  }

  // Edit mode - show input
  return (
    <FormField label={label} required={required}>
      {options ? (
        <select
          className="input w-full"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : multiline ? (
        <textarea
          className="input w-full"
          style={{ minHeight: 100, resize: 'vertical' }}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
        />
      ) : (
        <input
          type={type}
          className="input w-full"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
        />
      )}
    </FormField>
  );
}
