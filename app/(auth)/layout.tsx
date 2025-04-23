import type { Metadata } from "next"
import { Inter } from 'next/font/google'
import "@/app/globals.css"
import { ThemeProvider } from "@/components/theme-provider"

const inter = Inter({ subsets: ["latin"] })

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
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <main className="min-h-screen flex items-center justify-center bg-gray-50">
            {children}
          </main>
        </ThemeProvider>
      </body>
    </html>
  )
} 