"use client"

import { LineChart, Line, ResponsiveContainer } from "recharts"
import { cn } from "@/lib/utils"

interface SparklineProps {
  data: number[]
  color?: string
  gradient?: boolean
  className?: string
  height?: number
}

export function Sparkline({
  data,
  color = "#14b8a6",
  gradient = false,
  className,
  height = 50,
}: SparklineProps) {
  // Transform data into format recharts expects
  const chartData = data.map((value, index) => ({ index, value }))

  return (
    <div className={cn("w-full", className)} style={{ height: `${height}px` }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <defs>
            {gradient && (
              <linearGradient id={`sparkline-gradient-${color}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.3} />
                <stop offset="100%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            )}
          </defs>
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            dot={false}
            fill={gradient ? `url(#sparkline-gradient-${color})` : "none"}
            isAnimationActive={true}
            animationDuration={800}
            animationEasing="ease-out"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
