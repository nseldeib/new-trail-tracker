"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { createClient } from "@/lib/supabase/client"
import { X } from "lucide-react"

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

interface GoalFormProps {
  goal?: Goal | null
  onClose: () => void
  onSave: () => void
}

export function GoalForm({ goal, onClose, onSave }: GoalFormProps) {
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

  useEffect(() => {
    if (goal) {
      setFormData({
        title: goal.title || "",
        description: goal.description || "",
        activity_type: goal.activity_type || "",
        target_value: goal.target_value?.toString() || "",
        unit: goal.unit || "",
        target_date: goal.target_date || "",
      })
    }
  }, [goal])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      if (!formData.title.trim()) {
        throw new Error("Goal title is required")
      }

      const data = {
        ...formData,
        target_value: formData.target_value ? Number.parseFloat(formData.target_value) : null,
        current_value: goal?.current_value || 0,
        is_completed: goal?.is_completed || false,
      }

      const supabase = createClient()

      if (goal) {
        // Update existing goal
        const { error: updateError } = await supabase.from("goals").update(data).eq("id", goal.id)

        if (updateError) throw updateError
      } else {
        // Create new goal
        const { error: insertError } = await supabase.from("goals").insert([data])

        if (insertError) throw insertError
      }

      onSave()
    } catch (err: any) {
      console.error("Error saving goal:", err)
      setError(err.message || "Failed to save goal. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const activityTypes = [
    { value: "general", label: "🎯 General" },
    { value: "running", label: "🏃‍♂️ Running" },
    { value: "climbing", label: "🧗‍♂️ Climbing" },
    { value: "hiking", label: "🥾 Hiking" },
    { value: "snowboarding", label: "🏂 Snowboarding" },
    { value: "cycling", label: "🚴‍♂️ Cycling" },
    { value: "swimming", label: "🏊‍♂️ Swimming" },
  ]

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold">{goal ? "Edit Goal" : "Create New Goal"}</DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0 hover:bg-gray-100">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="activity_type">Activity Type</Label>
            <Select
              value={formData.activity_type}
              onValueChange={(value) => setFormData({ ...formData, activity_type: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose activity type" />
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

          <div className="space-y-2">
            <Label htmlFor="title">Goal Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Run 100 miles this month"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe your goal..."
              className="min-h-[80px] resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="target_value">Target Value</Label>
              <Input
                id="target_value"
                type="number"
                step="0.1"
                value={formData.target_value}
                onChange={(e) => setFormData({ ...formData, target_value: e.target.value })}
                placeholder="e.g., 100"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="unit">Unit</Label>
              <Input
                id="unit"
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                placeholder="e.g., miles"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="target_date">Target Date</Label>
            <Input
              id="target_date"
              type="date"
              value={formData.target_date}
              onChange={(e) => setFormData({ ...formData, target_date: e.target.value })}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={loading} className="flex-1 bg-green-600 hover:bg-green-700">
              {loading ? "Saving..." : goal ? "Update Goal" : "Create Goal"}
            </Button>
            <Button type="button" variant="outline" onClick={onClose} className="px-6 bg-transparent">
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
