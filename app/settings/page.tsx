import { SettingsForm } from "@/components/settings-form"

export default function SettingsPage() {
  return (
    <div className="container mx-auto max-w-6xl py-6">
      <div className="mb-8 space-y-2">
        <h1 className="text-3xl font-bold">Settings ⚙️</h1>
        <p className="text-muted-foreground">Configure your email accounts and preferences</p>
      </div>
      <SettingsForm />
    </div>
  )
}
