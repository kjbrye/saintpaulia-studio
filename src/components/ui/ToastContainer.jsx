/**
 * ToastContainer - Renders toast notifications
 */

import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { useToastState } from '../../hooks/useToast';

const toastConfig = {
  success: {
    icon: CheckCircle,
    bg: 'var(--sage-100)',
    border: 'var(--sage-300)',
    iconColor: 'var(--sage-700)',
    text: 'var(--sage-800)',
  },
  error: {
    icon: AlertCircle,
    bg: '#fef2f2',
    border: '#fecaca',
    iconColor: 'var(--color-error)',
    text: '#991b1b',
  },
  info: {
    icon: Info,
    bg: 'var(--purple-50, #f5f3ff)',
    border: 'var(--purple-200)',
    iconColor: 'var(--purple-500)',
    text: 'var(--purple-800, #3b0764)',
  },
};

function Toast({ toast, onDismiss }) {
  const config = toastConfig[toast.type] || toastConfig.info;
  const Icon = config.icon;

  return (
    <div
      className="flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg max-w-sm w-full animate-slide-in"
      style={{
        background: config.bg,
        border: `1px solid ${config.border}`,
      }}
    >
      <Icon size={18} style={{ color: config.iconColor, flexShrink: 0 }} />
      <p className="text-small font-medium flex-1" style={{ color: config.text }}>
        {toast.message}
      </p>
      <button
        onClick={() => onDismiss(toast.id)}
        className="p-0.5 rounded hover:opacity-70 transition-opacity flex-shrink-0"
      >
        <X size={14} style={{ color: config.text }} />
      </button>
    </div>
  );
}

export default function ToastContainer() {
  const { toasts, removeToast } = useToastState();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <Toast toast={toast} onDismiss={removeToast} />
        </div>
      ))}
    </div>
  );
}
