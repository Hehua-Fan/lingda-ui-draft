"use client"

import { useState } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { AgentsContent } from "@/components/agents-content"
import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"
import { useIsMobile } from "@/hooks/use-mobile"

export default function RootPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const isMobile = useIsMobile()

  return (
    <div className="flex h-screen relative overflow-hidden" style={{ backgroundColor: '#f8f8f7' }}>
      
      {/* Sidebar */}
      <div className={isMobile ? "lg:block" : "block"}>
        <AppSidebar 
          className={isMobile ? "hidden" : ""}
          isMobile={isMobile}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
      </div>
      
      {/* Mobile Sidebar */}
      {isMobile && (
        <AppSidebar 
          isMobile={true}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Actions */}
        {isMobile && (
          <div className="flex justify-start items-center p-4 sm:p-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden hover:bg-gray-100 transition-colors cursor-pointer"
              style={{ color: '#2c80ff' }}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        )}

        {/* Content */}
        <main className="flex-1 overflow-auto">
          <div className="p-4 sm:p-6">
            <AgentsContent />
          </div>
        </main>
      </div>
    </div>
  )
}