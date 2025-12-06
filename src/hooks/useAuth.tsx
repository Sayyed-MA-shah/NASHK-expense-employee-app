'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'

export function useAuth() {
  const router = useRouter()
  const pathname = usePathname()
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [username, setUsername] = useState<string>('')

  useEffect(() => {
    // Check authentication status
    const authStatus = localStorage.getItem('isAuthenticated')
    const storedUsername = localStorage.getItem('username')
    
    if (authStatus === 'true') {
      setIsAuthenticated(true)
      setUsername(storedUsername || '')
    } else {
      setIsAuthenticated(false)
      // Redirect to login if not authenticated and not already on login page
      if (pathname !== '/login') {
        router.push('/login')
      }
    }
  }, [pathname, router])

  const logout = () => {
    localStorage.removeItem('isAuthenticated')
    localStorage.removeItem('username')
    setIsAuthenticated(false)
    router.push('/login')
  }

  return {
    isAuthenticated,
    username,
    logout,
    isLoading: isAuthenticated === null
  }
}
