"use client"

import { useUser } from "@/components/providers/user-provider"
import { createClient } from "@/utils/supabase/client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import TailwindSpinner from "@/components/ui/tailwind-spinner"

export default function DashboardPage() {
  const { user, loading } = useUser()
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/signin")
  }

  if (loading) {
    return <TailwindSpinner />
  }

  if (!user) {
    router.push("/signin")
    return null
  }

  return (
    <div className="container mx-auto p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Welcome, {user.email}</h2>
          <div className="space-y-4">
            <p>
              <span className="font-medium">Email:</span> {user.email}
            </p>
            <p>
              <span className="font-medium">Last Sign In:</span>{" "}
              {new Date(user.last_sign_in_at || "").toLocaleString()}
            </p>
            <Button onClick={handleSignOut} variant="destructive">
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
} 