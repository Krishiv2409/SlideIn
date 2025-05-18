"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import Image from "next/image"
import { 
  BarChart3, 
  Mail, 
  Inbox, 
  Settings, 
  User, 
  HelpCircle,
  Search,
  Menu
} from "lucide-react"
import { User as SupabaseUser } from '@supabase/supabase-js'

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
  SidebarTrigger
} from "@/components/ui/sidebar"
import { NavUser } from "./nav-user"
import { NavMain } from "./nav-main"
import { NavSecondary } from "./nav-secondary"
import { NavDocuments } from "./nav-documents"
import { NavLogo } from "./nav-logo"
import { createClient } from "@/utils/supabase/client"
import { Button } from "./ui/button"

interface AppSidebarProps {
  variant?: "sidebar" | "floating" | "inset"
  collapsible?: "offcanvas" | "icon" | "none"
  className?: string
}

export function AppSidebar({ 
  variant = "sidebar", 
  collapsible = "icon", 
  className 
}: AppSidebarProps) {
  const { state, toggleSidebar } = useSidebar()
  const [user, setUser] = useState<SupabaseUser | null>(null)

  // Fetch user data on component mount
  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient()
      const { data, error } = await supabase.auth.getUser()
      
      if (!error && data?.user) {
        setUser(data.user)
      }
    }
    
    fetchUser()
  }, [])
  
  // This effect will add a data attribute to the document body
  // which can be used for styling based on sidebar state
  useEffect(() => {
    document.body.setAttribute('data-sidebar-state', state)
    
    return () => {
      document.body.removeAttribute('data-sidebar-state')
    }
  }, [state])

  // Get user avatar URL - simplify to what worked before
  const getUserAvatar = (): string | undefined => {
    if (!user) return undefined;
    
    // Try to get URL from user_metadata first
    if (user.user_metadata?.picture) {
      return user.user_metadata.picture;
    }
    
    if (user.user_metadata?.avatar_url) {
      return user.user_metadata.avatar_url;
    }
    
    return undefined;
  };

  // Get the avatar URL
  const avatarUrl = getUserAvatar();

  // Set up sidebar data with user information
  const sidebarData = {
    user: {
      name: user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split('@')[0] || "User",
      email: user?.email || "loading@example.com",
      avatar: avatarUrl
    },
    navMain: [
      {
        title: "Email Generator",
        url: "/email-generator",
        icon: Mail,
      },
      {
        title: "Inbox Tracker",
        url: "/inbox",
        icon: Inbox,
      },
      {
        title: "Analytics",
        url: "/analytics",
        icon: BarChart3,
      },
    ],
    navSecondary: [
      {
        title: "Settings",
        url: "/settings",
        icon: Settings,
      },
      {
        title: "Profile",
        url: "/profile",
        icon: User,
        comingSoon: true
      },
      {
        title: "Help",
        url: "/help",
        icon: HelpCircle,
        comingSoon: true
      },
      {
        title: "Search",
        url: "/search",
        icon: Search,
        comingSoon: true
      },
    ],
    documents: [
      {
        name: "Emails",
        url: "/emails",
        icon: Inbox,
        comingSoon: true
      },
      {
        name: "Reports",
        url: "/reports",
        icon: BarChart3,
        comingSoon: true
      },
      {
        name: "Drafts",
        url: "/drafts",
        icon: Mail,
        comingSoon: true
      },
    ],
  }
  
  return (
    <Sidebar 
      collapsible={collapsible} 
      variant={variant}
      className={className || ''}
    >
      <SidebarHeader className="border-b border-border">
        <div className="flex h-14 items-center px-3">
          <Button 
            variant="ghost" 
            size="icon" 
            className={`h-10 w-10 flex items-center justify-center hover:bg-accent ${state === "collapsed" ? "mx-auto" : ""}`}
            onClick={toggleSidebar}
          >
            <Menu className="h-6 w-6" />
            <span className="sr-only">Toggle sidebar</span>
          </Button>
          
          {state !== "collapsed" && (
            <div className="ml-2 flex-1 flex items-center">
              <Link href="/email-generator">
                <Image
                  src="/plane-logo.svg"
                  alt="SlideIn Logo"
                  width={26}
                  height={26}
                />
              </Link>
              <img 
                src="/logo-text.svg" 
                alt="SlideIn" 
                className="ml-2 h-4"
              />
            </div>
          )}
        </div>
      </SidebarHeader>
      <SidebarContent className="py-2">
        <NavMain items={sidebarData.navMain} />
        <NavDocuments items={sidebarData.documents} className="mt-6" />
        <NavSecondary items={sidebarData.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter className={`border-t border-border ${state === "collapsed" ? "flex items-center justify-center py-4" : ""}`}>
        <NavUser user={sidebarData.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
