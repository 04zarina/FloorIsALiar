import React from 'react';
import { Button } from './Button';
import { Disc3 } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className,
}) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-10 text-center rounded-3xl border-2 border-dashed border-disco-border bg-disco-surface/70 text-disco-cream',
        className
      )}
    >
      <div className="w-16 h-16 rounded-2xl bg-disco-mustard border-2 border-disco-border flex items-center justify-center text-disco-border mb-4 shadow-retro">
        {icon || <Disc3 className="w-8 h-8 animate-disco-spin" />}
      </div>
      <h3 className="text-xl font-bold font-display tracking-wide text-disco-cream mb-2">
        {title}
      </h3>
      <p className="text-sm text-disco-cream-muted max-w-sm mb-6 leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button variant="secondary" size="md" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
