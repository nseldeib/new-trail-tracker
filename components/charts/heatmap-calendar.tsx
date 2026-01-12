'use client'

import { HeatmapData } from '@/lib/types/analytics'
import { format, startOfWeek, eachWeekOfInterval, eachDayOfInterval, addWeeks } from 'date-fns'
import { Tooltip } from '@/components/ui/tooltip'
import { TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

interface HeatmapCalendarProps {
  data: HeatmapData[]
  onClick?: (date: string) => void
}

const INTENSITY_COLORS = {
  none: '#ebedf0',
  low: '#9be9a8',
  medium: '#40c463',
  high: '#30a14e',
  'very-high': '#216e39'
}

export function HeatmapCalendar({ data, onClick }: HeatmapCalendarProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-gray-500">
        <p>No data available</p>
      </div>
    )
  }

  // Group data by week
  const weeks: HeatmapData[][] = []
  let currentWeek: HeatmapData[] = []

  data.forEach((day, index) => {
    currentWeek.push(day)

    // Start new week every 7 days or at the end
    if (currentWeek.length === 7 || index === data.length - 1) {
      weeks.push([...currentWeek])
      currentWeek = []
    }
  })

  return (
    <div className="w-full overflow-x-auto">
      <TooltipProvider>
        <div className="inline-flex gap-1">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="flex flex-col gap-1">
              {week.map((day, dayIndex) => (
                <Tooltip key={day.date}>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => onClick?.(day.date)}
                      className="w-3 h-3 rounded-sm hover:ring-2 hover:ring-green-500 hover:ring-offset-1 transition-all"
                      style={{
                        backgroundColor: INTENSITY_COLORS[day.intensity]
                      }}
                      aria-label={`${day.count} workouts on ${day.date}`}
                    />
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="text-xs">
                      <p className="font-medium">{format(new Date(day.date), 'MMM d, yyyy')}</p>
                      <p className="text-gray-600">
                        {day.count} {day.count === 1 ? 'workout' : 'workouts'}
                      </p>
                      {day.workouts.length > 0 && (
                        <div className="mt-1 text-gray-500">
                          {day.workouts.map(w => w.activity_type).join(', ')}
                        </div>
                      )}
                    </div>
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-2 mt-4 text-xs text-gray-600">
          <span>Less</span>
          <div className="flex gap-1">
            {Object.entries(INTENSITY_COLORS).map(([level, color]) => (
              <div
                key={level}
                className="w-3 h-3 rounded-sm"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
          <span>More</span>
        </div>
      </TooltipProvider>
    </div>
  )
}
