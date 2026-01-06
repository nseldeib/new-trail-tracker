import { createBrowserClient } from "@supabase/ssr"

export function createClient() {
  return createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
}

// Demo user credentials for easy testing
export const DEMO_USER = {
  email: "demo@workouttracker.com",
  password: "demo123456",
}
