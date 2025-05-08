"use client"

import { SettingsForm } from "@/components/settings-form"

export default function SettingsPage() {
  return (
    <div className="container max-w-5xl py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your email accounts and preferences
        </p>
      </div>
      <SettingsForm />
    </div>
  )
} 