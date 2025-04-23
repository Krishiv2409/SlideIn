import { InboxTracker } from "@/components/inbox-tracker"

export default function InboxPage() {
  return (
    <div className="container mx-auto max-w-7xl py-6">
      <div className="mb-8 space-y-2">
        <h1 className="text-3xl font-bold">Inbox Tracker 📊</h1>
        <p className="text-muted-foreground">Track and manage all your cold email campaigns</p>
      </div>
      <InboxTracker />
    </div>
  )
}
