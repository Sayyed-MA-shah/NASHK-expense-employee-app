'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ToastContainer, useToast } from '@/components/ui/toast'
import { Eye, EyeOff, Lock, User, LogIn } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const { toasts, toast, removeToast } = useToast()
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  })

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    
    if (!formData.username || !formData.password) {
      toast.warning('Missing Fields', 'Please enter both username and password')
      return
    }

    setLoading(true)

    try {
      // Simulate authentication
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Super Admin credentials
      const SUPER_ADMIN_USERNAME = 'Bilal_admin'
      const SUPER_ADMIN_PASSWORD = 'Bilal984134'

      // Check for super admin login
      if (formData.username === SUPER_ADMIN_USERNAME && formData.password === SUPER_ADMIN_PASSWORD) {
        // Store authentication state with admin role
        localStorage.setItem('isAuthenticated', 'true')
        localStorage.setItem('username', formData.username)
        localStorage.setItem('userRole', 'super_admin')
        
        toast.success('Login Successful', `Welcome back, Super Admin!`)
        
        // Redirect to dashboard after short delay
        setTimeout(() => {
          router.push('/')
        }, 500)
      } else {
        toast.error('Login Failed', 'Invalid username or password')
        setLoading(false)
      }
    } catch (error) {
      console.error('Login error:', error)
      toast.error('Login Failed', 'An error occurred. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
      <div className="w-full max-w-md">
        {/* Logo/Brand Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-2xl mb-4 shadow-lg">
            <Lock className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            NASHK Portal
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Employee & Expense Management System
          </p>
        </div>

        {/* Login Card */}
        <Card className="shadow-2xl border-0">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-2xl font-bold text-center">Sign In</CardTitle>
            <CardDescription className="text-center">
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              {/* Username Field */}
              <div className="space-y-2">
                <label htmlFor="username" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Username
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    id="username"
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    placeholder="Enter your username"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 transition-all"
                    disabled={loading}
                    autoFocus
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Enter your password"
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 transition-all"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    disabled={loading}
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                    disabled={loading}
                  />
                  <span className="text-gray-600 dark:text-gray-400">Remember me</span>
                </label>
                <button
                  type="button"
                  className="text-primary hover:underline font-medium"
                  disabled={loading}
                >
                  Forgot password?
                </button>
              </div>

              {/* Login Button */}
              <Button
                type="submit"
                className="w-full py-3 text-base font-semibold"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Signing in...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <LogIn className="w-5 h-5 mr-2" />
                    Sign In
                  </div>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-6 text-sm text-gray-600 dark:text-gray-400">
          <p>© 2025 NASHK Portal. All rights reserved.</p>
        </div>
      </div>

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  )
}
