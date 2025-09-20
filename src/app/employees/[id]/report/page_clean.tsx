'use client'

import { useState, useEffect } from 'react'
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
  Calendar,
  DollarSign
} from 'lucide-react'
import { 
  ContractualEmployee, 
  WorkRecord, 
  SalaryPayment, 
  DateRange,
  ReportSummary 
} from '@/types'

// Mock data - in real app this would come from API
const mockContractualEmployee: ContractualEmployee = {
  id: 'emp_001',
  firstName: 'John',
  lastName: 'Doe',
  phone: '+1-555-0123',
  role: 'developer',
  type: 'contractual',
  status: 'active',
  hireDate: new Date('2024-03-15'),
  totalEarned: 2500,
  advancePaid: 1000,
  balance: 1500,
  workRecords: [
    {
      id: 'wr_001',
      employeeId: 'emp_001',
      date: new Date('2025-09-15'),
      description: 'Web development work',
      quantity: 40,
      price: 50,
      total: 2000,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'wr_002',
      employeeId: 'emp_001',
      date: new Date('2025-09-16'),
      description: 'Bug fixes and testing',
      quantity: 10,
      price: 50,
      total: 500,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ],
  salaryPayments: [
    {
      id: 'sp_001',
      employeeId: 'emp_001',
      amount: 1500,
      paymentDate: new Date('2025-09-16'),
      workRecordIds: ['wr_001'],
      isAdvanceDeduction: false,
      type: 'Salary',
      notes: 'Payment for completed work',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ],
  advances: [],
  createdAt: new Date(),
  updatedAt: new Date()
}

interface WorkRecordFormData {
  date: string
  description: string
  quantity: string
  price: string
}

interface SalaryPaymentFormData {
  date: string
  description: string
  type: string
  amount: string
}

export default function ContractualEmployeeReport() {
  const params = useParams()
  const router = useRouter()
  const employeeId = params.id as string

  const [employee] = useState<ContractualEmployee>(mockContractualEmployee)
  const [dateRange, setDateRange] = useState<DateRange>({ startDate: '', endDate: '' })
  const [showWorkForm, setShowWorkForm] = useState(false)
  const [showSalaryForm, setShowSalaryForm] = useState(false)
  const [workRecords, setWorkRecords] = useState<WorkRecord[]>(employee.workRecords)
  const [salaryPayments, setSalaryPayments] = useState<SalaryPayment[]>(employee.salaryPayments)
  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; type: 'work' | 'salary'; id: string }>({
    isOpen: false,
    type: 'work',
    id: ''
  })
  const [editDialog, setEditDialog] = useState<{ isOpen: boolean; type: 'work' | 'salary'; id: string }>({
    isOpen: false,
    type: 'work',
    id: ''
  })
  const [workFormData, setWorkFormData] = useState<WorkRecordFormData>({
    date: '',
    description: '',
    quantity: '',
    price: ''
  })
  const [salaryFormData, setSalaryFormData] = useState<SalaryPaymentFormData>({
    date: '',
    description: '',
    type: '',
    amount: ''
  })

  // Filter data based on date range
  const filteredWorkRecords = workRecords.filter(record => {
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
  const summary: ReportSummary = {
    earned: filteredWorkRecords.reduce((sum, record) => sum + record.total, 0),
    paid: filteredSalaryPayments.reduce((sum, payment) => sum + payment.amount, 0),
    balance: 0,
    isNegativeBalance: false
  }
  summary.balance = summary.earned - summary.paid
  summary.isNegativeBalance = summary.balance < 0

  const handleAddWork = () => {
    if (!workFormData.date || !workFormData.description || !workFormData.quantity || !workFormData.price) {
      alert('Please fill in all fields')
      return
    }

    const quantity = parseFloat(workFormData.quantity)
    const price = parseFloat(workFormData.price)
    const total = quantity * price

    const newRecord: WorkRecord = {
      id: `wr_${Date.now()}`,
      employeeId: employee.id,
      date: new Date(workFormData.date),
      description: workFormData.description,
      quantity,
      price,
      total,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    setWorkRecords([...workRecords, newRecord])
    setWorkFormData({ date: '', description: '', quantity: '', price: '' })
    setShowWorkForm(false)
  }

  const handleAddSalary = () => {
    if (!salaryFormData.date || !salaryFormData.description || !salaryFormData.type || !salaryFormData.amount) {
      alert('Please fill in all fields')
      return
    }

    const newPayment: SalaryPayment = {
      id: `sp_${Date.now()}`,
      employeeId: employee.id,
      amount: parseFloat(salaryFormData.amount),
      paymentDate: new Date(salaryFormData.date),
      workRecordIds: [],
      isAdvanceDeduction: false,
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
    if (deleteDialog.type === 'work') {
      setWorkRecords(workRecords.filter(record => record.id !== deleteDialog.id))
    } else {
      setSalaryPayments(salaryPayments.filter(payment => payment.id !== deleteDialog.id))
    }
    setDeleteDialog({ isOpen: false, type: 'work', id: '' })
  }

  const handlePrint = () => {
    window.print()
  }

  const resetDateRange = () => {
    setDateRange({ startDate: '', endDate: '' })
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
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
            <h1 className="text-2xl font-bold">Employee Report - {employee.firstName} {employee.lastName}</h1>
          </div>
          <Button onClick={handlePrint} className="flex items-center gap-2">
            <Printer className="h-4 w-4" />
            Print Report
          </Button>
        </div>

        {/* Date Range Filter with Action Buttons */}
        <div className="no-print">
          <DateRangeFilter
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
            onReset={resetDateRange}
            actionButtons={
              <>
                <Button onClick={() => setShowWorkForm(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Work
                </Button>
                <Button onClick={() => setShowSalaryForm(true)} variant="outline">
                  <DollarSign className="w-4 h-4 mr-2" />
                  Add Payment
                </Button>
              </>
            }
          />
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            </div>
          </CardContent>
        </Card>

        {/* Summary Cards - Screen Only */}
        <div className="no-print">
          <SummaryCards 
            summary={summary} 
            type="contractual"
          />
        </div>

        {/* Work Records Section */}
        <Card className="no-print">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Work Records
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Date</th>
                    <th className="text-left py-2">Description</th>
                    <th className="text-right py-2">Quantity</th>
                    <th className="text-right py-2">Rate</th>
                    <th className="text-right py-2">Total</th>
                    <th className="text-center py-2 print:hidden">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredWorkRecords.map((record) => (
                    <tr key={record.id} className="border-b">
                      <td className="py-3">{formatDate(record.date)}</td>
                      <td className="py-3">{record.description}</td>
                      <td className="py-3 text-right">{record.quantity}</td>
                      <td className="py-3 text-right">{formatCurrency(record.price)}</td>
                      <td className="py-3 text-right font-medium">{formatCurrency(record.total)}</td>
                      <td className="py-3 text-center print:hidden">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteDialog({ isOpen: true, type: 'work', id: record.id })}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {filteredWorkRecords.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-gray-500">
                        No work records found for the selected period
                      </td>
                    </tr>
                  )}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 font-bold">
                    <td colSpan={4} className="py-3 text-right">Total Earned:</td>
                    <td className="py-3 text-right">{formatCurrency(summary.earned)}</td>
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

        {/* Add Work Modal */}
        <Dialog open={showWorkForm} onOpenChange={setShowWorkForm}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add Work Record</DialogTitle>
              <DialogDescription>
                Add a new work record for {employee.firstName} {employee.lastName}
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Date</label>
                <Input
                  type="date"
                  value={workFormData.date}
                  onChange={(e) => setWorkFormData({...workFormData, date: e.target.value})}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <Input
                  placeholder="Work description"
                  value={workFormData.description}
                  onChange={(e) => setWorkFormData({...workFormData, description: e.target.value})}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Quantity</label>
                <Input
                  type="number"
                  placeholder="Hours/Units"
                  value={workFormData.quantity}
                  onChange={(e) => setWorkFormData({...workFormData, quantity: e.target.value})}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Rate</label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="Price per unit"
                  value={workFormData.price}
                  onChange={(e) => setWorkFormData({...workFormData, price: e.target.value})}
                />
              </div>
            </div>
            <div className="flex gap-2 justify-end mt-4">
              <Button variant="outline" onClick={() => setShowWorkForm(false)}>Cancel</Button>
              <Button onClick={handleAddWork}>Add Work</Button>
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
          onClose={() => setDeleteDialog({ isOpen: false, type: 'work', id: '' })}
          onConfirm={handleDelete}
          title={`Delete ${deleteDialog.type === 'work' ? 'Work Record' : 'Salary Payment'}`}
          description={`Are you sure you want to delete this ${deleteDialog.type === 'work' ? 'work record' : 'salary payment'}? This action cannot be undone.`}
          confirmText="Delete"
        />
      </div>
    </DashboardLayout>
  )
}