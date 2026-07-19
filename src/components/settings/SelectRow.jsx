/**
 * SelectRow
 *
 * A label on the left and a dropdown on the right. Numeric option values are
 * coerced back to numbers on change (matching the previous behavior). Rows sit
 * inside a `.setting-rows` group, which draws the dividers between them.
 */

export default function SelectRow({ label, value, options, onChange }) {
  return (
    <div className="flex items-center justify-between gap-4 py-4">
      <span className="text-body">{label}</span>
      <select
        className="input py-2 px-4 min-w-[130px]"
        value={value}
        onChange={(e) => {
          const val = e.target.value;
          onChange(isNaN(val) ? val : Number(val));
        }}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
