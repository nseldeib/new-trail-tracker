'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { useMemo } from 'react'
import { cn } from '@/lib/utils'

interface WeekComparisonWidgetProps {
  workouts: Array<{
    created_at: string
    duration: number
    distance?: number
  }>
}

export function WeekComparisonWidget({ workouts }: WeekComparisonWidgetProps) {
  const comparisonData = useMemo(() => {
    const now = new Date()
    const thisWeekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay())
    const lastWeekStart = new Date(thisWeekStart.getTime() - 7 * 24 * 60 * 60 * 1000)
    const lastWeekEnd = new Date(thisWeekStart.getTime() - 1)

    const thisWeek = workouts.filter(w => {
      const date = new Date(w.created_at)
      return date >= thisWeekStart && date <= now
    })

    const lastWeek = workouts.filter(w => {
      const date = new Date(w.created_at)
      return date >= lastWeekStart && date <= lastWeekEnd
    })

    const thisWeekCount = thisWeek.length
    const lastWeekCount = lastWeek.length
    const thisWeekDuration = thisWeek.reduce((sum, w) => sum + w.duration, 0)
    const lastWeekDuration = lastWeek.reduce((sum, w) => sum + w.duration, 0)
    const thisWeekDistance = thisWeek.reduce((sum, w) => sum + (w.distance || 0), 0)
    const lastWeekDistance = lastWeek.reduce((sum, w) => sum + (w.distance || 0), 0)

    const calculateChange = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0
      return Math.round(((current - previous) / previous) * 100)
    }

    return {
      chartData: [
        {
          metric: 'Workouts',
          'This Week': thisWeekCount,
          'Last Week': lastWeekCount,
        },
        {
          metric: 'Duration (min)',
          'This Week': thisWeekDuration,
          'Last Week': lastWeekDuration,
        },
        {
          metric: 'Distance (km)',
          'This Week': Math.round(thisWeekDistance * 10) / 10,
          'Last Week': Math.round(lastWeekDistance * 10) / 10,
        },
      ],
      changes: {
        workouts: calculateChange(thisWeekCount, lastWeekCount),
        duration: calculateChange(thisWeekDuration, lastWeekDuration),
        distance: calculateChange(thisWeekDistance, lastWeekDistance),
      },
    }
  }, [workouts])

  const getChangeIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="w-3 h-3" />
    if (change < 0) return <TrendingDown className="w-3 h-3" />
    return <Minus className="w-3 h-3" />
  }

  const getChangeColor = (change: number) => {
    if (change > 0) return 'bg-green-100 text-green-700 border-green-200'
    if (change < 0) return 'bg-red-100 text-red-700 border-red-200'
    return 'bg-gray-100 text-gray-700 border-gray-200'
  }

  return (
    <Card className="bg-white dark:bg-gray-800 hover:shadow-lg transition-all duration-200">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1">
              <TrendingUp className="w-4 h-4 text-purple-600" />
              <CardTitle className="text-sm">Week vs Week</CardTitle>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Change badges */}
        <div className="flex flex-wrap gap-1 mb-2">
          <Badge className={cn('text-xs flex items-center gap-1', getChangeColor(comparisonData.changes.workouts))}>
            {getChangeIcon(comparisonData.changes.workouts)}
            {comparisonData.changes.workouts > 0 && '+'}
            {comparisonData.changes.workouts}% workouts
          </Badge>
          <Badge className={cn('text-xs flex items-center gap-1', getChangeColor(comparisonData.changes.duration))}>
            {getChangeIcon(comparisonData.changes.duration)}
            {comparisonData.changes.duration > 0 && '+'}
            {comparisonData.changes.duration}% duration
          </Badge>
          <Badge className={cn('text-xs flex items-center gap-1', getChangeColor(comparisonData.changes.distance))}>
            {getChangeIcon(comparisonData.changes.distance)}
            {comparisonData.changes.distance > 0 && '+'}
            {comparisonData.changes.distance}% distance
          </Badge>
        </div>

        {/* Bar chart */}
        <div className="h-[140px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={comparisonData.chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="metric"
                tick={{ fontSize: 12, fill: '#6b7280' }}
                axisLine={{ stroke: '#e5e7eb' }}
              />
              <YAxis
                tick={{ fontSize: 12, fill: '#6b7280' }}
                axisLine={{ stroke: '#e5e7eb' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '8px 12px',
                }}
              />
              <Legend
                wrapperStyle={{ fontSize: '12px' }}
              />
              <Bar dataKey="This Week" fill="#a855f7" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Last Week" fill="#d8b4fe" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
