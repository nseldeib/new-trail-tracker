"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { WorkoutForm } from "./workout-form"
import { Plus, MapPin, Clock, TrendingUp, Edit, Trash2, Mountain } from "lucide-react"
import { supabase } from "@/lib/supabase"

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
  const [showWorkoutForm, setShowWorkoutForm] = useState(false)
  const [editingWorkout, setEditingWorkout] = useState<any>(null)

  const deleteWorkout = async (id: string) => {
    await supabase.from("workouts").delete().eq("id", id)
    onRefresh()
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
          onClick={() => setShowWorkoutForm(true)}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Workout
        </Button>
      </div>

      {workouts.length === 0 ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-4 text-green-600">
              <Mountain className="w-full h-full" />
            </div>
            <h2 className="text-xl font-semibold text-gray-700 mb-2">No workouts yet</h2>
            <p className="text-gray-500 mb-4">Start tracking your outdoor adventures!</p>
            <Button
              onClick={() => setShowWorkoutForm(true)}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Workout
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {workouts.map((workout) => (
            <Card
              key={workout.id}
              className="bg-white shadow-sm hover:shadow-md transition-shadow border border-gray-200"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">{getActivityEmoji(workout.activity_type)}</span>
                      <CardTitle className="text-gray-900 text-base">{workout.title}</CardTitle>
                    </div>
                    {workout.description && (
                      <CardDescription className="text-gray-600 text-sm line-clamp-2">
                        {workout.description}
                      </CardDescription>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setEditingWorkout(workout)
                        setShowWorkoutForm(true)
                      }}
                      className="h-7 w-7 p-0 text-gray-400 hover:text-green-600 hover:bg-green-50"
                    >
                      <Edit className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteWorkout(workout.id)}
                      className="h-7 w-7 p-0 text-gray-400 hover:text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {workout.difficulty && (
                    <Badge className={`${getDifficultyColor(workout.difficulty)} border text-xs`}>
                      {workout.difficulty}
                    </Badge>
                  )}

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    {workout.duration_minutes && (
                      <div className="flex items-center gap-1 text-gray-600">
                        <Clock className="w-3 h-3 text-green-600" />
                        <span className="text-xs">{workout.duration_minutes}min</span>
                      </div>
                    )}
                    {workout.distance && (
                      <div className="flex items-center gap-1 text-gray-600">
                        <TrendingUp className="w-3 h-3 text-green-600" />
                        <span className="text-xs">{workout.distance}mi</span>
                      </div>
                    )}
                    {workout.elevation_gain && (
                      <div className="flex items-center gap-1 text-gray-600">
                        <TrendingUp className="w-3 h-3 text-green-600" />
                        <span className="text-xs">{workout.elevation_gain}ft</span>
                      </div>
                    )}
                    {workout.location && (
                      <div className="flex items-center gap-1 text-gray-600">
                        <MapPin className="w-3 h-3 text-green-600" />
                        <span className="text-xs truncate">{workout.location}</span>
                      </div>
                    )}
                  </div>

                  <div className="text-xs text-gray-500">{new Date(workout.date).toLocaleDateString()}</div>

                  {workout.notes && (
                    <p className="text-xs text-gray-600 bg-green-50 p-2 rounded border border-green-100 line-clamp-2">
                      {workout.notes}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {showWorkoutForm && (
        <WorkoutForm
          workout={editingWorkout}
          onClose={() => {
            setShowWorkoutForm(false)
            setEditingWorkout(null)
          }}
          onSave={() => {
            onRefresh()
            setShowWorkoutForm(false)
            setEditingWorkout(null)
          }}
        />
      )}
    </div>
  )
}
