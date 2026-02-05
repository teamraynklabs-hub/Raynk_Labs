'use client';

import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
};

export function LoadingSpinner({
  size = 'md',
  text,
  className,
}: LoadingSpinnerProps) {
  return (
    <div className={cn('flex items-center gap-2 text-muted-foreground', className)}>
      <Loader2 className={cn('animate-spin', sizeClasses[size])} />
      {text && <span className="text-sm">{text}</span>}
    </div>
  );
}

interface LoadingOverlayProps {
  text?: string;
}

export function LoadingOverlay({ text = 'Loading...' }: LoadingOverlayProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
      <p className="mt-4 text-muted-foreground">{text}</p>
    </div>
  );
}
