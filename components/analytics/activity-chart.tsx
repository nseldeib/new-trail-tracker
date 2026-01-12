'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { TimeSeriesDataPoint, TimeRange, ActivityTypeFilter } from '@/lib/types/analytics'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { useState } from 'react'
import { ChartSkeleton } from './chart-skeleton'
import { EmptyState } from './empty-state'

interface ActivityChartProps {
  data: TimeSeriesDataPoint[]
  loading: boolean
  timeRange: TimeRange
  activityType: ActivityTypeFilter
}

type ChartType = 'line' | 'bar'
type MetricType = 'count' | 'duration' | 'distance' | 'elevation'

export function ActivityChart({ data, loading, timeRange, activityType }: ActivityChartProps) {
  const [chartType, setChartType] = useState<ChartType>('line')
  const [metric, setMetric] = useState<MetricType>('count')

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
  const getMetricValue = (point: TimeSeriesDataPoint): number => {
    switch (metric) {
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

  const getMetricLabel = (): string => {
    switch (metric) {
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

  const getMetricTitle = (): string => {
    switch (metric) {
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

  // Format chart data
  const chartData = data.map(point => ({
    date: formatDate(point.date, timeRange),
    value: getMetricValue(point),
    fullDate: point.date
  }))

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
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="text-sm font-medium text-gray-900">{payload[0].payload.date}</p>
          <p className="text-sm text-gray-600 mt-1">
            {getMetricTitle()}: <span className="font-semibold text-green-600">{payload[0].value} {getMetricLabel()}</span>
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
            <CardTitle>Activity Over Time</CardTitle>
            <CardDescription>
              {activityType === 'all' ? 'All activities' : activityType.charAt(0).toUpperCase() + activityType.slice(1)}
              {' · '}
              {getMetricTitle()}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            {/* Metric selector */}
            <select
              value={metric}
              onChange={(e) => setMetric(e.target.value as MetricType)}
              className="text-sm border border-gray-300 rounded-md px-3 py-1.5 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="count">Count</option>
              <option value="duration">Duration</option>
              <option value="distance">Distance</option>
              <option value="elevation">Elevation</option>
            </select>

            {/* Chart type selector */}
            <select
              value={chartType}
              onChange={(e) => setChartType(e.target.value as ChartType)}
              className="text-sm border border-gray-300 rounded-md px-3 py-1.5 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="line">Line</option>
              <option value="bar">Bar</option>
            </select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          {chartType === 'line' ? (
            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="date"
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#16a34a"
                strokeWidth={2}
                dot={{ fill: '#16a34a', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          ) : (
            <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="date"
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" fill="#16a34a" radius={[4, 4, 0, 0]} />
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
