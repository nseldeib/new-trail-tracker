"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { supabase } from "@/lib/supabase"
import { X } from "lucide-react"

interface WorkoutFormProps {
  workout?: any
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const data = {
        ...formData,
        duration_minutes: formData.duration_minutes ? Number.parseInt(formData.duration_minutes) : null,
        distance: formData.distance ? Number.parseFloat(formData.distance) : null,
        elevation_gain: formData.elevation_gain ? Number.parseInt(formData.elevation_gain) : null,
      }

      if (workout) {
        await supabase.from("workouts").update(data).eq("id", workout.id)
      } else {
        await supabase.from("workouts").insert([data])
      }

      onSave()
    } catch (error) {
      console.error("Error saving workout:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            🏃 {workout ? "Edit Workout" : "Add New Workout"}
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Activity Type and Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="activity_type" className="text-sm font-medium text-gray-700">
                Activity Type
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
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date" className="text-sm font-medium text-gray-700">
                Workout Date
              </Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full"
              />
            </div>
          </div>

          {/* Workout Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium text-gray-700">
              Workout Title
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
              Workout Details
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Duration, notes, difficulty level, weather conditions..."
              className="w-full min-h-[100px] resize-none"
            />
          </div>

          {/* Distance and Location */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="distance" className="text-sm font-medium text-gray-700">
                Distance (miles)
              </Label>
              <Input
                id="distance"
                type="number"
                step="0.1"
                value={formData.distance}
                onChange={(e) => setFormData({ ...formData, distance: e.target.value })}
                placeholder="e.g., 5.2"
                className="w-full"
              />
            </div>

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
          </div>

          {/* Intensity/Priority */}
          <div className="space-y-2">
            <Label htmlFor="difficulty" className="text-sm font-medium text-gray-700">
              Intensity/Priority
            </Label>
            <Select
              value={formData.difficulty}
              onValueChange={(value) => setFormData({ ...formData, difficulty: value })}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select intensity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Easy">Low Intensity</SelectItem>
                <SelectItem value="Moderate">Medium Intensity</SelectItem>
                <SelectItem value="Hard">High Intensity</SelectItem>
                <SelectItem value="Expert">Maximum Intensity</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={loading} className="flex-1 bg-gray-900 hover:bg-gray-800 text-white">
              {loading ? "Saving..." : workout ? "Update Workout" : "Save Workout"}
            </Button>
            <Button type="button" variant="outline" onClick={onClose} className="px-6 bg-transparent">
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
