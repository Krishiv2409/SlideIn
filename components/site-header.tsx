"use client"

import React from "react"
import { MenuIcon } from "lucide-react"
import { useSidebar } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { NavLogo } from "./nav-logo"

interface SiteHeaderProps {
  className?: string
}

export function SiteHeader({ className }: SiteHeaderProps) {
  const { toggleSidebar } = useSidebar()

  return (
    <header className={`flex items-center p-4 border-b ${className || ""}`}>
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="icon" 
          className="md:flex h-9 w-9" 
          onClick={toggleSidebar}
        >
          <MenuIcon className="h-5 w-5" />
          <span className="sr-only">Toggle sidebar</span>
        </Button>
        <div className="hidden md:block">
          <NavLogo size="sm" showBackground={false} />
        </div>
        <h1 className="text-xl font-semibold md:ml-4">Dashboard</h1>
      </div>
      <div className="ml-auto flex items-center gap-2">
        {/* Additional header items can go here */}
      </div>
    </header>
  )
} 