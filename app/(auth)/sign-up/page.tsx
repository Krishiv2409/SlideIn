import { SignUpForm } from "@/components/auth/sign-up-form"
import { Logo } from "@/components/logo"

export default function SignUpPage() {
  return (
    <div className="w-full max-w-md px-4">
      <div className="flex flex-col items-center space-y-8">
        <Logo className="h-12 w-12" />
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Create an account</h1>
          <p className="text-muted-foreground">Sign up to start using SlideIn</p>
        </div>
        <SignUpForm />
      </div>
    </div>
  )
} 