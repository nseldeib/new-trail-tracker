"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { useAuth } from "./auth-provider"
import { supabase } from "@/lib/supabase"
import { WorkoutsView } from "./workouts-view"
import { GoalsView } from "./goals-view"
import { Mountain, LogOut, Target, CheckSquare, Activity, TrendingUp, Heart } from "lucide-react"

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

export function Dashboard() {
  const { user, signOut } = useAuth()
  const [activeTab, setActiveTab] = useState("dashboard")
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [goals, setGoals] = useState<Goal[]>([])
  const [wellbeingScore, setWellbeingScore] = useState([7])
  const [loading, setLoading] = useState(true)

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your adventures...</p>
        </div>
      </div>
    )
  }

  const completedWorkouts = workouts.length
  const activeGoals = goals.filter((g) => !g.is_completed)
  const completedGoals = goals.filter((g) => g.is_completed)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-3">
                <div className="text-green-600">
                  <Mountain className="w-8 h-8" />
                </div>
                <span className="text-xl font-semibold text-green-600">Trail Tracker</span>
              </div>

              <nav className="flex gap-8">
                <button
                  onClick={() => setActiveTab("dashboard")}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === "dashboard"
                      ? "border-green-500 text-green-600"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Dashboard
                </button>
                <button
                  onClick={() => setActiveTab("workouts")}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === "workouts"
                      ? "border-green-500 text-green-600"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Workouts
                </button>
                <button
                  onClick={() => setActiveTab("goals")}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === "goals"
                      ? "border-green-500 text-green-600"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Goals
                </button>
              </nav>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-gray-600">Welcome, demo@trailtracker.com</span>
              <Button onClick={signOut} variant="outline" size="sm" className="border-gray-300 bg-transparent">
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      {activeTab === "dashboard" && (
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back!</h1>
            <p className="text-gray-600">Here's an overview of your fitness journey.</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card className="bg-white shadow-sm border border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-2">Total Workouts</p>
                    <p className="text-4xl font-bold text-gray-900">{workouts.length}</p>
                  </div>
                  <div className="text-green-600">
                    <Activity className="h-8 w-8" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-sm border border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-2">Completed Workouts</p>
                    <p className="text-4xl font-bold text-gray-900">{completedWorkouts}</p>
                  </div>
                  <div className="text-green-600">
                    <CheckSquare className="h-8 w-8" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-sm border border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-2">Active Goals</p>
                    <p className="text-4xl font-bold text-gray-900">{activeGoals.length}</p>
                  </div>
                  <div className="text-green-600">
                    <Target className="h-8 w-8" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-sm border border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-2">Completed Goals</p>
                    <p className="text-4xl font-bold text-gray-900">{completedGoals.length}</p>
                  </div>
                  <div className="text-green-600">
                    <TrendingUp className="h-8 w-8" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Wellbeing Section */}
          <Card className="bg-white shadow-sm border border-gray-200">
            <CardContent className="p-6">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-2">
                  <Heart className="w-5 h-5 text-red-500" />
                  How are you feeling today?
                </h3>
                <p className="text-gray-600">Rate your overall well-being and track your emotions</p>
              </div>
              <div>
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-900 mb-2">Overall Score (1-10)</p>
                  <Slider
                    value={wellbeingScore}
                    onValueChange={setWellbeingScore}
                    max={10}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "workouts" && <WorkoutsView workouts={workouts} onRefresh={fetchData} />}

      {activeTab === "goals" && <GoalsView goals={goals} onRefresh={fetchData} />}
    </div>
  )
}
