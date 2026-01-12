import { SupabaseClient } from '@supabase/supabase-js'
import {
  startOfWeek,
  startOfMonth,
  startOfYear,
  subDays,
  subWeeks,
  subMonths,
  subYears,
  parseISO,
  format,
  differenceInDays,
  eachDayOfInterval,
  isSameDay,
  isAfter,
  isBefore
} from 'date-fns'
import {
  Workout,
  TimeRange,
  ActivityTypeFilter,
  StatsOverview,
  ActivityDistribution,
  DifficultyDistribution,
  TimeSeriesDataPoint,
  PersonalRecords,
  AnalyticsData,
  StatsRequest,
  HeatmapData,
  Achievement,
  TrainingInsight,
  GoalProgress,
  TrendData,
  CorrelationData,
  TrainingLoadData,
  RecoveryScore
} from '@/lib/types/analytics'
import regression from 'regression'

export class StatsCalculator {
  constructor(private supabase: SupabaseClient) {}

  /**
   * Main calculation method - orchestrates all statistics calculations
   */
  async calculateStats(request: StatsRequest): Promise<AnalyticsData> {
    try {
      // Fetch workouts from database
      const workouts = await this.fetchWorkouts(request)

      // Calculate all statistics
      const overview = this.calculateOverview(workouts)
      const activityDistribution = this.calculateActivityDistribution(workouts)
      const difficultyDistribution = this.calculateDifficultyDistribution(workouts)
      const timeSeries = this.calculateTimeSeries(workouts, request.timeRange)
      const personalRecords = this.findPersonalRecords(workouts)

      return {
        overview,
        activityDistribution,
        difficultyDistribution,
        timeSeries,
        personalRecords,
        lastUpdated: new Date().toISOString()
      }
    } catch (error) {
      console.error('Error calculating stats:', error)
      throw new Error('Failed to calculate statistics')
    }
  }

  /**
   * Fetch workouts from Supabase with filtering
   */
  private async fetchWorkouts(request: StatsRequest): Promise<Workout[]> {
    let query = this.supabase
      .from('workouts')
      .select('*')
      .eq('user_id', request.userId)
      .order('date', { ascending: false })

    // Apply time range filter
    const dateRange = this.getDateRange(request.timeRange)
    if (dateRange.start) {
      query = query.gte('date', dateRange.start)
    }
    if (dateRange.end) {
      query = query.lte('date', dateRange.end)
    }

    // Apply activity type filter
    if (request.activityType && request.activityType !== 'all') {
      query = query.eq('activity_type', request.activityType)
    }

    // Apply custom date range if provided
    if (request.startDate) {
      query = query.gte('date', request.startDate)
    }
    if (request.endDate) {
      query = query.lte('date', request.endDate)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching workouts:', error)
      throw new Error('Failed to fetch workouts')
    }

    // Filter out workouts with invalid dates or future dates
    const now = new Date()
    return (data || []).filter(workout => {
      try {
        const workoutDate = parseISO(workout.date)
        return !isAfter(workoutDate, now)
      } catch {
        return false
      }
    })
  }

  /**
   * Calculate overview statistics
   */
  calculateOverview(workouts: Workout[]): StatsOverview {
    if (!workouts || workouts.length === 0) {
      return {
        totalWorkouts: 0,
        totalDuration: 0,
        totalDistance: 0,
        totalElevation: 0,
        avgDuration: 0,
        avgDistance: 0,
        avgElevation: 0,
        mostCommonActivity: 'None',
        currentStreak: 0,
        longestStreak: 0,
        workoutsThisWeek: 0,
        workoutsThisMonth: 0,
        workoutsThisYear: 0
      }
    }

    const totalWorkouts = workouts.length
    const durations = workouts.map(w => w.duration_minutes || 0)
    const distances = workouts.map(w => w.distance || 0)
    const elevations = workouts.map(w => w.elevation_gain || 0)

    const totalDuration = this.safeSum(durations)
    const totalDistance = this.safeSum(distances)
    const totalElevation = this.safeSum(elevations)

    const avgDuration = this.safeAverage(durations.filter(d => d > 0))
    const avgDistance = this.safeAverage(distances.filter(d => d > 0))
    const avgElevation = this.safeAverage(elevations.filter(e => e > 0))

    const mostCommonActivity = this.findMostCommonActivity(workouts)
    const { current, longest } = this.calculateStreaks(workouts)

    // Calculate workouts in specific time periods
    const now = new Date()
    const weekStart = startOfWeek(now)
    const monthStart = startOfMonth(now)
    const yearStart = startOfYear(now)

    const workoutsThisWeek = workouts.filter(w => {
      const date = parseISO(w.date)
      return isAfter(date, weekStart) || isSameDay(date, weekStart)
    }).length

    const workoutsThisMonth = workouts.filter(w => {
      const date = parseISO(w.date)
      return isAfter(date, monthStart) || isSameDay(date, monthStart)
    }).length

    const workoutsThisYear = workouts.filter(w => {
      const date = parseISO(w.date)
      return isAfter(date, yearStart) || isSameDay(date, yearStart)
    }).length

    return {
      totalWorkouts,
      totalDuration,
      totalDistance,
      totalElevation,
      avgDuration,
      avgDistance,
      avgElevation,
      mostCommonActivity,
      currentStreak: current,
      longestStreak: longest,
      workoutsThisWeek,
      workoutsThisMonth,
      workoutsThisYear
    }
  }

