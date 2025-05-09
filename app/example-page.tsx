"use client"

import { AppSidebar } from "../components/app-sidebar"
import { SiteHeader } from "../components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

export default function ExamplePage() {
  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset className="bg-sidebar">
        <div className="m-2 rounded-xl bg-background shadow overflow-hidden">
          <SiteHeader />
          <div className="flex flex-1 flex-col">
            <div className="flex flex-1 flex-col gap-2">
              <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                <div className="px-4 md:px-6">
                  <h2 className="text-lg font-medium mb-2">Updated Sidebar Features</h2>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-base font-medium">Toggle Button on Main Content</h3>
                      <p>The sidebar toggle button is now located in the SiteHeader component, which is part of the main content area, not the sidebar itself.</p>
                    </div>
                    
                    <div>
                      <h3 className="text-base font-medium">Improved User Profile</h3>
                      <p>The user profile section now uses SidebarMenu components for proper styling, with rounded corners and better layout.</p>
                    </div>
                    
                    <div>
                      <h3 className="text-base font-medium">Google Avatar Integration</h3>
                      <p>Enhanced Google avatar detection with multiple fallback strategies to show the user's profile picture.</p>
                    </div>
                    
                    <div>
                      <h3 className="text-base font-medium">Rounded UI Elements</h3>
                      <p>All UI elements now have consistent rounded corners, and the main content area has a rounded container over the background.</p>
                    </div>
                    
                    <div>
                      <h3 className="text-base font-medium">Centered Logo</h3>
                      <p>The logo area is properly implemented with SidebarMenu components for consistent display in both expanded and collapsed states.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
} 