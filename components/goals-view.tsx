"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { GoalForm } from "./goal-form"
import { Plus, Target, Trophy, CheckCircle, Star, Edit, Trash2, Circle } from "lucide-react"
import { supabase } from "@/lib/supabase"

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
  const [showGoalForm, setShowGoalForm] = useState(false)
  const [editingGoal, setEditingGoal] = useState<any>(null)

  const deleteGoal = async (id: string) => {
    await supabase.from("goals").delete().eq("id", id)
    onRefresh()
  }

  const toggleGoalCompletion = async (goal: Goal) => {
    await supabase.from("goals").update({ is_completed: !goal.is_completed }).eq("id", goal.id)
    onRefresh()
  }

  const getGoalIcon = (goal: Goal, index: number) => {
    if (goal.is_completed) {
      return <Target key="completed-icon" className="w-5 h-5 text-green-600" />
    }

    // Different icons for different goals
    const icons = [
      <Trophy key="trophy-icon" className="w-5 h-5 text-yellow-600" />,
      <Target key="target-icon" className="w-5 h-5 text-red-500" />,
      <CheckCircle key="check-circle-icon" className="w-5 h-5 text-green-600" />,
    ]

    return icons[index % icons.length] || <Target key="default-icon" className="w-5 h-5 text-gray-600" />
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-1">Your Goals</h1>
          <p className="text-gray-600">Set and achieve your outdoor adventure goals</p>
        </div>
        <Button
          onClick={() => setShowGoalForm(true)}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Goal
        </Button>
      </div>

      {goals.length === 0 ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-4 text-green-600">
              <Target className="w-full h-full" />
            </div>
            <h2 className="text-xl font-semibold text-gray-700 mb-2">No goals yet</h2>
            <p className="text-gray-500 mb-4">Set your first outdoor adventure goal!</p>
            <Button
              onClick={() => setShowGoalForm(true)}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Goal
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {goals.map((goal, index) => (
            <Card key={goal.id} className="bg-white shadow-sm hover:shadow-md transition-shadow border border-gray-200">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <button onClick={() => toggleGoalCompletion(goal)} className="flex-shrink-0">
                      {goal.is_completed ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <Circle className="w-4 h-4 text-gray-400 hover:text-green-600 transition-colors" />
                      )}
                    </button>
                    <div className="flex items-center gap-2">
                      {getGoalIcon(goal, index)}
                      <h3 className="font-semibold text-gray-900 text-sm">{goal.title || `Goal ${index + 1}`}</h3>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 w-7 p-0 text-gray-400 hover:text-yellow-600 hover:bg-yellow-50"
                    >
                      <Star className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setEditingGoal(goal)
                        setShowGoalForm(true)
                      }}
                      className="h-7 w-7 p-0 text-gray-400 hover:text-green-600 hover:bg-green-50"
                    >
                      <Edit className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteGoal(goal.id)}
                      className="h-7 w-7 p-0 text-gray-400 hover:text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-3">
                  {goal.is_completed && (
                    <Badge className="bg-green-100 text-green-800 border border-green-200 text-xs">Achieved</Badge>
                  )}

                  <div className="text-xs text-gray-500">
                    {goal.target_date ? `Target: ${new Date(goal.target_date).toLocaleDateString()}` : "No target date"}
                  </div>

                  {goal.description && <p className="text-xs text-gray-600 line-clamp-2">{goal.description}</p>}

                  {goal.target_value && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs text-gray-600">
                        <span>Progress</span>
                        <span>
                          {goal.current_value}/{goal.target_value} {goal.unit}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full transition-all"
                          style={{ width: `${Math.min((goal.current_value / goal.target_value) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {showGoalForm && (
        <GoalForm
          goal={editingGoal}
          onClose={() => {
            setShowGoalForm(false)
            setEditingGoal(null)
          }}
          onSave={() => {
            onRefresh()
            setShowGoalForm(false)
            setEditingGoal(null)
          }}
        />
      )}
    </div>
  )
}
