"use client"

import React, { useState } from 'react'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import { Moon, Sun, Bell, Search, User, Menu, LogOut, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'

interface HeaderProps {
  onMenuClick?: () => void
  className?: string
}

export default function Header({ onMenuClick, className }: HeaderProps) {
  const { theme, setTheme } = useTheme()
  const { username, userRole, isSuperAdmin, logout } = useAuth()
  const [showUserMenu, setShowUserMenu] = useState(false)

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  const handleLogout = () => {
    setShowUserMenu(false)
    logout()
  }

  return (
    <header className={cn(
      "sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
      className
    )}>
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Left side - Mobile menu button and search */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={onMenuClick}
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          <div className="hidden md:flex items-center relative">
            <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search..."
              className="pl-10 pr-4 py-2 bg-muted/50 rounded-lg border-0 focus:ring-2 focus:ring-ring focus:bg-background transition-colors w-64"
            />
          </div>
        </div>

        {/* Center - Page title */}
        <div className="flex-1 md:flex-none">
          <h1 className="text-lg font-semibold">Dashboard</h1>
        </div>

        {/* Right side - Actions and user menu */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="md:hidden">
            <Search className="h-5 w-5" />
          </Button>
          
          <Button variant="ghost" size="icon">
            <Bell className="h-5 w-5" />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
          >
            {theme === 'dark' ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>
          
          {/* User Menu */}
          <div className="relative">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="relative"
            >
              <User className="h-5 w-5" />
            </Button>
            
            {showUserMenu && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setShowUserMenu(false)}
                />
                <div className="absolute right-0 mt-2 w-56 bg-background border rounded-lg shadow-lg z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b bg-muted/50">
                    <p className="text-sm font-medium">Signed in as</p>
                    <p className="text-sm text-muted-foreground truncate">{username || 'User'}</p>
                    {isSuperAdmin && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gradient-to-r from-yellow-500 to-orange-500 text-white mt-1">
                        Super Admin
                      </span>
                    )}
                  </div>
                  <div className="py-1">
                    <button
                      onClick={() => {
                        setShowUserMenu(false)
                        // Add settings navigation here if needed
                      }}
                      className="w-full px-4 py-2 text-sm text-left hover:bg-muted/50 flex items-center gap-2"
                    >
                      <Settings className="h-4 w-4" />
                      Settings
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full px-4 py-2 text-sm text-left hover:bg-muted/50 flex items-center gap-2 text-red-600 dark:text-red-400"
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}