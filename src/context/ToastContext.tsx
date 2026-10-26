import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
}

interface ToastContextType {
  addToast: (message: string, type?: ToastType, title?: string) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((message: string, type: ToastType = 'info', title?: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, title, message }]);

    setTimeout(() => {
      removeToast(id);
    }, 4500);
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      {/* Toast Render Container */}
      <div 
        aria-live="polite" 
        className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-md w-full px-4 pointer-events-none"
      >
        {toasts.map((toast) => {
          // Retro 1970s Sticker Toast Styling
          const typeStyles = {
            success: 'border-l-8 border-l-disco-teal border-2 border-disco-border bg-disco-surface text-disco-cream shadow-retro',
            error: 'border-l-8 border-l-disco-pink border-2 border-disco-border bg-disco-surface text-disco-cream shadow-retro',
            warning: 'border-l-8 border-l-disco-orange border-2 border-disco-border bg-disco-surface text-disco-cream shadow-retro',
            info: 'border-l-8 border-l-disco-mustard border-2 border-disco-border bg-disco-surface text-disco-cream shadow-retro',
          }[toast.type];

          const IconComponent = {
            success: CheckCircle2,
            error: AlertCircle,
            warning: AlertTriangle,
            info: Info,
          }[toast.type];

          const iconColor = {
            success: 'text-disco-teal',
            error: 'text-disco-pink',
            warning: 'text-disco-orange',
            info: 'text-disco-mustard',
          }[toast.type];

          return (
            <div
              key={toast.id}
              role="alert"
              className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl transition-transform duration-200 ${typeStyles}`}
            >
              <IconComponent className={`w-5 h-5 flex-shrink-0 mt-0.5 ${iconColor}`} />
              <div className="flex-1 text-sm">
                {toast.title && <div className="font-bold font-display text-disco-cream mb-0.5">{toast.title}</div>}
                <div className="text-disco-cream-muted leading-relaxed">{toast.message}</div>
              </div>
              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                className="text-disco-cream-muted hover:text-disco-cream transition-colors p-1 rounded-lg hover:bg-disco-border/30"
                aria-label="Close notification"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
