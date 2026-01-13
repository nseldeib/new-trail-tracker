// Shared activity type data and helpers

export const ACTIVITY_TYPES = [
  { value: "running", label: "Running", emoji: "🏃‍♂️" },
  { value: "climbing", label: "Climbing", emoji: "🧗‍♂️" },
  { value: "hiking", label: "Hiking", emoji: "🥾" },
  { value: "snowboarding", label: "Snowboarding", emoji: "🏂" },
  { value: "cycling", label: "Cycling", emoji: "🚴‍♂️" },
  { value: "swimming", label: "Swimming", emoji: "🏊‍♂️" },
  { value: "yoga", label: "Yoga", emoji: "🧘‍♀️" },
  { value: "strength", label: "Strength Training", emoji: "💪" },
] as const

export const GOAL_ACTIVITY_TYPES = [
  { value: "general", label: "General", emoji: "🎯" },
  ...ACTIVITY_TYPES.filter(t => t.value !== "yoga" && t.value !== "strength"),
] as const

export const DIFFICULTY_LEVELS = [
  { value: "Easy", emoji: "🟢" },
  { value: "Moderate", emoji: "🟡" },
  { value: "Hard", emoji: "🟠" },
  { value: "Expert", emoji: "🔴" },
] as const

export function getActivityEmoji(activity: string): string {
  const found = ACTIVITY_TYPES.find(t => t.value === activity)
  return found?.emoji ?? "🏃‍♂️"
}

export function getActivityLabel(activity: string): string {
  const found = [...ACTIVITY_TYPES, { value: "general", label: "General", emoji: "🎯" }].find(t => t.value === activity)
  return found ? `${found.emoji} ${found.label}` : activity
}
