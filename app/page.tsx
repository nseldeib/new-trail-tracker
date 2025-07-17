"use client"

import { useAuth } from "@/components/auth-provider"
import { LoadingScreen } from "@/components/loading-screen"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Mountain, Target, TrendingUp, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function LandingPage() {
  const { user, loading, signInAsDemo } = useAuth()
  const [demoLoading, setDemoLoading] = useState(false)

  useEffect(() => {
    if (!loading && user) {
      // Force redirect to dashboard if user is authenticated
      window.location.href = "/dashboard"
    }
  }, [user, loading])

  const handleDemoLogin = async () => {
    try {
      setDemoLoading(true)
      await signInAsDemo()
    } catch (error) {
      console.error("Demo login failed:", error)
    } finally {
      setDemoLoading(false)
    }
  }

  // Show loading screen while checking auth state
  if (loading) {
    return <LoadingScreen message="Loading..." />
  }

  // Show loading screen during demo login
  if (demoLoading) {
    return <LoadingScreen message="Signing in to demo account..." />
  }

  if (user) {
    return <LoadingScreen message="Redirecting to dashboard..." />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="text-green-600">
                <Mountain className="w-6 h-6" />
              </div>
              <span className="text-lg font-medium text-gray-900">Trail Tracker</span>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/auth/signin">
                <Button variant="ghost" className="text-gray-700 hover:text-gray-900 font-medium">
                  Sign In
                </Button>
              </Link>
              <Link href="/auth/signin">
                <Button className="bg-green-600 hover:bg-green-700 text-white font-medium px-4">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
            Track Your Outdoor <span className="text-green-600">Adventures</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            Log your workouts, set fitness goals, and track your progress on your journey to outdoor mastery. From trail
            runs to mountain climbs, capture every adventure.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/auth/signin">
              <Button className="bg-green-600 hover:bg-green-700 text-white font-medium px-6 py-3 text-base">
                Start Tracking
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link href="/auth/signin">
              <Button
                variant="outline"
                className="border-gray-300 text-gray-700 font-medium px-6 py-3 text-base bg-white hover:bg-gray-50"
              >
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Track Workouts */}
            <Card className="bg-white shadow-sm border border-gray-200 text-center hover:shadow-md transition-shadow">
              <CardContent className="p-8">
                <div className="w-12 h-12 mx-auto mb-6 text-green-600">
                  <Mountain className="w-full h-full" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Track Workouts</h3>
                <p className="text-gray-600 leading-relaxed">
                  Log your outdoor activities including running, climbing, hiking, and snowboarding with detailed
                  metrics.
                </p>
              </CardContent>
            </Card>

            {/* Set Goals */}
            <Card className="bg-white shadow-sm border border-gray-200 text-center hover:shadow-md transition-shadow">
              <CardContent className="p-8">
                <div className="w-12 h-12 mx-auto mb-6 text-green-600">
                  <Target className="w-full h-full" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Set Goals</h3>
                <p className="text-gray-600 leading-relaxed">
                  Create fitness goals and track your progress with our intuitive goal-setting and monitoring system.
                </p>
              </CardContent>
            </Card>

            {/* Monitor Progress */}
            <Card className="bg-white shadow-sm border border-gray-200 text-center hover:shadow-md transition-shadow">
              <CardContent className="p-8">
                <div className="w-12 h-12 mx-auto mb-6 text-green-600">
                  <TrendingUp className="w-full h-full" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Monitor Progress</h3>
                <p className="text-gray-600 leading-relaxed">
                  Visualize your improvement over time with detailed analytics and beautiful progress tracking.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-6">
          <Card className="bg-white shadow-sm border border-gray-200">
            <CardContent className="p-12 text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to Start Your Journey?</h2>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Join thousands of outdoor enthusiasts tracking their adventures with Trail Tracker.
              </p>
              <Link href="/auth/signin">
                <Button className="bg-green-600 hover:bg-green-700 text-white font-medium px-8 py-3 text-base">
                  Create Your Account
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-center gap-2 text-gray-600">
            <Mountain className="w-4 h-4 text-green-600" />
            <span className="text-sm">© 2024 Trail Tracker. Built for outdoor enthusiasts.</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
