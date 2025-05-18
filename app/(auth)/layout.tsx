import type { Metadata } from "next"
import "@/app/globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { inter } from "@/app/fonts"

export const metadata: Metadata = {
  title: "Authentication - SlideIn",
  description: "Sign in or sign up to SlideIn",
}

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
      <main className={`min-h-screen flex items-center justify-center py-12 bg-gradient-to-b from-white to-gray-100 ${inter.className}`}>
        {children}
      </main>
    </ThemeProvider>
  )
} 