  /**
   * Calculate activity distribution
   */
  calculateActivityDistribution(workouts: Workout[]): ActivityDistribution[] {
    if (!workouts || workouts.length === 0) {
      return []
    }

    const activityMap = new Map<string, {
      count: number
      totalDuration: number
      totalDistance: number
    }>()

    workouts.forEach(workout => {
      const activity = workout.activity_type
      const existing = activityMap.get(activity) || {
        count: 0,
        totalDuration: 0,
        totalDistance: 0
      }

      activityMap.set(activity, {
        count: existing.count + 1,
        totalDuration: existing.totalDuration + (workout.duration_minutes || 0),
        totalDistance: existing.totalDistance + (workout.distance || 0)
      })
    })

    const total = workouts.length

    return Array.from(activityMap.entries()).map(([activityType, data]) => ({
      activityType,
      count: data.count,
      percentage: this.safePercentage(data.count, total),
      totalDuration: data.totalDuration,
      totalDistance: data.totalDistance
    })).sort((a, b) => b.count - a.count)
  }

  /**
   * Calculate difficulty distribution
   */
  calculateDifficultyDistribution(workouts: Workout[]): DifficultyDistribution[] {
    if (!workouts || workouts.length === 0) {
      return []
    }

    const difficultyMap = new Map<string, {
      count: number
      totalDuration: number
    }>()

    // Filter workouts that have difficulty set
    const workoutsWithDifficulty = workouts.filter(w => w.difficulty)

    workoutsWithDifficulty.forEach(workout => {
      const difficulty = workout.difficulty!
      const existing = difficultyMap.get(difficulty) || {
        count: 0,
        totalDuration: 0
      }

      difficultyMap.set(difficulty, {
        count: existing.count + 1,
        totalDuration: existing.totalDuration + (workout.duration_minutes || 0)
      })
    })

    const total = workoutsWithDifficulty.length

    if (total === 0) {
      return []
    }

    return Array.from(difficultyMap.entries()).map(([difficulty, data]) => ({
      difficulty,
      count: data.count,
      percentage: this.safePercentage(data.count, total),
      avgDuration: this.safeAverage([data.totalDuration / data.count])
    })).sort((a, b) => {
      // Sort by difficulty level
      const order = { 'Easy': 1, 'Moderate': 2, 'Hard': 3, 'Expert': 4 }
      return (order[a.difficulty as keyof typeof order] || 0) - (order[b.difficulty as keyof typeof order] || 0)
    })
  }

  /**
   * Calculate time series data for charts
   */
  calculateTimeSeries(workouts: Workout[], timeRange: TimeRange): TimeSeriesDataPoint[] {
    if (!workouts || workouts.length === 0) {
      return []
    }

    const granularity = this.getGranularity(timeRange)
    const groupedData = this.groupWorkoutsByDate(workouts, granularity)

    return Array.from(groupedData.entries()).map(([date, workoutsOnDate]) => {
      const dataPoint: TimeSeriesDataPoint = {
        date,
        workoutCount: workoutsOnDate.length,
        totalDuration: this.safeSum(workoutsOnDate.map(w => w.duration_minutes || 0)),
        totalDistance: this.safeSum(workoutsOnDate.map(w => w.distance || 0)),
        totalElevation: this.safeSum(workoutsOnDate.map(w => w.elevation_gain || 0))
      }

      // Add per-activity breakdowns for stacked charts
      const activities: Workout['activity_type'][] = ['running', 'climbing', 'hiking', 'snowboarding', 'cycling', 'swimming', 'yoga', 'strength']
      activities.forEach(activity => {
        const activityWorkouts = workoutsOnDate.filter(w => w.activity_type === activity)
        dataPoint[activity] = activityWorkouts.length
      })

      return dataPoint
    }).sort((a, b) => a.date.localeCompare(b.date))
  }

