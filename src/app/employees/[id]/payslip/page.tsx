'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import DashboardLayout from '@/components/layout/dashboard-layout'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  getEmployeeById, 
  getWorkRecordsByEmployee, 
  getSalaryPaymentsByEmployee 
} from '@/lib/api'
import { formatCurrency, formatDate } from '@/lib/utils'
import { ArrowLeft, Printer } from 'lucide-react'

export default function EmployeePayslipPage() {
  const params = useParams()
  const router = useRouter()
  const employeeId = params.id as string

  const [employee, setEmployee] = useState<any>(null)
  const [workRecords, setWorkRecords] = useState<any[]>([])
  const [salaryPayments, setSalaryPayments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadEmployee()
  }, [employeeId])

  async function loadEmployee() {
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
      console.error('Error loading employee:', error)
    } finally {
      setLoading(false)
    }
  }

  function handlePrint() {
    window.print()
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <p className="text-muted-foreground">Loading payslip...</p>
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

  // Calculate totals from actual records
  const totalEarned = workRecords.reduce((sum, wr) => sum + (wr.quantity * wr.price), 0)
  const totalSalaryPaid = salaryPayments.reduce((sum, sp) => sum + sp.amount, 0)
  const balance = totalEarned - totalSalaryPaid

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Print-only header */}
        <div className="print-only mb-8">
          <div className="flex justify-between items-start border-b-2 border-gray-300 pb-6 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">NASHK</h1>
              <p className="text-gray-600 mt-1">Employee Payslip</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Generated Date</p>
              <p className="font-semibold text-gray-900">{formatDate(new Date().toISOString().split('T')[0])}</p>
            </div>
          </div>
        </div>

        {/* Screen-only header */}
        <div className="no-print">
          <div className="flex items-center gap-2 mb-4">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => router.push(`/employees/${employeeId}`)}
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h1 className="text-3xl font-bold">Employee Payslip</h1>
          </div>
        </div>

        <Card className="print:shadow-none print:border-0">
          <CardContent className="p-8">
            {/* Print header for card */}
            <div className="print:hidden flex justify-between items-center mb-6 border-b pb-4">
              <div>
                <h2 className="text-2xl font-bold">NASHK</h2>
                <p className="text-muted-foreground text-sm">Employee Payslip</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Generated Date</p>
                <p className="font-semibold">{formatDate(new Date().toISOString().split('T')[0])}</p>
              </div>
            </div>

            {/* Employee Information */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Employee Name</p>
                <p className="text-lg font-semibold">{employee.first_name} {employee.last_name}</p>
              </div>
              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Role</p>
                <p className="text-lg font-semibold capitalize">{employee.role || '—'}</p>
              </div>
              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Phone</p>
                <p className="text-lg font-semibold">{employee.phone || '—'}</p>
              </div>
            </div>

            {/* Payment Summary */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4">Payment Summary</h3>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                  <tbody>
                    <tr className="border-b">
                      <td className="bg-muted/50 px-4 py-3 font-medium w-1/2">Total Work Records</td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {workRecords.length} records
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="bg-muted/50 px-4 py-3 font-medium">Total Earned</td>
                      <td className="px-4 py-3 font-semibold text-green-600">
                        {formatCurrency(totalEarned)}
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="bg-muted/50 px-4 py-3 font-medium">Total Salary Payments</td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {salaryPayments.length} payments
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="bg-muted/50 px-4 py-3 font-medium">Total Salary Paid</td>
                      <td className="px-4 py-3 font-semibold text-blue-600">
                        {formatCurrency(totalSalaryPaid)}
                      </td>
                    </tr>
                    <tr className="bg-primary/5">
                      <td className="bg-muted px-4 py-4 font-bold text-lg">Net Balance</td>
                      <td className="px-4 py-4">
                        {balance > 0 ? (
                          <div>
                            <p className="text-lg font-bold text-green-600">{formatCurrency(balance)}</p>
                            <p className="text-sm text-muted-foreground">(Payable to Employee)</p>
                          </div>
                        ) : balance < 0 ? (
                          <div>
                            <p className="text-lg font-bold text-red-600">{formatCurrency(Math.abs(balance))}</p>
                            <p className="text-sm text-muted-foreground">(Overpaid)</p>
                          </div>
                        ) : (
                          <div>
                            <p className="text-lg font-bold text-gray-600">{formatCurrency(0)}</p>
                            <p className="text-sm text-muted-foreground">(Cleared)</p>
                          </div>
                        )}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Notes */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-sm text-gray-700">
              <p className="font-semibold mb-2">📋 Note:</p>
              <ul className="space-y-1 ml-4 list-disc">
                <li>This is an official payslip generated by NASHK.</li>
                <li>All payments are calculated based on work records and salary payments.</li>
                <li>For any discrepancies, please contact the accounts department.</li>
              </ul>
            </div>

            {/* Footer - Print only */}
            <div className="print-only mt-8 pt-4 border-t text-center text-sm text-gray-500">
              <p>Generated on {formatDate(new Date().toISOString().split('T')[0])}</p>
              <p className="mt-1">This is a computer-generated document and does not require a signature.</p>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons - Screen only */}
        <div className="flex justify-between no-print">
          <Button 
            variant="outline"
            onClick={() => router.push(`/employees/${employeeId}`)}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Report
          </Button>
          <Button onClick={handlePrint}>
            <Printer className="w-4 h-4 mr-2" />
            Print Payslip
          </Button>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          .no-print {
            display: none !important;
          }
          .print-only {
            display: block !important;
          }
          nav, footer, header, aside {
            display: none !important;
          }
          body {
            background: white !important;
          }
          main {
            padding: 0 !important;
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
