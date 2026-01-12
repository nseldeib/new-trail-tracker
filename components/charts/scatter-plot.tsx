'use client'

import { CorrelationData } from '@/lib/types/analytics'
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface ScatterPlotProps {
  correlationData: CorrelationData
  height?: number
}

export function ScatterPlot({ correlationData, height = 300 }: ScatterPlotProps) {
  if (!correlationData || correlationData.scatterData.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-gray-500">
        <p>No correlation data available</p>
      </div>
    )
  }

  const getCorrelationIcon = () => {
    if (correlationData.direction === 'positive') {
      return <TrendingUp className="w-5 h-5 text-green-600" />
    }
    if (correlationData.direction === 'negative') {
      return <TrendingDown className="w-5 h-5 text-red-600" />
    }
    return <Minus className="w-5 h-5 text-gray-400" />
  }

  const getCorrelationColor = () => {
    if (correlationData.direction === 'positive') return 'text-green-600'
    if (correlationData.direction === 'negative') return 'text-red-600'
    return 'text-gray-600'
  }

  const getStrengthColor = () => {
    if (correlationData.strength === 'strong') return 'bg-purple-100 text-purple-700'
    if (correlationData.strength === 'moderate') return 'bg-blue-100 text-blue-700'
    if (correlationData.strength === 'weak') return 'bg-yellow-100 text-yellow-700'
    return 'bg-gray-100 text-gray-700'
  }

  // Color points based on correlation direction
  const pointColor = correlationData.direction === 'positive'
    ? '#16a34a'
    : correlationData.direction === 'negative'
    ? '#dc2626'
    : '#6b7280'

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="text-xs text-gray-500 mb-1">{payload[0].payload.date}</p>
          <p className="text-sm font-medium">
            {correlationData.metric1}: <span className="text-green-600">{payload[0].value}</span>
          </p>
          <p className="text-sm font-medium">
            {correlationData.metric2}: <span className="text-blue-600">{payload[1]?.value}</span>
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="space-y-4">
      {/* Correlation summary */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          {getCorrelationIcon()}
          <span className={`font-medium ${getCorrelationColor()}`}>
            {correlationData.direction === 'positive' && 'Positive '}
            {correlationData.direction === 'negative' && 'Negative '}
            {correlationData.direction === 'none' && 'No '}
            Correlation
          </span>
          <span className={`text-xs px-2 py-1 rounded-full ${getStrengthColor()}`}>
            {correlationData.strength}
          </span>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-sm text-blue-900">
            <span className="font-medium">Correlation coefficient:</span>{' '}
            {correlationData.correlation > 0 ? '+' : ''}
            {correlationData.correlation.toFixed(2)}
          </p>
          <p className="text-xs text-blue-700 mt-1">
            {correlationData.insight}
          </p>
        </div>
      </div>

      {/* Scatter plot */}
      <ResponsiveContainer width="100%" height={height}>
        <ScatterChart
          margin={{ top: 10, right: 10, bottom: 10, left: 10 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            type="number"
            dataKey="x"
            name={correlationData.metric1}
            stroke="#6b7280"
            fontSize={12}
            tickLine={false}
            label={{ value: correlationData.metric1, position: 'insideBottom', offset: -5, fontSize: 11 }}
          />
          <YAxis
            type="number"
            dataKey="y"
            name={correlationData.metric2}
            stroke="#6b7280"
            fontSize={12}
            tickLine={false}
            label={{ value: correlationData.metric2, angle: -90, position: 'insideLeft', fontSize: 11 }}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />
          <Scatter
            name="Data Points"
            data={correlationData.scatterData}
            fill={pointColor}
          >
            {correlationData.scatterData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={pointColor} fillOpacity={0.6} />
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="text-xs text-gray-600 text-center">
        {correlationData.scatterData.length} data points analyzed
      </div>
    </div>
  )
}
