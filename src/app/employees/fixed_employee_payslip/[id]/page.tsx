'use client'

import { useState, useEffect } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import DashboardLayout from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatDate } from '@/lib/utils'
import { 
  ArrowLeft, 
  Printer, 
  Phone,
  MapPin,
  Calendar,
  User,
  Briefcase,
  Clock,
  Wallet
} from 'lucide-react'
import { 
  FixedEmployee, 
  OvertimeRecord, 
  FixedSalaryPayment 
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

export default function FixedEmployeePayslip() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  
  const employeeId = params.id as string
  const startDate = searchParams.get('start_date') || ''
  const endDate = searchParams.get('end_date') || ''
  
  const [employee] = useState<FixedEmployee>(mockFixedEmployee)
  
  // Filter data based on date range
  const filteredOvertimeRecords = employee.overtimeRecords.filter(record => {
    if (!startDate && !endDate) return true
    const recordDate = record.date.toISOString().split('T')[0]
    const isAfterStart = !startDate || recordDate >= startDate
    const isBeforeEnd = !endDate || recordDate <= endDate
    return isAfterStart && isBeforeEnd
  })

  const filteredSalaryPayments = employee.salaryPayments.filter(payment => {
    if (!startDate && !endDate) return true
    const paymentDate = payment.paymentDate.toISOString().split('T')[0]
    const isAfterStart = !startDate || paymentDate >= startDate
    const isBeforeEnd = !endDate || paymentDate <= endDate
    return isAfterStart && isBeforeEnd
  })

  // Calculate totals
  const totalOvertime = filteredOvertimeRecords.reduce((sum, record) => sum + record.amount, 0)
  const totalCompensation = employee.monthlySalary + totalOvertime
  const totalPaid = filteredSalaryPayments.reduce((sum, payment) => sum + payment.amount, 0)
  const balance = totalCompensation - totalPaid
  const isNegativeBalance = balance < 0

  const handlePrint = () => {
    window.print()
  }

  const periodText = startDate && endDate 
    ? `${formatDate(new Date(startDate))} - ${formatDate(new Date(endDate))}`
    : 'All Time'

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Screen Header - Hidden in Print */}
        <div className="no-print bg-white dark:bg-gray-800 shadow-sm border-b p-4 mb-6">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.back()}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Report
              </Button>
              <h1 className="text-xl font-semibold">Payslip - {employee.firstName} {employee.lastName}</h1>
            </div>
            <Button onClick={handlePrint} className="flex items-center gap-2">
              <Printer className="h-4 w-4" />
              Print Payslip
            </Button>
          </div>
        </div>

        {/* Print-Optimized Payslip */}
        <div className="max-w-4xl mx-auto p-6 print:p-0 print:max-w-none">
          <div className="bg-white dark:bg-white dark:text-black shadow-lg print:shadow-none print:bg-white rounded-lg print:rounded-none">
            
            {/* Header with Company Branding */}
            <div className="border-b-2 border-gray-800 p-8 print:p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-3xl font-bold text-gray-800 mb-2">WINSIDE</h1>
                  <p className="text-gray-600 text-sm">Employee Management System</p>
                  <p className="text-gray-600 text-sm">123 Business Street, City, State 12345</p>
                  <p className="text-gray-600 text-sm">Phone: (555) 123-4567</p>
                </div>
                <div className="text-right">
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">PAYSLIP</h2>
                  <p className="text-gray-600 text-sm">
                    <strong>Period:</strong> {periodText}
                  </p>
                  <p className="text-gray-600 text-sm">
                    <strong>Generated:</strong> {formatDate(new Date())}
                  </p>
                  <p className="text-gray-600 text-sm">
                    <strong>Employee ID:</strong> {employeeId}
                  </p>
                </div>
              </div>
            </div>

            {/* Employee Information */}
            <div className="p-8 print:p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <User className="h-5 w-5" />
                Employee Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600 min-w-20">Name:</span>
                    <span className="font-medium text-gray-800">{employee.firstName} {employee.lastName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-600 min-w-16">Phone:</span>
                    <span className="text-gray-800">{employee.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-600 min-w-16">Role:</span>
                    <span className="text-gray-800 capitalize">{employee.role}</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-600 min-w-20">Hire Date:</span>
                    <span className="text-gray-800">{formatDate(employee.hireDate)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600 min-w-20">Type:</span>
                    <span className="text-gray-800 capitalize">{employee.type}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Wallet className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-600 min-w-20">Monthly Salary:</span>
                    <span className="text-gray-800 font-semibold">{formatCurrency(employee.monthlySalary)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Salary Breakdown */}
            <div className="p-8 print:p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Salary Breakdown</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-300">
                      <th className="text-left py-2 text-gray-700 font-medium">Component</th>
                      <th className="text-right py-2 text-gray-700 font-medium">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-200">
                      <td className="py-2 text-gray-800">Monthly Salary</td>
                      <td className="py-2 text-right text-gray-800 font-medium">{formatCurrency(employee.monthlySalary)}</td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="py-2 text-gray-800">Overtime Pay</td>
                      <td className="py-2 text-right text-gray-800 font-medium">{formatCurrency(totalOvertime)}</td>
                    </tr>
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-gray-800 bg-gray-50">
                      <td className="py-3 text-right font-semibold text-gray-800">Total Compensation:</td>
                      <td className="py-3 text-right font-bold text-gray-800">{formatCurrency(totalCompensation)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Overtime Records */}
            {filteredOvertimeRecords.length > 0 && (
              <div className="p-8 print:p-6 border-b">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Overtime Details
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-300">
                        <th className="text-left py-2 text-gray-700 font-medium">Date</th>
                        <th className="text-left py-2 text-gray-700 font-medium">Description</th>
                        <th className="text-right py-2 text-gray-700 font-medium">Hours</th>
                        <th className="text-right py-2 text-gray-700 font-medium">Rate</th>
                        <th className="text-right py-2 text-gray-700 font-medium">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredOvertimeRecords.map((record) => (
                        <tr key={record.id} className="border-b border-gray-200">
                          <td className="py-2 text-gray-800">{formatDate(record.date)}</td>
                          <td className="py-2 text-gray-800">{record.description}</td>
                          <td className="py-2 text-right text-gray-800">{record.hours}</td>
                          <td className="py-2 text-right text-gray-800">{formatCurrency(record.rate)}</td>
                          <td className="py-2 text-right text-gray-800 font-medium">{formatCurrency(record.amount)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t-2 border-gray-800 bg-gray-50">
                        <td colSpan={4} className="py-3 text-right font-semibold text-gray-800">Total Overtime:</td>
                        <td className="py-3 text-right font-bold text-gray-800">{formatCurrency(totalOvertime)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            )}

            {/* Payment Summary */}
            <div className="p-8 print:p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Payment Summary</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-300">
                      <th className="text-left py-2 text-gray-700 font-medium">Date</th>
                      <th className="text-left py-2 text-gray-700 font-medium">Description</th>
                      <th className="text-left py-2 text-gray-700 font-medium">Type</th>
                      <th className="text-right py-2 text-gray-700 font-medium">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSalaryPayments.map((payment) => (
                      <tr key={payment.id} className="border-b border-gray-200">
                        <td className="py-2 text-gray-800">{formatDate(payment.paymentDate)}</td>
                        <td className="py-2 text-gray-800">{payment.notes || 'Salary Payment'}</td>
                        <td className="py-2 text-gray-800">{payment.type || 'Salary'}</td>
                        <td className="py-2 text-right text-gray-800 font-medium">{formatCurrency(payment.amount)}</td>
                      </tr>
                    ))}
                    {filteredSalaryPayments.length === 0 && (
                      <tr>
                        <td colSpan={4} className="py-4 text-center text-gray-500">
                          No payments found for selected period
                        </td>
                      </tr>
                    )}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-gray-800 bg-gray-50">
                      <td colSpan={3} className="py-3 text-right font-semibold text-gray-800">Total Paid:</td>
                      <td className="py-3 text-right font-bold text-gray-800">{formatCurrency(totalPaid)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Final Summary */}
            <div className="p-8 print:p-6">
              <div className="bg-gray-50 rounded-lg p-6 print:bg-gray-100">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">Payment Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
                  <div className="bg-white rounded-lg p-4 shadow-sm print:shadow-none print:border">
                    <p className="text-gray-600 text-sm font-medium">Monthly Salary</p>
                    <p className="text-xl font-bold text-gray-800">{formatCurrency(employee.monthlySalary)}</p>
                  </div>
                  <div className="bg-white rounded-lg p-4 shadow-sm print:shadow-none print:border">
                    <p className="text-gray-600 text-sm font-medium">Overtime Pay</p>
                    <p className="text-xl font-bold text-gray-800">{formatCurrency(totalOvertime)}</p>
                  </div>
                  <div className="bg-white rounded-lg p-4 shadow-sm print:shadow-none print:border">
                    <p className="text-gray-600 text-sm font-medium">Total Paid</p>
                    <p className="text-xl font-bold text-gray-800">{formatCurrency(totalPaid)}</p>
                  </div>
                  <div className="bg-white rounded-lg p-4 shadow-sm print:shadow-none print:border">
                    <p className="text-gray-600 text-sm font-medium">Balance</p>
                    <p className={`text-xl font-bold ${isNegativeBalance ? 'text-red-600' : 'text-green-600'}`}>
                      {formatCurrency(Math.abs(balance))}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {isNegativeBalance ? 'Overpaid' : 'Outstanding'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-gray-300 p-6 print:p-4 text-center">
              <p className="text-gray-500 text-xs">
                This payslip is computer generated and does not require a signature.
              </p>
              <p className="text-gray-500 text-xs mt-1">
                Generated on {formatDate(new Date())} at {new Date().toLocaleTimeString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}