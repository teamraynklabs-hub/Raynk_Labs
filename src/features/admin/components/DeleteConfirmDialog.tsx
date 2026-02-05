'use client';

import { Trash2, AlertTriangle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DeleteConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
  itemName?: string;
  loading?: boolean;
}

export function DeleteConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = 'Delete Item',
  description,
  itemName,
  loading = false,
}: DeleteConfirmDialogProps) {
  if (!open) return null;

  const defaultDescription = itemName
    ? `Are you sure you want to delete "${itemName}"? This action cannot be undone.`
    : 'Are you sure you want to delete this item? This action cannot be undone.';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Dialog */}
      <div
        className={cn(
          'relative w-full max-w-md rounded-2xl border border-border bg-card p-6',
          'animate-in fade-in zoom-in-95 duration-200'
        )}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        aria-describedby="dialog-description"
      >
        {/* Icon */}
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
          <AlertTriangle className="h-6 w-6 text-destructive" />
        </div>

        {/* Title */}
        <h2
          id="dialog-title"
          className="mb-2 text-center text-lg font-semibold"
        >
          {title}
        </h2>

        {/* Description */}
        <p
          id="dialog-description"
          className="mb-6 text-center text-sm text-muted-foreground"
        >
          {description || defaultDescription}
        </p>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className={cn(
              'flex-1 rounded-xl border border-input px-4 py-2.5',
              'font-medium transition-colors',
              'hover:bg-accent focus:outline-none focus:ring-2 focus:ring-primary',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'cursor-pointer'
            )}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={cn(
              'flex-1 rounded-xl bg-destructive px-4 py-2.5',
              'font-medium text-destructive-foreground transition-colors',
              'hover:bg-destructive/90 focus:outline-none focus:ring-2 focus:ring-destructive',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'cursor-pointer flex items-center justify-center gap-2'
            )}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4" />
                Delete
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
