import React from 'react';
import { cn } from '../../lib/utils';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      children,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      disabled,
      leftIcon,
      rightIcon,
      type = 'button',
      ...props
    },
    ref
  ) => {
    // 1970s Disco Retro Button Styles:
    // Solid flat colors, thick dark outline (2.5px), hard offset shadow, hover bounce, press translation.
    const baseStyles = 
      'relative inline-flex items-center justify-center font-bold rounded-2xl border-2 border-disco-border transition-transform duration-150 select-none cursor-pointer focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-disco-mustard/60 focus-visible:ring-offset-2 focus-visible:ring-offset-disco-bg disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none active:translate-x-[2px] active:translate-y-[2px] active:shadow-retro-xs font-display text-sm tracking-wide hover:-translate-y-0.5';

    const variants = {
      // Solid Hot Pink with hard shadow
      primary:
        'bg-disco-pink text-white shadow-retro hover:bg-disco-pink-dark hover:shadow-retro-lg',
      // Solid Mustard Yellow with hard shadow
      secondary:
        'bg-disco-mustard text-disco-border font-extrabold shadow-retro hover:bg-disco-mustard-dark hover:shadow-retro-lg',
      // Chunky Retro Outline with solid plum surface
      outline:
        'bg-disco-surface text-disco-cream shadow-retro-sm hover:bg-disco-elevated hover:shadow-retro',
      // Warm Ghost button
      ghost:
        'border-transparent bg-transparent text-disco-cream hover:bg-disco-surface/80 hover:border-disco-border shadow-none hover:shadow-retro-sm',
      // Solid Tangerine Orange Danger button
      danger:
        'bg-disco-orange text-white shadow-retro hover:bg-disco-orange-dark hover:shadow-retro-lg',
    };

    const sizes = {
      sm: 'h-9 px-4 text-xs gap-1.5 rounded-xl',
      md: 'h-11 px-5 text-sm gap-2 rounded-2xl',
      lg: 'h-13 px-7 text-base gap-2.5 rounded-2xl',
    };

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        aria-busy={isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin text-current" />}
        {!isLoading && leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>}
        <span>{children}</span>
        {!isLoading && rightIcon && <span className="inline-flex shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';
