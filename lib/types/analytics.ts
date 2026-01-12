// Core workout data type (matches database schema)
export interface Workout {
  id: string
  user_id: string
  activity_type: 'running' | 'climbing' | 'hiking' | 'snowboarding' | 'cycling' | 'swimming' | 'yoga' | 'strength'
  title: string
  description?: string
  duration_minutes?: number
  distance?: number
  elevation_gain?: number
  difficulty?: 'Easy' | 'Moderate' | 'Hard' | 'Expert'
  location?: string
  notes?: string
  date: string
  created_at: string
}

// Time range filter options
export type TimeRange = 'week' | 'month' | 'year' | 'all'

// Activity type filter
export type ActivityTypeFilter = Workout['activity_type'] | 'all'

// Statistics overview data
export interface StatsOverview {
  totalWorkouts: number
  totalDuration: number // in minutes
  totalDistance: number // in miles/km
  totalElevation: number // in feet/meters
  avgDuration: number
  avgDistance: number
  avgElevation: number
  mostCommonActivity: string
  currentStreak: number // days
  longestStreak: number // days
  workoutsThisWeek: number
  workoutsThisMonth: number
  workoutsThisYear: number
}

// Activity distribution data (for pie/donut chart)
export interface ActivityDistribution {
  activityType: string
  count: number
  percentage: number
  totalDuration: number
  totalDistance: number
}

// Difficulty distribution data
export interface DifficultyDistribution {
  difficulty: string
  count: number
  percentage: number
  avgDuration: number
}

// Time series data point (for line/bar charts)
export interface TimeSeriesDataPoint {
  date: string // ISO date or formatted date
  workoutCount: number
  totalDuration: number
  totalDistance: number
  totalElevation: number
  // Per-activity breakdowns (optional for stacked charts)
  running?: number
  climbing?: number
  hiking?: number
  snowboarding?: number
  cycling?: number
  swimming?: number
  yoga?: number
  strength?: number
}

// Personal records
export interface PersonalRecords {
  longestDistance?: { value: number; workout: Workout }
  longestDuration?: { value: number; workout: Workout }
  highestElevation?: { value: number; workout: Workout }
  mostWorkoutsInWeek?: { value: number; weekStart: string }
  mostWorkoutsInMonth?: { value: number; monthStart: string }
}

// Statistics request parameters
export interface StatsRequest {
  userId: string
  timeRange: TimeRange
  activityType?: ActivityTypeFilter
  startDate?: string
  endDate?: string
}

// Complete analytics data response
export interface AnalyticsData {
  overview: StatsOverview
  activityDistribution: ActivityDistribution[]
  difficultyDistribution: DifficultyDistribution[]
  timeSeries: TimeSeriesDataPoint[]
  personalRecords: PersonalRecords
  lastUpdated: string
}

// Loading/error states
export type AnalyticsLoadingState = 'idle' | 'loading' | 'success' | 'error'

export interface AnalyticsState {
  data: AnalyticsData | null
  loading: AnalyticsLoadingState
  error: string | null
}

// ============================================================================
// NEW TYPES FOR DASHBOARD OVERHAUL & VISUALIZATION PAGES
// ============================================================================

// Heatmap data for GitHub-style contribution calendar
export interface HeatmapData {
  date: string // ISO date (YYYY-MM-DD)
  count: number // Number of workouts
  intensity: 'none' | 'low' | 'medium' | 'high' | 'very-high' // Visual intensity level
  workouts: Workout[] // Full workout data for tooltip
}

// Achievement/Badge system
export interface Achievement {
  id: string
  title: string
  description: string
  category: 'distance' | 'frequency' | 'streak' | 'pr' | 'diversity' | 'elevation'
  icon: string // lucide-react icon name
  locked: boolean
  progress: number // 0-100
  requirement: number
  currentValue: number
  unit: string // e.g., "workouts", "miles", "days"
  unlockedAt?: string // ISO date
}

// Smart training insights/suggestions
export interface TrainingInsight {
  id: string
  type: 'suggestion' | 'warning' | 'achievement' | 'tip'
  title: string
  message: string
  icon: string // lucide-react icon name
  priority: 'low' | 'medium' | 'high'
  actionable: boolean
  action?: {
    label: string
    href?: string
  }
}

// Goal progress with predictions
export interface GoalProgress {
  goalId: string
  title: string
  activityType?: string
  targetValue: number
  currentValue: number
  unit: string
  targetDate?: string
  progress: number // 0-100
  onTrack: boolean
  daysRemaining?: number
  predictedCompletion?: string // ISO date
  projectedValue?: number // Predicted value by target date
  requiredPace: number // Units per week to stay on track
  currentPace: number // Current units per week
}

// Trend analysis with linear regression
export interface TrendData {
  metric: 'workouts' | 'duration' | 'distance' | 'elevation'
  dataPoints: Array<{ date: string; value: number }>
  trendLine: Array<{ date: string; value: number }> // Regression line
  slope: number // Rate of change
  direction: 'up' | 'down' | 'flat'
  prediction: Array<{ date: string; value: number }> // Future predictions
  r2: number // Goodness of fit (0-1)
}

// Correlation analysis (e.g., workout vs wellbeing)
export interface CorrelationData {
  metric1: string
  metric2: string
  correlation: number // -1 to 1 (Pearson correlation coefficient)
  strength: 'none' | 'weak' | 'moderate' | 'strong'
  direction: 'positive' | 'negative' | 'none'
  scatterData: Array<{ x: number; y: number; date: string }>
  insight: string // Human-readable interpretation
}

// Training load/intensity tracking
export interface TrainingLoadData {
  date: string
  workoutCount: number
  totalDuration: number
  intensityScore: number // Calculated score (0-100)
  difficulty: 'easy' | 'moderate' | 'hard' | 'expert' | 'rest'
  recoveryNeeded: boolean
  workouts: Workout[]
}

// Recovery score and recommendations
export interface RecoveryScore {
  date: string
  score: number // 0-100 (100 = fully recovered)
  status: 'recovered' | 'recovering' | 'fatigued' | 'overtrained'
  recommendation: string
  daysOfRest: number
  recentLoad: number // Last 7 days intensity
  recommendedAction: 'rest' | 'light' | 'moderate' | 'normal'
}

// Widget configuration for dashboard grid
export interface WidgetConfig {
  id: string
  type: 'stats-overview' | 'heatmap' | 'goal-progress' | 'timeline' | 'quick-actions' | 'personal-records' | 'streak' | 'weekly-summary' | 'training-insights' | 'wellbeing'
  x: number // Grid position
  y: number
  w: number // Grid width
  h: number // Grid height
  minW?: number
  minH?: number
  visible: boolean
}

// Widget grid layout
export interface DashboardLayout {
  userId: string
  widgets: WidgetConfig[]
  gridCols: number
  rowHeight: number
  updatedAt: string
}
