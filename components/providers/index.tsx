"use client"

import { ThemeProvider } from "next-themes"
import { UserProvider } from "./user-provider"
import { CustomToaster } from "../ui/toast-config"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <UserProvider>
        {children}
        <CustomToaster />
      </UserProvider>
    </ThemeProvider>
  )
} 