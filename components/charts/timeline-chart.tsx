'use client'

import { Workout } from '@/lib/types/analytics'
import { format, parseISO } from 'date-fns'
import { Clock, MapPin, TrendingUp } from 'lucide-react'

interface TimelineChartProps {
  workouts: Workout[]
  maxItems?: number
}

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

export function TimelineChart({ workouts, maxItems = 10 }: TimelineChartProps) {
  if (!workouts || workouts.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-gray-500">
        <p>No workouts to display</p>
      </div>
    )
  }

  const displayWorkouts = workouts.slice(0, maxItems)

  return (
    <div className="relative">
      {/* Vertical line */}
      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />

      {/* Timeline items */}
      <div className="space-y-6">
        {displayWorkouts.map((workout, index) => (
          <div key={workout.id} className="relative flex items-start gap-4 pl-10">
            {/* Timeline dot */}
            <div
              className="absolute left-0 w-8 h-8 rounded-full flex items-center justify-center text-lg ring-4 ring-white"
              style={{
                backgroundColor: ACTIVITY_COLORS[workout.activity_type] || '#64748b'
              }}
            >
              {ACTIVITY_EMOJIS[workout.activity_type] || '🏋️'}
            </div>

            {/* Content */}
            <div className="flex-1 bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="font-medium text-gray-900">{workout.title}</h4>
                  <p className="text-xs text-gray-500 mt-1">
                    {format(parseISO(workout.date), 'MMM d, yyyy')}
                  </p>
                </div>
                {workout.difficulty && (
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      workout.difficulty === 'Easy'
                        ? 'bg-green-100 text-green-700'
                        : workout.difficulty === 'Moderate'
                        ? 'bg-yellow-100 text-yellow-700'
                        : workout.difficulty === 'Hard'
                        ? 'bg-orange-100 text-orange-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {workout.difficulty}
                  </span>
                )}
              </div>

              {/* Metrics */}
              <div className="flex flex-wrap gap-3 text-xs text-gray-600">
                {workout.duration_minutes && (
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{workout.duration_minutes} min</span>
                  </div>
                )}
                {workout.distance && (
                  <div className="flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    <span>{workout.distance} mi</span>
                  </div>
                )}
                {workout.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    <span>{workout.location}</span>
                  </div>
                )}
              </div>

              {workout.description && (
                <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                  {workout.description}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {workouts.length > maxItems && (
        <div className="mt-4 text-center text-sm text-gray-500">
          Showing {maxItems} of {workouts.length} workouts
        </div>
      )}
    </div>
  )
}
