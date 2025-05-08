"use client"

import Link from "next/link"
import { useEffect } from "react"
import { BarChart3, Inbox, Mail, Settings, User } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"

export function AppSidebar() {
  const { state } = useSidebar()
  
  // This effect will add a data attribute to the document body
  // which can be used for styling based on sidebar state
  useEffect(() => {
    document.body.setAttribute('data-sidebar-state', state)
    
    return () => {
      document.body.removeAttribute('data-sidebar-state')
    }
  }, [state])
  
  return (
    <Sidebar 
      collapsible="icon" 
      variant="sidebar"
      className="border-r"
    >
      <SidebarHeader className="border-b border-border">
        {state === "expanded" ? (
          <div className="flex items-center gap-2 px-4 py-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-pink-500 text-white">
              <Mail className="h-4 w-4" />
            </div>
            <div className="font-semibold">SlideIn</div>
            <SidebarTrigger className="ml-auto" />
          </div>
        ) : (
          <div className="flex justify-center items-center py-2">
            <SidebarTrigger />
          </div>
        )}
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu className={state === "collapsed" ? "items-center" : ""}>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Email Generator" className={state === "collapsed" ? "justify-center" : ""}>
              <Link href="/email-generator">
                <Mail className="h-4 w-4" />
                <span>Email Generator</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Inbox Tracker" className={state === "collapsed" ? "justify-center" : ""}>
              <Link href="/inbox">
                <Inbox className="h-4 w-4" />
                <span>Inbox Tracker</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Analytics" className={state === "collapsed" ? "justify-center" : ""}>
              <Link href="/analytics">
                <BarChart3 className="h-4 w-4" />
                <span>Analytics</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="border-t border-border">
        <SidebarMenu className={state === "collapsed" ? "items-center" : ""}>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Settings" className={state === "collapsed" ? "justify-center" : ""}>
              <Link href="/settings">
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Profile" className={state === "collapsed" ? "justify-center" : ""}>
              <Link href="/profile">
                <User className="h-4 w-4" />
                <span>Profile</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
