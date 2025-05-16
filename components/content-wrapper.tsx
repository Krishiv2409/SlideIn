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
  
  // Determine max-width based on route for proper centering
  let maxWidthClass = "max-w-4xl"
  if (pathname?.includes("email-generator")) {
    maxWidthClass = "max-w-full" // Allow email generator layout to control width
  }
  
  return (
    <div 
      className={`w-full flex flex-col items-center justify-center transition-all duration-300 ${containerClass} ${className}`}
      data-sidebar-state={state}
    >
      <div className={`w-full ${maxWidthClass} mx-auto transition-none`}>
        {children}
      </div>
    </div>
  )
}