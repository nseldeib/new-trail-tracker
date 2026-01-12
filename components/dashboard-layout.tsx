"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Loader2, LogOut, Mountain } from "lucide-react"

import { useAuth } from "./auth-provider"
import { Button } from "@/components/ui/button"
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
  const { signOut } = useAuth()
  const pathname = usePathname()
  const [isSigningOut, setIsSigningOut] = useState(false)

  async function handleSignOut(): Promise<void> {
    setIsSigningOut(true)
    try {
      await signOut()
    } catch (error) {
      console.error("Sign out failed:", error)
      window.location.href = "/"
    }
  }

  return (
    <div className="min-h-screen bg-green-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-8">
              <Link href="/dashboard" className="flex items-center gap-3">
                <Mountain className="w-7 h-7 text-green-600" />
                <span className="text-lg font-semibold text-green-600">Trail Tracker</span>
              </Link>

              <nav className="flex gap-6">
                {NAV_ITEMS.map(({ href, label }) => {
                  const isActive = pathname === href
                  return (
                    <Link
                      key={href}
                      href={href}
                      className={cn(
                        "py-3 px-1 border-b-2 font-medium text-sm transition-colors",
                        isActive
                          ? "border-green-500 text-green-600"
                          : "border-transparent text-gray-500 hover:text-gray-700"
                      )}
                    >
                      {label}
                    </Link>
                  )
                })}
              </nav>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-gray-600 text-sm hidden sm:block">Welcome, demo@trailtracker.com</span>
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

      <main className="max-w-7xl mx-auto px-6 py-6">{children}</main>
    </div>
  )
}
