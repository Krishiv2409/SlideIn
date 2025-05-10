import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { CustomToaster } from "@/components/ui/toast-config"
import { UserProvider } from "@/components/providers/user-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "SlideIn - AI-Powered Cold Email Tool",
  description: "Generate, send, and track cold emails with AI",
  generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <UserProvider>
          {children}
        </UserProvider>
        <CustomToaster />
      </body>
    </html>
  )
}
