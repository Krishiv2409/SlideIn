"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Loader2 } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { GoogleButton } from "./google-button"
import { Logo } from "../logo"
import Image from "next/image"
import { MicrosoftSignIn } from "./MicrosoftSignIn"
import { createClient } from "@/utils/supabase/client"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function SignUpForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [privacyConsent, setPrivacyConsent] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    if (!privacyConsent) {
      setError("Please agree to the Privacy Policy to continue")
      return
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${location.origin}/auth/callback`,
        },
      })

      if (error) {
        throw error
      }

      setSuccess("Account created successfully! Please check your email for verification.")
      setTimeout(() => {
        router.push("/sign-in")
      }, 2000)
    } catch (error: any) {
      console.error('Error signing up:', error)
      setError(error.message || 'Failed to sign up')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full shadow-lg border-gray-200 rounded-xl overflow-hidden animate-slide-up">
      <CardHeader className="flex flex-col items-center pt-8 pb-6">
        <Image 
          src="/plane-logo.svg" 
          alt="SlideIn Logo" 
          width={90} 
          height={90} 
          className="mb-2"
        />
        <div className="text-center w-full">
          <h1 className="text-3xl font-bold" style={{ fontFamily: 'Satoshi, sans-serif', fontWeight: 700 }}>Create an account</h1>
          <p className="text-muted-foreground text-base" style={{ fontFamily: 'Satoshi, sans-serif' }}>Sign up to start using SlideIn</p>
        </div>
      </CardHeader>
      <form onSubmit={handleSubmit} suppressHydrationWarning>
        <CardContent className="px-8 pb-6 space-y-5">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {success && (
            <Alert>
              <AlertDescription className="text-green-600">{success}</AlertDescription>
            </Alert>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2.5">
              <Label htmlFor="first-name" className="font-medium">First name</Label>
              <Input 
                id="first-name" 
                placeholder="John" 
                required 
                className="h-11 transition-all focus-visible:ring-pink-500"
                suppressHydrationWarning
              />
            </div>
            <div className="space-y-2.5">
              <Label htmlFor="last-name" className="font-medium">Last name</Label>
              <Input 
                id="last-name" 
                placeholder="Doe" 
                required 
                className="h-11 transition-all focus-visible:ring-pink-500"
                suppressHydrationWarning
              />
            </div>
          </div>
          <div className="space-y-2.5">
            <Label htmlFor="email" className="font-medium">Email</Label>
            <Input 
              id="email" 
              type="email" 
              placeholder="you@example.com" 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-11 transition-all focus-visible:ring-pink-500"
              suppressHydrationWarning
            />
          </div>
          <div className="space-y-2.5">
            <Label htmlFor="password" className="font-medium">Password</Label>
            <Input 
              id="password" 
              type="password" 
              placeholder="••••••••" 
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-11 transition-all focus-visible:ring-pink-500"
              suppressHydrationWarning
            />
          </div>
          <div className="flex items-center space-x-3 pt-2">
            <Checkbox 
              id="privacy" 
              checked={privacyConsent}
              onCheckedChange={(checked) => setPrivacyConsent(checked as boolean)}
              className="data-[state=checked]:bg-pink-500 data-[state=checked]:border-pink-500" 
              suppressHydrationWarning 
            />
            <Label htmlFor="privacy" className="text-sm font-normal leading-tight cursor-pointer">
              I agree to the{" "}
              <Link href="/privacy-policy" className="text-pink-500 hover:text-pink-600 transition-colors">
                Privacy Policy
              </Link>
              {" "}and consent to the processing of my data
            </Label>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-6 px-8 pb-8">
          <Button 
            type="submit" 
            className="w-full h-11 bg-pink-500 hover:bg-pink-600 transition-all duration-200 shadow-sm text-base font-medium"
            disabled={isLoading}
            suppressHydrationWarning
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Creating account...
              </>
            ) : (
              "Create account"
            )}
          </Button>
          <div className="relative w-full pt-2">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-3 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>
          <div className="flex flex-col space-y-3 w-full">
            <GoogleButton />
            <MicrosoftSignIn />
          </div>
          <p className="text-sm text-center text-muted-foreground pt-2">
            Already have an account?{" "}
            <Link 
              href="/sign-in" 
              className="text-pink-500 hover:text-pink-600 transition-colors font-medium"
            >
              Sign in
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  )
} 