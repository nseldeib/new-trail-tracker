"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth-provider"
import { supabase } from "@/lib/supabase"
import { WorkoutsView } from "@/components/workouts-view"
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

export default function WorkoutsPage() {
  const { user } = useAuth()
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchWorkouts()
    }
  }, [user])

  const fetchWorkouts = async () => {
    try {
      const { data, error } = await supabase.from("workouts").select("*").order("date", { ascending: false })

      if (error) throw error
      setWorkouts(data || [])
    } catch (error) {
      console.error("Error fetching workouts:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <LoadingScreen message="Loading workouts..." />
  }

  return (
    <DashboardLayout>
      <WorkoutsView workouts={workouts} onRefresh={fetchWorkouts} />
    </DashboardLayout>
  )
}
