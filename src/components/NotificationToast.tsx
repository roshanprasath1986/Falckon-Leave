import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  message?: string;
}

interface NotificationToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success';
        const isError = toast.type === 'error';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto p-3.5 rounded-xl border shadow-lg flex items-start gap-3 bg-white dark:bg-[#111827] animate-in slide-in-from-bottom-2 duration-200 ${
              isSuccess
                ? 'border-[#0D9488]/40 dark:border-[#0D9488]/40'
                : isError
                ? 'border-rose-400 dark:border-rose-700'
                : 'border-[#CBD5E1] dark:border-[#334155]'
            }`}
          >
            {isSuccess && <CheckCircle2 className="w-5 h-5 text-[#0D9488] shrink-0 mt-0.5" />}
            {isError && <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />}
            {!isSuccess && !isError && <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />}

            <div className="min-w-0 flex-1">
              <h4 className="text-xs font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
                {toast.title}
              </h4>
              {toast.message && (
                <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8] mt-0.5 leading-snug">
                  {toast.message}
                </p>
              )}
            </div>

            <button
              onClick={() => onDismiss(toast.id)}
              className="text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white p-0.5"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
