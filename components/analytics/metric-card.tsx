import { Card, CardContent } from '@/components/ui/card'
import { LucideIcon } from 'lucide-react'

interface MetricCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  subtitle?: string
  loading?: boolean
}

export function MetricCard({ title, value, icon: Icon, subtitle, loading }: MetricCardProps) {
  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-2"></div>
            {subtitle && <div className="h-3 bg-gray-200 rounded w-1/3"></div>}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
            {subtitle && (
              <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
            )}
          </div>
          <div className="ml-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <Icon className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
