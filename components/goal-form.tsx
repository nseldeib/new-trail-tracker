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

interface GoalFormProps {
  goal?: any
  onClose: () => void
  onSave: () => void
}

export function GoalForm({ goal, onClose, onSave }: GoalFormProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    activity_type: "",
    target_value: "",
    current_value: "",
    unit: "",
    target_date: "",
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (goal) {
      setFormData({
        title: goal.title || "",
        description: goal.description || "",
        activity_type: goal.activity_type || "",
        target_value: goal.target_value?.toString() || "",
        current_value: goal.current_value?.toString() || "",
        unit: goal.unit || "",
        target_date: goal.target_date || "",
      })
    }
  }, [goal])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const data = {
        ...formData,
        target_value: formData.target_value ? Number.parseFloat(formData.target_value) : null,
        current_value: formData.current_value ? Number.parseFloat(formData.current_value) : 0,
      }

      if (goal) {
        await supabase.from("goals").update(data).eq("id", goal.id)
      } else {
        await supabase.from("goals").insert([data])
      }

      onSave()
    } catch (error) {
      console.error("Error saving goal:", error)
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
            🎯 {goal ? "Edit Goal" : "Add New Goal"}
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Activity Type and Target Date */}
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
                  <SelectItem value="general">🎯 General</SelectItem>
                  <SelectItem value="running">🏃‍♂️ Running</SelectItem>
                  <SelectItem value="climbing">🧗‍♂️ Climbing</SelectItem>
                  <SelectItem value="hiking">🥾 Hiking</SelectItem>
                  <SelectItem value="snowboarding">🏂 Snowboarding</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="target_date" className="text-sm font-medium text-gray-700">
                Target Date
              </Label>
              <Input
                id="target_date"
                type="date"
                value={formData.target_date}
                onChange={(e) => setFormData({ ...formData, target_date: e.target.value })}
                className="w-full"
              />
            </div>
          </div>

          {/* Goal Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium text-gray-700">
              Goal Title
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Run 100 miles this month, Climb 5.10a route"
              className="w-full"
              required
            />
          </div>

          {/* Goal Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium text-gray-700">
              Goal Description
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe your goal, motivation, and any specific requirements..."
              className="w-full min-h-[100px] resize-none"
            />
          </div>

          {/* Target Value and Unit */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="target_value" className="text-sm font-medium text-gray-700">
                Target Value
              </Label>
              <Input
                id="target_value"
                type="number"
                step="0.1"
                value={formData.target_value}
                onChange={(e) => setFormData({ ...formData, target_value: e.target.value })}
                placeholder="e.g., 100, 5, 10"
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="unit" className="text-sm font-medium text-gray-700">
                Unit
              </Label>
              <Input
                id="unit"
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                placeholder="e.g., miles, routes, peaks, days"
                className="w-full"
              />
            </div>
          </div>

          {/* Priority Level */}
          <div className="space-y-2">
            <Label htmlFor="priority" className="text-sm font-medium text-gray-700">
              Priority Level
            </Label>
            <Select
              value={formData.current_value.toString()}
              onValueChange={(value) => setFormData({ ...formData, current_value: value })}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Low Priority</SelectItem>
                <SelectItem value="2">Medium Priority</SelectItem>
                <SelectItem value="3">High Priority</SelectItem>
                <SelectItem value="4">Critical Priority</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={loading} className="flex-1 bg-gray-900 hover:bg-gray-800 text-white">
              {loading ? "Saving..." : goal ? "Update Goal" : "Save Goal"}
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
