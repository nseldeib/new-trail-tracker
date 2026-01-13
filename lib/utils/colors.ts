/**
 * Color utility functions for Trail Tracker
 * Provides consistent color mapping for activities, moods, and difficulty levels
 */

import {
  Activity,
  Bike,
  Dumbbell,
  Flame,
  Mountain,
  Waves,
  type LucideIcon,
} from "lucide-react"

// Activity type color mapping
const activityColors: Record<string, string> = {
  running: "#ef4444", // red-500
  climbing: "#f97316", // orange-500
  hiking: "#84cc16", // lime-500
  snowboarding: "#06b6d4", // cyan-500
  cycling: "#3b82f6", // blue-500
  swimming: "#0ea5e9", // sky-500
  yoga: "#a855f7", // purple-500
  strength: "#ec4899", // pink-500
}

// Activity type gradient mapping
const activityGradients: Record<string, string> = {
  running: "linear-gradient(135deg, #ef4444 0%, #f97316 100%)",
  climbing: "linear-gradient(135deg, #f97316 0%, #fb923c 100%)",
  hiking: "linear-gradient(135deg, #84cc16 0%, #22c55e 100%)",
  snowboarding: "linear-gradient(135deg, #06b6d4 0%, #0ea5e9 100%)",
  cycling: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
  swimming: "linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%)",
  yoga: "linear-gradient(135deg, #a855f7 0%, #ec4899 100%)",
  strength: "linear-gradient(135deg, #ec4899 0%, #ef4444 100%)",
}

// Activity type gradient class names
const activityGradientClasses: Record<string, string> = {
  running: "bg-gradient-to-br from-red-500 to-orange-500",
  climbing: "bg-gradient-to-br from-orange-500 to-orange-400",
  hiking: "bg-gradient-to-br from-lime-500 to-green-500",
  snowboarding: "bg-gradient-to-br from-cyan-500 to-sky-500",
  cycling: "bg-gradient-to-br from-blue-500 to-blue-600",
  swimming: "bg-gradient-to-br from-sky-500 to-cyan-500",
  yoga: "bg-gradient-to-br from-purple-500 to-pink-500",
  strength: "bg-gradient-to-br from-pink-500 to-red-500",
}

// Activity type icon mapping
const activityIcons: Record<string, LucideIcon> = {
  running: Activity,
  climbing: Mountain,
  hiking: Mountain,
  snowboarding: Mountain,
  cycling: Bike,
  swimming: Waves,
  yoga: Activity,
  strength: Dumbbell,
}

// Difficulty color mapping
const difficultyColors: Record<string, { bg: string; text: string; border: string }> = {
  Easy: {
    bg: "bg-green-100",
    text: "text-green-800",
    border: "border-green-200",
  },
  Moderate: {
    bg: "bg-yellow-100",
    text: "text-yellow-800",
    border: "border-yellow-200",
  },
  Hard: {
    bg: "bg-orange-100",
    text: "text-orange-800",
    border: "border-orange-200",
  },
  Expert: {
    bg: "bg-red-100",
    text: "text-red-800",
    border: "border-red-200",
  },
}

/**
 * Get the color hex code for an activity type
 */
export function getActivityColor(activityType: string): string {
  return activityColors[activityType.toLowerCase()] || "#6b7280" // gray-500 fallback
}

/**
 * Get the CSS gradient string for an activity type
 */
export function getActivityGradient(activityType: string): string {
  return activityGradients[activityType.toLowerCase()] || "linear-gradient(135deg, #6b7280 0%, #9ca3af 100%)"
}

/**
 * Get the Tailwind gradient class name for an activity type
 */
export function getActivityGradientClass(activityType: string): string {
  return activityGradientClasses[activityType.toLowerCase()] || "bg-gradient-to-br from-gray-500 to-gray-400"
}

/**
 * Get the icon component for an activity type
 */
export function getActivityIcon(activityType: string): LucideIcon {
  return activityIcons[activityType.toLowerCase()] || Activity
}

/**
 * Get the mood gradient class based on wellbeing score (1-10)
 */
export function getMoodGradient(score: number): string {
  if (score <= 3) return "bg-mood-poor"
  if (score <= 7) return "bg-mood-average"
  return "bg-mood-excellent"
}

/**
 * Get the mood color based on wellbeing score (1-10)
 */
export function getMoodColor(score: number): string {
  if (score <= 3) return "text-red-500"
  if (score <= 7) return "text-yellow-500"
  return "text-green-500"
}

/**
 * Get the difficulty badge classes
 */
export function getDifficultyBadgeClass(difficulty: string): string {
  const colors = difficultyColors[difficulty] || {
    bg: "bg-gray-100",
    text: "text-gray-800",
    border: "border-gray-200",
  }
  return `${colors.bg} ${colors.text} ${colors.border} border px-2 py-1 rounded-full text-xs font-medium`
}

/**
 * Get the difficulty color object
 */
export function getDifficultyColor(difficulty: string): { bg: string; text: string; border: string } {
  return difficultyColors[difficulty] || {
    bg: "bg-gray-100",
    text: "text-gray-800",
    border: "border-gray-200",
  }
}

/**
 * Calculate days remaining until a target date
 */
export function getDaysRemaining(targetDate: string): number {
  const target = new Date(targetDate)
  const today = new Date()
  const diffTime = target.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return Math.max(0, diffDays)
}

/**
 * Get color for a metric type (used for stats cards)
 */
export function getMetricGradient(metricType: string): string {
  const gradients: Record<string, string> = {
    workouts: "bg-gradient-teal",
    duration: "bg-gradient-purple",
    distance: "bg-gradient-coral",
    elevation: "bg-gradient-green",
    streak: "bg-gradient-amber",
  }
  return gradients[metricType.toLowerCase()] || "bg-gradient-teal"
}
