'use client';

import { forwardRef, InputHTMLAttributes } from 'react';
import { useFormContext } from 'react-hook-form';
import { cn } from '@/lib/utils';

interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  name: string;
  label?: string;
  description?: string;
}

export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  ({ name, label, description, className, required, ...props }, ref) => {
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
        <input
          id={name}
          {...register(name)}
          {...props}
          ref={ref}
          className={cn(
            'w-full rounded-xl border border-input bg-background px-4 py-3',
            'placeholder:text-muted-foreground transition-colors',
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

FormInput.displayName = 'FormInput';
