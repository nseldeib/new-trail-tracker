'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { Activity } from 'lucide-react'
import { getActivityColor } from '@/lib/utils/colors'
import { useMemo } from 'react'

interface ActivityDistributionWidgetProps {
  workouts: Array<{
    activity_type: string
    duration: number
  }>
}

export function ActivityDistributionWidget({ workouts }: ActivityDistributionWidgetProps) {
  const distributionData = useMemo(() => {
    const activityCounts: Record<string, { count: number; duration: number }> = {}

    workouts.forEach((workout) => {
      const activity = workout.activity_type.toLowerCase()
      if (!activityCounts[activity]) {
        activityCounts[activity] = { count: 0, duration: 0 }
      }
      activityCounts[activity].count++
      activityCounts[activity].duration += workout.duration
    })

    return Object.entries(activityCounts)
      .map(([name, data]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value: data.count,
        duration: data.duration,
        color: getActivityColor(name),
      }))
      .sort((a, b) => b.value - a.value)
  }, [workouts])

  const totalWorkouts = workouts.length

  if (totalWorkouts === 0) {
    return (
      <Card className="bg-white dark:bg-gray-800">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-teal-600" />
            <CardTitle className="text-lg">Activity Distribution</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-br from-teal-100 to-blue-100 dark:from-teal-900 dark:to-blue-900 rounded-full flex items-center justify-center">
              <Activity className="w-8 h-8 text-teal-600 dark:text-teal-400" />
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm">No workout data yet</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-white dark:bg-gray-800 hover:shadow-lg transition-all duration-200">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-1">
          <Activity className="w-4 h-4 text-teal-600" />
          <CardTitle className="text-sm">Distribution</CardTitle>
        </div>
      </CardHeader>

      <CardContent>
        <div className="h-[180px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={distributionData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={2}
                dataKey="value"
                animationBegin={0}
                animationDuration={800}
                animationEasing="ease-out"
              >
                {distributionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '8px 12px',
                }}
                formatter={(value: number, name: string, props: any) => [
                  `${value} workouts (${props.payload.duration} min)`,
                  name
                ]}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="grid grid-cols-2 gap-2 mt-4">
          {distributionData.slice(0, 6).map((activity) => (
            <div key={activity.name} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: activity.color }}
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-900 dark:text-gray-100 truncate">
                  {activity.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {activity.value} ({Math.round((activity.value / totalWorkouts) * 100)}%)
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
