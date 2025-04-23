"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Loader2 } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { GoogleButton } from "./google-button"

export function SignUpForm() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    // Simulate account creation
    setTimeout(() => {
      setIsLoading(false)
      router.push("/") // Redirect to dashboard after sign up
    }, 1500)
  }

  return (
    <Card className="w-full shadow-sm border-gray-200 animate-slide-up">
      <form onSubmit={handleSubmit} suppressHydrationWarning>
        <CardContent className="pt-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first-name">First name</Label>
              <Input 
                id="first-name" 
                placeholder="John" 
                required 
                className="transition-all focus-visible:ring-pink-500"
                suppressHydrationWarning
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="last-name">Last name</Label>
              <Input 
                id="last-name" 
                placeholder="Doe" 
                required 
                className="transition-all focus-visible:ring-pink-500"
                suppressHydrationWarning
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email" 
              type="email" 
              placeholder="you@example.com" 
              required 
              className="transition-all focus-visible:ring-pink-500"
              suppressHydrationWarning
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input 
              id="password" 
              type="password" 
              placeholder="••••••••" 
              required 
              className="transition-all focus-visible:ring-pink-500"
              suppressHydrationWarning
            />
          </div>
          <div className="flex items-start space-x-2 pt-2">
            <Checkbox id="terms" className="mt-1 data-[state=checked]:bg-pink-500 data-[state=checked]:border-pink-500" suppressHydrationWarning />
            <Label htmlFor="terms" className="text-sm font-normal leading-tight">
              I agree to the{" "}
              <Link href="/terms" className="text-pink-500 hover:text-pink-600 transition-colors">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-pink-500 hover:text-pink-600 transition-colors">
                Privacy Policy
              </Link>
            </Label>
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
                Creating account...
              </>
            ) : (
              "Create account"
            )}
          </Button>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>
          <GoogleButton />
          <p className="text-sm text-center text-muted-foreground">
            Already have an account?{" "}
            <Link 
              href="/sign-in" 
              className="text-pink-500 hover:text-pink-600 transition-colors"
            >
              Sign in
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  )
} 