import type { Metadata } from "next"
import { CustomToaster } from "@/components/ui/toast-config"
import { UserProvider } from "@/components/providers/user-provider"
import "./globals.css"
import { inter } from "./fonts"
import { EmojiProvider } from "@/components/providers/emoji-provider"

export const metadata: Metadata = {
  title: "SlideIn - AI-Powered Cold Email Tool",
  description: "Generate, send, and track cold emails with AI",
  generator: 'v0.dev',
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon-16x16.svg', sizes: '16x16', type: 'image/svg+xml' },
      { url: '/favicon-192x192.svg', sizes: '192x192', type: 'image/svg+xml' }
    ]
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <head>
        <link href="https://api.fontshare.com/v2/css?f[]=satoshi@400,500,700&display=swap" rel="stylesheet" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="icon" href="/favicon-16x16.svg" sizes="16x16" type="image/svg+xml" />
        <link rel="icon" href="/favicon-192x192.svg" sizes="192x192" type="image/svg+xml" />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <EmojiProvider>
          <UserProvider>
            {children}
            <CustomToaster />
          </UserProvider>
        </EmojiProvider>
      </body>
    </html>
  )
}
