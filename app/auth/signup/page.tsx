"use client"

import { AuthForm } from "@/components/auth-form"
import { useAuth } from "@/components/auth-provider"
import { LoadingScreen } from "@/components/loading-screen"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function SignUpPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user) {
      // Redirect to dashboard if already authenticated
      router.push("/dashboard")
    }
  }, [user, loading, router])

  if (loading) {
    return <LoadingScreen message="Loading..." />
  }

  if (user) {
    return <LoadingScreen message="Redirecting to dashboard..." />
  }

  return <AuthForm mode="signup" />
}
