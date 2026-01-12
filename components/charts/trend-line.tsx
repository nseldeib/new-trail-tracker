'use client'

import { TrendData } from '@/lib/types/analytics'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { format, parseISO } from 'date-fns'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface TrendLineProps {
  trendData: TrendData
  height?: number
}

export function TrendLine({ trendData, height = 300 }: TrendLineProps) {
  if (!trendData || trendData.dataPoints.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-gray-500">
        <p>No trend data available</p>
      </div>
    )
  }

  // Combine actual data, trend line, and predictions
  const chartData = [
    ...trendData.dataPoints.map((point, index) => ({
      date: format(parseISO(point.date), 'MMM d'),
      actual: point.value,
      trend: trendData.trendLine[index]?.value || null,
      prediction: null
    })),
    ...trendData.prediction.map(point => ({
      date: format(parseISO(point.date), 'MMM d'),
      actual: null,
      trend: null,
      prediction: point.value
    }))
  ]

  const getTrendIcon = () => {
    if (trendData.direction === 'up') return <TrendingUp className="w-5 h-5 text-green-600" />
    if (trendData.direction === 'down') return <TrendingDown className="w-5 h-5 text-red-600" />
    return <Minus className="w-5 h-5 text-gray-400" />
  }

  const getTrendColor = () => {
    if (trendData.direction === 'up') return 'text-green-600'
    if (trendData.direction === 'down') return 'text-red-600'
    return 'text-gray-600'
  }

  const getTrendLabel = () => {
    if (trendData.direction === 'up') return 'Improving'
    if (trendData.direction === 'down') return 'Declining'
    return 'Stable'
  }

  return (
    <div className="space-y-4">
      {/* Trend summary */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {getTrendIcon()}
          <span className={`font-medium ${getTrendColor()}`}>
            {getTrendLabel()}
          </span>
        </div>
        <div className="text-sm text-gray-600">
          <span className="font-medium">R² = {trendData.r2}</span>
          <span className="text-xs text-gray-500 ml-2">
            (goodness of fit)
          </span>
        </div>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="date"
            stroke="#6b7280"
            fontSize={12}
            tickLine={false}
          />
          <YAxis
            stroke="#6b7280"
            fontSize={12}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '8px 12px'
            }}
          />
          <Legend />

          {/* Actual data */}
          <Line
            type="monotone"
            dataKey="actual"
            stroke="#16a34a"
            strokeWidth={2}
            dot={{ fill: '#16a34a', r: 4 }}
            activeDot={{ r: 6 }}
            name="Actual"
            connectNulls
          />

          {/* Trend line */}
          <Line
            type="monotone"
            dataKey="trend"
            stroke="#6366f1"
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={false}
            name="Trend"
            connectNulls
          />

          {/* Prediction */}
          <Line
            type="monotone"
            dataKey="prediction"
            stroke="#f97316"
            strokeWidth={2}
            strokeDasharray="3 3"
            dot={{ fill: '#f97316', r: 3 }}
            name="Prediction"
            connectNulls
          />
        </LineChart>
      </ResponsiveContainer>

      {/* Slope info */}
      <div className="text-xs text-gray-600 text-center">
        Slope: {trendData.slope > 0 ? '+' : ''}{trendData.slope} units per day
      </div>
    </div>
  )
}
