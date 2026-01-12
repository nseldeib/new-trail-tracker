import { BarChart3 } from 'lucide-react'

interface EmptyStateProps {
  title?: string
  message?: string
  icon?: React.ReactNode
}

export function EmptyState({
  title = 'No data available',
  message = 'Start logging workouts to see your analytics',
  icon
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="text-gray-400 mb-4">
        {icon || <BarChart3 className="h-16 w-16" />}
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-500 text-center max-w-sm">{message}</p>
    </div>
  )
}
