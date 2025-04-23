"use client"

import { createClient } from "@/utils/supabase/client"
import { Button } from "@/components/ui/button"
import { FcGoogle } from "react-icons/fc"

export function GoogleButton() {
  const supabase = createClient()

  const handleGoogleSignIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    })

    if (error) {
      console.error('Error signing in with Google:', error)
    }
  }

  return (
    <Button
      variant="outline"
      className="w-full flex items-center justify-center gap-2"
      onClick={handleGoogleSignIn}
      suppressHydrationWarning
    >
      <FcGoogle className="h-5 w-5" />
      Continue with Google
    </Button>
  )
} 