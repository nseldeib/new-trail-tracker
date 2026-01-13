interface LoadingSpinnerProps {
  className?: string
}

export function LoadingSpinner({ className = "h-4 w-4" }: LoadingSpinnerProps) {
  return (
    <div
      className={`animate-spin rounded-full border-b-2 border-white ${className}`}
    />
  )
}
