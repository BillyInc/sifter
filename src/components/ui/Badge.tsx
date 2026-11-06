import React from 'react';
import { cn } from './cn';

export type BadgeTone = 'neutral' | 'info' | 'success' | 'warning' | 'danger' | 'purple';

const tones: Record<BadgeTone, string> = {
  neutral: 'bg-sifter-elevated text-sifter-text-muted border-sifter-border',
  info: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
  success: 'bg-green-500/15 text-green-300 border-green-500/30',
  warning: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  danger: 'bg-red-500/15 text-red-300 border-red-500/30',
  purple: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
};

export function Badge({ tone = 'neutral', className, ...rest }: React.HTMLAttributes<HTMLSpanElement> & { tone?: BadgeTone }) {
  return (
    <span
      className={cn('inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap', tones[tone], className)}
      {...rest}
    />
  );
}

export default Badge;
