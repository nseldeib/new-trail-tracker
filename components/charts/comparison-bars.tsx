'use client'

import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface ComparisonData {
  label: string
  current: number
  previous: number
  unit: string
}

interface ComparisonBarsProps {
  data: ComparisonData[]
  title?: string
}

export function ComparisonBars({ data, title }: ComparisonBarsProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-gray-500">
        <p>No comparison data available</p>
      </div>
    )
  }

  const getPercentageChange = (current: number, previous: number): number => {
    if (previous === 0) return current > 0 ? 100 : 0
    return ((current - previous) / previous) * 100
  }

  const getTrendIcon = (change: number) => {
    if (change > 5) return <TrendingUp className="w-4 h-4 text-green-600" />
    if (change < -5) return <TrendingDown className="w-4 h-4 text-red-600" />
    return <Minus className="w-4 h-4 text-gray-400" />
  }

  const getTrendColor = (change: number): string => {
    if (change > 5) return 'text-green-600'
    if (change < -5) return 'text-red-600'
    return 'text-gray-600'
  }

  return (
    <div className="space-y-6">
      {title && <h3 className="text-lg font-semibold text-gray-900">{title}</h3>}

      {data.map((item, index) => {
        const percentChange = getPercentageChange(item.current, item.previous)
        const maxValue = Math.max(item.current, item.previous)

        return (
          <div key={index} className="space-y-2">
            {/* Label and change indicator */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">{item.label}</span>
              <div className="flex items-center gap-1">
                {getTrendIcon(percentChange)}
                <span className={`text-sm font-medium ${getTrendColor(percentChange)}`}>
                  {percentChange > 0 ? '+' : ''}
                  {percentChange.toFixed(1)}%
                </span>
              </div>
            </div>

            {/* Comparison bars */}
            <div className="space-y-2">
              {/* Current period */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 w-16">Current</span>
                <div className="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden">
                  <div
                    className="h-full bg-green-500 flex items-center justify-end pr-2 transition-all duration-500"
                    style={{
                      width: `${maxValue > 0 ? (item.current / maxValue) * 100 : 0}%`
                    }}
                  >
                    <span className="text-xs font-medium text-white">
                      {item.current.toFixed(1)} {item.unit}
                    </span>
                  </div>
                </div>
              </div>

              {/* Previous period */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 w-16">Previous</span>
                <div className="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden">
                  <div
                    className="h-full bg-gray-400 flex items-center justify-end pr-2 transition-all duration-500"
                    style={{
                      width: `${maxValue > 0 ? (item.previous / maxValue) * 100 : 0}%`
                    }}
                  >
                    <span className="text-xs font-medium text-white">
                      {item.previous.toFixed(1)} {item.unit}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
