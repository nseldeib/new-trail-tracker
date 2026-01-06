"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth-provider"
import { createClient } from "@/lib/supabase/client"
import { DashboardLayout } from "@/components/dashboard-layout"
import { WorkoutsView } from "@/components/workouts-view"
import { LoadingScreen } from "@/components/loading-screen"
import { useRouter } from "next/navigation"

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
  const { user, loading: authLoading } = useAuth()
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const router = useRouter()

  useEffect(() => {
    if (authLoading) return

    if (!user) {
      router.push("/auth/signin")
      return
    }

    fetchWorkouts()
  }, [user, authLoading, router])

  const fetchWorkouts = async () => {
    try {
      setLoading(true)
      setError("")

      const supabase = createClient()

      const { data, error: fetchError } = await supabase
        .from("workouts")
        .select("*")
        .order("date", { ascending: false })

      if (fetchError) {
        throw fetchError
      }

      setWorkouts(data || [])
    } catch (err: any) {
      console.error("Error fetching workouts:", err)
      setError("Failed to load workouts. Please try refreshing the page.")
    } finally {
      setLoading(false)
    }
  }

  if (authLoading || loading) {
    return <LoadingScreen message="Loading your workouts..." />
  }

  if (!user) {
    return <LoadingScreen message="Redirecting to sign in..." />
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="text-red-500 mb-4">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Something went wrong</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button onClick={fetchWorkouts} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg">
              Try Again
            </button>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <WorkoutsView workouts={workouts} onRefresh={fetchWorkouts} />
    </DashboardLayout>
  )
}
