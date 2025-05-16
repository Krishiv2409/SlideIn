"use client"

import { SidebarProvider } from "@/components/ui/sidebar"
import { useSidebar } from "@/components/ui/sidebar" 
import { AppSidebar } from "@/components/app-sidebar"
import { ReactNode } from "react"
import { Menu } from "lucide-react"

// Inner component to access sidebar context
function MainContentWithSidebar({ children }: { children: ReactNode }) {
  const { state } = useSidebar()
  
  return (
    <main 
      className="flex-1 overflow-auto transition-all duration-300 content-area flex flex-col items-center"
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
        <MobileSidebarButton />
        <AppSidebar />
        <MainContentWithSidebar>{children}</MainContentWithSidebar>
      </div>
    </SidebarProvider>
  )
}

function MobileSidebarButton() {
  const { toggleSidebar } = useSidebar();
  return (
    <button
      type="button"
      aria-label="Open sidebar"
      className="fixed top-4 left-4 z-50 rounded-md bg-white/90 p-2 shadow md:hidden border border-border"
      onClick={toggleSidebar}
    >
      <Menu className="h-6 w-6 text-foreground" />
    </button>
  );
} 