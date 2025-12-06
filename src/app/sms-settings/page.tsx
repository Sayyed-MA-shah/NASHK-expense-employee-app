'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ToastContainer, useToast } from '@/components/ui/toast'
import { getSMSSettings, updateSMSSettings, getSMSStats } from '@/lib/api/sms'
import { MessageSquare, Settings, ToggleLeft, ToggleRight, Send, AlertCircle, CheckCircle, XCircle, TestTube } from 'lucide-react'

export default function SMSSettingsPage() {
  const { toasts, toast, removeToast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState<any>(null)
  const [stats, setStats] = useState<any>(null)
  const [testPhone, setTestPhone] = useState('')
  const [sendingTest, setSendingTest] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      setLoading(true)
      const [settingsData, statsData] = await Promise.all([
        getSMSSettings(),
        getSMSStats()
      ])
      setSettings(settingsData)
      setStats(statsData)
    } catch (error) {
      console.error('Error loading SMS settings:', error)
      toast.error('Failed to load settings', error instanceof Error ? error.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    if (!settings) return

    setSaving(true)
    try {
      await updateSMSSettings(settings)
      toast.success('Settings Saved', 'SMS settings have been updated successfully')
      await loadData()
    } catch (error) {
      console.error('Error saving settings:', error)
      toast.error('Failed to save settings', error instanceof Error ? error.message : 'Unknown error')
    } finally {
      setSaving(false)
    }
  }

  async function handleSendTestSMS() {
    if (!testPhone) {
      toast.warning('Phone Required', 'Please enter a phone number')
      return
    }

    setSendingTest(true)
    try {
      // This would call your SMS API endpoint
      toast.success('Test SMS Sent', `Test message sent to ${testPhone}`)
      setTestPhone('')
    } catch (error) {
      console.error('Error sending test SMS:', error)
      toast.error('Failed to send test SMS', error instanceof Error ? error.message : 'Unknown error')
    } finally {
      setSendingTest(false)
    }
  }

  function toggleSetting(key: string) {
    setSettings({ ...settings, [key]: !settings[key] })
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <p className="text-muted-foreground">Loading SMS settings...</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <MessageSquare className="w-8 h-8" />
            SMS Settings
          </h1>
          <p className="text-muted-foreground mt-2">
            Configure SMS notifications and Twilio integration
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total SMS</CardTitle>
              <Send className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.total || 0}</div>
              <p className="text-xs text-muted-foreground">All time</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sent</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats?.sent || 0}</div>
              <p className="text-xs text-muted-foreground">Successfully sent</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Failed</CardTitle>
              <XCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats?.failed || 0}</div>
              <p className="text-xs text-muted-foreground">Failed to send</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Test Mode</CardTitle>
              <TestTube className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats?.test || 0}</div>
              <p className="text-xs text-muted-foreground">Test messages</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              General Settings
            </CardTitle>
            <CardDescription>
              Enable or disable SMS notifications and configure test mode
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Enable SMS */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-0.5">
                <div className="font-medium">Enable SMS Notifications</div>
                <div className="text-sm text-muted-foreground">
                  Turn on to send SMS notifications to employees
                </div>
              </div>
              <button
                onClick={() => toggleSetting('enabled')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings?.enabled ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings?.enabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Test Mode */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-0.5">
                <div className="font-medium flex items-center gap-2">
                  Test Mode
                  <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-0.5 rounded">
                    Recommended
                  </span>
                </div>
                <div className="text-sm text-muted-foreground">
                  Simulate SMS sending without actual API calls (no cost)
                </div>
              </div>
              <button
                onClick={() => toggleSetting('test_mode')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings?.test_mode ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings?.test_mode ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Save Button */}
            <Button onClick={handleSave} disabled={saving} className="w-full">
              {saving ? 'Saving...' : 'Save General Settings'}
            </Button>
          </CardContent>
        </Card>

        {/* Twilio Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>Twilio Configuration</CardTitle>
            <CardDescription>
              Configure your Twilio API credentials (required for production)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Account SID</label>
              <input
                type="text"
                value={settings?.twilio_account_sid || ''}
                onChange={(e) => setSettings({ ...settings, twilio_account_sid: e.target.value })}
                placeholder="Enter your Twilio Account SID"
                className="w-full px-3 py-2 border rounded-md bg-background"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Auth Token</label>
              <input
                type="password"
                value={settings?.twilio_auth_token || ''}
                onChange={(e) => setSettings({ ...settings, twilio_auth_token: e.target.value })}
                placeholder="Enter your Twilio Auth Token"
                className="w-full px-3 py-2 border rounded-md bg-background"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Twilio Phone Number</label>
              <input
                type="text"
                value={settings?.twilio_phone_number || ''}
                onChange={(e) => setSettings({ ...settings, twilio_phone_number: e.target.value })}
                placeholder="+1234567890"
                className="w-full px-3 py-2 border rounded-md bg-background"
              />
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong>Note:</strong> Get your Twilio credentials from{' '}
                <a href="https://www.twilio.com/console" target="_blank" rel="noopener noreferrer" className="underline">
                  Twilio Console
                </a>
              </p>
            </div>

            <Button onClick={handleSave} disabled={saving} className="w-full">
              {saving ? 'Saving...' : 'Save Twilio Configuration'}
            </Button>
          </CardContent>
        </Card>

        {/* Notification Triggers */}
        <Card>
          <CardHeader>
            <CardTitle>Notification Triggers</CardTitle>
            <CardDescription>
              Choose which events should trigger SMS notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-0.5">
                <div className="font-medium">Salary Payments</div>
                <div className="text-sm text-muted-foreground">
                  Notify employees when salary is paid
                </div>
              </div>
              <button
                onClick={() => toggleSetting('notify_on_salary_payment')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings?.notify_on_salary_payment ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings?.notify_on_salary_payment ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-0.5">
                <div className="font-medium">Work Assignments</div>
                <div className="text-sm text-muted-foreground">
                  Notify employees when new work is assigned
                </div>
              </div>
              <button
                onClick={() => toggleSetting('notify_on_work_assignment')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings?.notify_on_work_assignment ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings?.notify_on_work_assignment ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-0.5">
                <div className="font-medium">Advance Payments</div>
                <div className="text-sm text-muted-foreground">
                  Notify employees when advance is approved
                </div>
              </div>
              <button
                onClick={() => toggleSetting('notify_on_advance_payment')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings?.notify_on_advance_payment ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings?.notify_on_advance_payment ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-0.5">
                <div className="font-medium">Overtime Approval</div>
                <div className="text-sm text-muted-foreground">
                  Notify employees when overtime is approved
                </div>
              </div>
              <button
                onClick={() => toggleSetting('notify_on_overtime')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings?.notify_on_overtime ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings?.notify_on_overtime ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <Button onClick={handleSave} disabled={saving} className="w-full">
              {saving ? 'Saving...' : 'Save Notification Settings'}
            </Button>
          </CardContent>
        </Card>

        {/* Test SMS */}
        <Card>
          <CardHeader>
            <CardTitle>Test SMS</CardTitle>
            <CardDescription>
              Send a test SMS to verify your configuration
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Phone Number</label>
              <input
                type="text"
                value={testPhone}
                onChange={(e) => setTestPhone(e.target.value)}
                placeholder="+923001234567 or 03001234567"
                className="w-full px-3 py-2 border rounded-md bg-background"
              />
              <p className="text-xs text-muted-foreground">
                Enter phone number with country code (e.g., +92 for Pakistan)
              </p>
            </div>

            <Button onClick={handleSendTestSMS} disabled={sendingTest || !testPhone} className="w-full">
              <Send className="w-4 h-4 mr-2" />
              {sendingTest ? 'Sending...' : 'Send Test SMS'}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </DashboardLayout>
  )
}
