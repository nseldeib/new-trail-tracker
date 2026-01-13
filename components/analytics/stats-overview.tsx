import { useEffect, useState } from 'react'
import { StatsOverview as StatsOverviewType } from '@/lib/types/analytics'
import { MetricCard } from './metric-card'
import { Activity, Clock, TrendingUp, Mountain, Flame, Heart } from 'lucide-react'
import { EmptyState } from './empty-state'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/components/auth-provider'
import { subDays, parseISO, format, startOfWeek, isAfter, isSameDay, eachDayOfInterval } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { getActivityGradient } from '@/lib/utils/colors'

interface StatsOverviewProps {
  stats: StatsOverviewType | null
  loading: boolean
}

interface ComparisonData {
  change: number
  isPositive: boolean
}

interface MetricTrendData {
  workouts: number[]
  duration: number[]
  distance: number[]
  elevation: number[]
}

export function StatsOverview({ stats, loading }: StatsOverviewProps) {
  const { user } = useAuth()
  const [comparisonData, setComparisonData] = useState<Record<string, ComparisonData>>({})
  const [trendData, setTrendData] = useState<MetricTrendData | null>(null)

  // Fetch historical data for comparisons and trends
  useEffect(() => {
    if (!user || loading) return

    async function fetchHistoricalData() {
      try {
        const supabase = createClient()
        const now = new Date()
        const fourteenDaysAgo = subDays(now, 14)

        const { data: workouts, error } = await supabase
          .from('workouts')
          .select('*')
          .eq('user_id', user.id)
          .gte('date', format(fourteenDaysAgo, 'yyyy-MM-dd'))
          .order('date', { ascending: true })

        if (error || !workouts) return

        // Calculate week boundaries
        const thisWeekStart = startOfWeek(now)
        const lastWeekStart = subDays(thisWeekStart, 7)
        const lastWeekEnd = subDays(thisWeekStart, 1)

        // Split workouts into this week and last week
        const thisWeek = workouts.filter(w => {
          const date = parseISO(w.date)
          return isAfter(date, thisWeekStart) || isSameDay(date, thisWeekStart)
        })

        const lastWeek = workouts.filter(w => {
          const date = parseISO(w.date)
          return (isAfter(date, lastWeekStart) || isSameDay(date, lastWeekStart)) &&
                 (date <= lastWeekEnd)
        })

        // Calculate comparisons
        const thisWeekCount = thisWeek.length
        const lastWeekCount = lastWeek.length
        const thisWeekDuration = thisWeek.reduce((sum, w) => sum + (w.duration_minutes || 0), 0)
        const lastWeekDuration = lastWeek.reduce((sum, w) => sum + (w.duration_minutes || 0), 0)
        const thisWeekDistance = thisWeek.reduce((sum, w) => sum + (w.distance || 0), 0)
        const lastWeekDistance = lastWeek.reduce((sum, w) => sum + (w.distance || 0), 0)
        const thisWeekElevation = thisWeek.reduce((sum, w) => sum + (w.elevation_gain || 0), 0)
        const lastWeekElevation = lastWeek.reduce((sum, w) => sum + (w.elevation_gain || 0), 0)

        const calculateChange = (current: number, previous: number) => {
          if (previous === 0) return current > 0 ? 100 : 0
          return Math.round(((current - previous) / previous) * 100)
        }

        setComparisonData({
          workouts: {
            change: calculateChange(thisWeekCount, lastWeekCount),
            isPositive: thisWeekCount >= lastWeekCount
          },
          duration: {
            change: calculateChange(thisWeekDuration, lastWeekDuration),
            isPositive: thisWeekDuration >= lastWeekDuration
          },
          distance: {
            change: calculateChange(thisWeekDistance, lastWeekDistance),
            isPositive: thisWeekDistance >= lastWeekDistance
          },
          elevation: {
            change: calculateChange(thisWeekElevation, lastWeekElevation),
            isPositive: thisWeekElevation >= lastWeekElevation
          }
        })

        // Calculate 7-day trend data
        const last7Days = eachDayOfInterval({
          start: subDays(now, 6),
          end: now
        })

        const workoutsByDate = new Map<string, typeof workouts>()
        workouts.forEach(w => {
          const dateKey = format(parseISO(w.date), 'yyyy-MM-dd')
          const existing = workoutsByDate.get(dateKey) || []
          workoutsByDate.set(dateKey, [...existing, w])
        })

        const trends: MetricTrendData = {
          workouts: [],
          duration: [],
          distance: [],
          elevation: []
        }

        last7Days.forEach(day => {
          const dateKey = format(day, 'yyyy-MM-dd')
          const dayWorkouts = workoutsByDate.get(dateKey) || []

          trends.workouts.push(dayWorkouts.length)
          trends.duration.push(dayWorkouts.reduce((sum, w) => sum + (w.duration_minutes || 0), 0))
          trends.distance.push(dayWorkouts.reduce((sum, w) => sum + (w.distance || 0), 0))
          trends.elevation.push(dayWorkouts.reduce((sum, w) => sum + (w.elevation_gain || 0), 0))
        })

        setTrendData(trends)
      } catch (error) {
        console.error('Error fetching historical data:', error)
      }
    }

    fetchHistoricalData()
  }, [user, loading, stats])

  // Helper to render comparison badge
  const renderComparisonBadge = (metric: string) => {
    const comparison = comparisonData[metric]
    if (!comparison) return null

    const { change, isPositive } = comparison
    if (change === 0) return null

    return (
      <Badge
        className={cn(
          'text-xs font-medium',
          isPositive
            ? 'bg-green-100 text-green-700 border-green-200'
            : 'bg-red-100 text-red-700 border-red-200'
        )}
      >
        {isPositive ? '↑' : '↓'} {Math.abs(change)}% vs last week
      </Badge>
    )
  }

  // Show loading state
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <MetricCard title="" value="" icon={Activity} loading />
        <MetricCard title="" value="" icon={Clock} loading />
        <MetricCard title="" value="" icon={TrendingUp} loading />
        <MetricCard title="" value="" icon={Mountain} loading />
        <MetricCard title="" value="" icon={Flame} loading />
        <MetricCard title="" value="" icon={Heart} loading />
      </div>
    )
  }

  // Show empty state
  if (!stats || stats.totalWorkouts === 0) {
    return (
      <div className="mb-8">
        <EmptyState
          title="No workouts yet"
          message="Start logging your workouts to see your statistics and progress"
        />
      </div>
    )
  }

  // Format duration (convert minutes to hours and minutes)
  const formatDuration = (minutes: number): string => {
    if (minutes === 0) return '0 min'
    const hours = Math.floor(minutes / 60)
    const mins = Math.round(minutes % 60)
    if (hours === 0) return `${mins} min`
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
  }

  // Format distance
  const formatDistance = (distance: number): string => {
    if (distance === 0) return '0 mi'
    return `${distance.toFixed(1)} mi`
  }

  // Format elevation
  const formatElevation = (elevation: number): string => {
    if (elevation === 0) return '0 ft'
    return `${Math.round(elevation).toLocaleString()} ft`
  }

  // Get activity emoji
  const getActivityEmoji = (activity: string): string => {
    const emojiMap: Record<string, string> = {
      running: '🏃',
      climbing: '🧗',
      hiking: '🥾',
      snowboarding: '🏂',
      cycling: '🚴',
      swimming: '🏊',
      yoga: '🧘',
      strength: '💪'
    }
    return emojiMap[activity.toLowerCase()] || '🏃'
  }

  // Format most common activity
  const formatMostCommonActivity = (activity: string): string => {
    if (activity === 'None') return 'None'
    const emoji = getActivityEmoji(activity)
    const capitalized = activity.charAt(0).toUpperCase() + activity.slice(1)
    return `${emoji} ${capitalized}`
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      <MetricCard
        title="Total Workouts"
        value={stats.totalWorkouts.toLocaleString()}
        icon={Activity}
        subtitle={`${stats.workoutsThisMonth} this month`}
        gradient="teal"
        sparklineData={trendData?.workouts}
        badge={renderComparisonBadge('workouts')}
      />

      <MetricCard
        title="Total Duration"
        value={formatDuration(stats.totalDuration)}
        icon={Clock}
        subtitle={`Avg: ${formatDuration(stats.avgDuration)}`}
        gradient="purple"
        sparklineData={trendData?.duration}
        badge={renderComparisonBadge('duration')}
      />

      <MetricCard
        title="Total Distance"
        value={formatDistance(stats.totalDistance)}
        icon={TrendingUp}
        subtitle={`Avg: ${formatDistance(stats.avgDistance)}`}
        gradient="coral"
        sparklineData={trendData?.distance}
        badge={renderComparisonBadge('distance')}
      />

      <MetricCard
        title="Total Elevation"
        value={formatElevation(stats.totalElevation)}
        icon={Mountain}
        subtitle={`Avg: ${formatElevation(stats.avgElevation)}`}
        gradient="green"
        sparklineData={trendData?.elevation}
        badge={renderComparisonBadge('elevation')}
      />

      <MetricCard
        title={stats.currentStreak > 3 ? "Current Streak 🔥" : "Current Streak"}
        value={`${stats.currentStreak} ${stats.currentStreak === 1 ? 'day' : 'days'}`}
        icon={Flame}
        subtitle={`Longest: ${stats.longestStreak} ${stats.longestStreak === 1 ? 'day' : 'days'}`}
        gradient="amber"
      />

      <MetricCard
        title="Most Common"
        value={formatMostCommonActivity(stats.mostCommonActivity)}
        icon={Heart}
        subtitle={`${stats.workoutsThisWeek} this week`}
        gradient={stats.mostCommonActivity !== 'None' ? 'activity' : undefined}
        activityType={stats.mostCommonActivity !== 'None' ? stats.mostCommonActivity.toLowerCase() : undefined}
      />
    </div>
  )
}
