"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "./auth-provider"
import { ArrowLeft, Mountain, AlertCircle, CheckCircle } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

interface AuthFormProps {
  mode?: "signin" | "signup"
}

export function AuthForm({ mode = "signin" }: AuthFormProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [demoLoading, setDemoLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const { signIn, signUp } = useAuth()
  const router = useRouter()

  const isSignUp = mode === "signup"

  const validateForm = () => {
    if (!email || !password) {
      setError("Please fill in all fields")
      return false
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters long")
      return false
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Please enter a valid email address")
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    try {
      setLoading(true)
      setError("")
      setSuccess("")

      if (isSignUp) {
        await signUp(email, password)
        setSuccess("Account created successfully! Please check your email to verify your account.")
      } else {
        await signIn(email, password)
        // Redirect will be handled by auth state change
        router.push("/dashboard")
      }
    } catch (err: any) {
      console.error("Auth error:", err)
      if (err.message?.includes("Invalid login credentials")) {
        setError("Invalid email or password. Please try again.")
      } else if (err.message?.includes("User already registered")) {
        setError("An account with this email already exists. Please sign in instead.")
      } else if (err.message?.includes("Email not confirmed")) {
        setError("Please check your email and click the confirmation link before signing in.")
      } else {
        setError(err.message || "An error occurred. Please try again.")
      }
    } finally {
      setLoading(false)
    }
  }

  const handleDemoLogin = async () => {
    try {
      setDemoLoading(true)
      setError("")
      setSuccess("")

      console.log("Starting demo login...")

      // First, sign out any existing session
      await supabase.auth.signOut()

      // Wait a moment for the signout to complete
      await new Promise((resolve) => setTimeout(resolve, 500))

      console.log("Attempting to sign in with demo credentials...")

      // Try to sign in with demo credentials
      const { data, error } = await supabase.auth.signInWithPassword({
        email: "demo@workouttracker.com",
        password: "demo123456",
      })

      console.log("Demo login response:", { data, error })

      if (error) {
        console.error("Demo login error:", error)

        if (error.message.includes("Invalid login credentials")) {
          setError("Demo account not found. Please run the demo user creation script first.")
        } else {
          setError(`Demo login failed: ${error.message}`)
        }
        return
      }

      if (!data.user) {
        setError("Demo login failed - no user data returned")
        return
      }

      console.log("Demo login successful, user:", data.user.email)

      // Redirect to dashboard
      router.push("/dashboard")
    } catch (err: any) {
      console.error("Demo login exception:", err)
      setError(`Demo login failed: ${err.message || "Unknown error"}`)
    } finally {
      setDemoLoading(false)
    }
  }

  const handleBackToHome = () => {
    router.push("/")
  }

  return (
    <div className="min-h-screen bg-green-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back to home link */}
        <div className="mb-4">
          <Button
            onClick={handleBackToHome}
            variant="ghost"
            className="flex items-center gap-2 text-green-600 hover:text-green-700 text-sm font-medium p-0"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to home
          </Button>
        </div>

        {/* Logo/Header */}
        <div className="text-center mb-6">
          <div className="text-green-600 mb-3">
            <Mountain className="w-10 h-10 mx-auto" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-1">Trail Tracker</h1>
          <p className="text-gray-600 text-sm">Welcome back to your adventure log</p>
        </div>

        {/* Auth Card */}
        <Card className="bg-white shadow-sm border border-gray-200">
          <CardContent className="p-6">
            <div className="text-center mb-5">
              <h2 className="text-lg font-semibold text-gray-900 mb-1">{isSignUp ? "Sign Up" : "Sign In"}</h2>
              <p className="text-gray-600 text-sm">
                {isSignUp
                  ? "Create your account to start tracking adventures"
                  : "Enter your credentials to access your account"}
              </p>
            </div>

            {/* Demo Account Button - only show on sign in page */}
            {!isSignUp && (
              <>
                <Button
                  onClick={handleDemoLogin}
                  disabled={demoLoading || loading}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white mb-4 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {demoLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Signing in to demo...
                    </div>
                  ) : (
                    "Try Demo Account"
                  )}
                </Button>

                {/* Divider */}
                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-gray-500 font-medium">OR CONTINUE WITH EMAIL</span>
                  </div>
                </div>
              </>
            )}

            {/* Success Message */}
            {success && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 text-green-700">
                  <CheckCircle className="w-4 h-4" />
                  <p className="text-sm">{success}</p>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2 text-red-700">
                  <AlertCircle className="w-4 h-4" />
                  <p className="text-sm">{error}</p>
                </div>
                {error.includes("Demo account not found") && (
                  <div className="mt-2 text-xs text-red-600">
                    <p>To fix this:</p>
                    <ol className="list-decimal list-inside mt-1 space-y-1">
                      <li>Go to your Supabase project</li>
                      <li>Run the demo user creation script</li>
                      <li>Or create a user manually with email: demo@workouttracker.com</li>
                    </ol>
                  </div>
                )}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700 text-sm font-medium">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="border-gray-300 focus:border-green-500 focus:ring-green-500"
                  placeholder="your@email.com"
                  required
                  disabled={loading || demoLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-700 text-sm font-medium">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="border-gray-300 focus:border-green-500 focus:ring-green-500"
                  placeholder="Your password"
                  required
                  disabled={loading || demoLoading}
                />
              </div>

              <Button
                type="submit"
                disabled={loading || demoLoading}
                className="w-full bg-green-600 hover:bg-green-700 text-white disabled:opacity-50"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    {isSignUp ? "Creating account..." : "Signing in..."}
                  </div>
                ) : isSignUp ? (
                  "Sign Up"
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>

            {/* Toggle between sign in/up */}
            <div className="text-center mt-4">
              {isSignUp ? (
                <p className="text-gray-600 text-sm">
                  Already have an account?{" "}
                  <Link href="/auth/signin" className="text-green-600 font-medium hover:text-green-700">
                    Sign in
                  </Link>
                </p>
              ) : (
                <p className="text-gray-600 text-sm">
                  Don't have an account?{" "}
                  <Link href="/auth/signup" className="text-green-600 font-medium hover:text-green-700">
                    Sign up
                  </Link>
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
