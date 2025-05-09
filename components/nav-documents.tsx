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
                  tooltip={item.name}
                  className="rounded-lg"
                >
                  <Link href={item.url}>
                    <Icon className="h-4 w-4" />
                    <span>{item.name}</span>
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