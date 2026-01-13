"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { GoalForm } from "./goal-form"
import { Plus, Target, Trophy, CheckCircle, Star, Edit, Trash2, Circle } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { getActivityGradient, getActivityColor } from "@/lib/utils/colors"
import { ProgressRing } from "@/components/charts/progress-ring"
import { cn } from "@/lib/utils"

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
      {/* Vibrant Header */}
      <div className="relative bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 rounded-xl p-6 mb-4 overflow-hidden">
        {/* Decorative overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />

        <div className="relative z-10 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1 drop-shadow-lg">Your Goals</h1>
            <p className="text-white/90 text-sm">Set and achieve your fitness milestones</p>
          </div>
          <Button
            onClick={() => router.push("/dashboard/goals/new")}
            variant="secondary"
            className="bg-white/90 hover:bg-white text-purple-600 shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Goal
          </Button>
        </div>
      </div>

      {goals.length === 0 ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center max-w-md">
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-purple rounded-full flex items-center justify-center shadow-xl">
              <Target className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Ready to set your first goal?</h2>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Goals help you stay motivated and track your progress. Whether it's running your first 5K or climbing a
              new route, every adventure starts with a goal.
            </p>
            <Button
              onClick={() => router.push("/dashboard/goals/new")}
              variant="gradient-purple"
              className="shadow-lg hover:shadow-xl"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Your First Goal
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {goals.map((goal, index) => (
            <Card
              key={goal.id}
              className="relative overflow-hidden bg-white hover:shadow-xl transition-all duration-200 group border-0"
              style={{
                background: goal.activity_type
                  ? `linear-gradient(135deg, ${getActivityColor(goal.activity_type || "general")}08 0%, white 100%)`
                  : 'linear-gradient(135deg, rgba(168, 85, 247, 0.03) 0%, white 100%)'
              }}
            >
              {/* Colored accent strip */}
              <div
                className="absolute left-0 top-0 bottom-0 w-1.5 rounded-l-lg transition-all group-hover:w-2"
                style={{
                  background: goal.activity_type
                    ? getActivityGradient(goal.activity_type || "general")
                    : 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)'
                }}
              />

              <CardContent className="p-4 ml-2">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2 flex-1">
                    {/* Activity icon with complementary background */}
                    <div
                      className="p-2.5 rounded-md flex items-center justify-center shadow-sm flex-shrink-0 border border-white"
                      style={{
                        background: goal.activity_type === 'running' ? 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)' :
                                   goal.activity_type === 'climbing' ? 'linear-gradient(135deg, #fed7aa 0%, #fdba74 100%)' :
                                   goal.activity_type === 'hiking' ? 'linear-gradient(135deg, #d9f99d 0%, #bef264 100%)' :
                                   goal.activity_type === 'snowboarding' ? 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)' :
                                   goal.activity_type === 'cycling' ? 'linear-gradient(135deg, #dbeafe 0%, #93c5fd 100%)' :
                                   goal.activity_type === 'swimming' ? 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)' :
                                   goal.activity_type === 'yoga' ? 'linear-gradient(135deg, #e9d5ff 0%, #d8b4fe 100%)' :
                                   goal.activity_type === 'strength' ? 'linear-gradient(135deg, #fce7f3 0%, #fbcfe8 100%)' :
                                   'linear-gradient(135deg, #e9d5ff 0%, #f3e8ff 100%)'
                      }}
                    >
                      <span className="text-2xl">{getActivityIcon(goal.activity_type || "general")}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 text-base leading-tight truncate">
                        {goal.title || `Goal ${index + 1}`}
                      </h3>
                      {goal.is_completed && (
                        <Badge className="bg-green-100 text-green-700 border-green-200 text-xs font-medium mt-1 inline-flex">
                          ✓ Achieved
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEditGoal(goal)}
                      className="h-6 w-6 p-0 text-gray-400 hover:text-purple-600 hover:bg-purple-50"
                    >
                      <Edit className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteGoal(goal.id)}
                      className="h-6 w-6 p-0 text-gray-400 hover:text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  {goal.description && (
                    <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">{goal.description}</p>
                  )}

                  {goal.target_value && (
                    <div className="flex items-center gap-3">
                      {/* Progress Ring */}
                      <ProgressRing
                        progress={(goal.current_value / goal.target_value) * 100}
                        size={50}
                        strokeWidth={5}
                        showPercentage={false}
                        autoColor
                        glow
                      />
                      <div className="flex-1">
                        <div className="text-xs text-gray-600 font-medium">
                          {goal.current_value} / {goal.target_value} {goal.unit}
                        </div>
                        <div className="text-xs text-gray-500">
                          {Math.round((goal.current_value / goal.target_value) * 100)}% complete
                        </div>
                        {goal.target_date && (
                          <div className="text-xs text-gray-500 mt-1">
                            🗓️ {new Date(goal.target_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {!goal.target_value && goal.target_date && (
                    <div className="text-xs text-gray-500">
                      🗓️ Target: {new Date(goal.target_date).toLocaleDateString()}
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
