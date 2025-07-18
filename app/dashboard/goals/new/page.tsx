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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { supabase } from "@/lib/supabase"
import { ArrowLeft, Target, Plus } from "lucide-react"
import { LoadingScreen } from "@/components/loading-screen"

export default function NewGoalPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    activity_type: "",
    target_value: "",
    unit: "",
    target_date: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  if (authLoading) {
    return <LoadingScreen message="Loading..." />
  }

  if (!user) {
    router.push("/auth/signin")
    return <LoadingScreen message="Redirecting to sign in..." />
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      // Validation
      if (!formData.title.trim()) {
        throw new Error("Goal title is required")
      }

      const data = {
        ...formData,
        target_value: formData.target_value ? Number.parseFloat(formData.target_value) : null,
        current_value: 0,
        is_completed: false,
      }

      const { error: insertError } = await supabase.from("goals").insert([data])

      if (insertError) {
        throw insertError
      }

      // Success - redirect back to goals page
      router.push("/dashboard/goals")
    } catch (err: any) {
      console.error("Error saving goal:", err)
      setError(err.message || "Failed to save goal. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const activityTypes = [
    { value: "general", label: "🎯 General", icon: "🎯" },
    { value: "running", label: "🏃‍♂️ Running", icon: "🏃‍♂️" },
    { value: "climbing", label: "🧗‍♂️ Climbing", icon: "🧗‍♂️" },
    { value: "hiking", label: "🥾 Hiking", icon: "🥾" },
    { value: "snowboarding", label: "🏂 Snowboarding", icon: "🏂" },
    { value: "cycling", label: "🚴‍♂️ Cycling", icon: "🚴‍♂️" },
    { value: "swimming", label: "🏊‍♂️ Swimming", icon: "🏊‍♂️" },
  ]

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Target className="w-8 h-8 text-green-600" />
              Create New Goal
            </h1>
            <p className="text-gray-600 mt-1">Set a new adventure goal and track your progress</p>
          </div>
        </div>

        {/* Main Form Card */}
        <Card className="shadow-lg border-0 bg-white">
          <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50 border-b border-gray-100">
            <CardTitle className="text-xl text-gray-900 flex items-center gap-2">
              <Plus className="w-5 h-5 text-green-600" />
              Goal Details
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Error Display */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-red-800">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span className="font-medium">Error</span>
                  </div>
                  <p className="text-red-700 mt-1">{error}</p>
                </div>
              )}

              {/* Activity Type */}
              <div className="space-y-2">
                <Label htmlFor="activity_type" className="text-sm font-semibold text-gray-700">
                  Activity Type *
                </Label>
                <Select
                  value={formData.activity_type}
                  onValueChange={(value) => setFormData({ ...formData, activity_type: value })}
                  required
                >
                  <SelectTrigger className="w-full h-12">
                    <SelectValue placeholder="Choose your activity type" />
                  </SelectTrigger>
                  <SelectContent>
                    {activityTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Goal Title */}
              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm font-semibold text-gray-700">
                  Goal Title *
                </Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Run 100 miles this month, Climb 5.10a route"
                  className="w-full h-12 text-base"
                  required
                />
              </div>

              {/* Goal Description */}
              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-semibold text-gray-700">
                  Goal Description
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe your goal, motivation, and any specific requirements..."
                  className="w-full min-h-[120px] resize-none text-base"
                />
              </div>

              {/* Target Value and Unit */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="target_value" className="text-sm font-semibold text-gray-700">
                    Target Value
                  </Label>
                  <Input
                    id="target_value"
                    type="number"
                    step="0.1"
                    value={formData.target_value}
                    onChange={(e) => setFormData({ ...formData, target_value: e.target.value })}
                    placeholder="e.g., 100, 5, 10"
                    className="w-full h-12 text-base"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="unit" className="text-sm font-semibold text-gray-700">
                    Unit
                  </Label>
                  <Input
                    id="unit"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    placeholder="e.g., miles, routes, peaks, days"
                    className="w-full h-12 text-base"
                  />
                </div>
              </div>

              {/* Target Date */}
              <div className="space-y-2">
                <Label htmlFor="target_date" className="text-sm font-semibold text-gray-700">
                  Target Date
                </Label>
                <Input
                  id="target_date"
                  type="date"
                  value={formData.target_date}
                  onChange={(e) => setFormData({ ...formData, target_date: e.target.value })}
                  className="w-full h-12 text-base"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-100">
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1 h-12 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold text-base shadow-lg"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Creating Goal...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Target className="w-5 h-5" />
                      Create Goal
                    </div>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  className="sm:w-32 h-12 border-gray-300 text-gray-700 hover:bg-gray-50 font-medium text-base"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Quick Tips */}
        <Card className="mt-6 bg-gradient-to-r from-blue-50 to-green-50 border-blue-200">
          <CardContent className="p-4">
            <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">💡 Quick Tips</h3>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Be specific with your goal title (e.g., "Run 5K in under 25 minutes")</li>
              <li>• Set realistic target dates to stay motivated</li>
              <li>• Use measurable units to track your progress effectively</li>
              <li>• Add a description to remind yourself why this goal matters</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