  /**
   * Find personal records
   */
  findPersonalRecords(workouts: Workout[]): PersonalRecords {
    if (!workouts || workouts.length === 0) {
      return {}
    }

    const records: PersonalRecords = {}

    // Find longest distance
    const workoutsWithDistance = workouts.filter(w => w.distance && w.distance > 0)
    if (workoutsWithDistance.length > 0) {
      const longest = workoutsWithDistance.reduce((max, w) =>
        (w.distance || 0) > (max.distance || 0) ? w : max
      )
      records.longestDistance = {
        value: longest.distance!,
        workout: longest
      }
    }

    // Find longest duration
    const workoutsWithDuration = workouts.filter(w => w.duration_minutes && w.duration_minutes > 0)
    if (workoutsWithDuration.length > 0) {
      const longest = workoutsWithDuration.reduce((max, w) =>
        (w.duration_minutes || 0) > (max.duration_minutes || 0) ? w : max
      )
      records.longestDuration = {
        value: longest.duration_minutes!,
        workout: longest
      }
    }

    // Find highest elevation
    const workoutsWithElevation = workouts.filter(w => w.elevation_gain && w.elevation_gain > 0)
    if (workoutsWithElevation.length > 0) {
      const highest = workoutsWithElevation.reduce((max, w) =>
        (w.elevation_gain || 0) > (max.elevation_gain || 0) ? w : max
      )
      records.highestElevation = {
        value: highest.elevation_gain!,
        workout: highest
      }
    }

    // Find most workouts in a week
    const weeklyGroups = this.groupWorkoutsByDate(workouts, 'week')
    if (weeklyGroups.size > 0) {
      const mostWorkoutsWeek = Array.from(weeklyGroups.entries()).reduce((max, [date, workouts]) =>
        workouts.length > max.count ? { date, count: workouts.length } : max
      , { date: '', count: 0 })

      if (mostWorkoutsWeek.count > 0) {
        records.mostWorkoutsInWeek = {
          value: mostWorkoutsWeek.count,
          weekStart: mostWorkoutsWeek.date
        }
      }
    }

    // Find most workouts in a month
    const monthlyGroups = this.groupWorkoutsByDate(workouts, 'month')
    if (monthlyGroups.size > 0) {
      const mostWorkoutsMonth = Array.from(monthlyGroups.entries()).reduce((max, [date, workouts]) =>
        workouts.length > max.count ? { date, count: workouts.length } : max
      , { date: '', count: 0 })

      if (mostWorkoutsMonth.count > 0) {
        records.mostWorkoutsInMonth = {
          value: mostWorkoutsMonth.count,
          monthStart: mostWorkoutsMonth.date
        }
      }
    }

    return records
  }

  /**
   * Calculate current and longest workout streaks
   */
  calculateStreaks(workouts: Workout[]): { current: number; longest: number } {
    if (!workouts || workouts.length === 0) {
      return { current: 0, longest: 0 }
    }

    // Get unique workout dates, sorted from newest to oldest
    const uniqueDates = Array.from(new Set(
      workouts.map(w => format(parseISO(w.date), 'yyyy-MM-dd'))
    )).sort().reverse()

    if (uniqueDates.length === 0) {
      return { current: 0, longest: 0 }
    }

    // Calculate current streak
    let currentStreak = 0
    const today = format(new Date(), 'yyyy-MM-dd')
    const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd')

    // Check if there's a workout today or yesterday to start a streak
    if (uniqueDates[0] === today || uniqueDates[0] === yesterday) {
      currentStreak = 1
      let checkDate = parseISO(uniqueDates[0])

      for (let i = 1; i < uniqueDates.length; i++) {
        const prevDate = parseISO(uniqueDates[i])
        const daysDiff = differenceInDays(checkDate, prevDate)

        if (daysDiff === 1) {
          currentStreak++
          checkDate = prevDate
        } else {
          break
        }
      }
    }

    // Calculate longest streak
    let longestStreak = 0
    let tempStreak = 1
    let checkDate = parseISO(uniqueDates[0])

    for (let i = 1; i < uniqueDates.length; i++) {
      const prevDate = parseISO(uniqueDates[i])
      const daysDiff = differenceInDays(checkDate, prevDate)

      if (daysDiff === 1) {
        tempStreak++
        longestStreak = Math.max(longestStreak, tempStreak)
      } else {
        tempStreak = 1
      }

      checkDate = prevDate
    }

    longestStreak = Math.max(longestStreak, tempStreak)

    return { current: currentStreak, longest: longestStreak }
  }

  // ========== Helper Methods ==========

  /**
   * Get date range for time range filter
   */
  private getDateRange(timeRange: TimeRange): { start: string | null; end: string | null } {
    const now = new Date()
    let start: Date | null = null

    switch (timeRange) {
      case 'week':
        start = subWeeks(now, 1)
        break
      case 'month':
        start = subMonths(now, 1)
        break
      case 'year':
        start = subYears(now, 1)
        break
      case 'all':
        start = null
        break
    }

    return {
      start: start ? format(start, 'yyyy-MM-dd') : null,
      end: format(now, 'yyyy-MM-dd')
    }
  }

  /**
   * Get granularity for time series grouping
   */
  private getGranularity(timeRange: TimeRange): 'day' | 'week' | 'month' {
    switch (timeRange) {
      case 'week':
        return 'day'
      case 'month':
        return 'day'
      case 'year':
        return 'week'
      case 'all':
        return 'month'
    }
  }

