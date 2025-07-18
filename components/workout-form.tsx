"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { supabase } from "@/lib/supabase"
import { X, Mountain } from "lucide-react"

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

interface WorkoutFormProps {
  workout?: Workout | null
  onClose: () => void
  onSave: () => void
}

export function WorkoutForm({ workout, onClose, onSave }: WorkoutFormProps) {
  const [formData, setFormData] = useState({
    activity_type: "",
    title: "",
    description: "",
    duration_minutes: "",
    distance: "",
    elevation_gain: "",
    difficulty: "",
    location: "",
    notes: "",
    date: new Date().toISOString().split("T")[0],
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (workout) {
      setFormData({
        activity_type: workout.activity_type || "",
        title: workout.title || "",
        description: workout.description || "",
        duration_minutes: workout.duration_minutes?.toString() || "",
        distance: workout.distance?.toString() || "",
        elevation_gain: workout.elevation_gain?.toString() || "",
        difficulty: workout.difficulty || "",
        location: workout.location || "",
        notes: workout.notes || "",
        date: workout.date || new Date().toISOString().split("T")[0],
      })
    }
  }, [workout])

  const validateForm = () => {
    if (!formData.activity_type) {
      setError("Please select an activity type")
      return false
    }
    if (!formData.title.trim()) {
      setError("Please enter a workout title")
      return false
    }
    if (!formData.date) {
      setError("Please select a workout date")
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!validateForm()) return

    setLoading(true)

    try {
      const data = {
        ...formData,
        duration_minutes: formData.duration_minutes ? Number.parseInt(formData.duration_minutes) : null,
        distance: formData.distance ? Number.parseFloat(formData.distance) : null,
        elevation_gain: formData.elevation_gain ? Number.parseInt(formData.elevation_gain) : null,
      }

      if (workout) {
        const { error: updateError } = await supabase.from("workouts").update(data).eq("id", workout.id)
        if (updateError) throw updateError
      } else {
        const { error: insertError } = await supabase.from("workouts").insert([data])
        if (insertError) throw insertError
      }

      onSave()
    } catch (err: any) {
      console.error("Error saving workout:", err)
      setError(err.message || "Failed to save workout. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleCloseForm = () => {
    setError("")
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-blue-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
              <Mountain className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{workout ? "Edit Workout" : "Add New Workout"}</h2>
              <p className="text-sm text-gray-600">Update your workout details</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCloseForm}
            className="h-10 w-10 p-0 hover:bg-white/50 rounded-full"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          {/* Activity Type and Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="activity_type" className="text-sm font-medium text-gray-700">
                Activity Type *
              </Label>
              <Select
                value={formData.activity_type}
                onValueChange={(value) => setFormData({ ...formData, activity_type: value })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select activity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="running">🏃‍♂️ Running</SelectItem>
                  <SelectItem value="climbing">🧗‍♂️ Climbing</SelectItem>
                  <SelectItem value="hiking">🥾 Hiking</SelectItem>
                  <SelectItem value="snowboarding">🏂 Snowboarding</SelectItem>
                  <SelectItem value="cycling">🚴‍♂️ Cycling</SelectItem>
                  <SelectItem value="swimming">🏊‍♂️ Swimming</SelectItem>
                  <SelectItem value="yoga">🧘‍♀️ Yoga</SelectItem>
                  <SelectItem value="strength">💪 Strength Training</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date" className="text-sm font-medium text-gray-700">
                Workout Date *
              </Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full"
                required
              />
            </div>
          </div>

          {/* Workout Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium text-gray-700">
              Workout Title *
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Morning trail run, Rock climbing session"
              className="w-full"
              required
            />
          </div>

          {/* Workout Details */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium text-gray-700">
              Workout Description
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe your workout experience, conditions, achievements..."
              className="w-full min-h-[100px] resize-none"
            />
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="duration_minutes" className="text-sm font-medium text-gray-700">
                Duration (minutes)
              </Label>
              <Input
                id="duration_minutes"
                type="number"
                min="1"
                value={formData.duration_minutes}
                onChange={(e) => setFormData({ ...formData, duration_minutes: e.target.value })}
                placeholder="60"
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="distance" className="text-sm font-medium text-gray-700">
                Distance (miles)
              </Label>
              <Input
                id="distance"
                type="number"
                step="0.1"
                min="0"
                value={formData.distance}
                onChange={(e) => setFormData({ ...formData, distance: e.target.value })}
                placeholder="5.2"
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="elevation_gain" className="text-sm font-medium text-gray-700">
                Elevation (feet)
              </Label>
              <Input
                id="elevation_gain"
                type="number"
                min="0"
                value={formData.elevation_gain}
                onChange={(e) => setFormData({ ...formData, elevation_gain: e.target.value })}
                placeholder="1200"
                className="w-full"
              />
            </div>
          </div>

          {/* Location and Difficulty */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="location" className="text-sm font-medium text-gray-700">
                Location
              </Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g., Blue Ridge Trail, Central Park"
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="difficulty" className="text-sm font-medium text-gray-700">
                Intensity Level
              </Label>
              <Select
                value={formData.difficulty}
                onValueChange={(value) => setFormData({ ...formData, difficulty: value })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select intensity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Easy">🟢 Easy</SelectItem>
                  <SelectItem value="Moderate">🟡 Moderate</SelectItem>
                  <SelectItem value="Hard">🟠 Hard</SelectItem>
                  <SelectItem value="Expert">🔴 Expert</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes" className="text-sm font-medium text-gray-700">
              Additional Notes
            </Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Weather conditions, equipment used, personal achievements..."
              className="w-full min-h-[80px] resize-none"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-4 pt-6">
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white py-3"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {workout ? "Updating..." : "Creating..."}
                </>
              ) : workout ? (
                "Update Workout"
              ) : (
                "Create Workout"
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleCloseForm}
              className="px-8 bg-white hover:bg-gray-50"
              disabled={loading}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
