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
  getWorkRecordsByEmployee, 
  getSalaryPaymentsByEmployee,
  createWorkRecord,
  createSalaryPayment,
  deleteWorkRecord,
  deleteSalaryPayment
} from '@/lib/api'
import { formatCurrency, formatDate } from '@/lib/utils'
import { 
  ArrowLeft,
  Printer,
  Plus,
  Briefcase,
  DollarSign,
  Wallet,
  TrendingUp,
  Calendar,
  X,
  Trash2,
  AlertTriangle
} from 'lucide-react'

export default function EmployeeReportPage() {
  const params = useParams()
  const router = useRouter()
  const employeeId = params.id as string
  const { toasts, toast, removeToast } = useToast()

  const [employee, setEmployee] = useState<any>(null)
  const [workRecords, setWorkRecords] = useState<any[]>([])
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
  const [showAddWork, setShowAddWork] = useState(false)
  const [showAddSalary, setShowAddSalary] = useState(false)
  const [deleteWorkDialogOpen, setDeleteWorkDialogOpen] = useState(false)
  const [workToDelete, setWorkToDelete] = useState<string | null>(null)
  const [deleteSalaryDialogOpen, setDeleteSalaryDialogOpen] = useState(false)
  const [salaryToDelete, setSalaryToDelete] = useState<string | null>(null)

  // Form states
  const [workForm, setWorkForm] = useState({
    date: new Date().toISOString().split('T')[0],
    items: [{ description: '', quantity: '', price: '' }]
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
      const [empData, workData, salaryData] = await Promise.all([
        getEmployeeById(employeeId),
        getWorkRecordsByEmployee(employeeId),
        getSalaryPaymentsByEmployee(employeeId)
      ])

      setEmployee(empData)
      setWorkRecords(workData || [])
      setSalaryPayments(salaryData || [])
    } catch (error) {
      console.error('Error loading data:', error)
      toast.error('Failed to load employee data', error instanceof Error ? error.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  // Filter data by date range
  const filteredWorkRecords = workRecords.filter(wr => {
    const recordDate = wr.date
    return recordDate >= startDate && recordDate <= endDate
  })

  const filteredSalaryPayments = salaryPayments.filter(sp => {
    const paymentDate = sp.payment_date
    return paymentDate >= startDate && paymentDate <= endDate
  })

  // Calculate totals
  const totalWork = filteredWorkRecords.reduce((sum, wr) => 
    sum + (wr.quantity * wr.price), 0
  )
  const totalSalary = filteredSalaryPayments.reduce((sum, sp) => sum + sp.amount, 0)
  const balance = totalWork - totalSalary

  function addWorkRow() {
    setWorkForm({
      ...workForm,
      items: [...workForm.items, { description: '', quantity: '', price: '' }]
    })
  }

  function removeWorkRow(index: number) {
    if (workForm.items.length === 1) {
      toast.warning('Cannot Remove', 'At least one work item is required')
      return
    }
    const newItems = workForm.items.filter((_, i) => i !== index)
    setWorkForm({ ...workForm, items: newItems })
  }

  function updateWorkItem(index: number, field: string, value: string) {
    const newItems = [...workForm.items]
    newItems[index] = { ...newItems[index], [field]: value }
    setWorkForm({ ...workForm, items: newItems })
  }

  async function handleAddWork() {
    // Validate all items
    const validItems = workForm.items.filter(item => 
      item.description.trim() && item.quantity && item.price
    )

    if (validItems.length === 0) {
      toast.warning('Missing Fields', 'Please fill in at least one complete work item')
      return
    }

    try {
      // Create all work records
      const promises = validItems.map(item => {
        const quantity = parseFloat(item.quantity)
        const price = parseFloat(item.price)
        const total = quantity * price

        return createWorkRecord({
          employee_id: employeeId,
          date: workForm.date,
          description: item.description,
          quantity: quantity,
          price: price,
          total: total
        })
      })

      await Promise.all(promises)

      toast.success('Work Added', `${validItems.length} work record(s) added successfully`)
      await loadData()
      setShowAddWork(false)
      setWorkForm({
        date: new Date().toISOString().split('T')[0],
        items: [{ description: '', quantity: '', price: '' }]
      })
    } catch (error) {
      console.error('Error adding work:', error)
      toast.error('Failed to add work', error instanceof Error ? error.message : 'Unknown error')
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

  function handleDeleteWork(id: string) {
    setWorkToDelete(id)
    setDeleteWorkDialogOpen(true)
  }

  async function confirmDeleteWork() {
    if (!workToDelete) return

    try {
      await deleteWorkRecord(workToDelete)
      toast.success('Work Deleted', 'Work record has been deleted successfully')
      await loadData()
    } catch (error) {
      console.error('Error deleting work:', error)
      toast.error('Failed to delete work', error instanceof Error ? error.message : 'Unknown error')
    } finally {
      setDeleteWorkDialogOpen(false)
      setWorkToDelete(null)
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

  function handlePrint() {
    window.print()
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <p className="text-muted-foreground">Loading employee data...</p>
        </div>
      </DashboardLayout>
    )
  }

  if (!employee) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-96">
          <p className="text-muted-foreground mb-4">Employee not found</p>
          <Button onClick={() => router.push('/employees')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Employees
          </Button>
        </div>
      </DashboardLayout>
    )
  }

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
              <h1 className="text-3xl font-bold">📄 Employee Report</h1>
            </div>
            <p className="text-muted-foreground ml-10">
              {employee.first_name} {employee.last_name} - {formatDate(startDate)} to {formatDate(endDate)}
            </p>
          </div>
        </div>

        {/* Print Header (only shows when printing) */}
        <div className="print-only mb-6">
          <h1 className="text-3xl font-bold mb-2">📄 Employee Report</h1>
          <p className="text-gray-600">
            {employee.first_name} {employee.last_name} - {formatDate(startDate)} to {formatDate(endDate)}
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
                  className="px-3 py-2 border border-input rounded-md bg-background"
                />
                <span className="text-muted-foreground">to</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="px-3 py-2 border border-input rounded-md bg-background"
                />
              </div>
              
              <div className="flex-1"></div>

              <Button onClick={() => setShowAddWork(true)} variant="default">
                <Briefcase className="w-4 h-4 mr-2" />
                Add Work
              </Button>
              <Button onClick={() => setShowAddSalary(true)} variant="default">
                <DollarSign className="w-4 h-4 mr-2" />
                Add Salary
              </Button>
              <Button 
                onClick={() => router.push(`/employees/${employeeId}/payslip`)}
                variant="secondary"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 mr-2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <polyline points="10 9 9 9 8 9" />
                </svg>
                Payslip
              </Button>
              <Button onClick={handlePrint} variant="outline">
                <Printer className="w-4 h-4 mr-2" />
                Print
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Earned</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{formatCurrency(totalWork)}</div>
              <p className="text-xs text-muted-foreground">{filteredWorkRecords.length} work records</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Salary Paid</CardTitle>
              <DollarSign className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{formatCurrency(totalSalary)}</div>
              <p className="text-xs text-muted-foreground">{filteredSalaryPayments.length} payments</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Balance</CardTitle>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`h-4 w-4 ${balance < 0 ? 'text-red-600' : 'text-green-600'}`}>
                <path d="M3 3v18h18" />
                <path d="m19 9-5 5-4-4-3 3" />
              </svg>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${balance < 0 ? 'text-red-600' : 'text-green-600'}`}>
                {formatCurrency(balance)}
              </div>
              <p className="text-xs text-muted-foreground">Outstanding balance</p>
            </CardContent>
          </Card>
        </div>

        {/* Work Records Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="w-5 h-5" />
              Work Records
            </CardTitle>
            <CardDescription>Detailed breakdown of work completed</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <div className="max-h-[500px] overflow-y-auto">
                <table className="w-full">
                  <thead className="sticky top-0 bg-background">
                    <tr className="border-b">
                      <th className="text-left p-2 font-medium">Date</th>
                      <th className="text-left p-2 font-medium">Description</th>
                      <th className="text-center p-2 font-medium">Quantity</th>
                      <th className="text-right p-2 font-medium">Price</th>
                      <th className="text-right p-2 font-medium">Total</th>
                      <th className="text-center p-2 font-medium">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredWorkRecords.length > 0 ? (
                      filteredWorkRecords.map((wr) => (
                        <tr key={wr.id} className="border-b hover:bg-muted/50">
                          <td className="p-2 text-sm">{formatDate(wr.date)}</td>
                          <td className="p-2">{wr.description}</td>
                          <td className="p-2 text-center">{wr.quantity}</td>
                          <td className="p-2 text-right">{formatCurrency(wr.price)}</td>
                          <td className="p-2 text-right font-medium">{formatCurrency(wr.quantity * wr.price)}</td>
                          <td className="p-2 text-center">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteWork(wr.id)}
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
                          No work records found for this period
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <div className="border-t bg-muted/50 p-2 flex justify-between items-center font-bold sticky bottom-0">
                <span className="text-right flex-1">Total Earned:</span>
                <span className="text-right text-green-600 ml-4">{formatCurrency(totalWork)}</span>
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
                      filteredSalaryPayments.map((sp) => (
                        <tr key={sp.id} className="border-b hover:bg-muted/50">
                          <td className="p-2 text-sm">{formatDate(sp.payment_date)}</td>
                          <td className="p-2 text-right font-medium">{formatCurrency(sp.amount)}</td>
                          <td className="p-2 text-sm text-muted-foreground">{sp.notes || '-'}</td>
                          <td className="p-2 text-center">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteSalary(sp.id)}
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
              <div className="border-t bg-muted/50 p-2 flex justify-between items-center font-bold sticky bottom-0">
                <span className="text-right flex-1">Total Paid:</span>
                <span className="text-right text-blue-600 ml-4">{formatCurrency(totalSalary)}</span>
                <span className="w-16"></span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Work Dialog */}
      <Dialog open={showAddWork} onOpenChange={setShowAddWork}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>🛠️ Add Work Records</DialogTitle>
            <DialogDescription>
              Record work completed by {employee.first_name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Date *</label>
              <input
                type="date"
                value={workForm.date}
                onChange={(e) => setWorkForm({ ...workForm, date: e.target.value })}
                className="w-full px-3 py-2 border border-input rounded-md"
                required
              />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium">Work Items</label>
                <Button 
                  type="button" 
                  size="sm" 
                  variant="outline"
                  onClick={addWorkRow}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Row
                </Button>
              </div>

              {/* Table Header */}
              <div className="grid grid-cols-12 gap-2 text-xs font-medium text-muted-foreground px-2">
                <div className="col-span-5">Description</div>
                <div className="col-span-2">Quantity</div>
                <div className="col-span-2">Price</div>
                <div className="col-span-2">Total</div>
                <div className="col-span-1"></div>
              </div>

              {/* Work Items */}
              <div className="space-y-2">
                {workForm.items.map((item, index) => {
                  const itemTotal = item.quantity && item.price 
                    ? parseFloat(item.quantity) * parseFloat(item.price) 
                    : 0

                  return (
                    <div key={index} className="grid grid-cols-12 gap-2 items-start p-2 border rounded-md bg-muted/20">
                      <div className="col-span-5">
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => updateWorkItem(index, 'description', e.target.value)}
                          className="w-full px-2 py-1.5 text-sm border border-input rounded-md"
                          placeholder="Description"
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="number"
                          step="0.01"
                          value={item.quantity}
                          onChange={(e) => updateWorkItem(index, 'quantity', e.target.value)}
                          className="w-full px-2 py-1.5 text-sm border border-input rounded-md"
                          placeholder="0"
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="number"
                          step="0.01"
                          value={item.price}
                          onChange={(e) => updateWorkItem(index, 'price', e.target.value)}
                          className="w-full px-2 py-1.5 text-sm border border-input rounded-md"
                          placeholder="0.00"
                        />
                      </div>
                      <div className="col-span-2 flex items-center h-full">
                        <span className="text-sm font-medium px-2">
                          {itemTotal > 0 ? formatCurrency(itemTotal) : '-'}
                        </span>
                      </div>
                      <div className="col-span-1 flex items-center justify-center">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeWorkRow(index)}
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                          disabled={workForm.items.length === 1}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Grand Total */}
              <div className="p-3 bg-green-50 border border-green-200 rounded-md flex justify-between items-center">
                <p className="font-medium text-green-900">Grand Total:</p>
                <p className="text-xl font-bold text-green-600">
                  {formatCurrency(
                    workForm.items.reduce((sum, item) => {
                      if (item.quantity && item.price) {
                        return sum + (parseFloat(item.quantity) * parseFloat(item.price))
                      }
                      return sum
                    }, 0)
                  )}
                </p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setShowAddWork(false)
                setWorkForm({
                  date: new Date().toISOString().split('T')[0],
                  items: [{ description: '', quantity: '', price: '' }]
                })
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleAddWork}>
              Add {workForm.items.filter(i => i.description && i.quantity && i.price).length} Work Item(s)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Salary Dialog */}
      <Dialog open={showAddSalary} onOpenChange={setShowAddSalary}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>💷 Add Salary Payment</DialogTitle>
            <DialogDescription>
              Record salary payment to {employee.first_name}
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
                placeholder="e.g., Weekly payment, Advance, Final settlement"
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

      {/* Delete Work Confirmation Dialog */}
      <Dialog open={deleteWorkDialogOpen} onOpenChange={setDeleteWorkDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Delete Work Record
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this work record? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteWorkDialogOpen(false)
                setWorkToDelete(null)
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDeleteWork}
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
