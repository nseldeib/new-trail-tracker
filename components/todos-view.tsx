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

const categoryColors = {
  gear: "from-blue-500 to-cyan-500",
  logistics: "from-green-500 to-teal-500",
  training: "from-purple-500 to-pink-500"
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
      <div className="space-y-4">
        <div className="relative bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 rounded-xl p-6 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
          <div className="relative z-10">
            <h1 className="text-2xl font-bold text-white drop-shadow-lg">To-Dos</h1>
            <p className="text-white/90 text-sm">Manage your trail preparation tasks</p>
          </div>
        </div>
        <div className="text-center py-8">Loading...</div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Vibrant Header */}
      <div className="relative bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 rounded-xl p-6 overflow-hidden">
        {/* Decorative overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />

        <div className="relative z-10">
          <h1 className="text-2xl font-bold text-white mb-1 drop-shadow-lg">To-Dos</h1>
          <p className="text-white/90 text-sm">Manage your trail preparation tasks</p>
        </div>
      </div>

      {/* Inline Add Form */}
      <Card className="shadow-md border-0">
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
              variant="gradient-amber"
            >
              {submitting ? "Adding..." : "Add Task"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Task Lists by Category */}
      <div className="space-y-4">
        {(["gear", "logistics", "training"] as const).map((category) => {
          const categoryTodos = groupedTodos[category] || []
          const Icon = categoryIcons[category]

          if (categoryTodos.length === 0) return null

          return (
            <Card key={category} className="shadow-md border-0 overflow-hidden">
              <div className={`h-1.5 bg-gradient-to-r ${categoryColors[category]}`} />
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <div className={`p-1.5 rounded-lg bg-gradient-to-r ${categoryColors[category]}`}>
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  {categoryLabels[category]}
                  <span className="text-xs font-normal text-gray-500">
                    ({categoryTodos.filter((t) => !t.completed).length} pending)
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {categoryTodos.map((todo) => (
                    <div
                      key={todo.id}
                      className={`relative flex items-center gap-3 p-3 rounded-lg border transition-all duration-200 overflow-hidden ${
                        todo.completed
                          ? "bg-gray-50 border-gray-200"
                          : category === 'gear'
                            ? "bg-blue-50/50 border-blue-200 hover:border-blue-300 hover:shadow-md"
                            : category === 'logistics'
                            ? "bg-green-50/50 border-green-200 hover:border-green-300 hover:shadow-md"
                            : "bg-purple-50/50 border-purple-200 hover:border-purple-300 hover:shadow-md"
                      }`}
                    >
                      {/* Colorful left accent */}
                      {!todo.completed && (
                        <div className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${categoryColors[category]}`} />
                      )}

                      <Checkbox
                        checked={todo.completed}
                        onCheckedChange={() => toggleComplete(todo.id, todo.completed)}
                        className="flex-shrink-0 ml-2"
                      />

                      <div className="flex-1 min-w-0">
                        <div
                          className={`font-medium ${todo.completed ? "line-through text-gray-500" : "text-gray-900"}`}
                        >
                          {todo.title}
                        </div>

                        {todo.due_date && (
                          <div
                            className={`text-xs flex items-center gap-1 mt-1 ${
                              todo.completed
                                ? "text-gray-400"
                                : isOverdue(todo.due_date)
                                  ? "text-red-600 font-semibold"
                                  : "text-gray-600"
                            }`}
                          >
                            <Calendar className="w-3 h-3" />
                            {formatDate(todo.due_date)}
                            {isOverdue(todo.due_date) && !todo.completed && (
                              <span className="ml-1 px-1.5 py-0.5 bg-red-100 text-red-700 rounded text-xs font-semibold">
                                Overdue
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteTodo(todo.id)}
                        className="flex-shrink-0 text-gray-400 hover:text-red-600 h-8 w-8 p-0"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )
        })}

        {todos.length === 0 && (
          <Card className="shadow-md border-0">
            <CardContent className="text-center py-12">
              <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full flex items-center justify-center">
                <Plus className="w-10 h-10 text-amber-600" />
              </div>
              <p className="text-lg font-semibold text-gray-900 mb-2">No tasks yet</p>
              <p className="text-gray-600">Add your first trail-related task above to get started!</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
