import React from 'react';
import { AlertOctagon, RotateCcw } from 'lucide-react';
import { Button } from './Button';
import { cn } from '../../lib/utils';

export interface ErrorMessageProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  title = 'Hold On!',
  message,
  onRetry,
  className,
}) => {
  return (
    <div
      role="alert"
      className={cn(
        'rounded-3xl border-2 border-disco-border bg-disco-surface p-6 text-disco-cream shadow-retro border-l-8 border-l-disco-pink',
        className
      )}
    >
      <div className="flex items-start gap-4">
        <div className="p-3 rounded-2xl bg-disco-pink border-2 border-disco-border text-white shadow-retro-xs shrink-0">
          <AlertOctagon className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <h4 className="text-base font-bold font-display tracking-wide text-disco-cream">
            {title}
          </h4>
          <p className="text-sm text-disco-cream-muted mt-1 leading-relaxed">
            {message}
          </p>
          {onRetry && (
            <div className="mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={onRetry}
                leftIcon={<RotateCcw className="w-4 h-4" />}
              >
                Try Again
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
