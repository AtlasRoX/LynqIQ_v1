// app/dashboard/layout.tsx
'use client'

import React, { useState } from 'react'
import { Sidebar } from '@/components/dashboard/sidebar'
import { TopNavbar } from '@/components/dashboard/top-navbar'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed)
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* The Sidebar is now state-aware */}
      <Sidebar isCollapsed={isCollapsed} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* The TopNavbar now contains the toggle button */}
        <TopNavbar toggleSidebar={toggleSidebar} />
        
        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          <div className="min-h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
