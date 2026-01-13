'use client'

import { cn } from '@/lib/utils'

interface ProgressRingProps {
  progress: number // 0-100
  size?: number
  strokeWidth?: number
  color?: string
  backgroundColor?: string
  showPercentage?: boolean
  label?: string
  gradient?: boolean
  glow?: boolean
  autoColor?: boolean // Auto color based on percentage
}

export function ProgressRing({
  progress,
  size = 120,
  strokeWidth = 10,
  color,
  backgroundColor = '#e5e7eb',
  showPercentage = true,
  label,
  gradient = false,
  glow = false,
  autoColor = false,
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (Math.min(100, Math.max(0, progress)) / 100) * circumference
  const gradientId = `progress-gradient-${Math.random().toString(36).substr(2, 9)}`

  // Auto determine color based on progress
  let finalColor = color || '#16a34a'
  if (autoColor) {
    if (progress < 33) {
      finalColor = '#ef4444' // red
    } else if (progress < 66) {
      finalColor = '#f59e0b' // amber
    } else {
      finalColor = '#10b981' // green
    }
  }

  const gradientColors = gradient
    ? [finalColor, finalColor]
    : [finalColor, finalColor]

  return (
    <div className={cn("relative inline-flex items-center justify-center", glow && "filter drop-shadow-lg")}>
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        <defs>
          {gradient && (
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: gradientColors[0], stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: gradientColors[1], stopOpacity: 0.7 }} />
            </linearGradient>
          )}
        </defs>

        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={backgroundColor}
          strokeWidth={strokeWidth}
          className="dark:stroke-gray-700"
        />

        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={gradient ? `url(#${gradientId})` : finalColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-500 ease-out"
          style={{
            filter: glow ? `drop-shadow(0 0 8px ${finalColor}40)` : undefined,
          }}
        />
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {showPercentage && (
          <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {Math.round(progress)}%
          </span>
        )}
        {label && (
          <span className="text-xs text-gray-600 dark:text-gray-400 mt-1 text-center px-2">
            {label}
          </span>
        )}
      </div>
    </div>
  )
}
