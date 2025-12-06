'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ToastContainer, useToast } from '@/components/ui/toast'
import { getAllSMSLogs } from '@/lib/api/sms'
import { useDateFormat } from '@/hooks/useDateFormat'
import { MessageSquare, CheckCircle, XCircle, TestTube, RefreshCw } from 'lucide-react'

export default function SMSLogsPage() {
  const { toasts, toast, removeToast } = useToast()
  const { formatDate } = useDateFormat()
  const [loading, setLoading] = useState(true)
  const [logs, setLogs] = useState<any[]>([])
  const [filter, setFilter] = useState<'all' | 'sent' | 'failed' | 'test'>('all')

  useEffect(() => {
    loadLogs()
  }, [])

  async function loadLogs() {
    try {
      setLoading(true)
      const data = await getAllSMSLogs()
      setLogs(data || [])
    } catch (error) {
      console.error('Error loading SMS logs:', error)
      toast.error('Failed to load logs', error instanceof Error ? error.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const filteredLogs = logs.filter(log => {
    if (filter === 'all') return true
    if (filter === 'test') return log.test_mode
    return log.status === filter
  })

  function getStatusIcon(status: string, testMode: boolean) {
    if (testMode) return <TestTube className="w-4 h-4 text-blue-600" />
    if (status === 'sent') return <CheckCircle className="w-4 h-4 text-green-600" />
    return <XCircle className="w-4 h-4 text-red-600" />
  }

  function getStatusColor(status: string, testMode: boolean) {
    if (testMode) return 'text-blue-600'
    if (status === 'sent') return 'text-green-600'
    return 'text-red-600'
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <p className="text-muted-foreground">Loading SMS logs...</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <MessageSquare className="w-8 h-8" />
              SMS Logs
            </h1>
            <p className="text-muted-foreground mt-2">
              View all sent SMS notifications and their status
            </p>
          </div>
          <Button onClick={loadLogs} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-2">
              <Button
                variant={filter === 'all' ? 'default' : 'outline'}
                onClick={() => setFilter('all')}
                size="sm"
              >
                All ({logs.length})
              </Button>
              <Button
                variant={filter === 'sent' ? 'default' : 'outline'}
                onClick={() => setFilter('sent')}
                size="sm"
              >
                Sent ({logs.filter((l) => l.status === 'sent' && !l.test_mode).length})
              </Button>
              <Button
                variant={filter === 'failed' ? 'default' : 'outline'}
                onClick={() => setFilter('failed')}
                size="sm"
              >
                Failed ({logs.filter((l) => l.status === 'failed').length})
              </Button>
              <Button
                variant={filter === 'test' ? 'default' : 'outline'}
                onClick={() => setFilter('test')}
                size="sm"
              >
                Test ({logs.filter((l) => l.test_mode).length})
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Logs Table */}
        <Card>
          <CardHeader>
            <CardTitle>SMS History</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredLogs.length === 0 ? (
              <div className="text-center py-12">
                <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No SMS logs found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 font-medium">Status</th>
                      <th className="text-left p-3 font-medium">Date & Time</th>
                      <th className="text-left p-3 font-medium">Employee</th>
                      <th className="text-left p-3 font-medium">Phone Number</th>
                      <th className="text-left p-3 font-medium">Type</th>
                      <th className="text-left p-3 font-medium">Message</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLogs.map((log) => (
                      <tr key={log.id} className="border-b hover:bg-muted/50">
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(log.status, log.test_mode)}
                            <span className={`text-sm font-medium ${getStatusColor(log.status, log.test_mode)}`}>
                              {log.test_mode ? 'Test' : log.status}
                            </span>
                          </div>
                        </td>
                        <td className="p-3 text-sm">
                          {formatDate(log.created_at)}
                        </td>
                        <td className="p-3 text-sm">
                          {log.employees ? 
                            `${log.employees.first_name} ${log.employees.last_name || ''}` :
                            '-'
                          }
                        </td>
                        <td className="p-3 text-sm font-mono">
                          {log.phone_number}
                        </td>
                        <td className="p-3">
                          <span className="text-xs bg-muted px-2 py-1 rounded">
                            {log.message_type}
                          </span>
                        </td>
                        <td className="p-3 text-sm max-w-md truncate">
                          {log.message}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </DashboardLayout>
  )
}
