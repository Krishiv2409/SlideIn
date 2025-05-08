"use client"

import { InboxTracker } from "@/components/inbox-tracker"
import { ContentWrapper } from "@/components/content-wrapper"

export default function InboxPage() {
  return (
    <ContentWrapper>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Inbox Tracker 📊</h1>
        <p className="text-muted-foreground">Track and manage all your cold email campaigns</p>
      </div>
      <div className="w-full">
        <InboxTracker />
      </div>
    </ContentWrapper>
  )
}