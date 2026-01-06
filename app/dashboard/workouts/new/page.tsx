"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import { ArrowLeft, Plus, Clock, MapPin, TrendingUp, Mountain, Lightbulb } from "lucide-react"
import { LoadingScreen } from "@/components/loading-screen"

export default function NewWorkoutPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
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

  if (authLoading) {
    return <LoadingScreen message="Loading..." />
  }

  if (!user) {
    router.push("/auth/signin")
    return <LoadingScreen message="Redirecting to sign in..." />
  }

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
        user_id: user.id,
      }

      const supabase = createClient()
      const { error: insertError } = await supabase.from("workouts").insert([data])

      if (insertError) {
        throw insertError
      }

      router.push("/dashboard/workouts")
    } catch (err: any) {
      console.error("Error saving workout:", err)
      setError(err.message || "Failed to save workout. Please try again.")
    } finally {
      setLoading(false)
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
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-teal-50">
        <div className="max-w-4xl mx-auto p-6">
          {/* Header */}
          <div className="mb-8">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="mb-4 text-gray-600 hover:text-gray-900 hover:bg-white/50"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Workouts
            </Button>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-full mb-4">
                <Plus className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Add New Workout</h1>
              <p className="text-gray-600">Track your outdoor adventure and fitness progress</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Form */}
            <div className="lg:col-span-2">
              <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0">
                <CardHeader className="pb-6">
                  <CardTitle className="text-xl text-gray-900 flex items-center gap-2">
                    <Mountain className="w-5 h-5 text-green-600" />
                    Workout Details
                  </CardTitle>
                  <CardDescription>Fill in the details of your workout session</CardDescription>
                </CardHeader>
                <CardContent>
                  {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-red-800 text-sm">{error}</p>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-6">
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
                          <SelectTrigger className="w-full bg-white">
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
                          className="w-full bg-white"
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
                        className="w-full bg-white"
                        required
                      />
                    </div>

                    {/* Workout Description */}
                    <div className="space-y-2">
                      <Label htmlFor="description" className="text-sm font-medium text-gray-700">
                        Workout Description
                      </Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Describe your workout experience, conditions, achievements..."
                        className="w-full min-h-[100px] resize-none bg-white"
                      />
                    </div>

                    {/* Metrics Row */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <Label
                          htmlFor="duration_minutes"
                          className="text-sm font-medium text-gray-700 flex items-center gap-1"
                        >
                          <Clock className="w-3 h-3 text-green-600" />
                          Duration (minutes)
                        </Label>
                        <Input
                          id="duration_minutes"
                          type="number"
                          min="1"
                          value={formData.duration_minutes}
                          onChange={(e) => setFormData({ ...formData, duration_minutes: e.target.value })}
                          placeholder="60"
                          className="w-full bg-white"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="distance" className="text-sm font-medium text-gray-700 flex items-center gap-1">
                          <TrendingUp className="w-3 h-3 text-green-600" />
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
                          className="w-full bg-white"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="elevation_gain"
                          className="text-sm font-medium text-gray-700 flex items-center gap-1"
                        >
                          <Mountain className="w-3 h-3 text-green-600" />
                          Elevation (feet)
                        </Label>
                        <Input
                          id="elevation_gain"
                          type="number"
                          min="0"
                          value={formData.elevation_gain}
                          onChange={(e) => setFormData({ ...formData, elevation_gain: e.target.value })}
                          placeholder="1200"
                          className="w-full bg-white"
                        />
                      </div>
                    </div>

                    {/* Location and Difficulty */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="location" className="text-sm font-medium text-gray-700 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-green-600" />
                          Location
                        </Label>
                        <Input
                          id="location"
                          value={formData.location}
                          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                          placeholder="e.g., Blue Ridge Trail, Central Park"
                          className="w-full bg-white"
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
                          <SelectTrigger className="w-full bg-white">
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
                        className="w-full min-h-[80px] resize-none bg-white"
                      />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-4 pt-6">
                      <Button
                        type="submit"
                        disabled={loading}
                        className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white py-3 text-base font-medium"
                      >
                        {loading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Creating Workout...
                          </>
                        ) : (
                          <>
                            <Plus className="w-4 h-4 mr-2" />
                            Create Workout
                          </>
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.back()}
                        className="px-8 bg-white hover:bg-gray-50"
                        disabled={loading}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Tips Sidebar */}
            <div className="lg:col-span-1">
              <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0 sticky top-6">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg text-gray-900 flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-yellow-500" />
                    Quick Tips
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3 text-sm text-gray-600">
                    <div className="flex gap-3">
                      <span className="text-green-600">📝</span>
                      <p>Use descriptive titles to easily find your workouts later</p>
                    </div>
                    <div className="flex gap-3">
                      <span className="text-blue-600">📍</span>
                      <p>Add location details to track your favorite spots</p>
                    </div>
                    <div className="flex gap-3">
                      <span className="text-purple-600">⏱️</span>
                      <p>Track duration and distance to monitor progress</p>
                    </div>
                    <div className="flex gap-3">
                      <span className="text-orange-600">📊</span>
                      <p>Set intensity levels to balance your training</p>
                    </div>
                    <div className="flex gap-3">
                      <span className="text-red-600">💡</span>
                      <p>Use notes to remember what worked well</p>
                    </div>
                  </div>

                  {formData.activity_type && (
                    <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">{getActivityEmoji(formData.activity_type)}</span>
                        <span className="font-medium text-gray-900 capitalize">{formData.activity_type} Workout</span>
                      </div>
                      <p className="text-sm text-gray-600">
                        Great choice! {formData.activity_type === "running" && "Remember to track your pace and route."}
                        {formData.activity_type === "climbing" && "Don't forget to note the route difficulty."}
                        {formData.activity_type === "hiking" && "Track elevation gain and trail conditions."}
                        {formData.activity_type === "snowboarding" && "Note snow conditions and runs completed."}
                        {formData.activity_type === "cycling" && "Track your route and average speed."}
                        {formData.activity_type === "swimming" && "Record laps and stroke technique."}
                        {formData.activity_type === "yoga" && "Note the style and focus areas."}
                        {formData.activity_type === "strength" && "Track sets, reps, and weights used."}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
