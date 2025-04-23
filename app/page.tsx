import { EmailGenerator } from "@/components/email-generator"

export default function Home() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="w-full max-w-4xl px-6">
        <div className="mb-8 space-y-2">
          <h1 className="text-3xl font-bold">Email Generator 💌</h1>
          <p className="text-muted-foreground">Generate personalized cold emails from URLs with AI</p>
        </div>
        <EmailGenerator />
      </div>
    </div>
  )
}
