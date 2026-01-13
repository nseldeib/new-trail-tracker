"use client"

import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface EmotionButtonProps {
  emotion: {
    id: string
    label: string
    emoji: string
  }
  selected: boolean
  onToggle: () => void
}

export function EmotionButton({ emotion, selected, onToggle }: EmotionButtonProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        "relative flex flex-col items-center justify-center p-2 rounded-lg border transition-all duration-200",
        "hover:scale-105",
        selected
          ? "bg-gradient-teal border-teal-500 text-white"
          : "bg-gray-50 border-gray-200 hover:border-teal-300 dark:bg-gray-800 dark:border-gray-700"
      )}
    >
      {selected && (
        <div className="absolute -top-1 -right-1 bg-white dark:bg-gray-900 rounded-full p-0.5">
          <Check className="w-3 h-3 text-teal-600" />
        </div>
      )}
      <span className="text-xl mb-1">{emotion.emoji}</span>
      <span className={cn("text-xs font-medium", selected ? "text-white" : "text-gray-700 dark:text-gray-300")}>
        {emotion.label}
      </span>
    </button>
  )
}
