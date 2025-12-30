/**
 * FormField - Label and input wrapper with error support
 */

export default function FormField({
  label,
  required,
  error,
  children,
  className = '',
}) {
  return (
    <div className={className}>
      {label && (
        <label className="block mb-2">
          <span
            className="text-small font-semibold"
            style={{ color: 'var(--sage-700)' }}
          >
            {label}
            {required && (
              <span style={{ color: 'var(--copper-500)' }} className="ml-1">
                *
              </span>
            )}
          </span>
        </label>
      )}
      {children}
      {error && (
        <p
          className="text-small mt-1"
          style={{ color: 'var(--color-error)' }}
        >
          {error}
        </p>
      )}
    </div>
  );
}
