import React from 'react';
import { cn } from '../../lib/utils';
import { Disc3 } from 'lucide-react';

export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  label = 'Grooving...',
  className,
}) => {
  const sizeClasses = {
    sm: 'w-7 h-7',
    md: 'w-12 h-12',
    lg: 'w-18 h-18',
  }[size];

  return (
    <div className={cn('flex flex-col items-center justify-center p-8 gap-4', className)}>
      <div className="relative flex items-center justify-center">
        {/* Retro circular badge outline */}
        <div className="p-3 rounded-2xl bg-disco-mustard border-2 border-disco-border shadow-retro">
          <Disc3 className={cn('text-disco-border animate-disco-spin', sizeClasses)} />
        </div>
      </div>
      {label && (
        <span className="text-sm font-bold font-display tracking-wider text-disco-cream mt-1">
          {label}
        </span>
      )}
    </div>
  );
};
