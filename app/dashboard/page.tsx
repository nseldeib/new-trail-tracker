"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { WorkoutForm } from "@/components/workout-form"
import { GoalForm } from "@/components/goal-form"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/components/auth-provider"
import { LoadingScreen } from "@/components/loading-screen"
import { Mountain, Target, CheckCircle, TrendingUp, Plus, ArrowRight, Heart, Save, Activity, Clock } from "lucide-react"
import { MetricCard } from "@/components/analytics/metric-card"
import { EmotionButton } from "@/components/ui/emotion-button"
import { ProgressRing } from "@/components/charts/progress-ring"
import { getActivityIcon, getActivityGradientClass, getDifficultyBadgeClass, getDaysRemaining, getMoodGradient } from "@/lib/utils/colors"
import { StreakWidget } from "@/components/dashboard/streak-widget"
import { ActivityDistributionWidget } from "@/components/dashboard/activity-distribution-widget"
import { WeekComparisonWidget } from "@/components/dashboard/week-comparison-widget"
import { WeatherWidget } from "@/components/dashboard/weather-widget"
import confetti from "canvas-confetti"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface Workout {
  id: string
  activity_type: string
  title?: string
  duration: number
  distance?: number
  location?: string
  difficulty?: string
  created_at: string
}

interface Goal {
  id: string
  title: string
  description?: string
  target_value: number
  current_value: number
  unit: string
  target_date: string
  status: string
  created_at: string
}

interface WellbeingEntry {
  overall_score: number
  emotions: string[]
  notes?: string
}

const emotionOptions = [
  { id: "energized", label: "Energized", emoji: "⚡" },
  { id: "fatigued", label: "Fatigued", emoji: "😴" },
  { id: "motivated", label: "Motivated", emoji: "🔥" },
  { id: "stressed", label: "Stressed", emoji: "😰" },
  { id: "happy", label: "Happy", emoji: "😊" },
  { id: "anxious", label: "Anxious", emoji: "😟" },
  { id: "focused", label: "Focused", emoji: "🎯" },
  { id: "sore", label: "Sore", emoji: "💪" },
  { id: "strong", label: "Strong", emoji: "💪" },
  { id: "peaceful", label: "Peaceful", emoji: "🕊️" },
]

// Visual states for CodeYam scenario generation - ensures 5 distinct visual variations
type VisualState = "peak-performance" | "struggling" | "moderate-progress" | "empty" | "activity-diversity" | "goal-achiever" | "loading" | "default"

interface DashboardProps {
  visualState?: VisualState
  isWellbeingExpanded?: boolean
  mockUser?: any
  mockWorkouts?: Workout[]
  mockGoals?: Goal[]
  mockLoading?: boolean
  mockAuthLoading?: boolean
  mockWellbeingScore?: number
  mockWellbeingEmotions?: string[]
  mockWellbeingNotes?: string
  mockWeather?: any
}

