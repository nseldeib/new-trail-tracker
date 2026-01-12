import { StatsOverview as StatsOverviewType } from '@/lib/types/analytics'
import { MetricCard } from './metric-card'
import { Activity, Clock, TrendingUp, Mountain, Flame, Heart } from 'lucide-react'
import { EmptyState } from './empty-state'

interface StatsOverviewProps {
  stats: StatsOverviewType | null
  loading: boolean
}

export function StatsOverview({ stats, loading }: StatsOverviewProps) {
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
      />

      <MetricCard
        title="Total Duration"
        value={formatDuration(stats.totalDuration)}
        icon={Clock}
        subtitle={`Avg: ${formatDuration(stats.avgDuration)}`}
      />

      <MetricCard
        title="Total Distance"
        value={formatDistance(stats.totalDistance)}
        icon={TrendingUp}
        subtitle={`Avg: ${formatDistance(stats.avgDistance)}`}
      />

      <MetricCard
        title="Total Elevation"
        value={formatElevation(stats.totalElevation)}
        icon={Mountain}
        subtitle={`Avg: ${formatElevation(stats.avgElevation)}`}
      />

      <MetricCard
        title={stats.currentStreak > 3 ? "Current Streak 🔥" : "Current Streak"}
        value={`${stats.currentStreak} ${stats.currentStreak === 1 ? 'day' : 'days'}`}
        icon={Flame}
        subtitle={`Longest: ${stats.longestStreak} ${stats.longestStreak === 1 ? 'day' : 'days'}`}
      />

      <MetricCard
        title="Most Common"
        value={formatMostCommonActivity(stats.mostCommonActivity)}
        icon={Heart}
        subtitle={`${stats.workoutsThisWeek} this week`}
      />
    </div>
  )
}
