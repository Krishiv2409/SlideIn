"use client"

import { SettingsForm } from "@/components/settings-form"

export default function SettingsPage() {
  return (
    <div className="w-full h-full flex flex-col items-center justify-start pt-12">
      <div className="mb-8 w-full max-w-3xl px-4">
        <h1 className="text-3xl font-bold tracking-tight text-left">Settings</h1>
        <p className="text-muted-foreground text-left">
          Manage your email accounts and preferences
        </p>
      </div>
      <div className="w-full max-w-3xl flex-1 flex flex-col items-center justify-center">
        <SettingsForm />
      </div>
    </div>
  )
}