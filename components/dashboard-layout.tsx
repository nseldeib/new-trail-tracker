"use client"

import type React from "react"

import { useAuth } from "./auth-provider"
import { Button } from "@/components/ui/button"
import { Mountain, LogOut } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, signOut } = useAuth()
  const pathname = usePathname()

  const getActiveTab = () => {
    if (pathname === "/dashboard") return "dashboard"
    if (pathname === "/dashboard/workouts") return "workouts"
    if (pathname === "/dashboard/goals") return "goals"
    return "dashboard"
  }

  const activeTab = getActiveTab()

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error("Sign out failed:", error)
      // Force redirect even if there's an error
      window.location.href = "/"
    }
  }

  return (
    <div className="min-h-screen bg-green-50">
      {/* Header - Compact */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-8">
              <Link href="/dashboard" className="flex items-center gap-3">
                <div className="text-green-600">
                  <Mountain className="w-7 h-7" />
                </div>
                <span className="text-lg font-semibold text-green-600">Trail Tracker</span>
              </Link>

              <nav className="flex gap-6">
                <Link
                  href="/dashboard"
                  className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === "dashboard"
                      ? "border-green-500 text-green-600"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  href="/dashboard/workouts"
                  className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === "workouts"
                      ? "border-green-500 text-green-600"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Workouts
                </Link>
                <Link
                  href="/dashboard/goals"
                  className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === "goals"
                      ? "border-green-500 text-green-600"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Goals
                </Link>
              </nav>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-gray-600 text-sm hidden sm:block">Welcome, demo@trailtracker.com</span>
              <Button
                onClick={handleSignOut}
                variant="outline"
                size="sm"
                className="border-gray-300 bg-white hover:bg-gray-50 text-gray-700"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content - Optimized spacing */}
      <div className="max-w-7xl mx-auto px-6 py-6">{children}</div>
    </div>
  )
}
