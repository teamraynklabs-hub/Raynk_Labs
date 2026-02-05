'use client';

import { ReactNode } from 'react';
import { Edit, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AdminCardProps {
  children: ReactNode;
  onEdit?: () => void;
  onDelete?: () => void;
  className?: string;
}

export function AdminCard({
  children,
  onEdit,
  onDelete,
  className,
}: AdminCardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-border bg-card p-5',
        'transition-shadow hover:shadow-lg',
        className
      )}
    >
      {children}

      {(onEdit || onDelete) && (
        <div className="mt-4 flex justify-end gap-2">
          {onEdit && (
            <button
              type="button"
              onClick={onEdit}
              className={cn(
                'rounded-lg border border-input p-2',
                'transition-colors hover:bg-accent',
                'cursor-pointer'
              )}
              aria-label="Edit"
            >
              <Edit size={16} />
            </button>
          )}
          {onDelete && (
            <button
              type="button"
              onClick={onDelete}
              className={cn(
                'rounded-lg border border-destructive/40 p-2',
                'text-destructive transition-colors',
                'hover:bg-destructive/10',
                'cursor-pointer'
              )}
              aria-label="Delete"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
