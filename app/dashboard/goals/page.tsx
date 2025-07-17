"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth-provider"
import { supabase } from "@/lib/supabase"
import { GoalsView } from "@/components/goals-view"
import { DashboardLayout } from "@/components/dashboard-layout"
import { LoadingScreen } from "@/components/loading-screen"

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

export default function GoalsPage() {
  const { user } = useAuth()
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchGoals()
    }
  }, [user])

  const fetchGoals = async () => {
    try {
      const { data, error } = await supabase.from("goals").select("*").order("created_at", { ascending: false })

      if (error) throw error
      setGoals(data || [])
    } catch (error) {
      console.error("Error fetching goals:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <LoadingScreen message="Loading goals..." />
  }

  return (
    <DashboardLayout>
      <GoalsView goals={goals} onRefresh={fetchGoals} />
    </DashboardLayout>
  )
}
