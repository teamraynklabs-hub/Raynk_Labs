'use client';

import { forwardRef, TextareaHTMLAttributes } from 'react';
import { useFormContext } from 'react-hook-form';
import { cn } from '@/lib/utils';

interface FormTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  name: string;
  label?: string;
  description?: string;
}

export const FormTextarea = forwardRef<HTMLTextAreaElement, FormTextareaProps>(
  ({ name, label, description, className, required, rows = 4, ...props }, ref) => {
    const {
      register,
      formState: { errors },
    } = useFormContext();
    const error = errors[name];

    return (
      <div className="space-y-2">
        {label && (
          <label htmlFor={name} className="text-sm font-medium">
            {label}
            {required && <span className="text-destructive ml-1">*</span>}
          </label>
        )}
        <textarea
          id={name}
          rows={rows}
          {...register(name)}
          {...props}
          ref={ref}
          className={cn(
            'w-full rounded-xl border border-input bg-background px-4 py-3',
            'placeholder:text-muted-foreground transition-colors resize-none',
            'focus:border-primary focus:ring-2 focus:ring-primary/30 outline-none',
            error &&
              'border-destructive focus:border-destructive focus:ring-destructive/30',
            className
          )}
        />
        {description && !error && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
        {error && (
          <p className="text-xs text-destructive">{error.message as string}</p>
        )}
      </div>
    );
  }
);

FormTextarea.displayName = 'FormTextarea';
