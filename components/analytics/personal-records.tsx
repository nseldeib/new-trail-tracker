import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { PersonalRecords as PersonalRecordsType } from '@/lib/types/analytics'
import { Trophy, TrendingUp, Mountain, Calendar, Award } from 'lucide-react'
import Link from 'next/link'
import { EmptyState } from './empty-state'

interface PersonalRecordsProps {
  records: PersonalRecordsType
  loading: boolean
}

export function PersonalRecords({ records, loading }: PersonalRecordsProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Personal Records</CardTitle>
          <CardDescription>Your best achievements</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
            {[1, 2, 3].map(i => (
              <div key={i} className="p-4 border border-gray-200 rounded-lg">
                <div className="h-6 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  const hasAnyRecords = Object.keys(records).length > 0

  if (!hasAnyRecords) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Personal Records</CardTitle>
          <CardDescription>Your best achievements</CardDescription>
        </CardHeader>
        <CardContent>
          <EmptyState
            title="No records yet"
            message="Keep logging workouts to set your first personal records"
            icon={<Trophy className="h-16 w-16" />}
          />
        </CardContent>
      </Card>
    )
  }

  const formatDate = (dateStr: string): string => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Personal Records 🏆</CardTitle>
        <CardDescription>Your best achievements</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Longest Distance */}
          {records.longestDistance && (
            <div className="group p-4 border-2 border-green-200 bg-green-50/50 rounded-lg hover:border-green-300 transition-colors">
              <div className="flex items-start justify-between mb-2">
                <div className="p-2 bg-green-100 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </div>
                <Trophy className="h-4 w-4 text-yellow-500" />
              </div>
              <h3 className="text-sm font-medium text-gray-600 mb-1">Longest Distance</h3>
              <p className="text-2xl font-bold text-gray-900 mb-2">
                {records.longestDistance.value.toFixed(2)} mi
              </p>
              <Link
                href={`/dashboard/workouts/${records.longestDistance.workout.id}`}
                className="text-xs text-green-600 hover:text-green-700 hover:underline"
              >
                {records.longestDistance.workout.title}
              </Link>
              <p className="text-xs text-gray-500 mt-1">
                {formatDate(records.longestDistance.workout.date)}
              </p>
            </div>
          )}

          {/* Longest Duration */}
          {records.longestDuration && (
            <div className="group p-4 border-2 border-blue-200 bg-blue-50/50 rounded-lg hover:border-blue-300 transition-colors">
              <div className="flex items-start justify-between mb-2">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Calendar className="h-5 w-5 text-blue-600" />
                </div>
                <Trophy className="h-4 w-4 text-yellow-500" />
              </div>
              <h3 className="text-sm font-medium text-gray-600 mb-1">Longest Duration</h3>
              <p className="text-2xl font-bold text-gray-900 mb-2">
                {Math.floor(records.longestDuration.value / 60)}h {records.longestDuration.value % 60}m
              </p>
              <Link
                href={`/dashboard/workouts/${records.longestDuration.workout.id}`}
                className="text-xs text-blue-600 hover:text-blue-700 hover:underline"
              >
                {records.longestDuration.workout.title}
              </Link>
              <p className="text-xs text-gray-500 mt-1">
                {formatDate(records.longestDuration.workout.date)}
              </p>
            </div>
          )}

          {/* Highest Elevation */}
          {records.highestElevation && (
            <div className="group p-4 border-2 border-purple-200 bg-purple-50/50 rounded-lg hover:border-purple-300 transition-colors">
              <div className="flex items-start justify-between mb-2">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Mountain className="h-5 w-5 text-purple-600" />
                </div>
                <Trophy className="h-4 w-4 text-yellow-500" />
              </div>
              <h3 className="text-sm font-medium text-gray-600 mb-1">Highest Elevation</h3>
              <p className="text-2xl font-bold text-gray-900 mb-2">
                {Math.round(records.highestElevation.value).toLocaleString()} ft
              </p>
              <Link
                href={`/dashboard/workouts/${records.highestElevation.workout.id}`}
                className="text-xs text-purple-600 hover:text-purple-700 hover:underline"
              >
                {records.highestElevation.workout.title}
              </Link>
              <p className="text-xs text-gray-500 mt-1">
                {formatDate(records.highestElevation.workout.date)}
              </p>
            </div>
          )}

          {/* Most Workouts in a Week */}
          {records.mostWorkoutsInWeek && (
            <div className="group p-4 border-2 border-orange-200 bg-orange-50/50 rounded-lg hover:border-orange-300 transition-colors">
              <div className="flex items-start justify-between mb-2">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Award className="h-5 w-5 text-orange-600" />
                </div>
                <Trophy className="h-4 w-4 text-yellow-500" />
              </div>
              <h3 className="text-sm font-medium text-gray-600 mb-1">Most in a Week</h3>
              <p className="text-2xl font-bold text-gray-900 mb-2">
                {records.mostWorkoutsInWeek.value} workouts
              </p>
              <p className="text-xs text-gray-500">
                Week of {formatDate(records.mostWorkoutsInWeek.weekStart)}
              </p>
            </div>
          )}

          {/* Most Workouts in a Month */}
          {records.mostWorkoutsInMonth && (
            <div className="group p-4 border-2 border-pink-200 bg-pink-50/50 rounded-lg hover:border-pink-300 transition-colors">
              <div className="flex items-start justify-between mb-2">
                <div className="p-2 bg-pink-100 rounded-lg">
                  <Award className="h-5 w-5 text-pink-600" />
                </div>
                <Trophy className="h-4 w-4 text-yellow-500" />
              </div>
              <h3 className="text-sm font-medium text-gray-600 mb-1">Most in a Month</h3>
              <p className="text-2xl font-bold text-gray-900 mb-2">
                {records.mostWorkoutsInMonth.value} workouts
              </p>
              <p className="text-xs text-gray-500">
                {formatDate(records.mostWorkoutsInMonth.monthStart)}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
