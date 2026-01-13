'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth-provider'
import { DashboardLayout } from '@/components/dashboard-layout'
import { TimeRange, ActivityTypeFilter, AnalyticsData, Achievement, TrainingInsight } from '@/lib/types/analytics'
import { StatsCalculator } from '@/lib/services/stats-calculator'
import { createClient } from '@/lib/supabase/client'
import { StatsOverview } from '@/components/analytics/stats-overview'
import { ActivityChart } from '@/components/analytics/activity-chart'
import { ActivityBreakdown } from '@/components/analytics/activity-breakdown'
import { PersonalRecords } from '@/components/analytics/personal-records'
import { AchievementsPanel } from '@/components/analytics/achievements-panel'
import { TrainingInsightsPanel } from '@/components/analytics/training-insights-panel'
import { TimeRangeSelector } from '@/components/analytics/time-range-selector'
import { ActivityTypeFilter as ActivityFilter } from '@/components/analytics/activity-type-filter'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function AnalyticsPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()

  const [timeRange, setTimeRange] = useState<TimeRange>('month')
  const [activityType, setActivityType] = useState<ActivityTypeFilter>('all')
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [insights, setInsights] = useState<TrainingInsight[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (authLoading) return

    if (!user) {
      router.push('/auth/signin')
      return
    }

    fetchAnalytics()
  }, [user, authLoading, router, timeRange, activityType])

  const fetchAnalytics = async () => {
    if (!user) return

    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      const calculator = new StatsCalculator(supabase)

      // Fetch main analytics data
      const data = await calculator.calculateStats({
        userId: user.id,
        timeRange,
        activityType
      })

      setAnalyticsData(data)

      // Fetch all workouts for achievements and insights (unfiltered)
      const { data: allWorkouts } = await supabase
        .from('workouts')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })

      if (allWorkouts && allWorkouts.length > 0) {
        // Calculate achievements
        const achievementsData = calculator.checkAchievements(allWorkouts)
        setAchievements(achievementsData)

        // Generate insights
        const insightsData = calculator.generateTrainingInsights(allWorkouts)
        setInsights(insightsData)
      }
    } catch (err) {
      console.error('Error fetching analytics:', err)
      setError('Failed to load analytics data. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = () => {
    fetchAnalytics()
  }

  if (authLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        {/* Vibrant Header */}
        <div className="relative bg-gradient-to-br from-blue-500 via-cyan-500 to-teal-500 rounded-xl p-6 mb-4 overflow-hidden">
          {/* Decorative overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />

          <div className="relative z-10">
            <h1 className="text-2xl font-bold text-white mb-1 drop-shadow-lg">Analytics</h1>
            <p className="text-white/90 text-sm">Track your progress and view detailed statistics</p>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4 p-4 bg-white rounded-lg shadow-sm border-0">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 flex-1">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Time Range</label>
              <TimeRangeSelector selected={timeRange} onChange={setTimeRange} />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Activity Type</label>
              <ActivityFilter selected={activityType} onChange={setActivityType} />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={handleRefresh}
              disabled={loading}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <Alert variant="destructive" className="mb-8">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Stats Overview */}
        <StatsOverview
          stats={analyticsData?.overview || null}
          loading={loading}
        />

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          <ActivityChart
            data={analyticsData?.timeSeries || []}
            loading={loading}
            timeRange={timeRange}
            activityType={activityType}
          />

          <ActivityBreakdown
            activityData={analyticsData?.activityDistribution || []}
            difficultyData={analyticsData?.difficultyDistribution || []}
            loading={loading}
          />
        </div>

        {/* Personal Records */}
        <PersonalRecords
          records={analyticsData?.personalRecords || {}}
          loading={loading}
        />

        {/* Achievements */}
        <div className="mt-8">
          <AchievementsPanel
            achievements={achievements}
            loading={loading}
          />
        </div>

        {/* Training Insights */}
        <div className="mt-8">
          <TrainingInsightsPanel
            insights={insights}
            loading={loading}
          />
        </div>

        {/* Last Updated */}
        {analyticsData && !loading && (
          <div className="mt-8 text-center">
            <p className="text-xs text-gray-500">
              Last updated: {new Date(analyticsData.lastUpdated).toLocaleString()}
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
