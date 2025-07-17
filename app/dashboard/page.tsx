"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { useAuth } from "@/components/auth-provider"
import { supabase } from "@/lib/supabase"
import { Target, CheckSquare, Activity, TrendingUp, Heart } from "lucide-react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { LoadingScreen } from "@/components/loading-screen"

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

export default function DashboardPage() {
  const { user } = useAuth()
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
    return <LoadingScreen message="Loading your adventures..." />
  }

  const completedWorkouts = workouts.length
  const activeGoals = goals.filter((g) => !g.is_completed)
  const completedGoals = goals.filter((g) => g.is_completed)

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-1">Welcome back!</h1>
        <p className="text-gray-600">Here's an overview of your fitness journey.</p>
      </div>

      {/* Stats Grid - Optimized for above the fold */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
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
      </div>

      {/* Wellbeing Section - Compact */}
      <Card className="bg-white shadow-sm border border-gray-200">
        <CardContent className="p-5">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-1">
              <Heart className="w-5 h-5 text-green-600" />
              How are you feeling today?
            </h3>
            <p className="text-gray-600 text-sm">Rate your overall well-being and track your emotions</p>
          </div>
          <div>
            <div className="mb-3">
              <p className="text-sm font-medium text-gray-900 mb-2">Overall Score (1-10): {wellbeingScore[0]}</p>
              <Slider
                value={wellbeingScore}
                onValueChange={setWellbeingScore}
                max={10}
                min={1}
                step={1}
                className="w-full [&_[role=slider]]:bg-green-600 [&_[role=slider]]:border-green-600 [&_.bg-primary]:bg-green-600"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  )
}
