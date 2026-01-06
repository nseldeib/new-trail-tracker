"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { WorkoutForm } from "./workout-form"
import { Plus, MapPin, Clock, TrendingUp, Edit, Trash2, Mountain } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-1">Your Workouts</h1>
          <p className="text-gray-600">Track and manage your outdoor adventures</p>
        </div>
        <Button
          onClick={() => router.push("/dashboard/workouts/new")}
          className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-6 py-3 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Workout
        </Button>
      </div>

      {workouts.length === 0 ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center max-w-md">
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-green-100 to-blue-100 rounded-full flex items-center justify-center">
              <Mountain className="w-12 h-12 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Start Your Fitness Journey</h2>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Ready to track your outdoor adventures? Create your first workout and start building healthy habits that
              last.
            </p>
            <Button
              onClick={() => router.push("/dashboard/workouts/new")}
              className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-8 py-3 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Your First Workout
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {workouts.map((workout) => (
            <Card
              key={workout.id}
              className="bg-white shadow-sm hover:shadow-lg transition-all duration-200 border border-gray-200 hover:border-green-200"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xl">{getActivityEmoji(workout.activity_type)}</span>
                      <CardTitle className="text-gray-900 text-lg leading-tight">{workout.title}</CardTitle>
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
