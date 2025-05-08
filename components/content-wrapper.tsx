"use client"

import { ReactNode } from "react"
import { useSidebar } from "@/components/ui/sidebar"
import { usePathname } from "next/navigation"

interface ContentWrapperProps {
  children: ReactNode
  className?: string
}

export function ContentWrapper({ children, className = "" }: ContentWrapperProps) {
  const { state } = useSidebar()
  const pathname = usePathname()
  
  // Determine container class based on route
  let containerClass = ""
  if (pathname?.includes("email-generator")) {
    containerClass = "email-generator-container"
  } else if (pathname?.includes("inbox")) {
    containerClass = "inbox-tracker-container"
  }
  
  return (
    <div 
      className={`w-full transition-all duration-300 ${containerClass} ${className}`}
      data-sidebar-state={state}
    >
      {children}
    </div>
  )
}