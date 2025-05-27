import { SignUpForm } from "@/components/auth/sign-up-form"
import { Suspense } from "react"
import TailwindSpinner from "@/components/ui/tailwind-spinner"

export default function SignUpPage() {
  return (
    <div className="w-full max-w-xl px-4">
      <Suspense 
        fallback={<TailwindSpinner />}
        key="sign-up-suspense"
      >
        <SignUpForm />
      </Suspense>
    </div>
  )
} 