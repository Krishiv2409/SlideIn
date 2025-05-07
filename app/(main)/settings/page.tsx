import { SettingsForm } from "@/components/settings-form"

export default function SettingsPage() {
  return (
    <div className="flex justify-center w-full min-h-screen px-2 md:px-8 py-8">
      <div className="w-full max-w-4xl">
        <div className="mb-8 space-y-2">
          <h1 className="text-3xl font-bold">Settings ⚙️</h1>
          <p className="text-muted-foreground">Configure your email accounts and preferences</p>
        </div>
        <SettingsForm />
      </div>
    </div>
  )
} 