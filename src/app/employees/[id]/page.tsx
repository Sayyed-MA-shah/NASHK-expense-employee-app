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
  updateWorkRecord,
  updateSalaryPayment,
  deleteWorkRecord,
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
  X,
  Trash2,
  AlertTriangle
} from 'lucide-react'

export default function EmployeeReportPage() {
  const params = useParams()
  const router = useRouter()
  const employeeId = params.id as string
  const { toasts, toast, removeToast } = useToast()
  const { formatDate } = useDateFormat()

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
  const [showEditWork, setShowEditWork] = useState(false)
  const [showEditSalary, setShowEditSalary] = useState(false)
  const [deleteWorkDialogOpen, setDeleteWorkDialogOpen] = useState(false)
  const [workToDelete, setWorkToDelete] = useState<string | null>(null)
  const [workToEdit, setWorkToEdit] = useState<any>(null)
  const [deleteSalaryDialogOpen, setDeleteSalaryDialogOpen] = useState(false)
  const [salaryToDelete, setSalaryToDelete] = useState<string | null>(null)
  const [salaryToEdit, setSalaryToEdit] = useState<any>(null)

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

  const [editWorkForm, setEditWorkForm] = useState({
    date: '',
    description: '',
    quantity: '',
    price: ''
  })

  const [editSalaryForm, setEditSalaryForm] = useState({
    date: '',
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
    // Validate all items - need description and price, quantity is optional
    const validItems = workForm.items.filter(item => 
      item.description.trim() && item.price
    )

    if (validItems.length === 0) {
      toast.warning('Missing Fields', 'Please fill in at least one work item with description and price/amount')
      return
    }

    try {
      // Create all work records
      const promises = validItems.map(item => {
        const quantity = item.quantity ? parseFloat(item.quantity) : 1
        const price = parseFloat(item.price)
        const total = item.quantity ? (quantity * price) : price

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

  function handleEditWork(record: any) {
    setWorkToEdit(record)
    setEditWorkForm({
      date: record.date,
      description: record.description,
      quantity: record.quantity.toString(),
      price: record.price.toString()
    })
    setShowEditWork(true)
  }

  async function handleUpdateWork() {
    if (!workToEdit || !editWorkForm.description || !editWorkForm.price) {
      toast.warning('Missing Fields', 'Please fill in description and price/amount')
      return
    }

    try {
      const quantity = editWorkForm.quantity ? parseFloat(editWorkForm.quantity) : 1
      const price = parseFloat(editWorkForm.price)
      const total = editWorkForm.quantity ? (quantity * price) : price

      await updateWorkRecord(workToEdit.id, {
        date: editWorkForm.date,
        description: editWorkForm.description,
        quantity: quantity,
        price: price,
        total: total
      })

      toast.success('Work Updated', 'Work record has been updated successfully')
      await loadData()
      setShowEditWork(false)
      setWorkToEdit(null)
      setEditWorkForm({
        date: '',
        description: '',
        quantity: '',
        price: ''
      })
    } catch (error) {
      console.error('Error updating work:', error)
      toast.error('Failed to update work', error instanceof Error ? error.message : 'Unknown error')
    }
  }

  function handleEditSalary(payment: any) {
    setSalaryToEdit(payment)
    setEditSalaryForm({
      date: payment.payment_date,
      amount: payment.amount.toString(),
      description: payment.notes || ''
    })
    setShowEditSalary(true)
  }

  async function handleUpdateSalary() {
    if (!salaryToEdit || !editSalaryForm.amount) {
      toast.warning('Missing Fields', 'Please enter an amount')
      return
    }

    try {
      await updateSalaryPayment(salaryToEdit.id, {
        payment_date: editSalaryForm.date,
        amount: parseFloat(editSalaryForm.amount),
        notes: editSalaryForm.description || null
      })

      toast.success('Salary Updated', 'Salary payment has been updated successfully')
      await loadData()
      setShowEditSalary(false)
      setSalaryToEdit(null)
      setEditSalaryForm({
        date: '',
        amount: '',
        description: ''
      })
    } catch (error) {
      console.error('Error updating salary:', error)
      toast.error('Failed to update salary', error instanceof Error ? error.message : 'Unknown error')
    }
  }

  function handlePrint() {
    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    const reportHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Employee Report - ${employee.first_name}${employee.last_name ? ` ${employee.last_name}` : ''}</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              padding: 20px;
              background: white;
            }
            .report {
              max-width: 1000px;
              margin: 0 auto;
            }
            .header {
              border-bottom: 3px solid #2563eb;
              padding-bottom: 20px;
              margin-bottom: 24px;
            }
            .header h1 {
              font-size: 28px;
              font-weight: bold;
              color: #1f2937;
              margin-bottom: 8px;
            }
            .header .subtitle {
              font-size: 16px;
              color: #6b7280;
            }
            .period {
              background: #f3f4f6;
              padding: 16px;
              border-radius: 8px;
              margin-bottom: 24px;
              font-size: 14px;
              color: #374151;
            }
            .summary-cards {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 16px;
              margin-bottom: 24px;
            }
            .card {
              background: white;
              border: 1px solid #e5e7eb;
              border-radius: 8px;
              padding: 16px;
            }
            .card-title {
              font-size: 12px;
              color: #6b7280;
              text-transform: uppercase;
              margin-bottom: 8px;
            }
            .card-value {
              font-size: 24px;
              font-weight: bold;
              margin-bottom: 4px;
            }
            .card-value.green { color: #16a34a; }
            .card-value.blue { color: #2563eb; }
            .card-value.red { color: #dc2626; }
            .card-subtitle {
              font-size: 11px;
              color: #6b7280;
            }
            .section {
              margin-bottom: 32px;
              page-break-inside: avoid;
            }
            .section-title {
              font-size: 16px;
              font-weight: bold;
              color: #1f2937;
              margin-bottom: 12px;
              padding-bottom: 8px;
              border-bottom: 2px solid #e5e7eb;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 16px;
              background: white;
              border: 1px solid #e5e7eb;
            }
            thead {
              background: #f9fafb;
            }
            th {
              padding: 10px;
              text-align: left;
              font-size: 11px;
              font-weight: 600;
              color: #6b7280;
              text-transform: uppercase;
              border-bottom: 1px solid #e5e7eb;
            }
            th.center { text-align: center; }
            th.right { text-align: right; }
            td {
              padding: 10px;
              font-size: 13px;
              color: #374151;
              border-bottom: 1px solid #f3f4f6;
            }
            td.center { text-align: center; }
            td.right { text-align: right; }
            tbody tr:hover {
              background: #f9fafb;
            }
            tfoot {
              background: #f3f4f6;
              font-weight: bold;
            }
            tfoot td {
              padding: 12px 10px;
              border-top: 2px solid #e5e7eb;
            }
            .no-data {
              text-align: center;
              padding: 32px;
              color: #9ca3af;
              font-style: italic;
            }
            .footer {
              margin-top: 32px;
              padding-top: 16px;
              border-top: 1px solid #e5e7eb;
              text-align: center;
              font-size: 12px;
              color: #6b7280;
            }
            @media print {
              body { padding: 20px; }
              .section { page-break-inside: avoid; }
            }
          </style>
        </head>
        <body>
          <div class="report">
            <div class="header">
              <h1>📄 Employee Report</h1>
              <div class="subtitle">${employee.first_name}${employee.last_name ? ` ${employee.last_name}` : ''} - ${employee.phone || 'N/A'}</div>
            </div>

            <div class="period">
              <strong>Report Period:</strong> ${formatDate(startDate)} to ${formatDate(endDate)}
            </div>

            <div class="summary-cards">
              <div class="card">
                <div class="card-title">Total Earned</div>
                <div class="card-value green">${formatCurrency(totalWork)}</div>
                <div class="card-subtitle">${filteredWorkRecords.length} work records</div>
              </div>
              <div class="card">
                <div class="card-title">Salary Paid</div>
                <div class="card-value blue">${formatCurrency(totalSalary)}</div>
                <div class="card-subtitle">${filteredSalaryPayments.length} payments</div>
              </div>
              <div class="card">
                <div class="card-title">Balance</div>
                <div class="card-value ${balance < 0 ? 'red' : 'green'}">${formatCurrency(balance)}</div>
                <div class="card-subtitle">${balance < 0 ? 'Overpaid' : 'Outstanding'}</div>
              </div>
            </div>

            <div class="section">
              <div class="section-title">⏱️ Work Records</div>
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Description</th>
                    <th class="center">Quantity</th>
                    <th class="right">Price</th>
                    <th class="right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  ${filteredWorkRecords.length > 0 ? filteredWorkRecords.map(record => `
                    <tr>
                      <td>${formatDate(record.date)}</td>
                      <td>${record.description}</td>
                      <td class="center">${record.quantity}</td>
                      <td class="right">${formatCurrency(record.price)}</td>
                      <td class="right">${formatCurrency(record.quantity * record.price)}</td>
                    </tr>
                  `).join('') : '<tr><td colspan="5" class="no-data">No work records found</td></tr>'}
                </tbody>
                <tfoot>
                  <tr>
                    <td colspan="4" class="right">Total Earned:</td>
                    <td class="right">${formatCurrency(totalWork)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <div class="section">
              <div class="section-title">💰 Salary Payments</div>
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Description</th>
                    <th class="right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  ${filteredSalaryPayments.length > 0 ? filteredSalaryPayments.map(payment => `
                    <tr>
                      <td>${formatDate(payment.payment_date)}</td>
                      <td>${payment.notes || 'Salary Payment'}</td>
                      <td class="right">${formatCurrency(payment.amount)}</td>
                    </tr>
                  `).join('') : '<tr><td colspan="3" class="no-data">No salary payments found</td></tr>'}
                </tbody>
                <tfoot>
                  <tr>
                    <td colspan="2" class="right">Total Paid:</td>
                    <td class="right">${formatCurrency(totalSalary)}</td>
                  </tr>
                  <tr>
                    <td colspan="2" class="right">Balance (Earned − Paid):</td>
                    <td class="right">${formatCurrency(balance)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <div class="footer">
              Generated on ${formatDate(new Date().toISOString())} | Employee Report
            </div>
          </div>
          <script>
            window.onload = function() {
              window.print();
              window.onafterprint = function() {
                window.close();
              }
            }
          </script>
        </body>
      </html>
    `

    printWindow.document.write(reportHTML)
    printWindow.document.close()
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
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 no-print">
          <div className="w-full">
            <div className="flex items-center gap-2 mb-2">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => router.push('/employees')}
                className="h-8 w-8 p-0 sm:h-9 sm:w-auto sm:px-3"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">📄 Employee Report</h1>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground ml-0 sm:ml-10">
              {employee.first_name}{employee.last_name ? ` ${employee.last_name}` : ''} - {formatDate(startDate)} to {formatDate(endDate)}
            </p>
          </div>
        </div>

        {/* Print Header (only shows when printing) */}
        <div className="print-only mb-6">
          <h1 className="text-3xl font-bold mb-2">📄 Employee Report</h1>
          <p className="text-gray-600 mb-4">
            {employee.first_name}{employee.last_name ? ` ${employee.last_name}` : ''} | Phone: {employee.phone || 'N/A'}
          </p>
          <p className="text-sm text-gray-600 mb-4">
            <strong>Report Period:</strong> {formatDate(startDate)} to {formatDate(endDate)}
          </p>
          
          {/* Print Summary */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="text-xs text-gray-500 uppercase mb-2">Total Earned</div>
              <div className="text-2xl font-bold text-green-600">{formatCurrency(totalWork)}</div>
              <div className="text-xs text-gray-500 mt-1">{filteredWorkRecords.length} work records</div>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="text-xs text-gray-500 uppercase mb-2">Salary Paid</div>
              <div className="text-2xl font-bold text-blue-600">{formatCurrency(totalSalary)}</div>
              <div className="text-xs text-gray-500 mt-1">{filteredSalaryPayments.length} payments</div>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="text-xs text-gray-500 uppercase mb-2">Balance</div>
              <div className={`text-2xl font-bold ${balance < 0 ? 'text-red-600' : 'text-green-600'}`}>
                {formatCurrency(balance)}
              </div>
              <div className="text-xs text-gray-500 mt-1">{balance < 0 ? 'Overpaid' : 'Outstanding'}</div>
            </div>
          </div>
        </div>

        {/* Filters and Actions */}
        <Card className="no-print">
          <CardContent className="pt-6">
            <div className="flex flex-col gap-3 sm:gap-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground hidden sm:block" />
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="px-2 sm:px-3 py-2 text-xs sm:text-sm border border-input rounded-md bg-background flex-1 sm:flex-none"
                  />
                  <span className="text-xs sm:text-sm text-muted-foreground">to</span>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="px-2 sm:px-3 py-2 text-xs sm:text-sm border border-input rounded-md bg-background flex-1 sm:flex-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:flex gap-2">
                <Button onClick={() => setShowAddWork(true)} variant="default" size="sm" className="text-xs sm:text-sm">
                  <Briefcase className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Add </span>Work
                </Button>
                <Button onClick={() => setShowAddSalary(true)} variant="default" size="sm" className="text-xs sm:text-sm">
                  <DollarSign className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Add </span>Salary
                </Button>
                <Button 
                  onClick={() => router.push(`/employees/${employeeId}/payslip`)}
                  variant="secondary"
                  size="sm"
                  className="text-xs sm:text-sm"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                    <polyline points="10 9 9 9 8 9" />
                  </svg>
                  Payslip
                </Button>
                <Button onClick={handlePrint} variant="outline" size="sm" className="text-xs sm:text-sm">
                  <Printer className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  Print
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary Cards - Screen Only */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 sm:gap-4 no-print">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Total Earned</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{formatCurrency(totalWork)}</div>
              <p className="text-xs text-muted-foreground">{filteredWorkRecords.length} work records</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Salary Paid</CardTitle>
              <DollarSign className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{formatCurrency(totalSalary)}</div>
              <p className="text-xs text-muted-foreground">{filteredSalaryPayments.length} payments</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Balance</CardTitle>
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
            <div className="overflow-x-auto -mx-2 sm:mx-0">
              <div className="max-h-[500px] overflow-y-auto">
                <table className="w-full min-w-[700px]">
                  <thead className="sticky top-0 bg-background">
                    <tr className="border-b">
                      <th className="text-left p-2 font-medium text-xs sm:text-sm whitespace-nowrap">Date</th>
                      <th className="text-left p-2 font-medium text-xs sm:text-sm whitespace-nowrap">Description</th>
                      <th className="text-center p-2 font-medium text-xs sm:text-sm whitespace-nowrap">Quantity</th>
                      <th className="text-right p-2 font-medium text-xs sm:text-sm whitespace-nowrap">Price</th>
                      <th className="text-right p-2 font-medium text-xs sm:text-sm whitespace-nowrap">Total</th>
                      <th className="text-center p-2 font-medium text-xs sm:text-sm whitespace-nowrap">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredWorkRecords.length > 0 ? (
                      filteredWorkRecords.map((wr) => (
                        <tr key={wr.id} className="border-b hover:bg-muted/50">
                          <td className="p-2 text-xs sm:text-sm whitespace-nowrap">{formatDate(wr.date)}</td>
                          <td className="p-2 text-xs sm:text-sm">{wr.description}</td>
                          <td className="p-2 text-center text-xs sm:text-sm whitespace-nowrap">{wr.quantity}</td>
                          <td className="p-2 text-right text-xs sm:text-sm whitespace-nowrap">{formatCurrency(wr.price)}</td>
                          <td className="p-2 text-right font-medium text-xs sm:text-sm whitespace-nowrap">{formatCurrency(wr.quantity * wr.price)}</td>
                          <td className="p-2 text-center whitespace-nowrap">
                            <div className="flex items-center justify-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditWork(wr)}
                                className="h-7 w-7 sm:h-8 sm:w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                title="Edit"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3 w-3 sm:h-4 sm:w-4">
                                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                </svg>
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteWork(wr.id)}
                                className="h-7 w-7 sm:h-8 sm:w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                                title="Delete"
                              >
                                <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                              </Button>
                            </div>
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
            <div className="overflow-x-auto -mx-2 sm:mx-0">
              <div className="max-h-[500px] overflow-y-auto">
                <table className="w-full min-w-[600px]">
                  <thead className="sticky top-0 bg-background">
                    <tr className="border-b">
                      <th className="text-left p-2 font-medium text-xs sm:text-sm whitespace-nowrap">Date</th>
                      <th className="text-left p-2 font-medium text-xs sm:text-sm whitespace-nowrap">Description</th>
                      <th className="text-right p-2 font-medium text-xs sm:text-sm whitespace-nowrap">Amount</th>
                      <th className="text-center p-2 font-medium text-xs sm:text-sm whitespace-nowrap">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSalaryPayments.length > 0 ? (
                      filteredSalaryPayments.map((sp) => (
                        <tr key={sp.id} className="border-b hover:bg-muted/50">
                          <td className="p-2 text-xs sm:text-sm whitespace-nowrap">{formatDate(sp.payment_date)}</td>
                          <td className="p-2 text-xs sm:text-sm text-muted-foreground">{sp.notes || '-'}</td>
                          <td className="p-2 text-right font-medium text-xs sm:text-sm whitespace-nowrap">{formatCurrency(sp.amount)}</td>
                          <td className="p-2 text-center whitespace-nowrap">
                            <div className="flex items-center justify-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditSalary(sp)}
                                className="h-7 w-7 sm:h-8 sm:w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                title="Edit"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3 w-3 sm:h-4 sm:w-4">
                                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                </svg>
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteSalary(sp.id)}
                                className="h-7 w-7 sm:h-8 sm:w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                                title="Delete"
                              >
                                <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                              </Button>
                            </div>
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
                <span className="text-right flex-1 text-xs sm:text-sm">Total Paid:</span>
                <span className="text-right text-blue-600 ml-4 text-xs sm:text-sm">{formatCurrency(totalSalary)}</span>
                <span className="w-12 sm:w-16"></span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Work Dialog */}
      <Dialog open={showAddWork} onOpenChange={setShowAddWork}>
        <DialogContent className="max-w-4xl w-[95vw] sm:w-full max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg">🛠️ Add Work Records</DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              Record work completed by {employee.first_name}{employee.last_name ? ` ${employee.last_name}` : ''}
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

              {/* Helper Text */}
              <div className="bg-blue-50 border border-blue-200 rounded-md p-3 text-xs text-blue-800">
                <strong>💡 Tip:</strong> Enter <strong>Quantity + Price</strong> for per-item calculation (e.g., 10 items × $5 = $50), 
                or leave <strong>Quantity blank</strong> and enter the total amount directly in the <strong>Price</strong> field.
              </div>

              {/* Table Header */}
              <div className="grid grid-cols-12 gap-2 text-xs font-medium text-muted-foreground px-2">
                <div className="col-span-5">Description *</div>
                <div className="col-span-2">Quantity (optional)</div>
                <div className="col-span-2">Price / Amount *</div>
                <div className="col-span-2">Total</div>
                <div className="col-span-1"></div>
              </div>

              {/* Work Items */}
              <div className="space-y-2">
                {workForm.items.map((item, index) => {
                  const itemTotal = item.price
                    ? (item.quantity ? parseFloat(item.quantity) * parseFloat(item.price) : parseFloat(item.price))
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
                      if (item.price) {
                        const amount = item.quantity 
                          ? parseFloat(item.quantity) * parseFloat(item.price)
                          : parseFloat(item.price)
                        return sum + amount
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
              Add {workForm.items.filter(i => i.description && i.price).length} Work Item(s)
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

      {/* Edit Work Dialog */}
      <Dialog open={showEditWork} onOpenChange={setShowEditWork}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>✏️ Edit Work Record</DialogTitle>
            <DialogDescription>
              Update work record details
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Date *</label>
              <input
                type="date"
                value={editWorkForm.date}
                onChange={(e) => setEditWorkForm({ ...editWorkForm, date: e.target.value })}
                className="w-full px-3 py-2 border border-input rounded-md"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Description *</label>
              <input
                type="text"
                value={editWorkForm.description}
                onChange={(e) => setEditWorkForm({ ...editWorkForm, description: e.target.value })}
                className="w-full px-3 py-2 border border-input rounded-md"
                placeholder="Work description"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Quantity (optional)</label>
                <input
                  type="number"
                  step="0.01"
                  value={editWorkForm.quantity}
                  onChange={(e) => setEditWorkForm({ ...editWorkForm, quantity: e.target.value })}
                  className="w-full px-3 py-2 border border-input rounded-md"
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Price / Amount *</label>
                <input
                  type="number"
                  step="0.01"
                  value={editWorkForm.price}
                  onChange={(e) => setEditWorkForm({ ...editWorkForm, price: e.target.value })}
                  className="w-full px-3 py-2 border border-input rounded-md"
                  placeholder="0.00"
                  required
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowEditWork(false)
                setWorkToEdit(null)
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdateWork}>
              Update
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Salary Dialog */}
      <Dialog open={showEditSalary} onOpenChange={setShowEditSalary}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>✏️ Edit Salary Payment</DialogTitle>
            <DialogDescription>
              Update salary payment details
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Payment Date *</label>
              <input
                type="date"
                value={editSalaryForm.date}
                onChange={(e) => setEditSalaryForm({ ...editSalaryForm, date: e.target.value })}
                className="w-full px-3 py-2 border border-input rounded-md"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Amount *</label>
              <input
                type="number"
                step="0.01"
                value={editSalaryForm.amount}
                onChange={(e) => setEditSalaryForm({ ...editSalaryForm, amount: e.target.value })}
                className="w-full px-3 py-2 border border-input rounded-md"
                placeholder="0.00"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <input
                type="text"
                value={editSalaryForm.description}
                onChange={(e) => setEditSalaryForm({ ...editSalaryForm, description: e.target.value })}
                className="w-full px-3 py-2 border border-input rounded-md"
                placeholder="Optional notes"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowEditSalary(false)
                setSalaryToEdit(null)
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdateSalary}>
              Update
            </Button>
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
