"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { WorkoutForm } from "@/components/workout-form"
import { GoalForm } from "@/components/goal-form"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/components/auth-provider"
import { LoadingScreen } from "@/components/loading-screen"
import { Mountain, Target, CheckCircle, TrendingUp, Plus, ArrowRight, Heart, Save } from "lucide-react"
import Link from "next/link"

interface Workout {
  id: string
  activity_type: string
  duration: number
  distance?: number
  location?: string
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

  if (loading || dataLoading) {
    return <LoadingScreen message="Loading your dashboard..." />
  }

  const completedWorkouts = workouts.filter((w) => w.duration > 0).length
  const activeGoals = goals.filter((g) => g.status === "active").length
  const completedGoals = goals.filter((g) => g.status === "completed").length
  const recentWorkouts = workouts.slice(0, 3)
  const recentGoals = goals.slice(0, 3)

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {/* Total Workouts */}
          <Card className="bg-white hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Workouts</p>
                  <p className="text-2xl font-bold text-gray-900">{workouts.length}</p>
                </div>
                <div className="text-green-600">
                  <TrendingUp className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Completed Workouts */}
          <Card className="bg-white hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Completed Workouts</p>
                  <p className="text-2xl font-bold text-gray-900">{completedWorkouts}</p>
                </div>
                <div className="text-green-600">
                  <CheckCircle className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Active Goals */}
          <Card className="bg-white hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Goals</p>
                  <p className="text-2xl font-bold text-gray-900">{activeGoals}</p>
                </div>
                <div className="text-green-600">
                  <Target className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Completed Goals */}
          <Card className="bg-white hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Completed Goals</p>
                  <p className="text-2xl font-bold text-gray-900">{completedGoals}</p>
                </div>
                <div className="text-green-600">
                  <TrendingUp className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Wellbeing Section */}
        <Card className="bg-white">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Heart className="w-5 h-5 text-red-500" />
              <h2 className="text-xl font-semibold text-gray-900">How are you feeling today?</h2>
            </div>
            <p className="text-gray-600 mb-6">Rate your overall well-being and track your emotions</p>

            {/* Overall Score Slider */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700">Overall Score (1-10)</label>
                <span className={`text-sm font-medium ${getScoreLabelColor(wellbeingScore[0])}`}>
                  {wellbeingScore[0]}/10 - {getScoreLabel(wellbeingScore[0])}
                </span>
              </div>
              <Slider
                value={wellbeingScore}
                onValueChange={setWellbeingScore}
                max={10}
                min={1}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>1 - Poor</span>
                <span>5/10 - Average</span>
                <span>10 - Excellent</span>
              </div>
            </div>

            {/* Emotion Selection */}
            <div className="mb-6">
              <label className="text-sm font-medium text-gray-700 mb-3 block">
                How are you feeling? (Select all that apply)
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-10 gap-2">
                {emotionOptions.map((emotion) => (
                  <button
                    key={emotion.id}
                    onClick={() => toggleEmotion(emotion.id)}
                    className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                      selectedEmotions.includes(emotion.id)
                        ? "bg-green-50 border-green-200 text-green-700"
                        : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <div className="text-lg mb-1">{emotion.emoji}</div>
                    <div className="text-xs">{emotion.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Notes and Save Button */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
              <div className="lg:col-span-3">
                <label className="text-sm font-medium text-gray-700 mb-2 block">Notes (optional)</label>
                <Textarea
                  value={wellbeingNotes}
                  onChange={(e) => setWellbeingNotes(e.target.value)}
                  placeholder="Any additional thoughts about how you're feeling today..."
                  className="min-h-[100px]"
                />
              </div>
              <div className="flex items-end">
                <Button
                  onClick={handleSaveWellbeing}
                  disabled={isSavingWellbeing}
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                >
                  {isSavingWellbeing ? (
                    <>
                      <Save className="w-4 h-4 mr-2 animate-pulse" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Check-in
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Cards and Recent Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {/* Track Workout Card */}
          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <div className="mb-4">
                <Mountain className="w-12 h-12 mx-auto opacity-80" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Track a Workout</h3>
              <p className="text-green-100 text-sm mb-4">Log your latest outdoor adventure</p>
              <Button
                onClick={() => setShowWorkoutForm(true)}
                variant="secondary"
                className="bg-white text-green-600 hover:bg-green-50"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Workout
              </Button>
            </CardContent>
          </Card>

          {/* Set Goal Card */}
          <Card className="bg-gradient-to-br from-blue-500 to-teal-600 text-white hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <div className="mb-4">
                <Target className="w-12 h-12 mx-auto opacity-80" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Set a Goal</h3>
              <p className="text-blue-100 text-sm mb-4">Define your next fitness milestone</p>
              <Button
                onClick={() => setShowGoalForm(true)}
                variant="secondary"
                className="bg-white text-blue-600 hover:bg-blue-50"
              >
                <Target className="w-4 h-4 mr-2" />
                Add Goal
              </Button>
            </CardContent>
          </Card>

          {/* Recent Workouts */}
          <Card className="bg-white hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Mountain className="w-5 h-5 text-green-600" />
                  <CardTitle className="text-lg">Recent Workouts</CardTitle>
                </div>
                <Link href="/dashboard/workouts">
                  <Button variant="ghost" size="sm" className="text-green-600 hover:text-green-700">
                    View All <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </div>
              <p className="text-sm text-gray-600">Your latest outdoor activities</p>
            </CardHeader>
            <CardContent className="pt-0">
              {recentWorkouts.length > 0 ? (
                <div className="space-y-3">
                  {recentWorkouts.slice(0, 2).map((workout) => (
                    <div key={workout.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div>
                        <p className="font-medium text-sm">{workout.activity_type}</p>
                        <p className="text-xs text-gray-600">
                          {workout.duration} min {workout.distance && `• ${workout.distance} km`}
                        </p>
                      </div>
                      <div className="text-xs text-gray-500">{new Date(workout.created_at).toLocaleDateString()}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <Mountain className="w-8 h-8 mx-auto text-gray-300 mb-2" />
                  <p className="text-gray-500 text-sm mb-3">No workouts yet</p>
                  <Button onClick={() => setShowWorkoutForm(true)} variant="outline" size="sm">
                    Add your first workout
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Goals */}
          <Card className="bg-white hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-green-600" />
                  <CardTitle className="text-lg">Recent Goals</CardTitle>
                </div>
                <Link href="/dashboard/goals">
                  <Button variant="ghost" size="sm" className="text-green-600 hover:text-green-700">
                    View All <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </div>
              <p className="text-sm text-gray-600">Your fitness objectives</p>
            </CardHeader>
            <CardContent className="pt-0">
              {recentGoals.length > 0 ? (
                <div className="space-y-3">
                  {recentGoals.slice(0, 2).map((goal) => (
                    <div key={goal.id} className="p-2 bg-gray-50 rounded">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-medium text-sm">{goal.title}</p>
                        <span
                          className={`text-xs px-2 py-1 rounded ${
                            goal.status === "completed" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {goal.status}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-gray-600">
                          {goal.current_value}/{goal.target_value} {goal.unit}
                        </p>
                        <p className="text-xs text-gray-500">Due: {new Date(goal.target_date).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <Target className="w-8 h-8 mx-auto text-gray-300 mb-2" />
                  <p className="text-gray-500 text-sm mb-3">No goals yet</p>
                  <Button onClick={() => setShowGoalForm(true)} variant="outline" size="sm">
                    Set your first goal
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
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
