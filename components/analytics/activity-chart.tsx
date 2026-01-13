'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { TimeSeriesDataPoint, TimeRange, ActivityTypeFilter } from '@/lib/types/analytics'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'
import { useState } from 'react'
import { ChartSkeleton } from './chart-skeleton'
import { EmptyState } from './empty-state'
import { BarChart3, LineChart as LineChartIcon, AreaChart as AreaChartIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface ActivityChartProps {
  data: TimeSeriesDataPoint[]
  loading: boolean
  timeRange: TimeRange
  activityType: ActivityTypeFilter
}

type ChartType = 'line' | 'bar' | 'area'
type MetricType = 'count' | 'duration' | 'distance' | 'elevation'

export function ActivityChart({ data, loading, timeRange, activityType }: ActivityChartProps) {
  const [chartType, setChartType] = useState<ChartType>('area')
  const [primaryMetric, setPrimaryMetric] = useState<MetricType>('count')
  const [secondaryMetric, setSecondaryMetric] = useState<MetricType | null>(null)
  const [multiMetricMode, setMultiMetricMode] = useState(false)

  if (loading) {
    return <ChartSkeleton />
  }

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Activity Over Time</CardTitle>
          <CardDescription>Track your workout frequency and metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <EmptyState
            title="No activity data"
            message="Your activity chart will appear here once you log workouts"
          />
        </CardContent>
      </Card>
    )
  }

  // Get metric value and formatting
  const getMetricValue = (point: TimeSeriesDataPoint, metricType: MetricType): number => {
    switch (metricType) {
      case 'count':
        return point.workoutCount
      case 'duration':
        return Math.round(point.totalDuration / 60 * 10) / 10 // Convert to hours
      case 'distance':
        return Math.round(point.totalDistance * 10) / 10
      case 'elevation':
        return Math.round(point.totalElevation)
      default:
        return 0
    }
  }

  const getMetricLabel = (metricType: MetricType): string => {
    switch (metricType) {
      case 'count':
        return 'Workouts'
      case 'duration':
        return 'Hours'
      case 'distance':
        return 'Miles'
      case 'elevation':
        return 'Feet'
      default:
        return ''
    }
  }

  const getMetricTitle = (metricType: MetricType): string => {
    switch (metricType) {
      case 'count':
        return 'Workout Count'
      case 'duration':
        return 'Total Duration'
      case 'distance':
        return 'Total Distance'
      case 'elevation':
        return 'Total Elevation'
      default:
        return ''
    }
  }

  const getMetricColor = (metricType: MetricType): string => {
    switch (metricType) {
      case 'count':
        return '#14b8a6' // teal
      case 'duration':
        return '#a855f7' // purple
      case 'distance':
        return '#f97316' // coral
      case 'elevation':
        return '#10b981' // green
      default:
        return '#6b7280'
    }
  }

  // Format chart data
  const chartData = data.map(point => {
    const dataPoint: any = {
      date: formatDate(point.date, timeRange),
      primaryValue: getMetricValue(point, primaryMetric),
      fullDate: point.date
    }

    if (multiMetricMode && secondaryMetric) {
      dataPoint.secondaryValue = getMetricValue(point, secondaryMetric)
    }

    return dataPoint
  })

  // Format date based on time range
  function formatDate(dateStr: string, range: TimeRange): string {
    const date = new Date(dateStr)
    switch (range) {
      case 'week':
        return date.toLocaleDateString('en-US', { weekday: 'short' })
      case 'month':
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      case 'year':
        return date.toLocaleDateString('en-US', { month: 'short' })
      case 'all':
        return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
      default:
        return dateStr
    }
  }

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl backdrop-blur-sm">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
            {payload[0].payload.date}
          </p>

          {payload.map((entry: any, index: number) => {
            const metric = entry.dataKey === 'primaryValue' ? primaryMetric : secondaryMetric
            if (!metric) return null

            return (
              <p key={index} className="text-sm text-gray-600 dark:text-gray-400">
                {getMetricTitle(metric)}:{' '}
                <span
                  className="font-semibold"
                  style={{ color: getMetricColor(metric) }}
                >
                  {entry.value} {getMetricLabel(metric)}
                </span>
              </p>
            )
          })}
        </div>
      )
    }
    return null
  }

  return (
    <Card className="hover:shadow-lg transition-all duration-200">
      <CardHeader>
        <div className="flex items-start justify-between mb-4">
          <div>
            <CardTitle>Activity Over Time</CardTitle>
            <CardDescription>
              {activityType === 'all' ? 'All activities' : activityType.charAt(0).toUpperCase() + activityType.slice(1)}
              {' · '}
              {getMetricTitle(primaryMetric)}
              {multiMetricMode && secondaryMetric && ` + ${getMetricTitle(secondaryMetric)}`}
            </CardDescription>
          </div>

          {/* Chart type toggle */}
          <div className="flex items-center gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                'h-8 w-8 p-0',
                chartType === 'line' && 'bg-white dark:bg-gray-700 shadow-sm'
              )}
              onClick={() => setChartType('line')}
            >
              <LineChartIcon className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                'h-8 w-8 p-0',
                chartType === 'area' && 'bg-white dark:bg-gray-700 shadow-sm'
              )}
              onClick={() => setChartType('area')}
            >
              <AreaChartIcon className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                'h-8 w-8 p-0',
                chartType === 'bar' && 'bg-white dark:bg-gray-700 shadow-sm'
              )}
              onClick={() => setChartType('bar')}
            >
              <BarChart3 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Metric selectors */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-600 dark:text-gray-400">Primary:</span>
            <select
              value={primaryMetric}
              onChange={(e) => setPrimaryMetric(e.target.value as MetricType)}
              className="text-xs border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="count">Count</option>
              <option value="duration">Duration</option>
              <option value="distance">Distance</option>
              <option value="elevation">Elevation</option>
            </select>
          </div>

          {multiMetricMode && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-600 dark:text-gray-400">Secondary:</span>
              <select
                value={secondaryMetric || ''}
                onChange={(e) => setSecondaryMetric(e.target.value as MetricType)}
                className="text-xs border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">None</option>
                <option value="count" disabled={primaryMetric === 'count'}>Count</option>
                <option value="duration" disabled={primaryMetric === 'duration'}>Duration</option>
                <option value="distance" disabled={primaryMetric === 'distance'}>Distance</option>
                <option value="elevation" disabled={primaryMetric === 'elevation'}>Elevation</option>
              </select>
            </div>
          )}

          <Button
            variant="outline"
            size="sm"
            className="text-xs h-7"
            onClick={() => {
              setMultiMetricMode(!multiMetricMode)
              if (multiMetricMode) setSecondaryMetric(null)
              else setSecondaryMetric('duration')
            }}
          >
            {multiMetricMode ? 'Single Metric' : 'Multi-Metric'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          {chartType === 'line' ? (
            <LineChart
              data={chartData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <defs>
                <linearGradient id="primaryGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={getMetricColor(primaryMetric)} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={getMetricColor(primaryMetric)} stopOpacity={0} />
                </linearGradient>
                {multiMetricMode && secondaryMetric && (
                  <linearGradient id="secondaryGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={getMetricColor(secondaryMetric)} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={getMetricColor(secondaryMetric)} stopOpacity={0} />
                  </linearGradient>
                )}
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="date"
                stroke="#6b7280"
                fontSize={12}
                tickLine={false}
                axisLine={{ stroke: '#e5e7eb' }}
              />
              <YAxis
                stroke="#6b7280"
                fontSize={12}
                tickLine={false}
                axisLine={{ stroke: '#e5e7eb' }}
              />
              <Tooltip content={<CustomTooltip />} />
              {multiMetricMode && <Legend />}
              <Line
                type="monotone"
                dataKey="primaryValue"
                name={getMetricTitle(primaryMetric)}
                stroke={getMetricColor(primaryMetric)}
                strokeWidth={2}
                dot={{ fill: getMetricColor(primaryMetric), r: 3 }}
                activeDot={{ r: 5 }}
                animationDuration={500}
              />
              {multiMetricMode && secondaryMetric && (
                <Line
                  type="monotone"
                  dataKey="secondaryValue"
                  name={getMetricTitle(secondaryMetric)}
                  stroke={getMetricColor(secondaryMetric)}
                  strokeWidth={2}
                  dot={{ fill: getMetricColor(secondaryMetric), r: 3 }}
                  activeDot={{ r: 5 }}
                  animationDuration={500}
                />
              )}
            </LineChart>
          ) : chartType === 'area' ? (
            <AreaChart
              data={chartData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <defs>
                <linearGradient id="primaryGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={getMetricColor(primaryMetric)} stopOpacity={0.6} />
                  <stop offset="95%" stopColor={getMetricColor(primaryMetric)} stopOpacity={0.1} />
                </linearGradient>
                {multiMetricMode && secondaryMetric && (
                  <linearGradient id="secondaryGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={getMetricColor(secondaryMetric)} stopOpacity={0.6} />
                    <stop offset="95%" stopColor={getMetricColor(secondaryMetric)} stopOpacity={0.1} />
                  </linearGradient>
                )}
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="date"
                stroke="#6b7280"
                fontSize={12}
                tickLine={false}
                axisLine={{ stroke: '#e5e7eb' }}
              />
              <YAxis
                stroke="#6b7280"
                fontSize={12}
                tickLine={false}
                axisLine={{ stroke: '#e5e7eb' }}
              />
              <Tooltip content={<CustomTooltip />} />
              {multiMetricMode && <Legend />}
              <Area
                type="monotone"
                dataKey="primaryValue"
                name={getMetricTitle(primaryMetric)}
                stroke={getMetricColor(primaryMetric)}
                strokeWidth={2}
                fill="url(#primaryGradient)"
                animationDuration={500}
              />
              {multiMetricMode && secondaryMetric && (
                <Area
                  type="monotone"
                  dataKey="secondaryValue"
                  name={getMetricTitle(secondaryMetric)}
                  stroke={getMetricColor(secondaryMetric)}
                  strokeWidth={2}
                  fill="url(#secondaryGradient)"
                  animationDuration={500}
                />
              )}
            </AreaChart>
          ) : (
            <BarChart
              data={chartData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="date"
                stroke="#6b7280"
                fontSize={12}
                tickLine={false}
                axisLine={{ stroke: '#e5e7eb' }}
              />
              <YAxis
                stroke="#6b7280"
                fontSize={12}
                tickLine={false}
                axisLine={{ stroke: '#e5e7eb' }}
              />
              <Tooltip content={<CustomTooltip />} />
              {multiMetricMode && <Legend />}
              <Bar
                dataKey="primaryValue"
                name={getMetricTitle(primaryMetric)}
                fill={getMetricColor(primaryMetric)}
                radius={[4, 4, 0, 0]}
                animationDuration={500}
              />
              {multiMetricMode && secondaryMetric && (
                <Bar
                  dataKey="secondaryValue"
                  name={getMetricTitle(secondaryMetric)}
                  fill={getMetricColor(secondaryMetric)}
                  radius={[4, 4, 0, 0]}
                  animationDuration={500}
                />
              )}
            </BarChart>
          )}
        </ResponsiveContainer>

        {data.length === 1 && (
          <p className="text-xs text-gray-500 text-center mt-4">
            Only one data point available. Add more workouts to see trends over time.
          </p>
        )}
      </CardContent>
    </Card>
  )
}
