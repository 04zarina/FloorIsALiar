import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  className,
  size = 'md',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  }[size];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
      aria-describedby={description ? 'modal-description' : undefined}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-disco-border/85 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog Content */}
      <div
        className={cn(
          'relative w-full rounded-3xl bg-disco-surface border-3 border-disco-border shadow-retro-xl p-6 md:p-8 z-10 transition-all text-disco-cream',
          sizeClasses,
          className
        )}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close dialog"
          className="absolute top-5 right-5 p-2 rounded-xl border-2 border-disco-border bg-disco-elevated text-disco-cream hover:bg-disco-pink hover:text-white transition-colors shadow-retro-xs active:translate-x-[1px] active:translate-y-[1px]"
        >
          <X className="w-5 h-5" />
        </button>

        {title && (
          <div className="mb-4 pr-8">
            <h2 id="modal-title" className="text-2xl md:text-3xl font-bold font-display tracking-wide text-disco-cream">
              {title}
            </h2>
            {description && (
              <p id="modal-description" className="text-sm text-disco-cream-muted mt-1 leading-relaxed">
                {description}
              </p>
            )}
          </div>
        )}

        <div className="mt-2">{children}</div>
      </div>
    </div>
  );
};
