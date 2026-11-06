import React from 'react';
import { cn } from './cn';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** `elevated` lifts the surface one step for nested or highlighted content. */
  tone?: 'default' | 'elevated';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  interactive?: boolean;
}

const paddings = { none: '', sm: 'p-4', md: 'p-6', lg: 'p-8' } as const;

export function Card({ tone = 'default', padding = 'md', interactive, className, ...rest }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-xl border border-sifter-border',
        tone === 'elevated' ? 'bg-sifter-elevated' : 'bg-sifter-card',
        paddings[padding],
        interactive && 'transition-colors duration-base hover:border-sifter-border-strong hover:bg-sifter-hover',
        className,
      )}
      {...rest}
    />
  );
}

export default Card;