  /**
   * Group workouts by date with specified granularity
   */
  private groupWorkoutsByDate(
    workouts: Workout[],
    granularity: 'day' | 'week' | 'month'
  ): Map<string, Workout[]> {
    const grouped = new Map<string, Workout[]>()

    workouts.forEach(workout => {
      try {
        const date = parseISO(workout.date)
        let key: string

        switch (granularity) {
          case 'day':
            key = format(date, 'yyyy-MM-dd')
            break
          case 'week':
            key = format(startOfWeek(date), 'yyyy-MM-dd')
            break
          case 'month':
            key = format(startOfMonth(date), 'yyyy-MM-dd')
            break
        }

        const existing = grouped.get(key) || []
        grouped.set(key, [...existing, workout])
      } catch (error) {
        console.error('Error parsing date:', workout.date, error)
      }
    })

    return grouped
  }

  /**
   * Find most common activity type
   */
  private findMostCommonActivity(workouts: Workout[]): string {
    if (!workouts || workouts.length === 0) {
      return 'None'
    }

    const counts = new Map<string, number>()

    workouts.forEach(workout => {
      const activity = workout.activity_type
      counts.set(activity, (counts.get(activity) || 0) + 1)
    })

    let maxCount = 0
    let mostCommon = 'None'

    counts.forEach((count, activity) => {
      if (count > maxCount) {
        maxCount = count
        mostCommon = activity
      }
    })

    return mostCommon
  }

  /**
   * Safe sum - handles null/undefined values
   */
  private safeSum(values: number[]): number {
    return values.reduce((sum, val) => sum + (val || 0), 0)
  }

  /**
   * Safe average - handles empty arrays and null values
   */
  private safeAverage(values: number[]): number {
    const validValues = values.filter(v => v !== null && v !== undefined && !isNaN(v))
    if (validValues.length === 0) {
      return 0
    }
    return this.safeSum(validValues) / validValues.length
  }

  /**
   * Safe percentage calculation - handles division by zero
   */
  private safePercentage(part: number, total: number): number {
    if (total === 0) {
      return 0
    }
    return Math.round((part / total) * 100 * 10) / 10 // Round to 1 decimal
  }

  // ========== NEW METHODS FOR DASHBOARD OVERHAUL ==========

  /**
   * Calculate heatmap data for GitHub-style contribution calendar (365 days)
   */
  calculateHeatmapData(workouts: Workout[]): HeatmapData[] {
    const now = new Date()
    const oneYearAgo = subYears(now, 1)

    // Create array of all days in the last 365 days
    const allDays = eachDayOfInterval({ start: oneYearAgo, end: now })

    // Group workouts by date
    const workoutsByDate = new Map<string, Workout[]>()
    workouts.forEach(workout => {
      const dateKey = format(parseISO(workout.date), 'yyyy-MM-dd')
      const existing = workoutsByDate.get(dateKey) || []
      workoutsByDate.set(dateKey, [...existing, workout])
    })

    // Create heatmap data for each day
    return allDays.map(day => {
      const dateKey = format(day, 'yyyy-MM-dd')
      const dayWorkouts = workoutsByDate.get(dateKey) || []
      const count = dayWorkouts.length

      // Determine intensity level based on workout count
      let intensity: HeatmapData['intensity'] = 'none'
      if (count === 1) intensity = 'low'
      else if (count === 2) intensity = 'medium'
      else if (count === 3) intensity = 'high'
      else if (count >= 4) intensity = 'very-high'

      return {
        date: dateKey,
        count,
        intensity,
        workouts: dayWorkouts
      }
    })
  }

