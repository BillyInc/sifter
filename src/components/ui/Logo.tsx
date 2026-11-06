import React from 'react';
import { cn } from './cn';

export function LogoMark({ size = 'md', className }: { size?: 'sm' | 'md' | 'lg'; className?: string }) {
  const box = { sm: 'w-8 h-8 rounded-lg', md: 'w-10 h-10 rounded-lg', lg: 'w-14 h-14 rounded-2xl' }[size];
  const icon = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-8 h-8' }[size];
  return (
    <div className={cn(box, 'bg-gradient-to-br from-sifter-blue to-blue-700 flex items-center justify-center shadow-card', className)} aria-hidden="true">
      <svg className={cn(icon, 'text-white')} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    </div>
  );
}

export function Logo({ size = 'md', subtitle }: { size?: 'sm' | 'md' | 'lg'; subtitle?: string }) {
  return (
    <span className="inline-flex items-center gap-3">
      <LogoMark size={size} />
      <span className="leading-tight">
        <span className={cn('block font-bold tracking-tight text-sifter-text', size === 'lg' ? 'text-2xl' : 'text-lg')}>SIFTER</span>
        {subtitle && <span className="block text-xs text-sifter-text-subtle">{subtitle}</span>}
      </span>
    </span>
  );
}

export default Logo;
