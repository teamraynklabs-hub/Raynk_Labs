import * as React from "react"
import { cn } from "@/lib/utils"

type ButtonVariant = "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
type ButtonSize = "default" | "sm" | "lg" | "icon" | "icon-sm" | "icon-lg"

const variantClasses: Record<ButtonVariant, string> = {
  default: "bg-primary text-primary-foreground hover:bg-primary/90",
  destructive: "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20",
  outline: "border border-border bg-background hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
  secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
  ghost: "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
  link: "text-primary underline-offset-4 hover:underline",
}

const sizeClasses: Record<ButtonSize, string> = {
  default: "h-9 px-4 py-2",
  sm: "h-8 rounded-md gap-1.5 px-3 text-xs",
  lg: "h-10 rounded-md px-6",
  icon: "size-9",
  "icon-sm": "size-8",
  "icon-lg": "size-10",
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  asChild?: boolean
}

function Button({
  className,
  variant = "default",
  size = "default",
  asChild: _asChild,
  ...props
}: ButtonProps) {
  return (
    <button
      data-slot="button"
      className={cn(
        "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all",
        "cursor-pointer disabled:pointer-events-none disabled:opacity-50",
        "outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
        "[&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0",
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...props}
    />
  )
}

function buttonVariants({
  variant = "default",
  size = "default",
  className,
}: {
  variant?: ButtonVariant
  size?: ButtonSize
  className?: string
} = {}) {
  return cn(
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all",
    "cursor-pointer disabled:pointer-events-none disabled:opacity-50",
    "outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
    variantClasses[variant],
    sizeClasses[size],
    className,
  )
}

export { Button, buttonVariants }
