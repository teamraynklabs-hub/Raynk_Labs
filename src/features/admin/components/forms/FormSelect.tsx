'use client';

import { forwardRef, SelectHTMLAttributes } from 'react';
import { useFormContext } from 'react-hook-form';
import { cn } from '@/lib/utils';

interface SelectOption {
  value: string;
  label: string;
}

interface FormSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  name: string;
  label?: string;
  description?: string;
  options: SelectOption[];
  placeholder?: string;
}

export const FormSelect = forwardRef<HTMLSelectElement, FormSelectProps>(
  (
    {
      name,
      label,
      description,
      options,
      placeholder = 'Select an option',
      className,
      required,
      ...props
    },
    ref
  ) => {
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
        <select
          id={name}
          {...register(name)}
          {...props}
          ref={ref}
          className={cn(
            'w-full rounded-xl border border-input bg-background px-4 py-3',
            'text-sm transition-colors cursor-pointer',
            'focus:border-primary focus:ring-2 focus:ring-primary/30 outline-none',
            error &&
              'border-destructive focus:border-destructive focus:ring-destructive/30',
            className
          )}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
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

FormSelect.displayName = 'FormSelect';
