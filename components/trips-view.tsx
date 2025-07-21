"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Trash2, Edit2, Calendar, MapPin, Plus } from "lucide-react"
import { useAuth } from "./auth-provider"
import { supabase } from "@/lib/supabase"

interface Trip {
  id: string
  trail_name: string
  date: string
  type: string
  notes: string
  created_at: string
}

const tripTypes = ["Hike", "Climb", "Snowboard", "Ski", "Mountain Bike", "Trail Run", "Backpack", "Other"]

const typeColors: Record<string, string> = {
  Hike: "bg-green-100 text-green-800",
  Climb: "bg-red-100 text-red-800",
  Snowboard: "bg-blue-100 text-blue-800",
  Ski: "bg-cyan-100 text-cyan-800",
  "Mountain Bike": "bg-orange-100 text-orange-800",
  "Trail Run": "bg-purple-100 text-purple-800",
  Backpack: "bg-yellow-100 text-yellow-800",
  Other: "bg-gray-100 text-gray-800",
}

export function TripsView() {
  const { user } = useAuth()
  const [trips, setTrips] = useState<Trip[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    trail_name: "",
    date: "",
    type: "",
    notes: "",
  })

  useEffect(() => {
    if (user) {
      fetchTrips()
    }
  }, [user])

  const fetchTrips = async () => {
    try {
      const { data, error } = await supabase
        .from("trips")
        .select("*")
        .eq("user_id", user?.id)
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
    if (!user || !formData.trail_name || !formData.date || !formData.type) return

    try {
      if (editingId) {
        // Update existing trip
        const { error } = await supabase
          .from("trips")
          .update({
            trail_name: formData.trail_name,
            date: formData.date,
            type: formData.type,
            notes: formData.notes,
          })
          .eq("id", editingId)
          .eq("user_id", user.id)

        if (error) throw error
        setEditingId(null)
      } else {
        // Create new trip
        const { error } = await supabase.from("trips").insert({
          user_id: user.id,
          trail_name: formData.trail_name,
          date: formData.date,
          type: formData.type,
          notes: formData.notes,
        })

        if (error) throw error
      }

      // Reset form
      setFormData({ trail_name: "", date: "", type: "", notes: "" })
      fetchTrips()
    } catch (error) {
      console.error("Error saving trip:", error)
    }
  }

  const handleEdit = (trip: Trip) => {
    setEditingId(trip.id)
    setFormData({
      trail_name: trip.trail_name,
      date: trip.date,
      type: trip.type,
      notes: trip.notes,
    })
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this trip?")) return

    try {
      const { error } = await supabase.from("trips").delete().eq("id", id).eq("user_id", user?.id)

      if (error) throw error
      fetchTrips()
    } catch (error) {
      console.error("Error deleting trip:", error)
    }
  }

  const cancelEdit = () => {
    setEditingId(null)
    setFormData({ trail_name: "", date: "", type: "", notes: "" })
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">My Trips</h1>
        </div>
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">My Trips</h1>
        <Badge variant="secondary" className="text-sm">
          {trips.length} {trips.length === 1 ? "trip" : "trips"}
        </Badge>
      </div>

      {/* Add/Edit Trip Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            {editingId ? "Edit Trip" : "Add New Trip"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Trail Name *</label>
                <Input
                  value={formData.trail_name}
                  onChange={(e) => setFormData({ ...formData, trail_name: e.target.value })}
                  placeholder="Enter trail name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Activity Type *</label>
              <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select activity type" />
                </SelectTrigger>
                <SelectContent>
                  {tripTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Add any notes about your trip..."
                rows={3}
              />
            </div>

            <div className="flex gap-2">
              <Button type="submit" className="bg-green-600 hover:bg-green-700">
                {editingId ? "Update Trip" : "Add Trip"}
              </Button>
              {editingId && (
                <Button type="button" variant="outline" onClick={cancelEdit}>
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Trips List */}
      {trips.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No trips yet</h3>
            <p className="text-gray-500">Add your first trip using the form above!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {trips.map((trip) => (
            <Card key={trip.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <h3 className="font-semibold text-lg text-gray-900">{trip.trail_name}</h3>
                      <Badge className={`w-fit ${typeColors[trip.type] || typeColors.Other}`}>{trip.type}</Badge>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(trip.date).toLocaleDateString()}
                      </div>
                    </div>

                    {trip.notes && <p className="text-gray-700 text-sm bg-gray-50 p-2 rounded">{trip.notes}</p>}
                  </div>

                  <div className="flex gap-2 sm:flex-col sm:w-auto">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(trip)}
                      className="flex-1 sm:flex-none"
                    >
                      <Edit2 className="w-4 h-4 sm:mr-0 mr-1" />
                      <span className="sm:hidden">Edit</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(trip.id)}
                      className="flex-1 sm:flex-none text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4 sm:mr-0 mr-1" />
                      <span className="sm:hidden">Delete</span>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
