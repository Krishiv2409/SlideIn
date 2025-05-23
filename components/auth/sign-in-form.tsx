"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Loader2 } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { GoogleButton } from "./google-button"
import { MicrosoftSignIn } from "./MicrosoftSignIn"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Image from "next/image"

export function SignInForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  useEffect(() => {
    const error = searchParams.get('error')
    if (error) {
      setError(decodeURIComponent(error))
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        throw error
      }

      router.push("/")
      router.refresh()
    } catch (error: any) {
      console.error('Error signing in:', error)
      setError(error.message || 'Failed to sign in')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full shadow-sm border-gray-200 animate-slide-up">
      <form onSubmit={handleSubmit} suppressHydrationWarning>
        <div className="flex flex-col items-center pt-8 mb-2">
          <Image 
            src="/plane-logo.svg" 
            alt="SlideIn Logo" 
            width={90} 
            height={90}
            className="mb-2" 
          />
          <div className="text-center w-full">
            <h1 className="text-2xl font-bold" style={{ fontFamily: 'Satoshi, sans-serif', fontWeight: 700 }}>Welcome back</h1>
            <p className="text-muted-foreground text-base" style={{ fontFamily: 'Satoshi, sans-serif' }}>Sign in to continue to SlideIn</p>
          </div>
        </div>

        <CardContent className="pt-6 space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email" 
              type="email" 
              placeholder="you@example.com" 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="transition-all focus-visible:ring-pink-500"
              suppressHydrationWarning
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link 
                href="/forgot-password" 
                className="text-sm text-pink-500 hover:text-pink-600 transition-colors"
              >
                Forgot password?
              </Link>
            </div>
            <Input 
              id="password" 
              type="password" 
              placeholder="••••••••" 
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="transition-all focus-visible:ring-pink-500"
              suppressHydrationWarning
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button 
            type="submit" 
            className="w-full bg-pink-500 hover:bg-pink-600 transition-all duration-200 shadow-sm"
            disabled={isLoading}
            suppressHydrationWarning
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign in"
            )}
          </Button>
          <div className="relative w-full">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>
          <div className="flex flex-col space-y-3 w-full">
            <GoogleButton />
            <MicrosoftSignIn />
          </div>
          <p className="text-sm text-center text-muted-foreground">
            Don't have an account?{" "}
            <Link 
              href="/sign-up" 
              className="text-pink-500 hover:text-pink-600 transition-colors"
            >
              Sign up
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  )
} 