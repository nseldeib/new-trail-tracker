'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { TrainingInsight } from '@/lib/types/analytics'
import {
  Lightbulb,
  AlertTriangle,
  Target,
  TrendingUp,
  Play,
  Clock,
  Shuffle,
  Flame,
  LucideIcon
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import { useSpring, animated } from 'react-spring'

interface TrainingInsightsPanelProps {
  insights: TrainingInsight[]
  loading?: boolean
}

const iconMap: Record<string, LucideIcon> = {
  Lightbulb,
  AlertTriangle,
  Target,
  TrendingUp,
  Play,
  Clock,
  Shuffle,
  Flame
}

const typeConfig: Record<TrainingInsight['type'], {
  bgColor: string
  borderColor: string
  icon: LucideIcon
  iconColor: string
}> = {
  achievement: {
    bgColor: 'bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20',
    borderColor: 'border-amber-200 dark:border-amber-800',
    icon: Flame,
    iconColor: 'text-amber-600 dark:text-amber-400'
  },
  warning: {
    bgColor: 'bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20',
    borderColor: 'border-red-200 dark:border-red-800',
    icon: AlertTriangle,
    iconColor: 'text-red-600 dark:text-red-400'
  },
  suggestion: {
    bgColor: 'bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20',
    borderColor: 'border-blue-200 dark:border-blue-800',
    icon: Lightbulb,
    iconColor: 'text-blue-600 dark:text-blue-400'
  },
  tip: {
    bgColor: 'bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20',
    borderColor: 'border-purple-200 dark:border-purple-800',
    icon: Target,
    iconColor: 'text-purple-600 dark:text-purple-400'
  }
}

const priorityBadgeConfig: Record<TrainingInsight['priority'], {
  className: string
  label: string
}> = {
  high: {
    className: 'bg-red-100 text-red-700 border-red-200',
    label: 'High Priority'
  },
  medium: {
    className: 'bg-amber-100 text-amber-700 border-amber-200',
    label: 'Medium'
  },
  low: {
    className: 'bg-gray-100 text-gray-700 border-gray-200',
    label: 'Low'
  }
}

export function TrainingInsightsPanel({ insights, loading }: TrainingInsightsPanelProps) {
  const router = useRouter()

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Training Insights</CardTitle>
          <CardDescription>Personalized recommendations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-gray-100 dark:bg-gray-800 animate-pulse rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!insights || insights.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-blue-600" />
            Training Insights
          </CardTitle>
          <CardDescription>Personalized recommendations based on your activity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Target className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Log more workouts to receive personalized insights and recommendations
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Sort by priority
  const sortedInsights = [...insights].sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 }
    return priorityOrder[a.priority] - priorityOrder[b.priority]
  })

  return (
    <Card className="hover:shadow-lg transition-all duration-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-blue-600" />
              Training Insights
            </CardTitle>
            <CardDescription>
              {insights.length} personalized {insights.length === 1 ? 'recommendation' : 'recommendations'}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-3">
          {sortedInsights.map((insight, index) => (
            <InsightCard
              key={insight.id}
              insight={insight}
              index={index}
              onAction={() => {
                if (insight.action?.href) {
                  router.push(insight.action.href)
                }
              }}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

interface InsightCardProps {
  insight: TrainingInsight
  index: number
  onAction: () => void
}

function InsightCard({ insight, index, onAction }: InsightCardProps) {
  const config = typeConfig[insight.type]
  const priorityConfig = priorityBadgeConfig[insight.priority]
  const Icon = iconMap[insight.icon] || config.icon

  // Stagger animation
  const animation = useSpring({
    from: { opacity: 0, transform: 'translateX(-20px)' },
    to: { opacity: 1, transform: 'translateX(0px)' },
    delay: index * 100,
    config: { tension: 200, friction: 20 }
  })

  return (
    <animated.div style={animation}>
      <Card className={cn(
        "border-l-4 transition-all duration-200 hover:shadow-md",
        config.bgColor,
        config.borderColor
      )}>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            {/* Icon */}
            <div className={cn(
              "p-2 rounded-lg flex-shrink-0",
              insight.type === 'achievement' ? 'bg-amber-100 dark:bg-amber-900/30' :
              insight.type === 'warning' ? 'bg-red-100 dark:bg-red-900/30' :
              insight.type === 'suggestion' ? 'bg-blue-100 dark:bg-blue-900/30' :
              'bg-purple-100 dark:bg-purple-900/30'
            )}>
              <Icon className={cn("w-5 h-5", config.iconColor)} />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-2">
                <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                  {insight.title}
                </h4>
                {insight.priority !== 'low' && (
                  <Badge className={cn("text-xs flex-shrink-0", priorityConfig.className)}>
                    {priorityConfig.label}
                  </Badge>
                )}
              </div>

              <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                {insight.message}
              </p>

              {/* Action button */}
              {insight.actionable && insight.action && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onAction}
                  className={cn(
                    "text-xs h-8",
                    insight.type === 'achievement' && "border-amber-300 hover:bg-amber-50 dark:hover:bg-amber-900/20",
                    insight.type === 'warning' && "border-red-300 hover:bg-red-50 dark:hover:bg-red-900/20",
                    insight.type === 'suggestion' && "border-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20",
                    insight.type === 'tip' && "border-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                  )}
                >
                  {insight.action.label}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </animated.div>
  )
}
