"use client"

import { Mountain } from "lucide-react"

interface LoadingScreenProps {
  message?: string
}

export function LoadingScreen({ message = "Loading your dashboard..." }: LoadingScreenProps) {
  return (
    <div className="min-h-screen bg-green-50 flex items-center justify-center">
      <div className="text-center">
        {/* Animated Mountain Icon */}
        <div className="mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 text-green-600 animate-pulse">
            <Mountain className="w-12 h-12" strokeWidth={2} />
          </div>
        </div>

        {/* Loading Message */}
        <p className="text-gray-600 text-lg font-medium">{message}</p>

        {/* Optional: Subtle loading dots animation */}
        <div className="flex justify-center mt-4 space-x-1">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
          <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
          <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
        </div>
      </div>
    </div>
  )
}