  /**
   * Check which achievements the user has unlocked
   */
  checkAchievements(workouts: Workout[]): Achievement[] {
    const totalWorkouts = workouts.length
    const totalDistance = this.safeSum(workouts.map(w => w.distance || 0))
    const totalElevation = this.safeSum(workouts.map(w => w.elevation_gain || 0))
    const { current: currentStreak, longest: longestStreak } = this.calculateStreaks(workouts)
    const uniqueActivities = new Set(workouts.map(w => w.activity_type)).size

    const achievements: Achievement[] = [
      {
        id: 'first-steps',
        title: 'First Steps',
        description: 'Complete your first workout',
        category: 'frequency',
        icon: 'Footprints',
        locked: totalWorkouts < 1,
        progress: Math.min(100, totalWorkouts * 100),
        requirement: 1,
        currentValue: totalWorkouts,
        unit: 'workout',
        unlockedAt: totalWorkouts >= 1 ? workouts[workouts.length - 1]?.date : undefined
      },
      {
        id: 'week-warrior',
        title: 'Week Warrior',
        description: 'Maintain a 7-day workout streak',
        category: 'streak',
        icon: 'Flame',
        locked: longestStreak < 7,
        progress: Math.min(100, (longestStreak / 7) * 100),
        requirement: 7,
        currentValue: longestStreak,
        unit: 'days',
        unlockedAt: longestStreak >= 7 ? workouts[0]?.date : undefined
      },
      {
        id: 'century-club',
        title: 'Century Club',
        description: 'Complete 100 total workouts',
        category: 'frequency',
        icon: 'Trophy',
        locked: totalWorkouts < 100,
        progress: Math.min(100, totalWorkouts),
        requirement: 100,
        currentValue: totalWorkouts,
        unit: 'workouts',
        unlockedAt: totalWorkouts >= 100 ? workouts[99]?.date : undefined
      },
      {
        id: 'mountain-goat',
        title: 'Mountain Goat',
        description: 'Climb 10,000 feet of total elevation',
        category: 'elevation',
        icon: 'Mountain',
        locked: totalElevation < 10000,
        progress: Math.min(100, (totalElevation / 10000) * 100),
        requirement: 10000,
        currentValue: Math.round(totalElevation),
        unit: 'feet',
        unlockedAt: totalElevation >= 10000 ? workouts[0]?.date : undefined
      },
      {
        id: 'marathon-ready',
        title: 'Marathon Ready',
        description: 'Complete a workout of 26.2+ miles',
        category: 'distance',
        icon: 'Medal',
        locked: !workouts.some(w => (w.distance || 0) >= 26.2),
        progress: Math.min(100, Math.max(...workouts.map(w => w.distance || 0)) / 26.2 * 100),
        requirement: 26.2,
        currentValue: Math.max(...workouts.map(w => w.distance || 0)),
        unit: 'miles',
        unlockedAt: workouts.find(w => (w.distance || 0) >= 26.2)?.date
      },
      {
        id: 'iron-will',
        title: 'Iron Will',
        description: 'Maintain a 30-day workout streak',
        category: 'streak',
        icon: 'Zap',
        locked: longestStreak < 30,
        progress: Math.min(100, (longestStreak / 30) * 100),
        requirement: 30,
        currentValue: longestStreak,
        unit: 'days',
        unlockedAt: longestStreak >= 30 ? workouts[0]?.date : undefined
      },
      {
        id: 'diverse-athlete',
        title: 'Diverse Athlete',
        description: 'Try 5 different activity types',
        category: 'diversity',
        icon: 'Sparkles',
        locked: uniqueActivities < 5,
        progress: Math.min(100, (uniqueActivities / 5) * 100),
        requirement: 5,
        currentValue: uniqueActivities,
        unit: 'activities',
        unlockedAt: uniqueActivities >= 5 ? workouts[0]?.date : undefined
      }
    ]

    return achievements
  }

  /**
   * Generate smart training insights based on workout patterns
   */
  generateTrainingInsights(workouts: Workout[]): TrainingInsight[] {
    const insights: TrainingInsight[] = []

    if (workouts.length === 0) {
      return [{
        id: 'get-started',
        type: 'tip',
        title: 'Get Started',
        message: 'Log your first workout to start tracking your fitness journey!',
        icon: 'Play',
        priority: 'high',
        actionable: true,
        action: {
          label: 'Log Workout',
          href: '/dashboard/workouts/new'
        }
      }]
    }

    const { current: currentStreak } = this.calculateStreaks(workouts)
    const overview = this.calculateOverview(workouts)
    const lastWorkoutDate = parseISO(workouts[0].date)
    const daysSinceLastWorkout = differenceInDays(new Date(), lastWorkoutDate)

    // Streak insights
    if (currentStreak >= 7) {
      insights.push({
        id: 'great-streak',
        type: 'achievement',
        title: 'Amazing Streak!',
        message: `You're on a ${currentStreak}-day workout streak. Keep it up!`,
        icon: 'Flame',
        priority: 'high',
        actionable: false
      })
    }

    // Inactivity warning
    if (daysSinceLastWorkout >= 7) {
      insights.push({
        id: 'inactive-warning',
        type: 'warning',
        title: 'Time to Get Moving',
        message: `It's been ${daysSinceLastWorkout} days since your last workout. Let's get back on track!`,
        icon: 'AlertTriangle',
        priority: 'high',
        actionable: true,
        action: {
          label: 'Log Workout',
          href: '/dashboard/workouts/new'
        }
      })
    } else if (daysSinceLastWorkout >= 3) {
      insights.push({
        id: 'rest-reminder',
        type: 'tip',
        title: 'Rest Day Streak',
        message: `You've had ${daysSinceLastWorkout} rest days. Consider a light workout to maintain momentum.`,
        icon: 'Clock',
        priority: 'medium',
        actionable: false
      })
    }

    // Activity diversity suggestion
    const recentWorkouts = workouts.slice(0, 10)
    const recentActivities = new Set(recentWorkouts.map(w => w.activity_type))
    if (recentActivities.size === 1 && workouts.length >= 10) {
      const activity = Array.from(recentActivities)[0]
      insights.push({
        id: 'diversity-tip',
        type: 'suggestion',
        title: 'Mix It Up!',
        message: `Your last 10 workouts have all been ${activity}. Try cross-training to improve overall fitness.`,
        icon: 'Shuffle',
        priority: 'medium',
        actionable: false
      })
    }

    // Consistency praise
    if (overview.workoutsThisWeek >= 3) {
      insights.push({
        id: 'consistency-praise',
        type: 'achievement',
        title: 'Great Consistency',
        message: `${overview.workoutsThisWeek} workouts this week! You're building a strong routine.`,
        icon: 'TrendingUp',
        priority: 'medium',
        actionable: false
      })
    }

    return insights.slice(0, 5) // Return top 5 insights
  }

