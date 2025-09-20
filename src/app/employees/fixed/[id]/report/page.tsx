'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import DashboardLayout from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import DateRangeFilter from '@/components/reports/DateRangeFilter'
import SummaryCards from '@/components/reports/SummaryCards'
import ConfirmationDialog from '@/components/reports/ConfirmationDialog'
import { formatCurrency, formatDate } from '@/lib/utils'
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Printer,
  Edit,
  Phone,
  User,
  Clock,
  DollarSign,
  Wallet,
  Receipt
} from 'lucide-react'
import { 
  FixedEmployee, 
  OvertimeRecord, 
  FixedSalaryPayment, 
  DateRange,
  ReportSummary 
} from '@/types'

// Mock data - in real app this would come from API
const mockFixedEmployee: FixedEmployee = {
  id: 'emp_002',
  firstName: 'Jane',
  lastName: 'Smith',
  phone: '+1-555-0456',
  role: 'manager',
  type: 'fixed',
  status: 'active',
  hireDate: new Date('2024-01-15'),
  monthlySalary: 5000,
  paidAmount: 4500,
  balance: 500,
  salaryPayments: [
    {
      id: 'fsp_001',
      employeeId: 'emp_002',
      amount: 4500,
      paymentDate: new Date('2025-09-01'),
      month: '2025-09',
      type: 'Salary',
      notes: 'September salary payment',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ],
  overtimeRecords: [
    {
      id: 'ot_001',
      employeeId: 'emp_002',
      date: new Date('2025-09-15'),
      description: 'Project deadline overtime',
      hours: 8,
      rate: 30,
      amount: 240,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'ot_002',
      employeeId: 'emp_002',
      date: new Date('2025-09-18'),
      description: 'Weekend development work',
      hours: 6,
      rate: 30,
      amount: 180,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ],
  createdAt: new Date(),
  updatedAt: new Date()
}

interface OvertimeFormData {
  date: string
  description: string
  hours: string
  rate: string
}

interface SalaryPaymentFormData {
  date: string
  description: string
  type: string
  amount: string
}

export default function FixedEmployeeReport() {
  const params = useParams()
  const router = useRouter()
  const employeeId = params.id as string

  const [employee] = useState<FixedEmployee>(mockFixedEmployee)
  const [dateRange, setDateRange] = useState<DateRange>({ startDate: '', endDate: '' })
  const [showOvertimeForm, setShowOvertimeForm] = useState(false)
  const [showSalaryForm, setShowSalaryForm] = useState(false)
  const [overtimeRecords, setOvertimeRecords] = useState<OvertimeRecord[]>(employee.overtimeRecords)
  const [salaryPayments, setSalaryPayments] = useState<FixedSalaryPayment[]>(employee.salaryPayments)
  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; type: 'overtime' | 'salary'; id: string }>({
    isOpen: false,
    type: 'overtime',
    id: ''
  })
  const [editDialog, setEditDialog] = useState<{ isOpen: boolean; type: 'overtime' | 'salary'; id: string }>({
    isOpen: false,
    type: 'overtime',
    id: ''
  })
  const [overtimeFormData, setOvertimeFormData] = useState<OvertimeFormData>({
    date: '',
    description: '',
    hours: '',
    rate: ''
  })
  const [salaryFormData, setSalaryFormData] = useState<SalaryPaymentFormData>({
    date: '',
    description: '',
    type: '',
    amount: ''
  })

  // Filter data based on date range
  const filteredOvertimeRecords = overtimeRecords.filter(record => {
    if (!dateRange.startDate && !dateRange.endDate) return true
    const recordDate = record.date.toISOString().split('T')[0]
    const isAfterStart = !dateRange.startDate || recordDate >= dateRange.startDate
    const isBeforeEnd = !dateRange.endDate || recordDate <= dateRange.endDate
    return isAfterStart && isBeforeEnd
  })

  const filteredSalaryPayments = salaryPayments.filter(payment => {
    if (!dateRange.startDate && !dateRange.endDate) return true
    const paymentDate = payment.paymentDate.toISOString().split('T')[0]
    const isAfterStart = !dateRange.startDate || paymentDate >= dateRange.startDate
    const isBeforeEnd = !dateRange.endDate || paymentDate <= dateRange.endDate
    return isAfterStart && isBeforeEnd
  })

  // Calculate summary
  const totalOvertime = filteredOvertimeRecords.reduce((sum, record) => sum + record.amount, 0)
  const totalCompensation = employee.monthlySalary + totalOvertime
  const totalPaid = filteredSalaryPayments.reduce((sum, payment) => sum + payment.amount, 0)
  
  const summary: ReportSummary = {
    earned: totalCompensation,
    paid: totalPaid,
    balance: totalCompensation - totalPaid,
    isNegativeBalance: false
  }
  summary.isNegativeBalance = summary.balance < 0

  const handleAddOvertime = () => {
    if (!overtimeFormData.date || !overtimeFormData.description || !overtimeFormData.hours || !overtimeFormData.rate) {
      alert('Please fill in all fields')
      return
    }

    const hours = parseFloat(overtimeFormData.hours)
    const rate = parseFloat(overtimeFormData.rate)
    
    const newRecord: OvertimeRecord = {
      id: `ot_${Date.now()}`,
      employeeId: employee.id,
      date: new Date(overtimeFormData.date),
      description: overtimeFormData.description,
      hours: hours,
      rate: rate,
      amount: hours * rate,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    setOvertimeRecords([...overtimeRecords, newRecord])
    setOvertimeFormData({ date: '', description: '', hours: '', rate: '' })
    setShowOvertimeForm(false)
  }

  const handleAddSalary = () => {
    if (!salaryFormData.date || !salaryFormData.description || !salaryFormData.type || !salaryFormData.amount) {
      alert('Please fill in all fields')
      return
    }

    const newPayment: FixedSalaryPayment = {
      id: `fsp_${Date.now()}`,
      employeeId: employee.id,
      amount: parseFloat(salaryFormData.amount),
      paymentDate: new Date(salaryFormData.date),
      month: new Date(salaryFormData.date).toISOString().slice(0, 7),
      type: salaryFormData.type,
      notes: salaryFormData.description,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    setSalaryPayments([...salaryPayments, newPayment])
    setSalaryFormData({ date: '', description: '', type: '', amount: '' })
    setShowSalaryForm(false)
  }

  const handleDelete = () => {
    if (deleteDialog.type === 'overtime') {
      setOvertimeRecords(overtimeRecords.filter(record => record.id !== deleteDialog.id))
    } else {
      setSalaryPayments(salaryPayments.filter(payment => payment.id !== deleteDialog.id))
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const handleViewPayslip = () => {
    const params = new URLSearchParams()
    if (dateRange.startDate) params.set('start_date', dateRange.startDate)
    if (dateRange.endDate) params.set('end_date', dateRange.endDate)
    
    const payslipUrl = `/employees/fixed_employee_payslip/${employeeId}${params.toString() ? `?${params.toString()}` : ''}`
    router.push(payslipUrl)
  }

  const resetDateRange = () => {
    setDateRange({ startDate: '', endDate: '' })
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 print:space-y-4">
        {/* Screen Header */}
        <div className="flex items-center justify-between no-print">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.back()}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <h1 className="text-2xl font-bold">Fixed Salary Report - {employee.firstName} {employee.lastName}</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={handleViewPayslip} variant="outline" className="flex items-center gap-2">
              <Receipt className="h-4 w-4" />
              Generate Report
            </Button>
            <Button onClick={handlePrint} className="flex items-center gap-2">
              <Printer className="h-4 w-4" />
              Print Report
            </Button>
          </div>
        </div>

        {/* Print Header */}
        <div className="print-only print-company-header">
          <h1 className="text-3xl font-bold text-center mb-2">WINSIDE</h1>
          <p className="text-center text-lg mb-4">Fixed Salary Employee Report</p>
          <div className="print-employee-info">
            <div>
              <strong>Employee:</strong> {employee.firstName} {employee.lastName}
            </div>
            <div>
              <strong>Role:</strong> {employee.role}
            </div>
            <div>
              <strong>Monthly Salary:</strong> {formatCurrency(employee.monthlySalary)}
            </div>
            <div>
              <strong>Report Date:</strong> {formatDate(new Date())}
            </div>
          </div>
        </div>

        {/* Employee Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Employee Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <p className="text-sm font-medium">Name</p>
                <p className="text-gray-600 dark:text-gray-300">{employee.firstName} {employee.lastName}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium flex items-center gap-1">
                  <Phone className="h-4 w-4" />
                  Phone
                </p>
                <p className="text-gray-600 dark:text-gray-300">{employee.phone}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Role</p>
                <p className="text-gray-600 dark:text-gray-300 capitalize">{employee.role}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium flex items-center gap-1">
                  <Wallet className="h-4 w-4" />
                  Monthly Salary
                </p>
                <p className="text-gray-600 dark:text-gray-300 font-semibold">{formatCurrency(employee.monthlySalary)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Date Range Filter */}
        <div className="no-print">
          <DateRangeFilter
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
            onReset={resetDateRange}
            actionButtons={
              <div className="flex gap-2">
                <Button 
                  onClick={() => setShowOvertimeForm(true)}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Overtime
                </Button>
                <Button 
                  onClick={() => setShowSalaryForm(true)}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Payment
                </Button>
              </div>
            }
          />
        </div>

        {/* Summary Cards */}
        <div className="no-print">
          <SummaryCards 
            summary={summary} 
            type="fixed"
            monthlySalary={employee.monthlySalary}
          />
        </div>

        {/* Overtime Records Section */}
        <Card className="no-print">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Overtime Records
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Date</th>
                    <th className="text-left py-2">Description</th>
                    <th className="text-right py-2">Hours</th>
                    <th className="text-right py-2">Rate</th>
                    <th className="text-right py-2">Amount</th>
                    <th className="text-center py-2 print:hidden">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOvertimeRecords.map((record) => (
                    <tr key={record.id} className="border-b">
                      <td className="py-3">{formatDate(record.date)}</td>
                      <td className="py-3">{record.description}</td>
                      <td className="py-3 text-right">{record.hours}</td>
                      <td className="py-3 text-right">{formatCurrency(record.rate)}</td>
                      <td className="py-3 text-right font-medium">{formatCurrency(record.amount)}</td>
                      <td className="py-3 text-center print:hidden">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteDialog({ isOpen: true, type: 'overtime', id: record.id })}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {filteredOvertimeRecords.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-gray-500">
                        No overtime records found for the selected period
                      </td>
                    </tr>
                  )}
                </tbody>
                <tfoot>
                  <tr className="border-t-2">
                    <td colSpan={4} className="py-3 text-right font-medium">Total Overtime:</td>
                    <td className="py-3 text-right font-bold">{formatCurrency(totalOvertime)}</td>
                    <td className="print:hidden"></td>
                  </tr>
                  <tr className="border-t">
                    <td colSpan={4} className="py-3 text-right font-medium">Monthly Salary:</td>
                    <td className="py-3 text-right font-bold">{formatCurrency(employee.monthlySalary)}</td>
                    <td className="print:hidden"></td>
                  </tr>
                  <tr className="border-t-2 bg-green-50 dark:bg-green-950">
                    <td colSpan={4} className="py-3 text-right font-bold text-green-700 dark:text-green-300">Total Compensation:</td>
                    <td className="py-3 text-right font-bold text-green-700 dark:text-green-300">{formatCurrency(totalCompensation)}</td>
                    <td className="print:hidden"></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Salary Payments Section */}
        <Card className="no-print">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Salary Payments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Date</th>
                    <th className="text-left py-2">Description</th>
                    <th className="text-left py-2">Type</th>
                    <th className="text-right py-2">Amount</th>
                    <th className="text-center py-2 print:hidden">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSalaryPayments.map((payment) => (
                    <tr key={payment.id} className="border-b">
                      <td className="py-3">{formatDate(payment.paymentDate)}</td>
                      <td className="py-3">{payment.notes || 'Salary Payment'}</td>
                      <td className="py-3">{payment.type || 'Salary'}</td>
                      <td className="py-3 text-right font-medium">{formatCurrency(payment.amount)}</td>
                      <td className="py-3 text-center print:hidden">
                        <div className="flex gap-1 justify-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditDialog({ isOpen: true, type: 'salary', id: payment.id })}
                          >
                            <Edit className="h-4 w-4 text-blue-500" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteDialog({ isOpen: true, type: 'salary', id: payment.id })}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredSalaryPayments.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-gray-500">
                        No salary payments found for the selected period
                      </td>
                    </tr>
                  )}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 font-bold">
                    <td colSpan={3} className="py-3 text-right">Total Paid:</td>
                    <td className="py-3 text-right">{formatCurrency(summary.paid)}</td>
                    <td className="print:hidden"></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Add Overtime Modal */}
        <Dialog open={showOvertimeForm} onOpenChange={setShowOvertimeForm}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add Overtime Record</DialogTitle>
              <DialogDescription>
                Add a new overtime record for {employee.firstName} {employee.lastName}
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Date</label>
                <Input
                  type="date"
                  value={overtimeFormData.date}
                  onChange={(e) => setOvertimeFormData({...overtimeFormData, date: e.target.value})}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <Input
                  placeholder="Overtime description"
                  value={overtimeFormData.description}
                  onChange={(e) => setOvertimeFormData({...overtimeFormData, description: e.target.value})}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Hours</label>
                <Input
                  type="number"
                  step="0.5"
                  placeholder="Overtime hours"
                  value={overtimeFormData.hours}
                  onChange={(e) => setOvertimeFormData({...overtimeFormData, hours: e.target.value})}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Rate</label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="Hourly rate"
                  value={overtimeFormData.rate}
                  onChange={(e) => setOvertimeFormData({...overtimeFormData, rate: e.target.value})}
                />
              </div>
            </div>
            <div className="flex gap-2 justify-end mt-4">
              <Button variant="outline" onClick={() => setShowOvertimeForm(false)}>Cancel</Button>
              <Button onClick={handleAddOvertime}>Add Overtime</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Add Payment Modal */}
        <Dialog open={showSalaryForm} onOpenChange={setShowSalaryForm}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add Salary Payment</DialogTitle>
              <DialogDescription>
                Add a new salary payment for {employee.firstName} {employee.lastName}
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Date</label>
                <Input
                  type="date"
                  value={salaryFormData.date}
                  onChange={(e) => setSalaryFormData({...salaryFormData, date: e.target.value})}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <Input
                  placeholder="Payment description"
                  value={salaryFormData.description}
                  onChange={(e) => setSalaryFormData({...salaryFormData, description: e.target.value})}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Type</label>
                <Input
                  placeholder="Payment type (e.g., Salary, Bonus)"
                  value={salaryFormData.type}
                  onChange={(e) => setSalaryFormData({...salaryFormData, type: e.target.value})}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Amount</label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="Payment amount"
                  value={salaryFormData.amount}
                  onChange={(e) => setSalaryFormData({...salaryFormData, amount: e.target.value})}
                />
              </div>
            </div>
            <div className="flex gap-2 justify-end mt-4">
              <Button variant="outline" onClick={() => setShowSalaryForm(false)}>Cancel</Button>
              <Button onClick={handleAddSalary}>Add Payment</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <ConfirmationDialog
          isOpen={deleteDialog.isOpen}
          onClose={() => setDeleteDialog({ isOpen: false, type: 'overtime', id: '' })}
          onConfirm={handleDelete}
          title={`Delete ${deleteDialog.type === 'overtime' ? 'Overtime Record' : 'Salary Payment'}`}
          description={`Are you sure you want to delete this ${deleteDialog.type === 'overtime' ? 'overtime record' : 'salary payment'}? This action cannot be undone.`}
          confirmText="Delete"
        />
      </div>
    </DashboardLayout>
  )
}