"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import type { User } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase/client"

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  signInAsDemo: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  }

  const signUp = async (email: string, password: string) => {
    const supabase = createClient()
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) throw error
  }

  const signOut = async () => {
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signOut()
      if (error) throw error

      window.location.href = "/"
    } catch (error) {
      console.error("Error signing out:", error)
      throw error
    }
  }

  const signInAsDemo = async () => {
    try {
      const supabase = createClient()
      await supabase.auth.signOut()

      await new Promise((resolve) => setTimeout(resolve, 500))

      const { data, error } = await supabase.auth.signInWithPassword({
        email: "demo@workouttracker.com",
        password: "demo123456",
      })

      if (error) {
        console.error("Demo login failed:", error)
        throw new Error("Demo account is not available. Please create your own account or contact support.")
      }

      if (!data.user) {
        throw new Error("Demo login failed - no user returned")
      }

      return data.user
    } catch (error) {
      console.error("Demo login error:", error)
      throw error
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn,
        signUp,
        signOut,
        signInAsDemo,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
