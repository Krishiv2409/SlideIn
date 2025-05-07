import { InboxTracker } from "@/components/inbox-tracker"

export default function InboxPage() {
  return (
    <div className="flex justify-center w-full min-h-screen px-2 md:px-8 py-8">
      <div className="w-full max-w-4xl">
        <div className="mb-8 space-y-2">
          <h1 className="text-3xl font-bold">Inbox Tracker 📊</h1>
          <p className="text-muted-foreground">Track and manage all your cold email campaigns</p>
        </div>
        <InboxTracker />
      </div>
    </div>
  )
} 