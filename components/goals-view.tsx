"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { GoalForm } from "./goal-form"
import { Plus, Target, Trophy, CheckCircle, Star, Edit, Trash2, Circle } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

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

interface GoalsViewProps {
  goals: Goal[]
  onRefresh: () => void
}

export function GoalsView({ goals, onRefresh }: GoalsViewProps) {
  const router = useRouter()
  const [showGoalForm, setShowGoalForm] = useState(false)
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null)

  const deleteGoal = async (id: string) => {
    if (!confirm("Are you sure you want to delete this goal?")) {
      return
    }

    try {
      const supabase = createClient()
      const { error } = await supabase.from("goals").delete().eq("id", id)
      if (error) throw error
      onRefresh()
    } catch (error) {
      console.error("Error deleting goal:", error)
      alert("Failed to delete goal. Please try again.")
    }
  }

  const toggleGoalCompletion = async (goal: Goal) => {
    try {
      const supabase = createClient()
      const { error } = await supabase.from("goals").update({ is_completed: !goal.is_completed }).eq("id", goal.id)

      if (error) throw error
      onRefresh()
    } catch (error) {
      console.error("Error updating goal:", error)
      alert("Failed to update goal. Please try again.")
    }
  }

  const handleEditGoal = (goal: Goal) => {
    setEditingGoal(goal)
    setShowGoalForm(true)
  }

  const handleCloseForm = () => {
    setShowGoalForm(false)
    setEditingGoal(null)
  }

  const handleSaveForm = () => {
    onRefresh()
    setShowGoalForm(false)
    setEditingGoal(null)
  }

  const getGoalIcon = (goal: Goal, index: number) => {
    if (goal.is_completed) {
      return <Target key="completed-icon" className="w-5 h-5 text-green-600" />
    }

    const icons = [
      <Trophy key="trophy-icon" className="w-5 h-5 text-yellow-600" />,
      <Target key="target-icon" className="w-5 h-5 text-red-500" />,
      <CheckCircle key="check-circle-icon" className="w-5 h-5 text-green-600" />,
    ]

    return icons[index % icons.length] || <Target key="default-icon" className="w-5 h-5 text-gray-600" />
  }

  const getActivityIcon = (activityType: string) => {
    const icons: { [key: string]: string } = {
      general: "🎯",
      running: "🏃‍♂️",
      climbing: "🧗‍♂️",
      hiking: "🥾",
      snowboarding: "🏂",
      cycling: "🚴‍♂️",
      swimming: "🏊‍♂️",
    }
    return icons[activityType] || "🎯"
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-1">Your Goals</h1>
          <p className="text-gray-600">Set and achieve your outdoor adventure goals</p>
        </div>
        <Button
          onClick={() => router.push("/dashboard/goals/new")}
          className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-6 py-3 rounded-lg transition-all shadow-lg hover:shadow-xl"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Goal
        </Button>
      </div>

      {goals.length === 0 ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center max-w-md">
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-green-100 to-blue-100 rounded-full flex items-center justify-center">
              <Target className="w-12 h-12 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Ready to set your first goal?</h2>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Goals help you stay motivated and track your progress. Whether it's running your first 5K or climbing a
              new route, every adventure starts with a goal.
            </p>
            <Button
              onClick={() => router.push("/dashboard/goals/new")}
              className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-8 py-3 rounded-lg transition-all shadow-lg hover:shadow-xl text-base font-semibold"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Your First Goal
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {goals.map((goal, index) => (
            <Card
              key={goal.id}
              className="bg-white shadow-sm hover:shadow-lg transition-all duration-200 border border-gray-200 hover:border-green-200"
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <button onClick={() => toggleGoalCompletion(goal)} className="flex-shrink-0">
                      {goal.is_completed ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <Circle className="w-5 h-5 text-gray-400 hover:text-green-600 transition-colors" />
                      )}
                    </button>
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{getActivityIcon(goal.activity_type || "general")}</span>
                      <h3 className="font-semibold text-gray-900 text-base leading-tight">
                        {goal.title || `Goal ${index + 1}`}
                      </h3>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0 text-gray-400 hover:text-yellow-600 hover:bg-yellow-50"
                    >
                      <Star className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEditGoal(goal)}
                      className="h-8 w-8 p-0 text-gray-400 hover:text-green-600 hover:bg-green-50"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteGoal(goal.id)}
                      className="h-8 w-8 p-0 text-gray-400 hover:text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  {goal.is_completed && (
                    <Badge className="bg-green-100 text-green-800 border border-green-200 text-xs font-medium">
                      ✅ Achieved
                    </Badge>
                  )}

                  {goal.target_date && (
                    <div className="text-sm text-gray-500">
                      🗓️ Target: {new Date(goal.target_date).toLocaleDateString()}
                    </div>
                  )}

                  {goal.description && (
                    <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">{goal.description}</p>
                  )}

                  {goal.target_value && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm text-gray-600">
                        <span className="font-medium">Progress</span>
                        <span className="font-mono">
                          {goal.current_value}/{goal.target_value} {goal.unit}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className="bg-gradient-to-r from-green-500 to-green-600 h-2.5 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min((goal.current_value / goal.target_value) * 100, 100)}%` }}
                        />
                      </div>
                      <div className="text-xs text-gray-500 text-right">
                        {Math.round((goal.current_value / goal.target_value) * 100)}% complete
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {showGoalForm && <GoalForm goal={editingGoal} onClose={handleCloseForm} onSave={handleSaveForm} />}
    </div>
  )
}
