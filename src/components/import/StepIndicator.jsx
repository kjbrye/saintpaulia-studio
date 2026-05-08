/**
 * StepIndicator
 *
 * Numbered progress chips for the import flow.
 */

const STEPS = ['upload', 'map', 'review', 'confirm', 'result'];
const LABELS = {
  upload: 'Upload',
  map: 'Map',
  review: 'Review',
  confirm: 'Confirm',
  result: 'Done',
};

export default function StepIndicator({ current }) {
  const currentIdx = STEPS.indexOf(current);
  return (
    <ol className="flex items-center gap-2 mb-6 flex-wrap text-small">
      {STEPS.map((s, idx) => {
        const active = idx === currentIdx;
        const done = idx < currentIdx;
        return (
          <li key={s} className="flex items-center gap-2">
            <span
              className="px-3 py-1 rounded-full font-semibold"
              style={{
                background: active
                  ? 'var(--gradient-sage-primary)'
                  : done
                    ? 'var(--sage-200)'
                    : 'var(--sage-100)',
                color: active ? 'var(--text-on-dark)' : 'var(--sage-700)',
                border: '1px solid var(--sage-300)',
                opacity: !active && !done ? 0.6 : 1,
              }}
            >
              {idx + 1}. {LABELS[s]}
            </span>
            {idx < STEPS.length - 1 && <span style={{ color: 'var(--sage-400)' }}>›</span>}
          </li>
        );
      })}
    </ol>
  );
}
