import { Suspense } from "react"
import { SignInForm } from "@/components/auth/sign-in-form"
import { Logo } from "@/components/logo"
import TailwindSpinner from "@/components/ui/tailwind-spinner"

export default function SignInPage() {
  return (
    <div className="w-full max-w-md px-4">
      <div className="flex flex-col items-center space-y-8">
        <Logo className="h-12 w-12" />
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Welcome back</h1>
          <p className="text-muted-foreground">Sign in to your SlideIn account</p>
        </div>
        <Suspense 
          fallback={<TailwindSpinner />}
          key="sign-in-suspense"
        >
          <SignInForm />
        </Suspense>
      </div>
    </div>
  )
} 