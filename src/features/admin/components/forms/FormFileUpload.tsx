'use client';

import { useState, useCallback, useRef } from 'react';
import { useFormContext, useController } from 'react-hook-form';
import { Upload, X, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface FormFileUploadProps {
  name: string;
  label?: string;
  accept?: string;
  previewUrl?: string;
  description?: string;
  onUpload?: (file: File) => Promise<string>;
}

export function FormFileUpload({
  name,
  label,
  accept = 'image/*',
  previewUrl: initialPreview,
  description,
  onUpload,
}: FormFileUploadProps) {
  const { control } = useFormContext();
  const { field, fieldState } = useController({ name, control });
  const inputRef = useRef<HTMLInputElement>(null);

  const [preview, setPreview] = useState<string | null>(initialPreview || null);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleFile = useCallback(
    async (file: File) => {
      // Show local preview
      const localUrl = URL.createObjectURL(file);
      setPreview(localUrl);

      if (onUpload) {
        setUploading(true);
        try {
          const uploadedUrl = await onUpload(file);
          field.onChange(uploadedUrl);
        } catch (err) {
          console.error('Upload failed:', err);
          setPreview(null);
        } finally {
          setUploading(false);
        }
      } else {
        field.onChange(file);
      }
    },
    [field, onUpload]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFile(file);
      }
    },
    [handleFile]
  );

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      const file = e.dataTransfer.files?.[0];
      if (file && file.type.startsWith('image/')) {
        handleFile(file);
      }
    },
    [handleFile]
  );

  const clearFile = useCallback(() => {
    setPreview(null);
    field.onChange(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  }, [field]);

  return (
    <div className="space-y-2">
      {label && <label className="text-sm font-medium">{label}</label>}

      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={cn(
          'relative rounded-xl border-2 border-dashed border-input p-4',
          'hover:border-primary/50 transition-colors',
          dragActive && 'border-primary bg-primary/5',
          fieldState.error && 'border-destructive'
        )}
      >
        {preview ? (
          <div className="relative flex justify-center">
            <div className="relative">
              <Image
                src={preview}
                alt="Preview"
                width={200}
                height={150}
                className="rounded-lg object-cover"
              />
              <button
                type="button"
                onClick={clearFile}
                disabled={uploading}
                className={cn(
                  'absolute -top-2 -right-2 rounded-full bg-destructive p-1.5 text-white',
                  'hover:bg-destructive/90 transition-colors',
                  'disabled:opacity-50'
                )}
              >
                <X size={14} />
              </button>
            </div>
          </div>
        ) : (
          <label className="flex flex-col items-center cursor-pointer py-6">
            {uploading ? (
              <Loader2 className="animate-spin text-muted-foreground" size={40} />
            ) : (
              <Upload
                className={cn(
                  'text-muted-foreground transition-colors',
                  dragActive && 'text-primary'
                )}
                size={40}
              />
            )}
            <span className="mt-3 text-sm text-muted-foreground">
              {uploading
                ? 'Uploading...'
                : dragActive
                ? 'Drop image here'
                : 'Click to upload or drag and drop'}
            </span>
            <span className="mt-1 text-xs text-muted-foreground">
              PNG, JPG, WebP up to 5MB
            </span>
            <input
              ref={inputRef}
              type="file"
              accept={accept}
              onChange={handleChange}
              disabled={uploading}
              className="sr-only"
            />
          </label>
        )}
      </div>

      {description && !fieldState.error && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
      {fieldState.error && (
        <p className="text-xs text-destructive">{fieldState.error.message}</p>
      )}
    </div>
  );
}