export default function Dashboard({
  visualState = "default",
  isWellbeingExpanded,
  mockUser,
  mockWorkouts,
  mockGoals,
  mockLoading = false,
  mockAuthLoading = false,
  mockWellbeingScore,
  mockWellbeingEmotions,
  mockWellbeingNotes,
  mockWeather
}: DashboardProps) {
  const { user: authUser, loading: authLoading } = useAuth()
  const user = mockUser !== undefined ? mockUser : authUser
  const loading = mockAuthLoading !== undefined ? mockAuthLoading : authLoading

  const [workouts, setWorkouts] = useState<Workout[]>(mockWorkouts || [])
  const [goals, setGoals] = useState<Goal[]>(mockGoals || [])
  const [showWorkoutForm, setShowWorkoutForm] = useState(false)
  const [showGoalForm, setShowGoalForm] = useState(false)
  const [dataLoading, setDataLoading] = useState(mockLoading)

  // Wellbeing state - initialize based on visualState for distinct scenario visuals
  const getInitialWellbeingState = () => {
    // Override with mock props if provided
    if (mockWellbeingScore !== undefined || mockWellbeingEmotions !== undefined) {
      return {
        score: [mockWellbeingScore ?? 5],
        emotions: mockWellbeingEmotions ?? [],
        notes: mockWellbeingNotes ?? "",
        expanded: isWellbeingExpanded ?? false
      }
    }

    switch (visualState) {
      case "peak-performance":
        return {
          score: [10],
          emotions: ["energized", "motivated", "happy", "focused", "strong"],
          notes: "Feeling absolutely amazing! Hit all my goals this week and ready for more! 💪🎉",
          expanded: true // Show it expanded for peak performance
        }
      case "struggling":
        return {
          score: [2],
          emotions: ["fatigued", "stressed", "anxious"],
          notes: "Having a tough day. Need to take it easy and focus on small wins.",
          expanded: true // Show it expanded to highlight the struggle
        }
      case "moderate-progress":
        return {
          score: [6],
          emotions: ["motivated", "sore"],
          notes: "Making steady progress. Some days are harder than others but staying consistent.",
          expanded: false // Collapsed for variety
        }
      case "activity-diversity":
        return {
          score: [8],
          emotions: ["energized", "happy", "strong"],
          notes: "Love mixing up my workouts! Variety keeps things exciting.",
          expanded: false // Collapsed to showcase other widgets
        }
      case "goal-achiever":
        return {
          score: [9],
          emotions: ["happy", "strong", "peaceful"],
          notes: "Proud of hitting my goals! Time to set new challenges.",
          expanded: false // Collapsed for variety
        }
      default:
        return {
          score: [5],
          emotions: [],
          notes: "",
          expanded: false // Collapsed by default
        }
    }
  }

  const initialWellbeing = getInitialWellbeingState()
  const [wellbeingScore, setWellbeingScore] = useState(initialWellbeing.score)
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>(initialWellbeing.emotions)
  const [wellbeingNotes, setWellbeingNotes] = useState(initialWellbeing.notes)
  const [wellbeingExpanded, setWellbeingExpanded] = useState<boolean>(initialWellbeing.expanded)
  const [isSavingWellbeing, setIsSavingWellbeing] = useState(false)

  useEffect(() => {
    // Update state when mock data changes
    if (mockWorkouts !== undefined) {
      setWorkouts(mockWorkouts)
    }
    if (mockGoals !== undefined) {
      setGoals(mockGoals)
    }
  }, [mockWorkouts, mockGoals])

  useEffect(() => {
    // Skip fetching if mock data is provided
    if (mockWorkouts !== undefined || mockGoals !== undefined) {
      setDataLoading(false)
      return
    }

    if (user) {
      fetchData()
    }
  }, [user, mockWorkouts, mockGoals])

  const fetchData = async () => {
    try {
      setDataLoading(true)

      const supabase = createClient()

      // Fetch workouts
      const { data: workoutsData } = await supabase
        .from("workouts")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false })
        .limit(10)

      // Fetch goals
      const { data: goalsData } = await supabase
        .from("goals")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false })
        .limit(10)

      setWorkouts(workoutsData || [])
      setGoals(goalsData || [])
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setDataLoading(false)
    }
  }

  const handleWorkoutAdded = () => {
    setShowWorkoutForm(false)
    if (!mockWorkouts && !mockGoals) {
      fetchData()
    }
  }

  const handleGoalAdded = () => {
    setShowGoalForm(false)
    if (!mockWorkouts && !mockGoals) {
      fetchData()
    }
  }

  const toggleEmotion = (emotionId: string) => {
    setSelectedEmotions((prev) =>
      prev.includes(emotionId) ? prev.filter((id) => id !== emotionId) : [...prev, emotionId],
    )
  }

  const handleSaveWellbeing = async () => {
    if (!user) return

    setIsSavingWellbeing(true)
    try {
      const wellbeingData: WellbeingEntry = {
        overall_score: wellbeingScore[0],
        emotions: selectedEmotions,
        notes: wellbeingNotes || undefined,
      }

      const supabase = createClient()

      const { error } = await supabase.from("wellbeing_entries").insert({
        user_id: user.id,
        ...wellbeingData,
        created_at: new Date().toISOString(),
      })

      if (error) throw error

      // Trigger confetti for high scores
      if (wellbeingScore[0] >= 8) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#10b981', '#34d399', '#6ee7b7']
        })
      }

      // Reset form
      setWellbeingScore([5])
      setSelectedEmotions([])
      setWellbeingNotes("")

      // You could show a success message here
    } catch (error) {
      console.error("Error saving wellbeing entry:", error)
    } finally {
      setIsSavingWellbeing(false)
    }
  }

  const getScoreLabel = (score: number) => {
    if (score <= 3) return "Poor"
    if (score <= 7) return "Average"
    return "Excellent"
  }

  const getScoreLabelColor = (score: number) => {
    if (score <= 3) return "text-red-500"
    if (score <= 7) return "text-yellow-500"
    return "text-green-500"
  }

  const calculateStreak = (workouts: Workout[]) => {
    if (workouts.length === 0) return 0

    const sortedWorkouts = [...workouts].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )

    let streak = 0
    let currentDate = new Date()
    currentDate.setHours(0, 0, 0, 0)

    for (const workout of sortedWorkouts) {
      const workoutDate = new Date(workout.created_at)
      workoutDate.setHours(0, 0, 0, 0)

      const daysDiff = Math.floor((currentDate.getTime() - workoutDate.getTime()) / (1000 * 60 * 60 * 24))

      if (daysDiff === streak) {
        streak++
      } else if (daysDiff > streak) {
        break
      }
    }

    return streak
  }

  if (loading || dataLoading) {
    return <LoadingScreen message="Loading your dashboard..." />
  }

  const completedWorkouts = workouts.filter((w) => w.duration > 0).length
  const activeGoals = goals.filter((g) => g.status === "active").length
  const completedGoals = goals.filter((g) => g.status === "completed").length
  const recentWorkouts = workouts.slice(0, 3)
  const recentGoals = goals.slice(0, 3)
  const currentStreak = calculateStreak(workouts)

  // Calculate activity diversity
  const activityTypes = new Set(workouts.map(w => w.activity_type))
  const activityDiversity = activityTypes.size

  // Calculate performance level
  const getPerformanceLevel = () => {
    if (workouts.length >= 20 && completedGoals >= 2) return "peak"
    if (workouts.length >= 10 && activeGoals >= 1) return "moderate"
    if (workouts.length < 5) return "struggling"
    return "building"
  }
  const performanceLevel = getPerformanceLevel()

  // Banner priority: ONLY ONE shows at a time for visual clarity
  // Explicit visualState takes priority over calculated state
  // Priority: Empty (none) > Struggling > Peak > Diversity > Goal Achiever
  const shouldShowStrugglingBanner = visualState === "struggling" || (visualState === "default" && performanceLevel === "struggling" && workouts.length > 0)
  const shouldShowPeakBanner = !shouldShowStrugglingBanner && visualState === "empty" ? false : (visualState === "peak-performance" || (visualState === "default" && performanceLevel === "peak"))
  const shouldShowDiversityBadge = !shouldShowStrugglingBanner && !shouldShowPeakBanner && visualState === "empty" ? false : (visualState === "activity-diversity" || (visualState === "default" && activityDiversity >= 6))
  const shouldShowGoalAchiever = !shouldShowStrugglingBanner && !shouldShowPeakBanner && !shouldShowDiversityBadge && visualState === "empty" ? false : (visualState === "goal-achiever" || (visualState === "default" && completedGoals >= 3 && workouts.length < 20))

  // Handle special visual states
  if (visualState === "loading") {
    return <LoadingScreen message="Loading your dashboard..." />
  }

  return (
    <DashboardLayout>
      <div className="space-y-3">
        {/* Stats Grid - Distinct colors for each metric */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <MetricCard
            title="Total Workouts"
            value={workouts.length.toString()}
            numericValue={workouts.length}
            icon={Activity}
            subtitle="All time activities"
            gradient="teal"
          />
          <MetricCard
            title="Completed Workouts"
            value={completedWorkouts.toString()}
            numericValue={completedWorkouts}
            icon={CheckCircle}
            subtitle="Finished sessions"
            gradient="green"
          />
          <MetricCard
            title="Active Goals"
            value={activeGoals.toString()}
            numericValue={activeGoals}
            icon={Target}
            subtitle="In progress"
            gradient="amber"
          />
          <MetricCard
            title="Completed Goals"
            value={completedGoals.toString()}
            numericValue={completedGoals}
            icon={TrendingUp}
            subtitle="Achieved milestones"
            gradient="purple"
          />
        </div>

        {/* Performance Status Banner - ONLY ONE shows at a time */}
        {shouldShowPeakBanner && (
          <Card className="bg-gradient-to-r from-green-700 to-green-600 text-white border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-full">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-base">Peak Performance</h3>
                  <p className="text-sm opacity-90">{workouts.length} workouts • {completedGoals} goals achieved</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {shouldShowStrugglingBanner && (
          <Card className="bg-gradient-to-r from-orange-500 to-red-500 text-white border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-full">
                  <Heart className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-base">Building Your Foundation</h3>
                  <p className="text-sm opacity-90">Every expert was once a beginner - you've got this!</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {shouldShowDiversityBadge && !shouldShowPeakBanner && (
          <Card className="bg-gradient-to-r from-teal-700 to-teal-600 text-white border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-full">
                  <Mountain className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-base">Activity Explorer</h3>
                  <p className="text-sm opacity-90">{activityDiversity} different activity types - love the variety!</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {shouldShowGoalAchiever && !shouldShowPeakBanner && !shouldShowDiversityBadge && (
          <Card className="bg-gradient-to-r from-yellow-600 to-amber-600 text-white border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-full">
                  <Target className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-base">Goal Achiever</h3>
                  <p className="text-sm opacity-90">{completedGoals} goals completed - celebrate your wins!</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Wellbeing Section - Collapsible */}
        <Card className="overflow-hidden relative transition-all duration-500 bg-white border-green-200">
          {/* Subtle green accent based on score */}
          <div className={cn("absolute inset-0 opacity-10 pointer-events-none", getMoodGradient(wellbeingScore[0]))} />

          <CardContent className="p-3 relative z-10">
            {/* Collapsible Header */}
            <button
              onClick={() => setWellbeingExpanded(!wellbeingExpanded)}
              className="w-full flex items-center justify-between mb-2 hover:opacity-80 transition-opacity"
            >
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-gray-800" />
                <h2 className="text-base font-bold text-gray-900">How are you feeling today?</h2>
              </div>
              <div className="flex items-center gap-2">
                {/* Wellbeing mood indicator */}
                {wellbeingScore[0] >= 8 && (
                  <Badge className="bg-green-700 text-white text-xs">Feeling Great</Badge>
                )}
                {wellbeingScore[0] >= 4 && wellbeingScore[0] <= 7 && (
                  <Badge className="bg-green-600 text-white text-xs">Doing OK</Badge>
                )}
                {wellbeingScore[0] <= 3 && (
                  <Badge className="bg-orange-500 text-white text-xs">Take Care</Badge>
                )}
                {/* Chevron indicator */}
                <svg
                  className={cn("w-5 h-5 text-gray-800 transition-transform duration-200", wellbeingExpanded ? "rotate-180" : "")}
                  fill="none"
                  strokeWidth="2"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </button>

            {/* Expandable Content */}
            {wellbeingExpanded && (
              <>
                {/* Overall Score Slider */}
                <div className="mb-2 bg-white/60 backdrop-blur-sm rounded-lg p-2">
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-medium text-gray-800">Overall Score</label>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-gray-900">
                        {wellbeingScore[0]}
                      </span>
                      <span className="text-xs font-semibold text-gray-800">
                        {getScoreLabel(wellbeingScore[0])}
                      </span>
                    </div>
                  </div>
                  <Slider
                    value={wellbeingScore}
                    onValueChange={setWellbeingScore}
                    max={10}
                    min={1}
                    step={1}
                    className="w-full"
                    gradientTrack
                  />
                </div>

                {/* Emotion Selection */}
                <div className="mb-2">
                  <label className="text-xs font-medium text-gray-800 mb-1 block">
                    Emotions (select all that apply)
                  </label>
                  <div className="grid grid-cols-5 gap-1">
                    {emotionOptions.map((emotion) => (
                      <EmotionButton
                        key={emotion.id}
                        emotion={emotion}
                        selected={selectedEmotions.includes(emotion.id)}
                        onToggle={() => toggleEmotion(emotion.id)}
                      />
                    ))}
                  </div>
                  {/* Emotion count indicator */}
                  {selectedEmotions.length >= 5 && (
                    <p className="text-xs text-gray-700 mt-1 font-medium">
                      Processing a lot today - that's completely normal 💭
                    </p>
                  )}
                  {selectedEmotions.length === 0 && (
                    <p className="text-xs text-gray-600 mt-1">
                      Select emotions to track your mental state
                    </p>
                  )}
                </div>

                {/* Notes and Save Button */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
                  <div className="lg:col-span-2">
                    <label className="text-xs font-medium text-gray-800 mb-1 block">Notes (optional)</label>
                    <Textarea
                      value={wellbeingNotes}
                      onChange={(e) => setWellbeingNotes(e.target.value)}
                      placeholder="Additional thoughts..."
                      className="min-h-[60px] text-sm bg-white/90 border-white/30 focus-visible:ring-teal-500"
                    />
                  </div>
                  <div className="flex items-end">
                    <Button
                      onClick={handleSaveWellbeing}
                      disabled={isSavingWellbeing}
                      variant="gradient"
                      size="sm"
                      className="w-full bg-white text-teal-600 hover:bg-white/90"
                    >
                      {isSavingWellbeing ? (
                        <>
                          <Save className="w-3 h-3 mr-1 animate-pulse" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-3 h-3 mr-1" />
                          Save
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="flex gap-2">
          <Button
            onClick={() => setShowWorkoutForm(true)}
            className="bg-green-700 text-white hover:bg-green-800"
            size="sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            Track Workout
          </Button>
          <Button
            onClick={() => setShowGoalForm(true)}
            className="bg-green-600 text-white hover:bg-green-700"
            size="sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            Set Goal
          </Button>
        </div>

        {/* Recent Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

          {/* Recent Workouts */}
          <Card className="bg-white dark:bg-gray-800 hover:shadow-lg transition-all duration-200 border-green-100">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <Mountain className="w-4 h-4 text-green-700" />
                  <CardTitle className="text-sm">Recent Workouts</CardTitle>
                </div>
                <Link href="/dashboard/workouts">
                  <Button variant="ghost" size="sm" className="text-green-700 hover:text-green-800 h-6 px-2 text-xs">
                    All <ArrowRight className="w-3 h-3 ml-1" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {recentWorkouts.length > 0 ? (
                <div className="space-y-2">
                  {recentWorkouts.slice(0, 2).map((workout) => {
                    const ActivityIcon = getActivityIcon(workout.activity_type)
                    return (
                      <Card key={workout.id} className="relative overflow-hidden group hover:shadow-md transition-all">
                        {/* Colored accent strip */}
                        <div
                          className={cn("absolute left-0 top-0 bottom-0 w-1 rounded-l-lg", getActivityGradientClass(workout.activity_type))}
                        />

                        <CardContent className="p-2 ml-1">
                          <div className="flex items-center gap-2">
                            {/* Activity icon */}
                            <div className={cn("p-1.5 rounded-lg", getActivityGradientClass(workout.activity_type))}>
                              <ActivityIcon className="w-4 h-4 text-white" />
                            </div>

                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-xs capitalize truncate">
                                {workout.title || workout.activity_type}
                              </p>
                              <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                                <Clock className="w-3 h-3" />
                                {workout.duration}m
                                {workout.distance && (
                                  <span className="ml-1">• {workout.distance}km</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-4">
                  <div className="w-12 h-12 mx-auto mb-2 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                    <Mountain className="w-6 h-6 text-green-700 dark:text-green-400" />
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 text-xs mb-2">No workouts yet</p>
                  <Button onClick={() => setShowWorkoutForm(true)} className="bg-green-700 hover:bg-green-800 text-white" size="sm">
                    <Plus className="w-3 h-3 mr-1" />
                    Add workout
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Goals */}
          <Card className="bg-white dark:bg-gray-800 hover:shadow-lg transition-all duration-200 border-green-100">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <Target className="w-4 h-4 text-green-700" />
                  <CardTitle className="text-sm">Recent Goals</CardTitle>
                </div>
                <Link href="/dashboard/goals">
                  <Button variant="ghost" size="sm" className="text-green-700 hover:text-green-800 h-6 px-2 text-xs">
                    All <ArrowRight className="w-3 h-3 ml-1" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {recentGoals.length > 0 ? (
                <div className="space-y-2">
                  {recentGoals.slice(0, 2).map((goal) => {
                    const progress = (goal.current_value / goal.target_value) * 100
                    const daysLeft = getDaysRemaining(goal.target_date)

                    return (
                      <Card key={goal.id} className="group hover:shadow-md transition-all">
                        <CardContent className="p-2">
                          <div className="flex items-center gap-2">
                            {/* Progress Ring */}
                            <ProgressRing
                              progress={progress}
                              size={40}
                              strokeWidth={4}
                              showPercentage={false}
                              autoColor
                              glow
                            />

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1">
                                <h4 className="font-semibold text-xs truncate">{goal.title}</h4>
                                {goal.status === "completed" && (
                                  <Badge className="bg-green-500 text-white text-[10px] px-1 py-0">✓</Badge>
                                )}
                                {progress >= 85 && progress < 100 && goal.status === "active" && (
                                  <Badge className="bg-orange-500 text-white text-[10px] px-1 py-0">Almost!</Badge>
                                )}
                              </div>
                              <p className="text-xs text-gray-600 dark:text-gray-400">
                                {goal.current_value} / {goal.target_value} {goal.unit}
                              </p>
                              {/* Milestone markers */}
                              <div className="flex gap-0.5 mt-1">
                                {[25, 50, 75, 100].map((milestone) => (
                                  <div
                                    key={milestone}
                                    className={cn(
                                      "h-1 flex-1 rounded-full transition-all",
                                      progress >= milestone
                                        ? "bg-gradient-to-r from-green-500 to-teal-500"
                                        : "bg-gray-200 dark:bg-gray-700"
                                    )}
                                  />
                                ))}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-4">
                  <div className="w-12 h-12 mx-auto mb-2 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                    <Target className="w-6 h-6 text-green-700 dark:text-green-400" />
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 text-xs mb-2">No goals yet</p>
                  <Button onClick={() => setShowGoalForm(true)} className="bg-green-700 hover:bg-green-800 text-white" size="sm">
                    <Plus className="w-3 h-3 mr-1" />
                    Set goal
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Analytics Widgets Section */}
        <div className="space-y-3">
          {/* Top Row - 4 widgets */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <StreakWidget currentStreak={currentStreak} workouts={workouts} />
            <ActivityDistributionWidget workouts={workouts} />
            <WeekComparisonWidget workouts={workouts} />
            <WeatherWidget workouts={workouts} mockWeather={mockWeather} />
          </div>
        </div>
      </div>

      {/* Modals */}
      {showWorkoutForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <WorkoutForm onWorkoutAdded={handleWorkoutAdded} onCancel={() => setShowWorkoutForm(false)} />
          </div>
        </div>
      )}

      {showGoalForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <GoalForm onGoalAdded={handleGoalAdded} onCancel={() => setShowGoalForm(false)} />
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
