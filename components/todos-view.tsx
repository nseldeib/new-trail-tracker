"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { createClient } from "@/lib/supabase/client"
import { Plus, Calendar, Package, MapPin, Dumbbell, Trash2 } from "lucide-react"
import { useAuth } from "./auth-provider"

interface Todo {
  id: string
  title: string
  category: "gear" | "logistics" | "training"
  due_date: string | null
  completed: boolean
  created_at: string
}

const categoryIcons = {
  gear: Package,
  logistics: MapPin,
  training: Dumbbell,
}

const categoryLabels = {
  gear: "Gear",
  logistics: "Logistics",
  training: "Training",
}

export function TodosView() {
  const supabase = createClient()
  const { user } = useAuth()
  const [todos, setTodos] = useState<Todo[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    category: "" as "gear" | "logistics" | "training" | "",
    due_date: "",
  })

  useEffect(() => {
    if (user) {
      fetchTodos()
    }
  }, [user])

  const fetchTodos = async () => {
    try {
      const { data, error } = await supabase
        .from("todos")
        .select("*")
        .order("completed", { ascending: true })
        .order("created_at", { ascending: false })

      if (error) throw error
      setTodos(data || [])
    } catch (error) {
      console.error("Error fetching todos:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title.trim() || !formData.category) return

    setSubmitting(true)
    try {
      const { error } = await supabase.from("todos").insert([
        {
          title: formData.title.trim(),
          category: formData.category,
          due_date: formData.due_date || null,
          user_id: user?.id,
        },
      ])

      if (error) throw error

      // Reset form
      setFormData({ title: "", category: "", due_date: "" })

      // Refresh todos
      await fetchTodos()
    } catch (error) {
      console.error("Error adding todo:", error)
    } finally {
      setSubmitting(false)
    }
  }

  const toggleComplete = async (id: string, completed: boolean) => {
    try {
      const { error } = await supabase.from("todos").update({ completed: !completed }).eq("id", id)

      if (error) throw error
      await fetchTodos()
    } catch (error) {
      console.error("Error updating todo:", error)
    }
  }

  const deleteTodo = async (id: string) => {
    try {
      const { error } = await supabase.from("todos").delete().eq("id", id)

      if (error) throw error
      await fetchTodos()
    } catch (error) {
      console.error("Error deleting todo:", error)
    }
  }

  const groupedTodos = todos.reduce(
    (acc, todo) => {
      if (!acc[todo.category]) {
        acc[todo.category] = []
      }
      acc[todo.category].push(todo)
      return acc
    },
    {} as Record<string, Todo[]>,
  )

  const formatDate = (dateString: string | null) => {
    if (!dateString) return null
    const date = new Date(dateString)
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    if (date.toDateString() === today.toDateString()) {
      return "Today"
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return "Tomorrow"
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: date.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
      })
    }
  }

  const isOverdue = (dateString: string | null) => {
    if (!dateString) return false
    const date = new Date(dateString)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return date < today
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">To-Dos</h1>
        </div>
        <div className="text-center py-8">Loading...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">To-Dos</h1>
      </div>

      {/* Inline Add Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Add New Task
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Task Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Buy new hiking boots"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value: "gear" | "logistics" | "training") =>
                    setFormData({ ...formData, category: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gear">🎒 Gear</SelectItem>
                    <SelectItem value="logistics">📍 Logistics</SelectItem>
                    <SelectItem value="training">💪 Training</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="due_date">Due Date (Optional)</Label>
                <Input
                  id="due_date"
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={submitting || !formData.title.trim() || !formData.category}
              className="bg-green-600 hover:bg-green-700"
            >
              {submitting ? "Adding..." : "Add Task"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Task Lists by Category */}
      <div className="space-y-6">
        {(["gear", "logistics", "training"] as const).map((category) => {
          const categoryTodos = groupedTodos[category] || []
          const Icon = categoryIcons[category]

          if (categoryTodos.length === 0) return null

          return (
            <Card key={category}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon className="w-5 h-5" />
                  {categoryLabels[category]}
                  <span className="text-sm font-normal text-gray-500">
                    ({categoryTodos.filter((t) => !t.completed).length} pending)
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {categoryTodos.map((todo) => (
                    <div
                      key={todo.id}
                      className={`flex items-center gap-3 p-3 rounded-lg border ${
                        todo.completed ? "bg-gray-50 border-gray-200" : "bg-white border-gray-200 hover:border-gray-300"
                      } transition-colors`}
                    >
                      <Checkbox
                        checked={todo.completed}
                        onCheckedChange={() => toggleComplete(todo.id, todo.completed)}
                        className="flex-shrink-0"
                      />

                      <div className="flex-1 min-w-0">
                        <div
                          className={`font-medium ${todo.completed ? "line-through text-gray-500" : "text-gray-900"}`}
                        >
                          {todo.title}
                        </div>

                        {todo.due_date && (
                          <div
                            className={`text-sm flex items-center gap-1 mt-1 ${
                              todo.completed
                                ? "text-gray-400"
                                : isOverdue(todo.due_date)
                                  ? "text-red-600"
                                  : "text-gray-600"
                            }`}
                          >
                            <Calendar className="w-3 h-3" />
                            {formatDate(todo.due_date)}
                            {isOverdue(todo.due_date) && !todo.completed && " (Overdue)"}
                          </div>
                        )}
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteTodo(todo.id)}
                        className="flex-shrink-0 text-gray-400 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )
        })}

        {todos.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <div className="text-gray-500">
                <Plus className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">No tasks yet</p>
                <p>Add your first trail-related task above to get started!</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