  /**
   * Calculate goal progress with pace analysis and predictions
   */
  async calculateGoalProgress(userId: string): Promise<GoalProgress[]> {
    // Fetch goals from database
    const { data: goals, error } = await this.supabase
      .from('goals')
      .select('*')
      .eq('user_id', userId)
      .eq('is_completed', false)
      .order('created_at', { ascending: false })

    if (error || !goals) {
      return []
    }

    // Fetch user's workouts
    const { data: workouts } = await this.supabase
      .from('workouts')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })

    if (!workouts) {
      return []
    }

    return goals.map(goal => {
      const currentValue = goal.current_value || 0
      const targetValue = goal.target_value || 100
      const progress = Math.min(100, (currentValue / targetValue) * 100)

      let daysRemaining: number | undefined
      let onTrack = true
      let predictedCompletion: string | undefined
      let projectedValue: number | undefined
      let requiredPace = 0
      let currentPace = 0

      if (goal.target_date) {
        const targetDate = parseISO(goal.target_date)
        const createdDate = parseISO(goal.created_at)
        const now = new Date()

        daysRemaining = differenceInDays(targetDate, now)
        const totalDays = differenceInDays(targetDate, createdDate)
        const daysPassed = differenceInDays(now, createdDate)

        if (daysRemaining > 0 && totalDays > 0) {
          // Calculate required pace
          const remainingValue = targetValue - currentValue
          const weeksRemaining = daysRemaining / 7
          requiredPace = weeksRemaining > 0 ? remainingValue / weeksRemaining : 0

          // Calculate current pace
          const weeksPassed = daysPassed / 7
          currentPace = weeksPassed > 0 ? currentValue / weeksPassed : 0

          // Project completion date based on current pace
          if (currentPace > 0) {
            const daysToComplete = ((targetValue - currentValue) / currentPace) * 7
            const completionDate = new Date(now.getTime() + daysToComplete * 24 * 60 * 60 * 1000)
            predictedCompletion = format(completionDate, 'yyyy-MM-dd')

            // Project value by target date
            projectedValue = currentValue + (currentPace * weeksRemaining)
          }

          // Determine if on track
          onTrack = currentPace >= requiredPace || progress >= ((daysPassed / totalDays) * 100)
        }
      }

      return {
        goalId: goal.id,
        title: goal.title,
        activityType: goal.activity_type,
        targetValue,
        currentValue,
        unit: goal.unit || 'units',
        targetDate: goal.target_date,
        progress,
        onTrack,
        daysRemaining,
        predictedCompletion,
        projectedValue,
        requiredPace: Math.round(requiredPace * 10) / 10,
        currentPace: Math.round(currentPace * 10) / 10
      }
    })
  }

  /**
   * Calculate performance trends using linear regression
   */
  calculatePerformanceTrends(
    workouts: Workout[],
    metric: 'workouts' | 'duration' | 'distance' | 'elevation'
  ): TrendData {
    if (workouts.length < 2) {
      return {
        metric,
        dataPoints: [],
        trendLine: [],
        slope: 0,
        direction: 'flat',
        prediction: [],
        r2: 0
      }
    }

    // Prepare data points (x = days since first workout, y = metric value)
    const sortedWorkouts = [...workouts].sort((a, b) => a.date.localeCompare(b.date))
    const firstDate = parseISO(sortedWorkouts[0].date)

    const dataPoints: Array<{ date: string; value: number }> = []
    const regressionData: Array<[number, number]> = []

    sortedWorkouts.forEach((workout, index) => {
      const workoutDate = parseISO(workout.date)
      const daysSinceStart = differenceInDays(workoutDate, firstDate)

      let value = 0
      switch (metric) {
        case 'workouts':
          value = 1 // Each workout counts as 1
          break
        case 'duration':
          value = workout.duration_minutes || 0
          break
        case 'distance':
          value = workout.distance || 0
          break
        case 'elevation':
          value = workout.elevation_gain || 0
          break
      }

      if (value > 0 || metric === 'workouts') {
        dataPoints.push({ date: workout.date, value })
        regressionData.push([daysSinceStart, value])
      }
    })

    // Calculate linear regression
    const result = regression.linear(regressionData)
    const slope = result.equation[0]
    const r2 = result.r2

    // Generate trend line points
    const trendLine = dataPoints.map((point, index) => {
      const daysSinceStart = differenceInDays(parseISO(point.date), firstDate)
      const trendValue = result.predict(daysSinceStart)[1]
      return {
        date: point.date,
        value: Math.max(0, trendValue)
      }
    })

    // Generate predictions for next 30 days
    const lastDate = parseISO(sortedWorkouts[sortedWorkouts.length - 1].date)
    const prediction: Array<{ date: string; value: number }> = []
    for (let i = 1; i <= 30; i += 7) {
      const futureDate = new Date(lastDate.getTime() + i * 24 * 60 * 60 * 1000)
      const daysSinceStart = differenceInDays(futureDate, firstDate)
      const predictedValue = result.predict(daysSinceStart)[1]
      prediction.push({
        date: format(futureDate, 'yyyy-MM-dd'),
        value: Math.max(0, predictedValue)
      })
    }

    // Determine direction
    let direction: TrendData['direction'] = 'flat'
    if (slope > 0.1) direction = 'up'
    else if (slope < -0.1) direction = 'down'

    return {
      metric,
      dataPoints,
      trendLine,
      slope: Math.round(slope * 100) / 100,
      direction,
      prediction,
      r2: Math.round(r2 * 100) / 100
    }
  }

  /**
   * Calculate correlation between workouts and wellbeing scores
   */
  async calculateCorrelations(userId: string): Promise<CorrelationData> {
    // Fetch workouts and wellbeing entries
    const { data: workouts } = await this.supabase
      .from('workouts')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })

    const { data: wellbeingEntries } = await this.supabase
      .from('wellbeing_entries')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (!workouts || !wellbeingEntries || workouts.length < 3 || wellbeingEntries.length < 3) {
      return {
        metric1: 'workouts',
        metric2: 'wellbeing',
        correlation: 0,
        strength: 'none',
        direction: 'none',
        scatterData: [],
        insight: 'Not enough data to calculate correlation. Log more workouts and wellbeing check-ins.'
      }
    }

    // Match workouts to wellbeing scores by date
    const scatterData: Array<{ x: number; y: number; date: string }> = []
    const wellbeingByDate = new Map(
      wellbeingEntries.map(entry => [
        format(parseISO(entry.created_at), 'yyyy-MM-dd'),
        entry.score
      ])
    )

    workouts.forEach(workout => {
      const dateKey = format(parseISO(workout.date), 'yyyy-MM-dd')
      const wellbeingScore = wellbeingByDate.get(dateKey)

      if (wellbeingScore !== undefined) {
        scatterData.push({
          x: workout.duration_minutes || 0,
          y: wellbeingScore,
          date: dateKey
        })
      }
    })

    if (scatterData.length < 3) {
      return {
        metric1: 'workout duration',
        metric2: 'wellbeing score',
        correlation: 0,
        strength: 'none',
        direction: 'none',
        scatterData,
        insight: 'Not enough matching dates between workouts and wellbeing check-ins.'
      }
    }

    // Calculate Pearson correlation coefficient
    const n = scatterData.length
    const sumX = scatterData.reduce((sum, d) => sum + d.x, 0)
    const sumY = scatterData.reduce((sum, d) => sum + d.y, 0)
    const sumXY = scatterData.reduce((sum, d) => sum + d.x * d.y, 0)
    const sumX2 = scatterData.reduce((sum, d) => sum + d.x * d.x, 0)
    const sumY2 = scatterData.reduce((sum, d) => sum + d.y * d.y, 0)

    const numerator = n * sumXY - sumX * sumY
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY))

    const correlation = denominator === 0 ? 0 : numerator / denominator

    // Determine strength and direction
    const absCorr = Math.abs(correlation)
    let strength: CorrelationData['strength'] = 'none'
    if (absCorr >= 0.7) strength = 'strong'
    else if (absCorr >= 0.4) strength = 'moderate'
    else if (absCorr >= 0.2) strength = 'weak'

    let direction: CorrelationData['direction'] = 'none'
    if (correlation > 0.2) direction = 'positive'
    else if (correlation < -0.2) direction = 'negative'

    // Generate insight
    let insight = ''
    if (strength === 'none') {
      insight = 'No significant correlation found between workout duration and wellbeing.'
    } else if (direction === 'positive') {
      insight = `${strength.charAt(0).toUpperCase() + strength.slice(1)} positive correlation: Longer workouts tend to improve your wellbeing score.`
    } else if (direction === 'negative') {
      insight = `${strength.charAt(0).toUpperCase() + strength.slice(1)} negative correlation: Longer workouts may be associated with lower wellbeing scores. Consider adjusting intensity.`
    }

    return {
      metric1: 'workout duration (min)',
      metric2: 'wellbeing score',
      correlation: Math.round(correlation * 100) / 100,
      strength,
      direction,
      scatterData,
      insight
    }
  }

  /**
   * Calculate training load/intensity by day
   */
  calculateTrainingLoad(workouts: Workout[], days: number = 30): TrainingLoadData[] {
    const now = new Date()
    const startDate = subDays(now, days)
    const allDays = eachDayOfInterval({ start: startDate, end: now })

    // Group workouts by date
    const workoutsByDate = new Map<string, Workout[]>()
    workouts.forEach(workout => {
      const dateKey = format(parseISO(workout.date), 'yyyy-MM-dd')
      const existing = workoutsByDate.get(dateKey) || []
      workoutsByDate.set(dateKey, [...existing, workout])
    })

    return allDays.map(day => {
      const dateKey = format(day, 'yyyy-MM-dd')
      const dayWorkouts = workoutsByDate.get(dateKey) || []
      const workoutCount = dayWorkouts.length
      const totalDuration = this.safeSum(dayWorkouts.map(w => w.duration_minutes || 0))

      // Calculate intensity score (0-100)
      let intensityScore = 0
      let difficulty: TrainingLoadData['difficulty'] = 'rest'

      if (workoutCount > 0) {
        // Base score on workout count and duration
        intensityScore = Math.min(100, (workoutCount * 15) + (totalDuration / 6))

        // Adjust based on difficulty
        const difficulties = dayWorkouts.map(w => w.difficulty).filter(Boolean)
        if (difficulties.length > 0) {
          const difficultyScores = { 'Easy': 0.7, 'Moderate': 1.0, 'Hard': 1.3, 'Expert': 1.6 }
          const avgDifficultyMultiplier = this.safeAverage(
            difficulties.map(d => difficultyScores[d as keyof typeof difficultyScores] || 1)
          )
          intensityScore *= avgDifficultyMultiplier
          intensityScore = Math.min(100, intensityScore)
        }

        // Determine difficulty category
        if (intensityScore < 25) difficulty = 'easy'
        else if (intensityScore < 50) difficulty = 'moderate'
        else if (intensityScore < 75) difficulty = 'hard'
        else difficulty = 'expert'
      }

      // Check if recovery is needed (high intensity without rest days)
      const recoveryNeeded = intensityScore > 70

      return {
        date: dateKey,
        workoutCount,
        totalDuration,
        intensityScore: Math.round(intensityScore),
        difficulty,
        recoveryNeeded,
        workouts: dayWorkouts
      }
    })
  }

  /**
   * Calculate recovery score and recommendations
   */
  calculateRecoveryScore(trainingLoad: TrainingLoadData[]): RecoveryScore {
    if (trainingLoad.length === 0) {
      return {
        date: format(new Date(), 'yyyy-MM-dd'),
        score: 100,
        status: 'recovered',
        recommendation: 'You\'re ready to work out!',
        daysOfRest: 0,
        recentLoad: 0,
        recommendedAction: 'normal'
      }
    }

    // Calculate recent load (last 7 days)
    const last7Days = trainingLoad.slice(-7)
    const recentLoad = this.safeAverage(last7Days.map(d => d.intensityScore))

    // Count consecutive rest days
    let daysOfRest = 0
    for (let i = trainingLoad.length - 1; i >= 0; i--) {
      if (trainingLoad[i].workoutCount === 0) {
        daysOfRest++
      } else {
        break
      }
    }

    // Calculate recovery score (0-100)
    // Higher score = more recovered
    let score = 100

    // Reduce score based on recent training load
    score -= recentLoad * 0.5

    // Increase score for rest days
    score += daysOfRest * 10

    // Cap at 0-100
    score = Math.max(0, Math.min(100, score))

    // Determine status
    let status: RecoveryScore['status'] = 'recovered'
    if (score < 30) status = 'overtrained'
    else if (score < 50) status = 'fatigued'
    else if (score < 70) status = 'recovering'

    // Generate recommendation
    let recommendation = ''
    let recommendedAction: RecoveryScore['recommendedAction'] = 'normal'

    if (status === 'overtrained') {
      recommendation = 'Your body needs rest. Take at least 2-3 days off from intense training.'
      recommendedAction = 'rest'
    } else if (status === 'fatigued') {
      recommendation = 'Consider taking a rest day or doing light, low-intensity activity.'
      recommendedAction = 'light'
    } else if (status === 'recovering') {
      recommendation = 'You\'re recovering well. Stick to moderate intensity workouts.'
      recommendedAction = 'moderate'
    } else {
      recommendation = 'You\'re well recovered and ready for normal training!'
      recommendedAction = 'normal'
    }

    return {
      date: format(new Date(), 'yyyy-MM-dd'),
      score: Math.round(score),
      status,
      recommendation,
      daysOfRest,
      recentLoad: Math.round(recentLoad),
      recommendedAction
    }
  }
}
