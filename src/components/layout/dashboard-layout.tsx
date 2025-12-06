"use client"

import React, { useState } from 'react'
import Header from './header'
import Sidebar from './sidebar'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'

interface DashboardLayoutProps {
  children: React.ReactNode
  className?: string
}

export default function DashboardLayout({ children, className }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { isAuthenticated, isLoading } = useAuth()

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const closeSidebar = () => {
    setSidebarOpen(false)
  }

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // Don't render layout if not authenticated (will redirect to login)
  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />
      
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header onMenuClick={toggleSidebar} />
        
        <main className={cn(
          "flex-1 overflow-x-hidden overflow-y-auto bg-background p-6",
          className
        )}>
          {children}
        </main>
      </div>
    </div>
  )
}