"use client"

import { LucideIcon } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  useSidebar,
} from "@/components/ui/sidebar"

interface DocumentItem {
  name: string
  url: string
  icon: LucideIcon
  comingSoon?: boolean
}

interface NavDocumentsProps {
  items: DocumentItem[]
  className?: string
}

export function NavDocuments({ items, className }: NavDocumentsProps) {
  const pathname = usePathname()
  const { state } = useSidebar()
  
  return (
    <SidebarGroup className={className}>
      <SidebarGroupLabel>Documents</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => {
            const isActive = pathname === item.url
            const Icon = item.icon
            
            return (
              <SidebarMenuItem key={item.name}>
                <SidebarMenuButton 
                  asChild 
                  isActive={isActive}
                  tooltip={item.comingSoon ? `${item.name} (Coming Soon)` : item.name}
                  className="rounded-lg"
                >
                  <Link 
                    href={item.comingSoon ? "#" : item.url}
                    onClick={item.comingSoon ? (e) => e.preventDefault() : undefined}
                    className={item.comingSoon ? "cursor-default opacity-70" : ""}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="flex items-center gap-2">
                      {item.name}
                      {item.comingSoon && state !== "collapsed" && (
                        <span className="ml-1 rounded-full bg-gray-200 px-2 py-0.5 text-[10px] font-medium text-gray-500">
                          Soon
                        </span>
                      )}
                    </span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
} 