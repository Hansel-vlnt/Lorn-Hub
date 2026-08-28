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
    success: <CheckCircle2 className="text-emerald-500 flex-shrink-0" size={20} />,
    error: <AlertCircle className="text-rose-500 flex-shrink-0" size={20} />,
    info: <Info className="text-blue-500 flex-shrink-0" size={20} />,
  };

  return (
    <div className="fixed bottom-20 md:bottom-6 right-6 z-50 flex items-start gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl rounded-xl p-4 max-w-sm animate-in slide-in-from-bottom-5 duration-200">
      {icons[toast.type]}
      <div className="flex-1">
        <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
          {toast.title}
        </h4>
        {toast.description && (
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {toast.description}
          </p>
        )}
      </div>
      <button
        onClick={onClose}
        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
      >
        <X size={16} />
      </button>
    </div>
  );
};
