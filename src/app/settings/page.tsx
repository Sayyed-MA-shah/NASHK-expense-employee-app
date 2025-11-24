'use client'

import DashboardLayout from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useSettings } from '@/contexts/SettingsContext'
import { useState } from 'react'
import { Check } from 'lucide-react'

export default function SettingsPage() {
  const { settings, updateSettings, resetSettings } = useSettings()
  const [showSaveMessage, setShowSaveMessage] = useState(false)

  const handleSave = () => {
    setShowSaveMessage(true)
    setTimeout(() => setShowSaveMessage(false), 3000)
  }

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all settings to defaults?')) {
      resetSettings()
      setShowSaveMessage(true)
      setTimeout(() => setShowSaveMessage(false), 3000)
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
            <p className="text-muted-foreground">
              Manage your application preferences and system configuration
            </p>
          </div>
          {showSaveMessage && (
            <div className="flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-md">
              <Check className="h-4 w-4" />
              <span>Settings saved successfully!</span>
            </div>
          )}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* User Settings */}
          <Card>
            <CardHeader>
              <CardTitle>User Preferences</CardTitle>
              <CardDescription>
                Customize your personal dashboard experience
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Theme</p>
                    <p className="text-sm text-muted-foreground">Choose your preferred theme</p>
                  </div>
                  <select 
                    className="px-3 py-2 border rounded-md" 
                    value={settings.theme}
                    onChange={(e) => updateSettings({ theme: e.target.value })}
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value="system">System</option>
                  </select>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Language</p>
                    <p className="text-sm text-muted-foreground">Select your language</p>
                  </div>
                  <select 
                    className="px-3 py-2 border rounded-md" 
                    value={settings.language}
                    onChange={(e) => updateSettings({ language: e.target.value })}
                  >
                    <option value="en-US">English (US)</option>
                    <option value="en-GB">English (UK)</option>
                    <option value="en-PK">English (Pakistan)</option>
                    <option value="ur-PK">Urdu (Pakistan)</option>
                  </select>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Currency</p>
                    <p className="text-sm text-muted-foreground">Default currency for display throughout the app</p>
                  </div>
                  <select 
                    className="px-3 py-2 border rounded-md font-medium" 
                    value={settings.currency}
                    onChange={(e) => {
                      const currency = e.target.value
                      const localeMap: Record<string, string> = {
                        'PKR': 'en-PK',
                        'USD': 'en-US',
                        'EUR': 'en-GB',
                        'GBP': 'en-GB',
                        'INR': 'en-IN',
                        'AED': 'en-AE',
                        'SAR': 'en-SA',
                      }
                      updateSettings({ 
                        currency, 
                        locale: localeMap[currency] || 'en-US' 
                      })
                    }}
                  >
                    <option value="PKR">PKR (Rs) - Pakistani Rupee</option>
                    <option value="USD">USD ($) - US Dollar</option>
                    <option value="EUR">EUR (€) - Euro</option>
                    <option value="GBP">GBP (£) - British Pound</option>
                    <option value="INR">INR (₹) - Indian Rupee</option>
                    <option value="AED">AED (د.إ) - UAE Dirham</option>
                    <option value="SAR">SAR (ر.س) - Saudi Riyal</option>
                  </select>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Time Format</p>
                    <p className="text-sm text-muted-foreground">Choose time display format</p>
                  </div>
                  <select 
                    className="px-3 py-2 border rounded-md" 
                    value={settings.timeFormat}
                    onChange={(e) => updateSettings({ timeFormat: e.target.value as '12h' | '24h' })}
                  >
                    <option value="12h">12 Hour</option>
                    <option value="24h">24 Hour</option>
                  </select>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Date Format</p>
                    <p className="text-sm text-muted-foreground">Choose date display format</p>
                  </div>
                  <select 
                    className="px-3 py-2 border rounded-md" 
                    value={settings.dateFormat}
                    onChange={(e) => updateSettings({ dateFormat: e.target.value })}
                  >
                    <option value="dd/MM/yyyy">DD/MM/YYYY</option>
                    <option value="MM/dd/yyyy">MM/DD/YYYY</option>
                    <option value="yyyy-MM-dd">YYYY-MM-DD</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>
                Configure how you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Email Notifications</p>
                  <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                </div>
                <input 
                  type="checkbox" 
                  checked={settings.notifications.email}
                  onChange={(e) => updateSettings({ 
                    notifications: { ...settings.notifications, email: e.target.checked } 
                  })}
                  className="h-4 w-4"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Push Notifications</p>
                  <p className="text-sm text-muted-foreground">Receive browser notifications</p>
                </div>
                <input 
                  type="checkbox" 
                  checked={settings.notifications.push}
                  onChange={(e) => updateSettings({ 
                    notifications: { ...settings.notifications, push: e.target.checked } 
                  })}
                  className="h-4 w-4"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Payment Alerts</p>
                  <p className="text-sm text-muted-foreground">Get notified about payment activity</p>
                </div>
                <input 
                  type="checkbox" 
                  checked={settings.notifications.paymentAlerts}
                  onChange={(e) => updateSettings({ 
                    notifications: { ...settings.notifications, paymentAlerts: e.target.checked } 
                  })}
                  className="h-4 w-4"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Expense Alerts</p>
                  <p className="text-sm text-muted-foreground">Get notified about expense submissions</p>
                </div>
                <input 
                  type="checkbox" 
                  checked={settings.notifications.expenseAlerts}
                  onChange={(e) => updateSettings({ 
                    notifications: { ...settings.notifications, expenseAlerts: e.target.checked } 
                  })}
                  className="h-4 w-4"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Weekly Reports</p>
                  <p className="text-sm text-muted-foreground">Receive weekly summary reports</p>
                </div>
                <input 
                  type="checkbox" 
                  checked={settings.notifications.weeklyReport}
                  onChange={(e) => updateSettings({ 
                    notifications: { ...settings.notifications, weeklyReport: e.target.checked } 
                  })}
                  className="h-4 w-4"
                />
              </div>
            </CardContent>
          </Card>

          {/* Currency Information */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Currency Settings</CardTitle>
              <CardDescription>
                Current currency configuration and preview
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground">Selected Currency</p>
                  <p className="text-2xl font-bold mt-2">{settings.currency}</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground">Locale</p>
                  <p className="text-2xl font-bold mt-2">{settings.locale}</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground">Sample Amount</p>
                  <p className="text-2xl font-bold mt-2">
                    {new Intl.NumberFormat(settings.locale, {
                      style: 'currency',
                      currency: settings.currency,
                    }).format(150000)}
                  </p>
                </div>
              </div>
              <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  ℹ️ Currency changes apply to all amounts displayed throughout the application including:
                </p>
                <ul className="mt-2 text-sm text-blue-800 dark:text-blue-200 list-disc list-inside">
                  <li>Dashboard statistics and charts</li>
                  <li>Payment records (PayIn/PayOut)</li>
                  <li>Expense submissions and approvals</li>
                  <li>Employee salaries and advances</li>
                  <li>PDF reports and exports</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end gap-4 pb-8">
          <Button variant="outline" onClick={handleReset}>
            Reset to Defaults
          </Button>
          <Button onClick={handleSave}>
            Save Changes
          </Button>
        </div>
      </div>
    </DashboardLayout>
  )
}
