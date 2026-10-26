import React from 'react';
import { cn } from '../../lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'pink' | 'mustard' | 'teal' | 'orange' | 'purple' | 'cyan' | 'gold';
  isInteractive?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', isInteractive = false, children, ...props }, ref) => {
    // 1970s Disco Retro Card:
    // Solid flat plum surface, thick 2.5px dark outline, hard offset shadow, chunky rounded corners.
    const variantStyles = {
      default: 'border-disco-border bg-disco-surface shadow-retro',
      pink: 'border-disco-border bg-disco-surface shadow-retro border-t-4 border-t-disco-pink',
      mustard: 'border-disco-border bg-disco-surface shadow-retro border-t-4 border-t-disco-mustard',
      gold: 'border-disco-border bg-disco-surface shadow-retro border-t-4 border-t-disco-mustard',
      teal: 'border-disco-border bg-disco-surface shadow-retro border-t-4 border-t-disco-teal',
      cyan: 'border-disco-border bg-disco-surface shadow-retro border-t-4 border-t-disco-teal',
      orange: 'border-disco-border bg-disco-surface shadow-retro border-t-4 border-t-disco-orange',
      purple: 'border-disco-border bg-disco-surface shadow-retro border-t-4 border-t-disco-grape',
    }[variant];

    return (
      <div
        ref={ref}
        className={cn(
          'relative rounded-3xl border-2 p-6 text-disco-cream transition-all duration-200 overflow-hidden',
          variantStyles,
          isInteractive && 'cursor-pointer hover:-translate-y-1 hover:shadow-retro-lg hover:rotate-[-0.3deg]',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
Card.displayName = 'Card';

export const CardHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('flex flex-col space-y-1.5 pb-3', className)} {...props} />
);

export const CardTitle = ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h3 className={cn('text-xl font-bold font-display tracking-wide text-disco-cream', className)} {...props} />
);

export const CardDescription = ({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
  <p className={cn('text-sm text-disco-cream-muted leading-relaxed', className)} {...props} />
);

export const CardContent = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('pt-2', className)} {...props} />
);

export const CardFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('flex items-center pt-4 border-t-2 border-disco-border/30 mt-4', className)} {...props} />
);
