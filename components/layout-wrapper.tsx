"use client"

import { SidebarProvider } from "@/components/ui/sidebar"
import { useSidebar } from "@/components/ui/sidebar" 
import { AppSidebar } from "@/components/app-sidebar"
import { ReactNode } from "react"

// Inner component to access sidebar context
function MainContentWithSidebar({ children }: { children: ReactNode }) {
  const { state } = useSidebar()
  
  return (
    <main 
      className="flex-1 overflow-auto transition-all duration-300 content-area"
      data-sidebar-state={state}
    >
      {children}
    </main>
  )
}

interface LayoutWrapperProps {
  children: ReactNode
}

export function LayoutWrapper({ children }: LayoutWrapperProps) {
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex h-screen w-full overflow-hidden">
        <AppSidebar />
        <MainContentWithSidebar>{children}</MainContentWithSidebar>
      </div>
    </SidebarProvider>
  )
} 