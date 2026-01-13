"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Plus, Edit2, Trash2, Calendar, MapPin, Activity } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "./auth-provider"

interface Trip {
  id: string
  trail_name: string
  date: string
  activity_type: string
  notes: string
  user_id: string
  created_at: string
}

const activityTypes = [
  { value: "hike", label: "Hike", color: "bg-green-100 text-green-800" },
  { value: "climb", label: "Climb", color: "bg-orange-100 text-orange-800" },
  { value: "snowboard", label: "Snowboard", color: "bg-blue-100 text-blue-800" },
  { value: "ski", label: "Ski", color: "bg-cyan-100 text-cyan-800" },
  { value: "bike", label: "Bike", color: "bg-yellow-100 text-yellow-800" },
  { value: "run", label: "Run", color: "bg-red-100 text-red-800" },
  { value: "walk", label: "Walk", color: "bg-gray-100 text-gray-800" },
  { value: "other", label: "Other", color: "bg-purple-100 text-purple-800" },
]

export function TripsView() {
  const supabase = createClient()
  const { user } = useAuth()
  const [trips, setTrips] = useState<Trip[]>([])
  const [loading, setLoading] = useState(true)
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null)
  const [formData, setFormData] = useState({
    trail_name: "",
    date: "",
    activity_type: "",
    notes: "",
  })

  useEffect(() => {
    fetchTrips()
  }, [user])

  const fetchTrips = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from("trips")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: false })

      if (error) throw error
      setTrips(data || [])
    } catch (error) {
      console.error("Error fetching trips:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    try {
      if (editingTrip) {
        // Update existing trip
        const { error } = await supabase
          .from("trips")
          .update({
            trail_name: formData.trail_name,
            date: formData.date,
            activity_type: formData.activity_type,
            notes: formData.notes,
          })
          .eq("id", editingTrip.id)

        if (error) throw error
      } else {
        // Create new trip
        const { error } = await supabase.from("trips").insert({
          trail_name: formData.trail_name,
          date: formData.date,
          activity_type: formData.activity_type,
          notes: formData.notes,
          user_id: user.id,
        })

        if (error) throw error
      }

      // Reset form and refresh trips
      setFormData({ trail_name: "", date: "", activity_type: "", notes: "" })
      setEditingTrip(null)
      fetchTrips()
    } catch (error) {
      console.error("Error saving trip:", error)
    }
  }

  const handleEdit = (trip: Trip) => {
    setEditingTrip(trip)
    setFormData({
      trail_name: trip.trail_name,
      date: trip.date,
      activity_type: trip.activity_type,
      notes: trip.notes,
    })
  }

  const handleDelete = async (tripId: string) => {
    try {
      const { error } = await supabase.from("trips").delete().eq("id", tripId)

      if (error) throw error
      fetchTrips()
    } catch (error) {
      console.error("Error deleting trip:", error)
    }
  }

  const cancelEdit = () => {
    setEditingTrip(null)
    setFormData({ trail_name: "", date: "", activity_type: "", notes: "" })
  }

  const getActivityTypeColor = (type: string) => {
    const activity = activityTypes.find((a) => a.value === type)
    return activity?.color || "bg-gray-100 text-gray-800"
  }

  const getActivityTypeLabel = (type: string) => {
    const activity = activityTypes.find((a) => a.value === type)
    return activity?.label || type
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="relative bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-500 rounded-xl p-6 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
          <div className="relative z-10">
            <h1 className="text-2xl font-bold text-white drop-shadow-lg">Trips</h1>
            <p className="text-white/90 text-sm">Track your trail adventures</p>
          </div>
        </div>
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-gray-200 rounded-lg"></div>
          <div className="h-24 bg-gray-200 rounded-lg"></div>
          <div className="h-24 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Vibrant Header */}
      <div className="relative bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-500 rounded-xl p-6 overflow-hidden">
        {/* Decorative overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />

        <div className="relative z-10">
          <h1 className="text-2xl font-bold text-white mb-1 drop-shadow-lg">Trips</h1>
          <p className="text-white/90 text-sm">Track your trail adventures</p>
        </div>
      </div>

      {/* Add/Edit Trip Form */}
      <Card className="shadow-md border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            {editingTrip ? "Edit Trip" : "Add New Trip"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="trail_name">Trail Name</Label>
                <Input
                  id="trail_name"
                  value={formData.trail_name}
                  onChange={(e) => setFormData({ ...formData, trail_name: e.target.value })}
                  placeholder="Enter trail name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="activity_type">Activity Type</Label>
              <Select
                value={formData.activity_type}
                onValueChange={(value) => setFormData({ ...formData, activity_type: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select activity type" />
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
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Add any notes about your trip..."
                rows={3}
              />
            </div>

            <div className="flex gap-2">
              <Button
                type="submit"
                variant="gradient"
                className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600"
              >
                {editingTrip ? "Update Trip" : "Add Trip"}
              </Button>
              {editingTrip && (
                <Button type="button" variant="outline" onClick={cancelEdit}>
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Trips List */}
      <div className="space-y-3">
        {trips.length === 0 ? (
          <Card className="shadow-md border-0">
            <CardContent className="py-12 text-center">
              <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center">
                <MapPin className="w-10 h-10 text-indigo-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No trips yet</h3>
              <p className="text-gray-600">Add your first trip using the form above.</p>
            </CardContent>
          </Card>
        ) : (
          trips.map((trip) => {
            const activityColorMap: Record<string, string> = {
              hike: "from-green-500 to-emerald-500",
              climb: "from-orange-500 to-red-500",
              snowboard: "from-blue-500 to-cyan-500",
              ski: "from-cyan-500 to-blue-500",
              bike: "from-yellow-500 to-orange-500",
              run: "from-red-500 to-pink-500",
              walk: "from-gray-500 to-slate-500",
              other: "from-purple-500 to-pink-500"
            }
            const activityGradient = activityColorMap[trip.activity_type] || "from-gray-500 to-slate-500"

            return (
              <Card
                key={trip.id}
                className="hover:shadow-xl transition-all duration-200 shadow-md border-0 overflow-hidden relative"
                style={{
                  background: `linear-gradient(135deg, ${activityGradient.split(' ')[0].replace('from-', '').replace('-500', '')}10 0%, white 100%)`
                }}
              >
                {/* Colored left accent strip */}
                <div className={`absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b ${activityGradient}`} />

                <CardContent className="p-4 ml-2">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <div className="flex items-center gap-2">
                          <div className={`p-2 rounded-lg bg-gradient-to-br ${activityGradient} shadow-sm`}>
                            <Activity className="w-5 h-5 text-white" />
                          </div>
                          <h3 className="text-base font-semibold text-gray-900">{trip.trail_name}</h3>
                        </div>
                        <Badge
                          className="border-0 shadow-sm"
                          style={{
                            background: `linear-gradient(135deg, ${activityGradient.split(' ')[0].replace('from-', '').replace('-500', '')}20 0%, ${activityGradient.split(' ')[1].replace('to-', '').replace('-500', '')}20 100%)`,
                            color: activityGradient.split(' ')[0].replace('from-', '').replace('-500', '-700')
                          }}
                        >
                          {getActivityTypeLabel(trip.activity_type)}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-4 text-xs text-gray-600 bg-white/60 rounded-lg px-2 py-1 w-fit">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span className="font-medium">{new Date(trip.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        </div>
                      </div>

                      {trip.notes && (
                        <div className="bg-white/80 rounded-lg p-2 border border-gray-100">
                          <p className="text-gray-700 text-xs leading-relaxed">{trip.notes}</p>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 sm:flex-col sm:gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(trip)}
                        className="flex-1 sm:flex-none h-8"
                      >
                        <Edit2 className="w-3 h-3 sm:mr-0 mr-2" />
                        <span className="sm:hidden">Edit</span>
                      </Button>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 sm:flex-none text-red-600 hover:text-red-700 hover:bg-red-50 bg-transparent h-8"
                          >
                            <Trash2 className="w-3 h-3 sm:mr-0 mr-2" />
                            <span className="sm:hidden">Delete</span>
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Trip</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this trip to {trip.trail_name}? This action cannot be
                              undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(trip.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}
