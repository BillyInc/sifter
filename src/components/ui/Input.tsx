'use client';

import React, { useId } from 'react';
import { cn } from './cn';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
  leadingIcon?: React.ReactNode;
}

/**
 * Dark-surface text input with label, hint and inline error.
 * Error text is linked with aria-describedby so screen readers announce it.
 */
export const Input = React.forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, hint, error, leadingIcon, className, id: idProp, 'aria-describedby': describedByProp, ...rest },
  ref,
) {
  const autoId = useId();
  const id = idProp ?? autoId;
  const ownDescribedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;
  const describedBy = [describedByProp, ownDescribedBy].filter(Boolean).join(' ') || undefined;

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-sifter-text-muted mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        {leadingIcon && (
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sifter-text-subtle">
            {leadingIcon}
          </span>
        )}
        <input
          ref={ref}
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={cn(
            'w-full h-11 rounded-lg bg-sifter-dark text-sifter-text placeholder:text-sifter-text-subtle',
            'border transition-colors duration-base px-3.5',
            'focus:outline-none focus:ring-2 focus:ring-sifter-blue/60 focus:border-sifter-blue',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            error ? 'border-sifter-danger/60' : 'border-sifter-border hover:border-sifter-border-strong',
            leadingIcon ? 'pl-10' : undefined,
            className,
          )}
          {...rest}
        />
      </div>
      {error ? (
        <p id={`${id}-error`} role="alert" className="mt-1.5 text-xs text-red-400">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="mt-1.5 text-xs text-sifter-text-subtle">
          {hint}
        </p>
      ) : null}
    </div>
  );
});

export default Input;
