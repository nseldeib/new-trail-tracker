"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { supabase } from "@/lib/supabase"
import { X } from "lucide-react"

interface TodoFormProps {
  todo?: any
  onClose: () => void
  onSave: () => void
}

export function TodoForm({ todo, onClose, onSave }: TodoFormProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    activity_type: "",
    priority: "Medium",
    due_date: "",
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (todo) {
      setFormData({
        title: todo.title || "",
        description: todo.description || "",
        activity_type: todo.activity_type || "",
        priority: todo.priority || "Medium",
        due_date: todo.due_date || "",
      })
    }
  }, [todo])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (todo) {
        await supabase.from("todos").update(formData).eq("id", todo.id)
      } else {
        await supabase.from("todos").insert([formData])
      }

      onSave()
    } catch (error) {
      console.error("Error saving todo:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl bg-white/10 backdrop-blur-lg border-white/20 max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white">{todo ? "Edit To-Do" : "Add New To-Do"}</CardTitle>
              <CardDescription className="text-purple-200">Keep track of your adventure tasks</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose} className="text-white hover:bg-white/20">
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-white">
                Task Title
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="bg-white/10 border-white/20 text-white placeholder:text-purple-200"
                placeholder="e.g., Buy new hiking boots"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-white">
                Description
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="bg-white/10 border-white/20 text-white placeholder:text-purple-200"
                placeholder="Additional details about the task"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="activity_type" className="text-white">
                  Related Activity
                </Label>
                <Select
                  value={formData.activity_type}
                  onValueChange={(value) => setFormData({ ...formData, activity_type: value })}
                >
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
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
                <Label htmlFor="priority" className="text-white">
                  Priority
                </Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value) => setFormData({ ...formData, priority: value })}
                >
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="due_date" className="text-white">
                  Due Date
                </Label>
                <Input
                  id="due_date"
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                  className="bg-white/10 border-white/20 text-white"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                {loading ? "Saving..." : todo ? "Update To-Do" : "Add To-Do"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
