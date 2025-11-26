'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import DashboardLayout from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ToastContainer, useToast } from '@/components/ui/toast'
import { 
  getEmployeeById, 
  getOvertimeRecordsByEmployee, 
  getSalaryPaymentsByEmployee,
  createOvertimeRecord,
  createSalaryPayment,
  deleteOvertimeRecord,
  deleteSalaryPayment
} from '@/lib/api'
import { formatCurrency } from '@/lib/utils'
import { useDateFormat } from '@/hooks/useDateFormat'
import { 
  ArrowLeft,
  Printer,
  Plus,
  Briefcase,
  DollarSign,
  Wallet,
  TrendingUp,
  Calendar,
  Trash2,
  AlertTriangle,
  Clock
} from 'lucide-react'

export default function FixedEmployeeReportPage() {
  const params = useParams()
  const router = useRouter()
  const employeeId = params.id as string
  const { toasts, toast, removeToast } = useToast()
  const { formatDate } = useDateFormat()

  const [employee, setEmployee] = useState<any>(null)
  const [overtimeRecords, setOvertimeRecords] = useState<any[]>([])
  const [salaryPayments, setSalaryPayments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Date filters
  const [startDate, setStartDate] = useState(() => {
    const date = new Date()
    date.setDate(1) // First day of current month
    return date.toISOString().split('T')[0]
  })
  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().split('T')[0]
  })

  // Dialog states
  const [showAddOvertime, setShowAddOvertime] = useState(false)
  const [showAddSalary, setShowAddSalary] = useState(false)
  const [deleteOvertimeDialogOpen, setDeleteOvertimeDialogOpen] = useState(false)
  const [overtimeToDelete, setOvertimeToDelete] = useState<string | null>(null)
  const [deleteSalaryDialogOpen, setDeleteSalaryDialogOpen] = useState(false)
  const [salaryToDelete, setSalaryToDelete] = useState<string | null>(null)

  // Form states
  const [overtimeForm, setOvertimeForm] = useState({
    date: new Date().toISOString().split('T')[0],
    description: '',
    hours: '',
    rate: '',
    amount: ''
  })

  const [salaryForm, setSalaryForm] = useState({
    date: new Date().toISOString().split('T')[0],
    amount: '',
    description: ''
  })

  useEffect(() => {
    loadData()
  }, [employeeId, startDate, endDate])

  async function loadData() {
    try {
      setLoading(true)
      const [empData, overtimeData, salaryData] = await Promise.all([
        getEmployeeById(employeeId),
        getOvertimeRecordsByEmployee(employeeId),
        getSalaryPaymentsByEmployee(employeeId)
      ])

      setEmployee(empData)
      setOvertimeRecords(overtimeData || [])
      setSalaryPayments(salaryData || [])
    } catch (error) {
      console.error('Error loading data:', error)
      toast.error('Failed to load data', error instanceof Error ? error.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  // Filter records by date range
  const filteredOvertimeRecords = overtimeRecords.filter(record => {
    const recordDate = new Date(record.date)
    const start = new Date(startDate)
    const end = new Date(endDate)
    end.setHours(23, 59, 59, 999)
    return recordDate >= start && recordDate <= end
  })

  const filteredSalaryPayments = salaryPayments.filter(payment => {
    const paymentDate = new Date(payment.payment_date)
    const start = new Date(startDate)
    const end = new Date(endDate)
    end.setHours(23, 59, 59, 999)
    return paymentDate >= start && paymentDate <= end
  })

  // Calculations
  const monthlyCount = Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24 * 30))
  const monthlySalaryTotal = (employee?.monthly_salary || 0) * monthlyCount
  const overtimeTotal = filteredOvertimeRecords.reduce((sum, record) => sum + record.amount, 0)
  const totalSalary = monthlySalaryTotal + overtimeTotal
  const totalPaid = filteredSalaryPayments.reduce((sum, payment) => sum + payment.amount, 0)
  const balance = totalSalary - totalPaid

  async function handleAddOvertime() {
    if (!overtimeForm.description || !overtimeForm.hours || !overtimeForm.rate) {
      toast.warning('Missing Fields', 'Please fill in all required fields')
      return
    }

    const hours = parseFloat(overtimeForm.hours)
    const rate = parseFloat(overtimeForm.rate)
    const calculatedAmount = hours * rate

    try {
      await createOvertimeRecord({
        employee_id: employeeId,
        date: overtimeForm.date,
        description: overtimeForm.description,
        hours: hours,
        rate: rate,
        amount: calculatedAmount,
        total: calculatedAmount
      })

      toast.success('Overtime Added', 'Overtime record has been added successfully')
      await loadData()
      setShowAddOvertime(false)
      setOvertimeForm({
        date: new Date().toISOString().split('T')[0],
        description: '',
        hours: '',
        rate: '',
        amount: ''
      })
    } catch (error) {
      console.error('Error adding overtime:', error)
      toast.error('Failed to add overtime', error instanceof Error ? error.message : 'Unknown error')
    }
  }

  async function handleAddSalary() {
    if (!salaryForm.amount) {
      toast.warning('Missing Fields', 'Please enter an amount')
      return
    }

    try {
      await createSalaryPayment({
        employee_id: employeeId,
        payment_date: salaryForm.date,
        amount: parseFloat(salaryForm.amount),
        notes: salaryForm.description || null
      })

      toast.success('Salary Added', 'Salary payment has been recorded successfully')
      await loadData()
      setShowAddSalary(false)
      setSalaryForm({
        date: new Date().toISOString().split('T')[0],
        amount: '',
        description: ''
      })
    } catch (error) {
      console.error('Error adding salary:', error)
      toast.error('Failed to add salary', error instanceof Error ? error.message : 'Unknown error')
    }
  }

  function handleDeleteOvertime(id: string) {
    setOvertimeToDelete(id)
    setDeleteOvertimeDialogOpen(true)
  }

  async function confirmDeleteOvertime() {
    if (!overtimeToDelete) return

    try {
      await deleteOvertimeRecord(overtimeToDelete)
      toast.success('Overtime Deleted', 'Overtime record has been deleted successfully')
      await loadData()
    } catch (error) {
      console.error('Error deleting overtime:', error)
      toast.error('Failed to delete overtime', error instanceof Error ? error.message : 'Unknown error')
    } finally {
      setDeleteOvertimeDialogOpen(false)
      setOvertimeToDelete(null)
    }
  }

  function handleDeleteSalary(id: string) {
    setSalaryToDelete(id)
    setDeleteSalaryDialogOpen(true)
  }

  async function confirmDeleteSalary() {
    if (!salaryToDelete) return

    try {
      await deleteSalaryPayment(salaryToDelete)
      toast.success('Salary Deleted', 'Salary payment has been deleted successfully')
      await loadData()
    } catch (error) {
      console.error('Error deleting salary:', error)
      toast.error('Failed to delete salary', error instanceof Error ? error.message : 'Unknown error')
    } finally {
      setDeleteSalaryDialogOpen(false)
      setSalaryToDelete(null)
    }
  }

  function clearFilters() {
    const today = new Date()
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1)
    setStartDate(firstDay.toISOString().split('T')[0])
    setEndDate(today.toISOString().split('T')[0])
  }

  function handlePrint() {
    window.print()
  }

  if (loading || !employee) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </DashboardLayout>
    )
  }

  // Calculate overtime amount when hours or rate changes
  useEffect(() => {
    if (overtimeForm.hours && overtimeForm.rate) {
      const hours = parseFloat(overtimeForm.hours) || 0
      const rate = parseFloat(overtimeForm.rate) || 0
      setOvertimeForm(prev => ({ ...prev, amount: (hours * rate).toFixed(2) }))
    } else {
      setOvertimeForm(prev => ({ ...prev, amount: '' }))
    }
  }, [overtimeForm.hours, overtimeForm.rate])

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-start no-print">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => router.push('/employees')}
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <h1 className="text-3xl font-bold">📄 Fixed Employee Report</h1>
            </div>
            <p className="text-muted-foreground ml-10">
              {employee.first_name}{employee.last_name ? ` ${employee.last_name}` : ''} - {formatDate(startDate)} to {formatDate(endDate)}
            </p>
          </div>
        </div>

        {/* Print Header (only shows when printing) */}
        <div className="print-only mb-6">
          <h1 className="text-3xl font-bold mb-2">📄 Fixed Employee Report</h1>
          <p className="text-gray-600">
            {employee.first_name}{employee.last_name ? ` ${employee.last_name}` : ''} - {formatDate(startDate)} to {formatDate(endDate)}
          </p>
        </div>

        {/* Filters and Actions */}
        <Card className="no-print">
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="px-3 py-2 border border-input rounded-md"
                />
                <span className="text-muted-foreground">to</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="px-3 py-2 border border-input rounded-md"
                />
                <Button variant="outline" size="sm" onClick={clearFilters}>
                  Clear
                </Button>
              </div>

              <div className="flex gap-2 ml-auto">
                <Button onClick={() => setShowAddOvertime(true)} variant="default">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Overtime
                </Button>
                <Button onClick={() => setShowAddSalary(true)} variant="default">
                  <DollarSign className="w-4 h-4 mr-2" />
                  Add Salary
                </Button>
                <Button onClick={handlePrint} variant="outline">
                  <Printer className="w-4 h-4 mr-2" />
                  Print
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total (Monthly + OT)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{formatCurrency(totalSalary)}</div>
              <p className="text-xs text-muted-foreground mt-1">Monthly + Overtime</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Overtime Total</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{formatCurrency(overtimeTotal)}</div>
              <p className="text-xs text-muted-foreground mt-1">Extra compensation</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Salary Paid</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{formatCurrency(totalPaid)}</div>
              <p className="text-xs text-muted-foreground mt-1">Total payments</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Balance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${balance < 0 ? 'text-red-600' : 'text-green-600'}`}>
                {formatCurrency(balance)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {balance < 0 ? 'Overpaid' : 'Outstanding'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Overtime Records Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Overtime Records
            </CardTitle>
            <CardDescription>Overtime work completed during this period</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <div className="max-h-[500px] overflow-y-auto">
                <table className="w-full">
                  <thead className="sticky top-0 bg-background">
                    <tr className="border-b">
                      <th className="text-left p-2 font-medium">Date</th>
                      <th className="text-left p-2 font-medium">Description</th>
                      <th className="text-center p-2 font-medium">Hours</th>
                      <th className="text-right p-2 font-medium">Rate</th>
                      <th className="text-right p-2 font-medium">Amount</th>
                      <th className="text-center p-2 font-medium">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOvertimeRecords.length > 0 ? (
                      filteredOvertimeRecords.map((record) => (
                        <tr key={record.id} className="border-b hover:bg-muted/50">
                          <td className="p-2 text-sm">{formatDate(record.date)}</td>
                          <td className="p-2">{record.description}</td>
                          <td className="p-2 text-center">{record.hours}</td>
                          <td className="p-2 text-right">{formatCurrency(record.rate)}</td>
                          <td className="p-2 text-right font-medium text-purple-600">{formatCurrency(record.amount)}</td>
                          <td className="p-2 text-center">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteOvertime(record.id)}
                              className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-muted-foreground">
                          No overtime records found for this period
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <div className="border-t bg-muted/50 p-2 flex justify-between items-center font-bold sticky bottom-0">
                <span className="text-right flex-1">Overtime Total:</span>
                <span className="text-right text-purple-600 ml-4">{formatCurrency(overtimeTotal)}</span>
                <span className="w-16"></span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Salary Payments Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Salary Payments
            </CardTitle>
            <CardDescription>Payment history for this period</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <div className="max-h-[500px] overflow-y-auto">
                <table className="w-full">
                  <thead className="sticky top-0 bg-background">
                    <tr className="border-b">
                      <th className="text-left p-2 font-medium">Date</th>
                      <th className="text-right p-2 font-medium">Amount</th>
                      <th className="text-left p-2 font-medium">Description</th>
                      <th className="text-center p-2 font-medium">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSalaryPayments.length > 0 ? (
                      filteredSalaryPayments.map((payment) => (
                        <tr key={payment.id} className="border-b hover:bg-muted/50">
                          <td className="p-2 text-sm">{formatDate(payment.payment_date)}</td>
                          <td className="p-2 text-right font-medium">{formatCurrency(payment.amount)}</td>
                          <td className="p-2 text-sm text-muted-foreground">{payment.notes || '-'}</td>
                          <td className="p-2 text-center">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteSalary(payment.id)}
                              className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="p-8 text-center text-muted-foreground">
                          No salary payments found for this period
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <div className="border-t bg-muted/50 p-2 space-y-1 sticky bottom-0">
                <div className="flex justify-between items-center font-bold">
                  <span className="text-right flex-1">Total Paid:</span>
                  <span className="text-right text-blue-600 ml-4">{formatCurrency(totalPaid)}</span>
                  <span className="w-16"></span>
                </div>
                <div className="flex justify-between items-center font-bold">
                  <span className="text-right flex-1">Balance (Salary + OT − Paid):</span>
                  <span className={`text-right ml-4 ${balance < 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {formatCurrency(balance)}
                  </span>
                  <span className="w-16"></span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Overtime Dialog */}
      <Dialog open={showAddOvertime} onOpenChange={setShowAddOvertime}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>⏱️ Add Overtime</DialogTitle>
            <DialogDescription>
              Record overtime work for {employee.first_name}{employee.last_name ? ` ${employee.last_name}` : ''}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Date *</label>
              <input
                type="date"
                value={overtimeForm.date}
                onChange={(e) => setOvertimeForm({ ...overtimeForm, date: e.target.value })}
                className="w-full px-3 py-2 border border-input rounded-md"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Description *</label>
              <input
                type="text"
                value={overtimeForm.description}
                onChange={(e) => setOvertimeForm({ ...overtimeForm, description: e.target.value })}
                className="w-full px-3 py-2 border border-input rounded-md"
                placeholder="e.g., Extra project work"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Hours *</label>
                <input
                  type="number"
                  step="0.5"
                  value={overtimeForm.hours}
                  onChange={(e) => setOvertimeForm({ ...overtimeForm, hours: e.target.value })}
                  className="w-full px-3 py-2 border border-input rounded-md"
                  placeholder="0"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Rate *</label>
                <input
                  type="number"
                  step="0.01"
                  value={overtimeForm.rate}
                  onChange={(e) => setOvertimeForm({ ...overtimeForm, rate: e.target.value })}
                  className="w-full px-3 py-2 border border-input rounded-md"
                  placeholder="0.00"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Amount (Auto-calculated)</label>
              <input
                type="text"
                value={overtimeForm.amount ? formatCurrency(parseFloat(overtimeForm.amount)) : ''}
                readOnly
                className="w-full px-3 py-2 border border-input rounded-md bg-muted"
                placeholder="0.00"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddOvertime(false)}>Cancel</Button>
            <Button onClick={handleAddOvertime}>Add Overtime</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Salary Dialog */}
      <Dialog open={showAddSalary} onOpenChange={setShowAddSalary}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>💷 Add Salary Payment</DialogTitle>
            <DialogDescription>
              Record salary payment to {employee.first_name}{employee.last_name ? ` ${employee.last_name}` : ''}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Date *</label>
              <input
                type="date"
                value={salaryForm.date}
                onChange={(e) => setSalaryForm({ ...salaryForm, date: e.target.value })}
                className="w-full px-3 py-2 border border-input rounded-md"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Amount *</label>
              <input
                type="number"
                step="0.01"
                value={salaryForm.amount}
                onChange={(e) => setSalaryForm({ ...salaryForm, amount: e.target.value })}
                className="w-full px-3 py-2 border border-input rounded-md"
                placeholder="0.00"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <textarea
                value={salaryForm.description}
                onChange={(e) => setSalaryForm({ ...salaryForm, description: e.target.value })}
                className="w-full px-3 py-2 border border-input rounded-md"
                placeholder="e.g., Monthly salary payment"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddSalary(false)}>Cancel</Button>
            <Button onClick={handleAddSalary}>Add Salary</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Overtime Confirmation Dialog */}
      <Dialog open={deleteOvertimeDialogOpen} onOpenChange={setDeleteOvertimeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Delete Overtime Record
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this overtime record? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteOvertimeDialogOpen(false)
                setOvertimeToDelete(null)
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDeleteOvertime}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Salary Confirmation Dialog */}
      <Dialog open={deleteSalaryDialogOpen} onOpenChange={setDeleteSalaryDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Delete Salary Payment
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this salary payment? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteSalaryDialogOpen(false)
                setSalaryToDelete(null)
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDeleteSalary}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          .no-print {
            display: none !important;
          }
          .print-only {
            display: block !important;
          }
          nav, footer, header {
            display: none !important;
          }
          body {
            background: white !important;
          }
          * {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
        }
        .print-only {
          display: none;
        }
      `}</style>
    </DashboardLayout>
  )
}
