'use client'

import type { ReactNode } from 'react'
import { ThemeProvider } from "@/components/theme-provider"
import { LayoutWrapper } from "@/components/layout-wrapper"

interface ThemeWrapperProps {
  children: ReactNode
}

export function ThemeWrapper({ children }: ThemeWrapperProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
      <LayoutWrapper>
        {children}
      </LayoutWrapper>
    </ThemeProvider>
  )
} 