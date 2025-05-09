"use client"

import { BellIcon, CreditCardIcon, LogOutIcon, UserCircleIcon, MoreVerticalIcon } from "lucide-react"
import Link from "next/link"
import { useRouter } from 'next/navigation'
import { useState } from "react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar"
import { createClient } from "@/utils/supabase/client"

interface UserData {
  name: string
  email: string
  avatar?: string
}

interface NavUserProps {
  user: UserData
}

export function NavUser({ user }: NavUserProps) {
  const { state, isMobile } = useSidebar()
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  
  const initials = user.name
    .split(' ')
    .map(name => name[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'U';
  
  const handleLogout = async () => {
    try {
      setIsLoggingOut(true)
      const supabase = createClient()
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        throw error
      }
      
      // Force page reload to ensure session state is completely reset
      window.location.href = '/sign-in'
    } catch (error) {
      console.error('Error signing out:', error)
    } finally {
      setIsLoggingOut(false)
    }
  }
    
  return (
    <SidebarMenu>
      <SidebarMenuItem className={state === "collapsed" ? "flex justify-center" : ""}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className={`data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground rounded-lg ${state === "collapsed" ? "justify-center px-0" : ""}`}
            >
              {state === "collapsed" ? (
                <div className="h-8 w-8 rounded-lg overflow-hidden bg-gray-700 flex items-center justify-center">
                  {user.avatar ? (
                    <img 
                      src={user.avatar} 
                      alt={user.name}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        if (e.currentTarget.parentElement) {
                          e.currentTarget.parentElement.textContent = initials;
                        }
                      }}
                    />
                  ) : (
                    <span className="text-white">{initials}</span>
                  )}
                </div>
              ) : (
                <Avatar className="h-8 w-8 rounded-lg">
                  {user.avatar ? (
                    <AvatarImage 
                      src={user.avatar} 
                      alt={user.name}
                    />
                  ) : (
                    <AvatarFallback className="rounded-lg bg-gray-700 text-white">{initials}</AvatarFallback>
                  )}
                </Avatar>
              )}
              
              {state === "expanded" && (
                <div className="grid flex-1 text-left text-sm leading-tight overflow-hidden">
                  <span className="truncate font-medium">{user.name}</span>
                  <span className="truncate text-xs text-muted-foreground">{user.email}</span>
                </div>
              )}
              {state === "expanded" && <MoreVerticalIcon className="ml-auto size-4" />}
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side="right"
            align="center"
            sideOffset={8}
            style={{ zIndex: 999 }}
          >
            <div className="flex items-center gap-2 px-3 py-2 text-left text-sm">
              <Avatar className="h-8 w-8 rounded-lg">
                {user.avatar ? (
                  <AvatarImage 
                    src={user.avatar} 
                    alt={user.name} 
                  />
                ) : (
                  <AvatarFallback className="rounded-lg bg-gray-700 text-white">{initials}</AvatarFallback>
                )}
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user.name}</span>
                <span className="truncate text-xs text-muted-foreground">{user.email}</span>
              </div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <Link href="/account" className="flex items-center">
                  <UserCircleIcon className="mr-2 h-4 w-4" />
                  <span>Account</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/billing" className="flex items-center">
                  <CreditCardIcon className="mr-2 h-4 w-4" />
                  <span>Billing</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/notifications" className="flex items-center">
                  <BellIcon className="mr-2 h-4 w-4" />
                  <span>Notifications</span>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} disabled={isLoggingOut} className="cursor-pointer">
              <LogOutIcon className="mr-2 h-4 w-4" />
              <span>{isLoggingOut ? "Logging out..." : "Log out"}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
} 