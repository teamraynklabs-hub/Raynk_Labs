'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-10 text-center shadow-xl">
        <h1 className="mb-4 text-3xl font-extrabold text-primary">
          Something went wrong
        </h1>

        <p className="mb-8 text-sm text-muted-foreground">
          {error.message || 'An unexpected error occurred. Please try again.'}
        </p>

        <button
          onClick={reset}
          className="rounded-full cursor-pointer bg-gradient-to-r from-primary to-accent px-8 py-3 text-sm font-semibold text-primary-foreground transition-all hover:scale-105 hover:shadow-lg"
        >
          Try again
        </button>
      </div>
    </div>
  )
}
