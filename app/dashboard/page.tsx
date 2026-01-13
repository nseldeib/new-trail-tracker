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

export default function Dashboard() {
  const { user, loading } = useAuth()
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [goals, setGoals] = useState<Goal[]>([])
  const [showWorkoutForm, setShowWorkoutForm] = useState(false)
  const [showGoalForm, setShowGoalForm] = useState(false)
  const [dataLoading, setDataLoading] = useState(true)

  // Wellbeing state
  const [wellbeingScore, setWellbeingScore] = useState([5])
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>([])
  const [wellbeingNotes, setWellbeingNotes] = useState("")
  const [isSavingWellbeing, setIsSavingWellbeing] = useState(false)

  useEffect(() => {
    if (user) {
      fetchData()
    }
  }, [user])

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
    fetchData()
  }

  const handleGoalAdded = () => {
    setShowGoalForm(false)
    fetchData()
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

  return (
    <DashboardLayout>
      <div className="space-y-2">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
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
            gradient="purple"
          />
          <MetricCard
            title="Completed Goals"
            value={completedGoals.toString()}
            numericValue={completedGoals}
            icon={TrendingUp}
            subtitle="Achieved milestones"
            gradient="coral"
          />
        </div>

        {/* Wellbeing Section */}
        <Card className={cn("overflow-hidden relative transition-all duration-500", getMoodGradient(wellbeingScore[0]))}>
          {/* Light overlay for better text contrast */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/20 pointer-events-none" />

          <CardContent className="p-3 relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <Heart className="w-4 h-4 text-gray-800" />
              <h2 className="text-base font-bold text-gray-900">How are you feeling today?</h2>
            </div>

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
          </CardContent>
        </Card>

        {/* Action Cards and Recent Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
          {/* Track Workout Card */}
          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-3 text-center">
              <div className="mb-2">
                <Mountain className="w-8 h-8 mx-auto opacity-80" />
              </div>
              <h3 className="text-sm font-semibold mb-1">Track Workout</h3>
              <Button
                onClick={() => setShowWorkoutForm(true)}
                variant="secondary"
                size="sm"
                className="bg-white text-green-600 hover:bg-green-50 w-full"
              >
                <Plus className="w-3 h-3 mr-1" />
                Add
              </Button>
            </CardContent>
          </Card>

          {/* Set Goal Card */}
          <Card className="bg-gradient-to-br from-blue-500 to-teal-600 text-white hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-3 text-center">
              <div className="mb-2">
                <Target className="w-8 h-8 mx-auto opacity-80" />
              </div>
              <h3 className="text-sm font-semibold mb-1">Set Goal</h3>
              <Button
                onClick={() => setShowGoalForm(true)}
                variant="secondary"
                size="sm"
                className="bg-white text-blue-600 hover:bg-blue-50 w-full"
              >
                <Target className="w-3 h-3 mr-1" />
                Add
              </Button>
            </CardContent>
          </Card>

          {/* Recent Workouts */}
          <Card className="bg-white dark:bg-gray-800 hover:shadow-lg transition-all duration-200">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <Mountain className="w-4 h-4 text-teal-600" />
                  <CardTitle className="text-sm">Recent Workouts</CardTitle>
                </div>
                <Link href="/dashboard/workouts">
                  <Button variant="ghost" size="sm" className="text-teal-600 hover:text-teal-700 h-6 px-2 text-xs">
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
                  <div className="w-12 h-12 mx-auto mb-2 bg-gradient-to-br from-teal-100 to-blue-100 dark:from-teal-900 dark:to-blue-900 rounded-full flex items-center justify-center">
                    <Mountain className="w-6 h-6 text-teal-600 dark:text-teal-400" />
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 text-xs mb-2">No workouts yet</p>
                  <Button onClick={() => setShowWorkoutForm(true)} variant="gradient" size="sm">
                    <Plus className="w-3 h-3 mr-1" />
                    Add workout
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Goals */}
          <Card className="bg-white dark:bg-gray-800 hover:shadow-lg transition-all duration-200">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <Target className="w-4 h-4 text-purple-600" />
                  <CardTitle className="text-sm">Recent Goals</CardTitle>
                </div>
                <Link href="/dashboard/goals">
                  <Button variant="ghost" size="sm" className="text-purple-600 hover:text-purple-700 h-6 px-2 text-xs">
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
                              <h4 className="font-semibold text-xs truncate">{goal.title}</h4>
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
                  <div className="w-12 h-12 mx-auto mb-2 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900 rounded-full flex items-center justify-center">
                    <Target className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 text-xs mb-2">No goals yet</p>
                  <Button onClick={() => setShowGoalForm(true)} variant="gradient-purple" size="sm">
                    <Plus className="w-3 h-3 mr-1" />
                    Set goal
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Analytics Widgets Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
          <StreakWidget currentStreak={currentStreak} workouts={workouts} />
          <ActivityDistributionWidget workouts={workouts} />
          <WeekComparisonWidget workouts={workouts} />
          <WeatherWidget workouts={workouts} />
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
