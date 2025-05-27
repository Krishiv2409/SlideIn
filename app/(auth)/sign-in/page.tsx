import { Suspense } from "react"
import { SignInForm } from "@/components/auth/sign-in-form"
import TailwindSpinner from "@/components/ui/tailwind-spinner"

export default function SignInPage() {
  return (
    <div className="w-full max-w-xl px-4">
      <Suspense 
        fallback={<TailwindSpinner />}
        key="sign-in-suspense"
      >
        <SignInForm />
      </Suspense>
    </div>
  )
} 