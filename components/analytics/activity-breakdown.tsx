'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { ActivityDistribution, DifficultyDistribution } from '@/lib/types/analytics'
import { PieChart, Pie, Cell, ResponsiveContainer, Sector, Tooltip } from 'recharts'
import { useState } from 'react'
import { useSpring, animated } from 'react-spring'
import { ChartSkeleton } from './chart-skeleton'
import { EmptyState } from './empty-state'
import { getActivityColor } from '@/lib/utils/colors'
import { cn } from '@/lib/utils'

interface ActivityBreakdownProps {
  activityData: ActivityDistribution[]
  difficultyData: DifficultyDistribution[]
  loading: boolean
}

type ViewMode = 'activity' | 'difficulty'

// Color palette for difficulty
const DIFFICULTY_COLORS: Record<string, string> = {
  Easy: '#10b981',
  Moderate: '#f59e0b',
  Hard: '#f97316',
  Expert: '#ef4444'
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
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const [hiddenSegments, setHiddenSegments] = useState<Set<string>>(new Set())

  // Entrance animation
  const chartAnimation = useSpring({
    from: { opacity: 0, transform: 'scale(0.8)' },
    to: { opacity: 1, transform: 'scale(1)' },
    config: { tension: 200, friction: 20 }
  })

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

  // Filter out hidden segments
  const filteredPieData = pieData.filter(item => !hiddenSegments.has(item.name))

  // Get color for pie slice
  const getColor = (name: string): string => {
    if (view === 'activity') {
      return getActivityColor(name.toLowerCase())
    } else {
      return DIFFICULTY_COLORS[name] || '#64748b'
    }
  }

  // Toggle segment visibility
  const toggleSegment = (name: string) => {
    setHiddenSegments(prev => {
      const newSet = new Set(prev)
      if (newSet.has(name)) {
        newSet.delete(name)
      } else {
        newSet.add(name)
      }
      return newSet
    })
  }

  // Active shape render for hover effect
  const renderActiveShape = (props: any) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props

    return (
      <g>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius + 10}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
        />
      </g>
    )
  }

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl backdrop-blur-sm">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
            {view === 'activity' && ACTIVITY_EMOJIS[payload[0].name.toLowerCase()]} {payload[0].name}
          </p>
          <div className="space-y-1 text-xs">
            <p className="text-gray-600 dark:text-gray-400">
              Count: <span className="font-semibold" style={{ color: getColor(payload[0].name) }}>
                {payload[0].value} workouts
              </span>
            </p>
            <p className="text-gray-600 dark:text-gray-400">
              Percentage: <span className="font-semibold" style={{ color: getColor(payload[0].name) }}>
                {payload[0].payload.percentage}%
              </span>
            </p>
          </div>
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
          {/* Donut Chart */}
          <animated.div style={chartAnimation} className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <Pie
                  data={filteredPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                  fill="#8884d8"
                  dataKey="value"
                  activeIndex={activeIndex !== null ? activeIndex : undefined}
                  activeShape={renderActiveShape}
                  onMouseEnter={(_, index) => setActiveIndex(index)}
                  onMouseLeave={() => setActiveIndex(null)}
                  animationDuration={800}
                  animationBegin={0}
                >
                  {filteredPieData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={getColor(entry.name)}
                      className="transition-all duration-200 hover:opacity-90 cursor-pointer"
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>

            {/* Center label */}
            {filteredPieData.length > 0 && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center">
                  <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                    {filteredPieData.reduce((sum, item) => sum + item.value, 0)}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {view === 'activity' ? 'Workouts' : 'Total'}
                  </p>
                </div>
              </div>
            )}
          </animated.div>

          {/* Interactive Legend */}
          <div className="space-y-2">
            {view === 'activity' ? (
              activityData.map((item, index) => {
                const isHidden = hiddenSegments.has(item.activityType)
                return (
                  <div
                    key={index}
                    onClick={() => toggleSegment(item.activityType)}
                    className={cn(
                      "flex items-center gap-3 p-2 rounded-lg transition-all duration-200 cursor-pointer",
                      isHidden
                        ? "opacity-40 hover:opacity-60 bg-gray-50 dark:bg-gray-800"
                        : "hover:bg-gray-50 dark:hover:bg-gray-800 hover:shadow-sm"
                    )}
                  >
                    <div
                      className="w-4 h-4 rounded-full flex-shrink-0 transition-all"
                      style={{ backgroundColor: getActivityColor(item.activityType.toLowerCase()) }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {ACTIVITY_EMOJIS[item.activityType.toLowerCase()] || ''} {item.activityType.charAt(0).toUpperCase() + item.activityType.slice(1)}
                        </span>
                        <span className="text-sm text-gray-600 dark:text-gray-400">{item.count} workouts</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className="h-2 rounded-full transition-all duration-300"
                            style={{
                              width: isHidden ? '0%' : `${item.percentage}%`,
                              backgroundColor: getActivityColor(item.activityType.toLowerCase())
                            }}
                          />
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400 w-12 text-right">
                          {item.percentage}%
                        </span>
                      </div>
                      <div className="flex gap-3 mt-1 text-xs text-gray-500 dark:text-gray-400">
                        {item.totalDuration > 0 && (
                          <span>{Math.round(item.totalDuration / 60)}h {Math.round(item.totalDuration % 60)}m</span>
                        )}
                        {item.totalDistance > 0 && (
                          <span>{item.totalDistance.toFixed(1)} mi</span>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })
            ) : (
              difficultyData.map((item, index) => {
                const isHidden = hiddenSegments.has(item.difficulty)
                return (
                  <div
                    key={index}
                    onClick={() => toggleSegment(item.difficulty)}
                    className={cn(
                      "flex items-center gap-3 p-2 rounded-lg transition-all duration-200 cursor-pointer",
                      isHidden
                        ? "opacity-40 hover:opacity-60 bg-gray-50 dark:bg-gray-800"
                        : "hover:bg-gray-50 dark:hover:bg-gray-800 hover:shadow-sm"
                    )}
                  >
                    <div
                      className="w-4 h-4 rounded-full flex-shrink-0 transition-all"
                      style={{ backgroundColor: DIFFICULTY_COLORS[item.difficulty] }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{item.difficulty}</span>
                        <span className="text-sm text-gray-600 dark:text-gray-400">{item.count} workouts</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className="h-2 rounded-full transition-all duration-300"
                            style={{
                              width: isHidden ? '0%' : `${item.percentage}%`,
                              backgroundColor: DIFFICULTY_COLORS[item.difficulty]
                            }}
                          />
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400 w-12 text-right">
                          {item.percentage}%
                        </span>
                      </div>
                      {item.avgDuration > 0 && (
                        <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          Avg: {Math.round(item.avgDuration)} min
                        </div>
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
