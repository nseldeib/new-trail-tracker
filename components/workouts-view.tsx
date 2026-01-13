"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { WorkoutForm } from "./workout-form"
import { Plus, MapPin, Clock, TrendingUp, Edit, Trash2, Mountain } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { getActivityGradient, getActivityColor } from "@/lib/utils/colors"
import { cn } from "@/lib/utils"

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

interface WorkoutsViewProps {
  workouts: Workout[]
  onRefresh: () => void
}

export function WorkoutsView({ workouts, onRefresh }: WorkoutsViewProps) {
  const router = useRouter()
  const [editingWorkout, setEditingWorkout] = useState<Workout | null>(null)
  const [showWorkoutForm, setShowWorkoutForm] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleEditWorkout = (workout: Workout) => {
    setEditingWorkout(workout)
    setShowWorkoutForm(true)
  }

  const handleCloseForm = () => {
    setShowWorkoutForm(false)
    setEditingWorkout(null)
  }

  const handleSaveWorkout = () => {
    onRefresh()
    handleCloseForm()
  }

  const deleteWorkout = async (id: string) => {
    if (!confirm("Are you sure you want to delete this workout?")) return

    try {
      setDeletingId(id)
      const supabase = createClient()
      const { error } = await supabase.from("workouts").delete().eq("id", id)

      if (error) throw error

      onRefresh()
    } catch (error) {
      console.error("Error deleting workout:", error)
      alert("Failed to delete workout. Please try again.")
    } finally {
      setDeletingId(null)
    }
  }

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case "Easy":
        return "bg-green-100 text-green-800 border-green-200"
      case "Moderate":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "Hard":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "Expert":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getActivityEmoji = (activity: string) => {
    switch (activity) {
      case "running":
        return "🏃‍♂️"
      case "climbing":
        return "🧗‍♂️"
      case "hiking":
        return "🥾"
      case "snowboarding":
        return "🏂"
      case "cycling":
        return "🚴‍♂️"
      case "swimming":
        return "🏊‍♂️"
      case "yoga":
        return "🧘‍♀️"
      case "strength":
        return "💪"
      default:
        return "🏃‍♂️"
    }
  }

  return (
    <div>
      {/* Vibrant Header */}
      <div className="relative bg-gradient-to-br from-teal-500 via-green-500 to-blue-500 rounded-xl p-6 mb-4 overflow-hidden">
        {/* Decorative overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />

        <div className="relative z-10 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1 drop-shadow-lg">Your Workouts</h1>
            <p className="text-white/90 text-sm">Track and manage your outdoor adventures</p>
          </div>
          <Button
            onClick={() => router.push("/dashboard/workouts/new")}
            variant="secondary"
            className="bg-white/90 hover:bg-white text-teal-600 shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Workout
          </Button>
        </div>
      </div>

      {workouts.length === 0 ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center max-w-md">
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-teal rounded-full flex items-center justify-center shadow-xl">
              <Mountain className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Start Your Fitness Journey</h2>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Ready to track your outdoor adventures? Create your first workout and start building healthy habits that
              last.
            </p>
            <Button
              onClick={() => router.push("/dashboard/workouts/new")}
              variant="gradient"
              className="shadow-lg hover:shadow-xl"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Your First Workout
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {workouts.map((workout) => (
            <Card
              key={workout.id}
              className="relative overflow-hidden bg-white hover:shadow-xl transition-all duration-200 group border-0"
              style={{
                background: `linear-gradient(135deg, ${getActivityColor(workout.activity_type)}08 0%, white 100%)`
              }}
            >
              {/* Colored accent strip */}
              <div
                className="absolute left-0 top-0 bottom-0 w-1.5 rounded-l-lg transition-all group-hover:w-2"
                style={{ background: getActivityGradient(workout.activity_type) }}
              />

              <CardHeader className="pb-3 ml-2">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div
                        className="p-2.5 rounded-md flex items-center justify-center shadow-sm border border-white"
                        style={{
                          background: workout.activity_type === 'running' ? 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)' :
                                     workout.activity_type === 'climbing' ? 'linear-gradient(135deg, #fed7aa 0%, #fdba74 100%)' :
                                     workout.activity_type === 'hiking' ? 'linear-gradient(135deg, #d9f99d 0%, #bef264 100%)' :
                                     workout.activity_type === 'snowboarding' ? 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)' :
                                     workout.activity_type === 'cycling' ? 'linear-gradient(135deg, #dbeafe 0%, #93c5fd 100%)' :
                                     workout.activity_type === 'swimming' ? 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)' :
                                     workout.activity_type === 'yoga' ? 'linear-gradient(135deg, #e9d5ff 0%, #d8b4fe 100%)' :
                                     workout.activity_type === 'strength' ? 'linear-gradient(135deg, #fce7f3 0%, #fbcfe8 100%)' :
                                     'linear-gradient(135deg, #e5e7eb 0%, #f3f4f6 100%)'
                        }}
                      >
                        <span className="text-2xl">{getActivityEmoji(workout.activity_type)}</span>
                      </div>
                      <CardTitle className="text-gray-900 text-base leading-tight">{workout.title}</CardTitle>
                    </div>
                    {workout.description && (
                      <CardDescription className="text-gray-600 text-sm line-clamp-2 leading-relaxed">
                        {workout.description}
                      </CardDescription>
                    )}
                  </div>
                  <div className="flex gap-1 ml-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEditWorkout(workout)}
                      className="h-8 w-8 p-0 text-gray-400 hover:text-green-600 hover:bg-green-50 transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteWorkout(workout.id)}
                      disabled={deletingId === workout.id}
                      className="h-8 w-8 p-0 text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                    >
                      {deletingId === workout.id ? (
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-red-600"></div>
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-4">
                  {workout.difficulty && (
                    <Badge className={`${getDifficultyColor(workout.difficulty)} border text-xs font-medium`}>
                      {workout.difficulty}
                    </Badge>
                  )}

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    {workout.duration_minutes && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Clock className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium">{workout.duration_minutes}min</span>
                      </div>
                    )}
                    {workout.distance && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <TrendingUp className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium">{workout.distance}mi</span>
                      </div>
                    )}
                    {workout.elevation_gain && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Mountain className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium">{workout.elevation_gain}ft</span>
                      </div>
                    )}
                    {workout.location && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <MapPin className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium truncate">{workout.location}</span>
                      </div>
                    )}
                  </div>

                  <div className="text-sm text-gray-500 font-medium">
                    {new Date(workout.date).toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </div>

                  {workout.notes && (
                    <p className="text-sm text-gray-600 bg-green-50 p-3 rounded-lg border border-green-100 line-clamp-2 leading-relaxed">
                      {workout.notes}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {showWorkoutForm && <WorkoutForm workout={editingWorkout} onClose={handleCloseForm} onSave={handleSaveWorkout} />}
    </div>
  )
}
