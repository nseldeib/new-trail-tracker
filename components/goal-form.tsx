"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { GradientHeader } from "@/components/ui/gradient-header"
import { FormAlert } from "@/components/ui/form-alert"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { createClient } from "@/lib/supabase/client"
import { GOAL_ACTIVITY_TYPES } from "@/lib/activity-types"
import { GRADIENT, BUTTON_COMMON, MODAL } from "@/lib/styles"
import { Target, Plus } from "lucide-react"

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

  const handleCloseForm = () => {
    setError("")
    onClose()
  }

  return (
    <div className={MODAL.overlay}>
      <div className={MODAL.content}>
        <GradientHeader
          icon={Target}
          title={goal ? "Edit Goal" : "Create New Goal"}
          subtitle={goal ? "Update your goal details" : "Set a new fitness milestone"}
          theme="goal"
          onClose={handleCloseForm}
        />

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <FormAlert type="error" message={error} />}

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
                {GOAL_ACTIVITY_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.emoji} {type.label}
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
            <Button
              type="submit"
              disabled={loading}
              className={`flex-1 ${GRADIENT.goal.button} ${GRADIENT.goal.buttonHover} text-white ${BUTTON_COMMON}`}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <LoadingSpinner />
                  {goal ? "Updating..." : "Creating..."}
                </div>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  {goal ? "Update Goal" : "Create Goal"}
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleCloseForm}
              className="px-8 bg-white hover:bg-gray-50 border-2 hover:border-gray-300 transition-all duration-200"
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
