"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Loader2, LogOut, Mountain, Bell, User, X } from "lucide-react"

import { useAuth } from "./auth-provider"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/dashboard/workouts", label: "Workouts" },
  { href: "/dashboard/goals", label: "Goals" },
  { href: "/dashboard/analytics", label: "Analytics" },
  { href: "/dashboard/todos", label: "To-Dos" },
  { href: "/dashboard/trips", label: "Trips" },
] as const

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps): React.ReactElement {
  const { signOut, user } = useAuth()
  const pathname = usePathname()
  const [isSigningOut, setIsSigningOut] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)

  async function handleSignOut(): Promise<void> {
    setIsSigningOut(true)
    try {
      await signOut()
    } catch (error) {
      console.error("Sign out failed:", error)
      window.location.href = "/"
    }
  }

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user?.email) return 'U'
    const email = user.email
    return email.charAt(0).toUpperCase()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-teal-50">
      <header className="bg-gradient-to-r from-white to-green-50 border-b border-gray-200 sticky top-0 z-40 backdrop-blur-sm bg-white/90">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <Link href="/dashboard" className="flex items-center gap-3 group">
                <div className="p-2 rounded-lg bg-gradient-teal group-hover:shadow-lg transition-all duration-200">
                  <Mountain className="w-6 h-6 text-white" />
                </div>
                <span className="text-lg font-bold bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">
                  Trail Tracker
                </span>
              </Link>

              <nav className="flex gap-1">
                {NAV_ITEMS.map(({ href, label }) => {
                  const isActive = pathname === href
                  return (
                    <Link
                      key={href}
                      href={href}
                      className={cn(
                        "relative py-4 px-4 font-medium text-sm transition-all duration-200 rounded-lg group",
                        isActive
                          ? "text-teal-600"
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                      )}
                    >
                      {label}
                      {isActive && (
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-500 to-blue-500 rounded-t-full" />
                      )}
                    </Link>
                  )
                })}
              </nav>
            </div>

            <div className="flex items-center gap-3">
              {/* Notification Bell */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-200"
                >
                  <Bell className="w-5 h-5" />
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500 text-white text-xs border-2 border-white">
                    3
                  </Badge>
                </button>

                {/* Notifications Dropdown */}
                {showNotifications && (
                  <>
                    {/* Backdrop */}
                    <div
                      className="fixed inset-0 z-30"
                      onClick={() => setShowNotifications(false)}
                    />

                    {/* Dropdown */}
                    <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-40 overflow-hidden">
                      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100">Notifications</h3>
                        <button
                          onClick={() => setShowNotifications(false)}
                          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                        >
                          <X className="w-4 h-4 text-gray-500" />
                        </button>
                      </div>

                      <div className="max-h-96 overflow-y-auto">
                        <div className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-100 dark:border-gray-700">
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">🎯 Goal almost complete!</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">You're 90% of the way to your monthly distance goal</p>
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">2 hours ago</p>
                        </div>

                        <div className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-100 dark:border-gray-700">
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">🔥 5-day streak!</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Keep up the momentum - you're on fire!</p>
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">1 day ago</p>
                        </div>

                        <div className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">☀️ Perfect weather for hiking</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Today's forecast is ideal for outdoor activities</p>
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">3 days ago</p>
                        </div>
                      </div>

                      <div className="p-3 border-t border-gray-200 dark:border-gray-700 text-center">
                        <button className="text-sm text-teal-600 hover:text-teal-700 font-medium">
                          Mark all as read
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* User Avatar */}
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-500 to-blue-500 flex items-center justify-center text-white font-semibold text-sm shadow-md">
                  {getUserInitials()}
                </div>
              </div>

              {/* Sign Out Button */}
              <Button
                onClick={handleSignOut}
                variant="outline"
                size="sm"
                className="border-gray-300 bg-white hover:bg-gray-50 text-gray-700"
                disabled={isSigningOut}
              >
                {isSigningOut ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Signing Out...
                  </>
                ) : (
                  <>
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-3">{children}</main>
    </div>
  )
}
