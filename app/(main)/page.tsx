import { EmailGenerator } from "@/components/email-generator"

export default function Home() {
  return (
    <div className="flex justify-center w-full min-h-screen px-2 md:px-8 py-8">
      <div className="w-full max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-left">Email Generator 💌</h1>
          <p className="text-muted-foreground text-left mt-2">Generate personalized cold emails from URLs with AI</p>
        </div>
        <EmailGenerator />
      </div>
    </div>
  )
} 