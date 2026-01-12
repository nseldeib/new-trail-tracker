'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { ActivityDistribution, DifficultyDistribution } from '@/lib/types/analytics'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { useState } from 'react'
import { ChartSkeleton } from './chart-skeleton'
import { EmptyState } from './empty-state'

interface ActivityBreakdownProps {
  activityData: ActivityDistribution[]
  difficultyData: DifficultyDistribution[]
  loading: boolean
}

type ViewMode = 'activity' | 'difficulty'

// Color palette for charts
const ACTIVITY_COLORS: Record<string, string> = {
  running: '#16a34a',
  climbing: '#dc2626',
  hiking: '#ca8a04',
  snowboarding: '#2563eb',
  cycling: '#7c3aed',
  swimming: '#0891b2',
  yoga: '#db2777',
  strength: '#ea580c'
}

const DIFFICULTY_COLORS: Record<string, string> = {
  Easy: '#22c55e',
  Moderate: '#eab308',
  Hard: '#f97316',
  Expert: '#dc2626'
}

const ACTIVITY_EMOJIS: Record<string, string> = {
  running: '🏃',
  climbing: '🧗',
  hiking: '🥾',
  snowboarding: '🏂',
  cycling: '🚴',
  swimming: '🏊',
  yoga: '🧘',
  strength: '💪'
}

export function ActivityBreakdown({ activityData, difficultyData, loading }: ActivityBreakdownProps) {
  const [view, setView] = useState<ViewMode>('activity')

  if (loading) {
    return <ChartSkeleton height="h-96" />
  }

  const currentData = view === 'activity' ? activityData : difficultyData
  const isEmpty = !currentData || currentData.length === 0

  if (isEmpty) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Activity Breakdown</CardTitle>
          <CardDescription>Distribution of your workouts</CardDescription>
        </CardHeader>
        <CardContent>
          <EmptyState
            title="No breakdown data"
            message="Your activity distribution will appear here once you log workouts"
          />
        </CardContent>
      </Card>
    )
  }

  // Prepare pie chart data
  const pieData = view === 'activity'
    ? activityData.map(item => ({
        name: item.activityType,
        value: item.count,
        percentage: item.percentage
      }))
    : difficultyData.map(item => ({
        name: item.difficulty,
        value: item.count,
        percentage: item.percentage
      }))

  // Get color for pie slice
  const getColor = (name: string): string => {
    if (view === 'activity') {
      return ACTIVITY_COLORS[name.toLowerCase()] || '#64748b'
    } else {
      return DIFFICULTY_COLORS[name] || '#64748b'
    }
  }

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="text-sm font-medium text-gray-900">{payload[0].name}</p>
          <p className="text-sm text-gray-600 mt-1">
            Count: <span className="font-semibold">{payload[0].value}</span>
          </p>
          <p className="text-sm text-gray-600">
            Percentage: <span className="font-semibold">{payload[0].payload.percentage}%</span>
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>Activity Breakdown</CardTitle>
            <CardDescription>
              Distribution by {view === 'activity' ? 'activity type' : 'difficulty level'}
            </CardDescription>
          </div>
          <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setView('activity')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                view === 'activity'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Activity
            </button>
            <button
              onClick={() => setView('difficulty')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                view === 'difficulty'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Difficulty
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pie Chart */}
          <div className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry: any) => `${entry.percentage}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getColor(entry.name)} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Data Table */}
          <div className="space-y-3">
            {view === 'activity' ? (
              activityData.map((item, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded-full flex-shrink-0"
                    style={{ backgroundColor: ACTIVITY_COLORS[item.activityType.toLowerCase()] }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-900">
                        {ACTIVITY_EMOJIS[item.activityType.toLowerCase()] || ''} {item.activityType.charAt(0).toUpperCase() + item.activityType.slice(1)}
                      </span>
                      <span className="text-sm text-gray-600">{item.count} workouts</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="h-2 rounded-full transition-all"
                          style={{
                            width: `${item.percentage}%`,
                            backgroundColor: ACTIVITY_COLORS[item.activityType.toLowerCase()]
                          }}
                        />
                      </div>
                      <span className="text-xs text-gray-500 w-12 text-right">{item.percentage}%</span>
                    </div>
                    <div className="flex gap-3 mt-1 text-xs text-gray-500">
                      {item.totalDuration > 0 && (
                        <span>{Math.round(item.totalDuration / 60)}h {Math.round(item.totalDuration % 60)}m</span>
                      )}
                      {item.totalDistance > 0 && (
                        <span>{item.totalDistance.toFixed(1)} mi</span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              difficultyData.map((item, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded-full flex-shrink-0"
                    style={{ backgroundColor: DIFFICULTY_COLORS[item.difficulty] }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-900">{item.difficulty}</span>
                      <span className="text-sm text-gray-600">{item.count} workouts</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="h-2 rounded-full transition-all"
                          style={{
                            width: `${item.percentage}%`,
                            backgroundColor: DIFFICULTY_COLORS[item.difficulty]
                          }}
                        />
                      </div>
                      <span className="text-xs text-gray-500 w-12 text-right">{item.percentage}%</span>
                    </div>
                    {item.avgDuration > 0 && (
                      <div className="mt-1 text-xs text-gray-500">
                        Avg: {Math.round(item.avgDuration)} min
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
