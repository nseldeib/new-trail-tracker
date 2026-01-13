'use client'

import type React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { LucideIcon } from 'lucide-react'
import { AnimatedCounter } from '@/components/ui/animated-counter'
import { Sparkline } from '@/components/charts/sparkline'
import { ProgressRing } from '@/components/charts/progress-ring'
import { SkeletonStat } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { getActivityGradient } from '@/lib/utils/colors'

interface MetricCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  subtitle?: string
  loading?: boolean
  gradient?: 'teal' | 'coral' | 'purple' | 'green' | 'amber' | 'activity'
  sparklineData?: number[]
  progress?: number // 0-100 for progress ring
  numericValue?: number // For animated counter
  badge?: React.ReactNode // Comparison badge
  activityType?: string // For activity-specific gradients
}

const gradientClasses = {
  teal: 'bg-gradient-teal',
  coral: 'bg-gradient-coral',
  purple: 'bg-gradient-purple',
  green: 'bg-gradient-green',
  amber: 'bg-gradient-amber',
}

const iconColors = {
  teal: 'text-teal-100',
  coral: 'text-coral-100',
  purple: 'text-purple-100',
  green: 'text-green-100',
  amber: 'text-amber-100',
}

export function MetricCard({
  title,
  value,
  icon: Icon,
  subtitle,
  loading,
  gradient = 'teal',
  sparklineData,
  progress,
  numericValue,
  badge,
  activityType,
}: MetricCardProps) {
  if (loading) {
    return <SkeletonStat />
  }

  // Determine gradient class
  let gradientClass: string
  let iconColor: string

  if (gradient === 'activity' && activityType) {
    // Use activity-specific gradient
    gradientClass = getActivityGradient(activityType)
    iconColor = 'text-white/90'
  } else if (gradient && gradient !== 'activity') {
    gradientClass = gradientClasses[gradient]
    iconColor = iconColors[gradient]
  } else {
    gradientClass = 'bg-white dark:bg-gray-800'
    iconColor = 'text-gray-700 dark:text-gray-300'
  }

  return (
    <Card
      className={cn(
        'overflow-hidden relative transition-all duration-200',
        'hover:-translate-y-1 hover:shadow-xl',
        gradient ? gradientClass : 'bg-white dark:bg-gray-800'
      )}
    >
      {/* Decorative gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />

      <CardContent className="pt-3 pb-2 relative z-10">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <p className={cn("text-xs font-medium", gradient ? "text-white/80" : "text-gray-600 dark:text-gray-400")}>
              {title}
            </p>
            <div className={cn("text-xl font-bold mt-0.5", gradient ? "text-white" : "text-gray-900 dark:text-gray-100")}>
              {numericValue !== undefined ? (
                <AnimatedCounter value={numericValue} />
              ) : (
                value
              )}
            </div>
            {subtitle && (
              <p className={cn("text-xs mt-0.5", gradient ? "text-white/70" : "text-gray-500 dark:text-gray-400")}>
                {subtitle}
              </p>
            )}
            {badge && (
              <div className="mt-1">
                {badge}
              </div>
            )}
          </div>

          {progress !== undefined ? (
            <ProgressRing progress={progress} size={40} showPercentage={false} color="white" />
          ) : (
            <div className={cn("p-1.5 rounded-lg bg-white/20 backdrop-blur-sm")}>
              <Icon className={cn("h-4 w-4", gradient ? iconColor : "text-gray-700 dark:text-gray-300")} />
            </div>
          )}
        </div>

        {sparklineData && sparklineData.length > 0 && (
          <div className="mt-1">
            <Sparkline data={sparklineData} color="white" height={24} />
          </div>
        )}
      </CardContent>
    </Card>
  )
}
