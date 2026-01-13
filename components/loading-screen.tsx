"use client"

import { Mountain } from "lucide-react"
import { GRADIENT } from "@/lib/styles"

interface LoadingScreenProps {
  message?: string
}

export function LoadingScreen({ message = "Loading your dashboard..." }: LoadingScreenProps) {
  return (
    <div className={`min-h-screen ${GRADIENT.page} flex items-center justify-center`}>
      <div className="text-center">
        {/* Animated Mountain Icon with Gradient Background */}
        <div className="mb-6">
          <div className={`inline-flex items-center justify-center w-20 h-20 ${GRADIENT.workout.header} rounded-2xl shadow-xl animate-pulse`}>
            <Mountain className="w-10 h-10 text-white" strokeWidth={2.5} />
          </div>
        </div>

        {/* Loading Message */}
        <p className="text-gray-700 text-lg font-semibold mb-1">{message}</p>
        <p className="text-gray-500 text-sm">Just a moment...</p>

        {/* Vibrant Loading Dots Animation */}
        <div className="flex justify-center mt-6 space-x-2">
          <div className="w-3 h-3 bg-gradient-to-r from-teal-500 to-green-500 rounded-full animate-bounce shadow-lg" style={{ animationDelay: "0ms" }}></div>
          <div className="w-3 h-3 bg-gradient-to-r from-green-500 to-blue-500 rounded-full animate-bounce shadow-lg" style={{ animationDelay: "150ms" }}></div>
          <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-teal-500 rounded-full animate-bounce shadow-lg" style={{ animationDelay: "300ms" }}></div>
        </div>
      </div>
    </div>
  )
}
