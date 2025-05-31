import type React from "react"
import type { Metadata } from "next"
import "@/app/globals.css"
import { ThemeWrapper } from "@/components/theme-wrapper"
import { inter } from "@/app/fonts"

export const metadata: Metadata = {
  title: "SlideIn - AI-Powered Cold Email Tool",
  description: "Generate, send, and track cold emails with AI",
  generator: 'v0.dev'
}

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ThemeWrapper>
      {children}
    </ThemeWrapper>
  )
} 