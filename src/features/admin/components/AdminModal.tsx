'use client';

import { ReactNode, useEffect, useCallback } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AdminModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  showCloseButton?: boolean;
}

const widthClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
};

export function AdminModal({
  open,
  onClose,
  title,
  children,
  maxWidth = 'lg',
  showCloseButton = true,
}: AdminModalProps) {
  // Handle escape key
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    },
    [onClose]
  );

  // Add/remove event listener
  useEffect(() => {
    if (open) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [open, handleKeyDown]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={cn(
          'relative w-full rounded-2xl border border-border bg-card p-6',
          'max-h-[90vh] overflow-y-auto',
          'animate-in fade-in zoom-in-95 duration-200',
          widthClasses[maxWidth]
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h2 id="modal-title" className="text-xl font-bold">
            {title}
          </h2>
          {showCloseButton && (
            <button
              type="button"
              onClick={onClose}
              className={cn(
                'rounded-lg p-2 transition-colors',
                'hover:bg-accent focus:outline-none focus:ring-2 focus:ring-primary',
                'cursor-pointer'
              )}
              aria-label="Close modal"
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* Content */}
        {children}
      </div>
    </div>
  );
}
