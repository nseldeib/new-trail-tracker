"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/components/auth-provider"
import { supabase } from "@/lib/supabase"
import { Target, CheckSquare, Activity, TrendingUp, Heart, Mountain, Plus, ArrowRight, Save } from "lucide-react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { LoadingScreen } from "@/components/loading-screen"
import { WorkoutForm } from "@/components/workout-form"
import { GoalForm } from "@/components/goal-form"

interface Workout {
  id: string
  activity_type: string
  title: string
  description?: string
  duration_minutes?: number
  distance?: number
  elevation_gain?: number
  difficulty?: string
  location?: string
  notes?: string
  date: string
  created_at: string
}

interface Goal {
  id: string
  title: string
  description?: string
  activity_type?: string
  target_value?: number
  current_value: number
  unit?: string
  target_date?: string
  is_completed: boolean
  created_at: string
}

const emotionOptions = [
  { id: "energized", label: "Energized", emoji: "⚡" },
  { id: "fatigued", label: "Fatigued", emoji: "😴" },
  { id: "motivated", label: "Motivated", emoji: "🔥" },
  { id: "stressed", label: "Stressed", emoji: "😰" },
  { id: "happy", label: "Happy", emoji: "😊" },
  { id: "anxious", label: "Anxious", emoji: "😰" },
  { id: "focused", label: "Focused", emoji: "🎯" },
  { id: "sore", label: "Sore", emoji: "💪" },
  { id: "strong", label: "Strong", emoji: "💪" },
  { id: "peaceful", label: "Peaceful", emoji: "🕊️" },
]

