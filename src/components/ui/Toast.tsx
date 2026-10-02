import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  description?: string;
}

interface ToastProps {
  toast: ToastMessage | null;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onClose();
    }, 3500);

    return () => clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  const icons = {
    success: <CheckCircle2 className="text-emerald-600 dark:text-emerald-400 flex-shrink-0" size={20} />,
    error: <AlertCircle className="text-rose-600 dark:text-rose-400 flex-shrink-0" size={20} />,
    info: <Info className="text-sky-600 dark:text-sky-400 flex-shrink-0" size={20} />,
  };

  return (
    <div
      role="alert"
      data-testid="toast-notification"
      className="fixed bottom-20 md:bottom-6 right-6 z-50 flex items-start gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md rounded-xl p-4 max-w-sm animate-in slide-in-from-bottom-5 duration-200"
    >
      {icons[toast.type]}
      <div className="flex-1">
        <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
          {toast.title}
        </h4>
        {toast.description && (
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
            {toast.description}
          </p>
        )}
      </div>
      <button
        onClick={onClose}
        className="min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
        aria-label="Tutup pemberitahuan"
      >
        <X size={16} />
      </button>
    </div>
  );
};
