import React from 'react';
import { cn } from '../../lib/utils';
import { AlertCircle } from 'lucide-react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, leftIcon, rightIcon, id, ...props }, ref) => {
    const inputId = id || props.name || Math.random().toString(36).substring(2, 9);
    const errorId = `${inputId}-error`;
    const helperId = `${inputId}-helper`;

    return (
      <div className="w-full flex flex-col gap-1.5 text-left">
        {label && (
          <label htmlFor={inputId} className="text-xs font-bold tracking-wide text-disco-cream font-display">
            {label}
            {props.required && <span className="text-disco-pink ml-1">*</span>}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3.5 text-disco-cream-muted pointer-events-none flex items-center">
              {leftIcon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? errorId : helperText ? helperId : undefined}
            className={cn(
              'w-full bg-disco-surface border-2 border-disco-border rounded-2xl px-4 py-2.5 text-disco-cream placeholder:text-disco-cream-dim text-sm transition-all duration-150 outline-none shadow-retro-sm',
              'focus:border-disco-mustard focus:shadow-retro focus:-translate-y-0.5',
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              error && 'border-disco-pink shadow-[2px_2px_0px_#FF3377]',
              props.disabled && 'opacity-60 cursor-not-allowed bg-disco-border/30',
              className
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3.5 text-disco-cream-muted flex items-center">
              {rightIcon}
            </div>
          )}
        </div>
        {error ? (
          <div id={errorId} role="alert" className="flex items-center gap-1.5 text-xs text-disco-pink font-semibold mt-0.5">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{error}</span>
          </div>
        ) : helperText ? (
          <p id={helperId} className="text-xs text-disco-cream-muted mt-0.5">
            {helperText}
          </p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';