export default function DashboardPage() {
  const { user } = useAuth()
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [goals, setGoals] = useState<Goal[]>([])
  const [wellbeingScore, setWellbeingScore] = useState([7])
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>([])
  const [wellbeingNotes, setWellbeingNotes] = useState("")
  const [loading, setLoading] = useState(true)
  const [showWorkoutForm, setShowWorkoutForm] = useState(false)
  const [showGoalForm, setShowGoalForm] = useState(false)

  useEffect(() => {
    if (user) {
      fetchData()
    }
  }, [user])

  const fetchData = async () => {
    try {
      const [workoutsRes, goalsRes] = await Promise.all([
        supabase.from("workouts").select("*").order("date", { ascending: false }),
        supabase.from("goals").select("*").order("created_at", { ascending: false }),
      ])

      setWorkouts(workoutsRes.data || [])
      setGoals(goalsRes.data || [])
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleEmotionToggle = (emotionId: string) => {
    setSelectedEmotions((prev) =>
      prev.includes(emotionId) ? prev.filter((id) => id !== emotionId) : [...prev, emotionId],
    )
  }

  const handleSaveCheckin = async () => {
    // Here you would save the wellbeing data to your database
    console.log("Saving check-in:", {
      score: wellbeingScore[0],
      emotions: selectedEmotions,
      notes: wellbeingNotes,
    })
    // Reset form or show success message
  }

  const getScoreLabel = (score: number) => {
    if (score <= 3) return "Poor"
    if (score <= 7) return "Average"
    return "Excellent"
  }

  if (loading) {
    return <LoadingScreen message="Loading your adventures..." />
  }

  const completedWorkouts = workouts.length
  const activeGoals = goals.filter((g) => !g.is_completed)
  const completedGoals = goals.filter((g) => g.is_completed)
  const recentWorkouts = workouts.slice(0, 3)
  const recentGoals = goals.slice(0, 3)

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-1">Welcome back!</h1>
        <p className="text-gray-600">Here's an overview of your fitness journey.</p>
      </div>

      {/* Modular Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {/* Stats Cards - Each takes 1 column */}
        <Card className="bg-white shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600 mb-1">Total Workouts</p>
                <p className="text-2xl font-bold text-gray-900">{workouts.length}</p>
              </div>
              <div className="text-green-600">
                <Activity className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600 mb-1">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{completedWorkouts}</p>
              </div>
              <div className="text-green-600">
                <CheckSquare className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600 mb-1">Active Goals</p>
                <p className="text-2xl font-bold text-gray-900">{activeGoals.length}</p>
              </div>
              <div className="text-green-600">
                <Target className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600 mb-1">Goals Done</p>
                <p className="text-2xl font-bold text-gray-900">{completedGoals.length}</p>
              </div>
              <div className="text-green-600">
                <TrendingUp className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Cards - Each takes 1 column */}
        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
          <CardContent className="p-4">
            <div className="text-center">
              <Mountain className="w-8 h-8 mx-auto mb-3 opacity-80" />
              <h3 className="text-lg font-semibold mb-2">Track Workout</h3>
              <p className="text-green-100 text-sm mb-4">Log your adventure</p>
              <Button
                onClick={() => setShowWorkoutForm(true)}
                variant="secondary"
                size="sm"
                className="bg-white text-green-600 hover:bg-gray-50 w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Workout
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-teal-500 to-blue-500 text-white shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
          <CardContent className="p-4">
            <div className="text-center">
              <Target className="w-8 h-8 mx-auto mb-3 opacity-80" />
              <h3 className="text-lg font-semibold mb-2">Set Goal</h3>
              <p className="text-blue-100 text-sm mb-4">Define milestone</p>
              <Button
                onClick={() => setShowGoalForm(true)}
                variant="secondary"
                size="sm"
                className="bg-white text-blue-600 hover:bg-gray-50 w-full"
              >
                <Target className="w-4 h-4 mr-2" />
                Add Goal
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Workouts - Takes 1 column */}
        <Card className="bg-white shadow-sm border border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-1">
                  <Mountain className="w-4 h-4 text-green-600" />
                  Recent Workouts
                </h3>
              </div>
              <Button variant="ghost" size="sm" className="text-green-600 hover:text-green-700 p-1">
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>

            {recentWorkouts.length > 0 ? (
              <div className="space-y-2">
                {recentWorkouts.slice(0, 2).map((workout) => (
                  <div key={workout.id} className="p-2 border border-gray-200 rounded text-xs">
                    <p className="font-medium text-gray-900 truncate">{workout.title}</p>
                    <p className="text-gray-600">{workout.activity_type}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <Mountain className="w-6 h-6 mx-auto text-gray-300 mb-2" />
                <p className="text-xs text-gray-500 mb-2">No workouts yet</p>
                <Button onClick={() => setShowWorkoutForm(true)} variant="outline" size="sm" className="text-xs">
                  Add first workout
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Goals - Takes 1 column */}
        <Card className="bg-white shadow-sm border border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-1">
                  <Target className="w-4 h-4 text-green-600" />
                  Recent Goals
                </h3>
              </div>
              <Button variant="ghost" size="sm" className="text-green-600 hover:text-green-700 p-1">
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>

            {recentGoals.length > 0 ? (
              <div className="space-y-2">
                {recentGoals.slice(0, 2).map((goal) => (
                  <div key={goal.id} className="p-2 border border-gray-200 rounded text-xs">
                    <p className="font-medium text-gray-900 truncate">{goal.title}</p>
                    <div className="flex items-center justify-between">
                      <p className="text-gray-600">{goal.activity_type}</p>
                      <div
                        className={`inline-flex px-1 py-0.5 rounded text-xs ${
                          goal.is_completed ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {goal.is_completed ? "Done" : "Active"}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <Target className="w-6 h-6 mx-auto text-gray-300 mb-2" />
                <p className="text-xs text-gray-500 mb-2">No goals yet</p>
                <Button onClick={() => setShowGoalForm(true)} variant="outline" size="sm" className="text-xs">
                  Set first goal
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Wellbeing Section - Takes 2 columns on larger screens */}
        <Card className="bg-white shadow-sm border border-gray-200 md:col-span-2 lg:col-span-2 xl:col-span-2">
          <CardContent className="p-4">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-2">
                <Heart className="w-5 h-5 text-red-500" />
                How are you feeling today?
              </h3>
              <p className="text-gray-600 text-sm">Rate your overall well-being and track your emotions</p>
            </div>

            {/* Overall Score Slider */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <p className="text-sm font-medium text-gray-900">Overall Score (1-10)</p>
                <span className="text-sm text-orange-600 font-medium">
                  {wellbeingScore[0]}/10 - {getScoreLabel(wellbeingScore[0])}
                </span>
              </div>
              <Slider
                value={wellbeingScore}
                onValueChange={setWellbeingScore}
                max={10}
                min={1}
                step={1}
                className="w-full [&_[role=slider]]:bg-green-600 [&_[role=slider]]:border-green-600 [&_.bg-primary]:bg-green-600"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>1 - Poor</span>
                <span>5/10 - Average</span>
                <span>10 - Excellent</span>
              </div>
            </div>

            {/* Emotion Selection - Compact Grid */}
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-900 mb-2">How are you feeling? (Select all that apply)</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                {emotionOptions.map((emotion) => (
                  <button
                    key={emotion.id}
                    onClick={() => handleEmotionToggle(emotion.id)}
                    className={`p-2 rounded-lg border text-xs font-medium transition-colors ${
                      selectedEmotions.includes(emotion.id)
                        ? "border-green-500 bg-green-50 text-green-700"
                        : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    <span className="block mb-1">{emotion.emoji}</span>
                    {emotion.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Notes and Save Button */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2">
                <p className="text-sm font-medium text-gray-900 mb-2">Notes (optional)</p>
                <Textarea
                  value={wellbeingNotes}
                  onChange={(e) => setWellbeingNotes(e.target.value)}
                  placeholder="Any additional thoughts about how you're feeling today..."
                  className="w-full min-h-[60px] resize-none text-sm"
                />
              </div>
              <div className="flex items-end">
                <Button onClick={handleSaveCheckin} className="w-full bg-green-600 hover:bg-green-700 text-white">
                  <Save className="w-4 h-4 mr-2" />
                  Save Check-in
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Forms */}
      {showWorkoutForm && (
        <WorkoutForm
          onClose={() => setShowWorkoutForm(false)}
          onSave={() => {
            setShowWorkoutForm(false)
            fetchData()
          }}
        />
      )}

      {showGoalForm && (
        <GoalForm
          onClose={() => setShowGoalForm(false)}
          onSave={() => {
            setShowGoalForm(false)
            fetchData()
          }}
        />
      )}
    </DashboardLayout>
  )
}
