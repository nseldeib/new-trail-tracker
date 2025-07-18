"use client"

import { useAuth } from "@/components/auth-provider"
import { LoadingScreen } from "@/components/loading-screen"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Mountain, Target, TrendingUp, ArrowRight, Sparkles } from "lucide-react"
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
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-teal-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-green-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="text-green-600">
                <Mountain className="w-6 h-6" />
              </div>
              <span className="text-lg font-semibold text-gray-900">Trail Tracker</span>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/auth/signin">
                <Button variant="ghost" className="text-gray-700 hover:text-green-700 hover:bg-green-50 font-medium">
                  Sign In
                </Button>
              </Link>
              <Link href="/auth/signin">
                <Button className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-medium px-4 shadow-lg">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-r from-green-100/20 to-blue-100/20" />
        <div className="absolute top-20 left-10 w-32 h-32 bg-green-200/30 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-blue-200/30 rounded-full blur-3xl" />

        <div className="max-w-4xl mx-auto px-6 text-center relative">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-100 to-blue-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            Track your outdoor adventures
          </div>

          <h1 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
            Track Your Outdoor{" "}
            <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              Adventures
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            Log your workouts, set fitness goals, and track your progress on your journey to outdoor mastery. From trail
            runs to mountain climbs, capture every adventure.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/auth/signin">
              <Button className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-medium px-6 py-3 text-base shadow-lg">
                Start Tracking
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link href="/auth/signin">
              <Button
                variant="outline"
                className="border-green-200 text-green-700 font-medium px-6 py-3 text-base bg-white/80 hover:bg-green-50 hover:border-green-300"
              >
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 relative">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Track Workouts */}
            <Card className="bg-white/80 backdrop-blur-sm shadow-lg border border-green-100 text-center hover:shadow-xl hover:border-green-200 transition-all duration-300 group">
              <CardContent className="p-8">
                <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-300">
                  <Mountain className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Track Workouts</h3>
                <p className="text-gray-600 leading-relaxed">
                  Log your outdoor activities including running, climbing, hiking, and snowboarding with detailed
                  metrics.
                </p>
              </CardContent>
            </Card>

            {/* Set Goals */}
            <Card className="bg-white/80 backdrop-blur-sm shadow-lg border border-blue-100 text-center hover:shadow-xl hover:border-blue-200 transition-all duration-300 group">
              <CardContent className="p-8">
                <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-300">
                  <Target className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Set Goals</h3>
                <p className="text-gray-600 leading-relaxed">
                  Create fitness goals and track your progress with our intuitive goal-setting and monitoring system.
                </p>
              </CardContent>
            </Card>

            {/* Monitor Progress */}
            <Card className="bg-white/80 backdrop-blur-sm shadow-lg border border-teal-100 text-center hover:shadow-xl hover:border-teal-200 transition-all duration-300 group">
              <CardContent className="p-8">
                <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-300">
                  <TrendingUp className="w-8 h-8" />
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
      <section className="py-20 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-blue-500/10" />
        <div className="max-w-4xl mx-auto px-6 relative">
          <Card className="bg-white/90 backdrop-blur-sm shadow-xl border border-green-100 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-green-50/50 to-blue-50/50" />
            <CardContent className="p-12 text-center relative">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to Start Your Journey?</h2>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Join thousands of outdoor enthusiasts tracking their adventures with Trail Tracker.
              </p>
              <Link href="/auth/signin">
                <Button className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-medium px-8 py-3 text-base shadow-lg">
                  Create Your Account
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-white/50 backdrop-blur-sm border-t border-green-100">
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
