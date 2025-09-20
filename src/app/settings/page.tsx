import DashboardLayout from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { mockUserSettings, mockSystemSettings } from '@/lib/mockData'

export default function SettingsPage() {
  const userSettings = mockUserSettings
  const systemSettings = mockSystemSettings

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Manage your application preferences and system configuration
          </p>
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
                  <select className="px-3 py-2 border rounded-md" defaultValue={userSettings.theme}>
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
                  <select className="px-3 py-2 border rounded-md" defaultValue={userSettings.language}>
                    <option value="en-US">English (US)</option>
                    <option value="en-GB">English (UK)</option>
                    <option value="es-ES">Spanish</option>
                    <option value="fr-FR">French</option>
                  </select>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Currency</p>
                    <p className="text-sm text-muted-foreground">Default currency for display</p>
                  </div>
                  <select className="px-3 py-2 border rounded-md" defaultValue={userSettings.currency}>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="JPY">JPY (¥)</option>
                  </select>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Time Format</p>
                    <p className="text-sm text-muted-foreground">Choose time display format</p>
                  </div>
                  <select className="px-3 py-2 border rounded-md" defaultValue={userSettings.timeFormat}>
                    <option value="12h">12 Hour</option>
                    <option value="24h">24 Hour</option>
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
                  defaultChecked={userSettings.notifications.email}
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
                  defaultChecked={userSettings.notifications.push}
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
                  defaultChecked={userSettings.notifications.paymentAlerts}
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
                  defaultChecked={userSettings.notifications.expenseAlerts}
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
                  defaultChecked={userSettings.notifications.weeklyReport}
                  className="h-4 w-4"
                />
              </div>
            </CardContent>
          </Card>

          {/* System Settings */}
          <Card>
            <CardHeader>
              <CardTitle>System Configuration</CardTitle>
              <CardDescription>
                Global system settings and company information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div>
                  <label className="text-sm font-medium">Company Name</label>
                  <input 
                    type="text" 
                    defaultValue={systemSettings.companyName}
                    className="w-full px-3 py-2 border rounded-md mt-1"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Default Currency</label>
                  <select className="w-full px-3 py-2 border rounded-md mt-1" defaultValue={systemSettings.defaultCurrency}>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium">Tax Rate (%)</label>
                  <input 
                    type="number" 
                    defaultValue={systemSettings.taxRate}
                    className="w-full px-3 py-2 border rounded-md mt-1"
                    step="0.1"
                    min="0"
                    max="100"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Fiscal Year Start</label>
                  <select className="w-full px-3 py-2 border rounded-md mt-1" defaultValue={systemSettings.fiscalYearStart}>
                    <option value="January">January</option>
                    <option value="April">April</option>
                    <option value="July">July</option>
                    <option value="October">October</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Security Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Security</CardTitle>
              <CardDescription>
                Manage security and access settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Two-Factor Authentication</p>
                  <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
                </div>
                <input 
                  type="checkbox" 
                  defaultChecked={systemSettings.security.twoFactorAuth}
                  className="h-4 w-4"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Audit Logging</p>
                  <p className="text-sm text-muted-foreground">Track all system activities</p>
                </div>
                <input 
                  type="checkbox" 
                  defaultChecked={systemSettings.security.auditLogging}
                  className="h-4 w-4"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Session Timeout (minutes)</label>
                <input 
                  type="number" 
                  defaultValue={systemSettings.security.sessionTimeout}
                  className="w-full px-3 py-2 border rounded-md mt-1"
                  min="15"
                  max="1440"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Minimum Password Length</label>
                <input 
                  type="number" 
                  defaultValue={systemSettings.security.passwordPolicy.minLength}
                  className="w-full px-3 py-2 border rounded-md mt-1"
                  min="6"
                  max="32"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end gap-4">
          <Button variant="outline">Reset to Defaults</Button>
          <Button>Save Changes</Button>
        </div>
      </div>
    </DashboardLayout>
  )
}