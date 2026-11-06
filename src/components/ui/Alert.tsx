import React from 'react';
import { cn } from './cn';

export function Alert({ tone = 'danger', className, children, ...rest }: React.HTMLAttributes<HTMLDivElement> & { tone?: 'danger' | 'info' | 'success' }) {
  const styles = {
    danger: 'bg-red-500/10 border-red-500/40 text-red-300',
    info: 'bg-blue-500/10 border-blue-500/40 text-blue-200',
    success: 'bg-green-500/10 border-green-500/40 text-green-200',
  }[tone];
  return (
    <div role={tone === 'danger' ? 'alert' : 'status'} className={cn('rounded-lg border p-3 text-sm', styles, className)} {...rest}>
      {children}
    </div>
  );
}

export default Alert;
