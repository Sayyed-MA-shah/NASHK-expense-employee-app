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
import { formatCurrency } from '@/lib/utils'
import { useDateFormat } from '@/hooks/useDateFormat'
import { ArrowLeft, Printer } from 'lucide-react'

export default function EmployeePayslipPage() {
  const params = useParams()
  const router = useRouter()
  const employeeId = params.id as string
  const { formatDate } = useDateFormat()

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
    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    const payslipHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Payslip - ${employee.first_name}${employee.last_name ? ` ${employee.last_name}` : ''}</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              padding: 30px;
              background: white;
              color: #000;
            }
            .payslip {
              max-width: 800px;
              margin: 0 auto;
              background: white;
            }
            .header {
              display: flex;
              justify-content: space-between;
              align-items: start;
              border-bottom: 2px solid #000;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .header .left h1 {
              font-size: 32px;
              font-weight: bold;
              color: #000;
              margin-bottom: 4px;
            }
            .header .left p {
              font-size: 14px;
              color: #666;
            }
            .header .right {
              text-align: right;
            }
            .header .right .label {
              font-size: 12px;
              color: #666;
              margin-bottom: 4px;
            }
            .header .right .value {
              font-size: 14px;
              font-weight: 600;
              color: #000;
            }
            .employee-info {
              background: #f8f9fa;
              border: 1px solid #dee2e6;
              border-radius: 8px;
              padding: 20px;
              margin-bottom: 30px;
            }
            .info-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 20px;
            }
            .info-item {
              padding: 8px 0;
            }
            .info-label {
              font-size: 12px;
              color: #666;
              text-transform: uppercase;
              margin-bottom: 4px;
            }
            .info-value {
              font-size: 16px;
              font-weight: 600;
              color: #000;
            }
            .summary-section {
              margin-bottom: 30px;
            }
            .summary-title {
              font-size: 18px;
              font-weight: bold;
              color: #000;
              margin-bottom: 15px;
              padding-bottom: 8px;
              border-bottom: 2px solid #e0e0e0;
            }
            .summary-table {
              width: 100%;
              border-collapse: collapse;
              background: white;
              border: 1px solid #dee2e6;
            }
            .summary-table tr {
              border-bottom: 1px solid #e0e0e0;
            }
            .summary-table td {
              padding: 12px 16px;
              font-size: 14px;
            }
            .summary-table td:first-child {
              color: #495057;
              font-weight: 500;
            }
            .summary-table td:last-child {
              text-align: right;
              font-weight: 600;
              color: #000;
            }
            .summary-table tr.total {
              background: #f8f9fa;
              font-weight: bold;
            }
            .summary-table tr.total td {
              font-size: 16px;
              padding: 16px;
            }
            .balance-positive {
              color: #28a745;
            }
            .balance-negative {
              color: #dc3545;
            }
            .balance-zero {
              color: #6c757d;
            }
            .notes {
              background: #e7f3ff;
              border: 1px solid #b3d9ff;
              border-radius: 8px;
              padding: 16px;
              margin-bottom: 30px;
            }
            .notes-title {
              font-weight: 600;
              margin-bottom: 8px;
              font-size: 14px;
            }
            .notes ul {
              list-style: disc;
              margin-left: 20px;
              font-size: 13px;
              color: #495057;
            }
            .notes li {
              margin-bottom: 4px;
            }
            .footer {
              margin-top: 40px;
              padding-top: 20px;
              border-top: 1px solid #dee2e6;
              text-align: center;
              font-size: 12px;
              color: #6c757d;
            }
            .footer p {
              margin-bottom: 4px;
            }
            @media print {
              body { padding: 0; }
            }
          </style>
        </head>
        <body>
          <div class="payslip">
            <div class="header">
              <div class="left">
                <h1>NASHAK</h1>
                <p>Employee Payslip</p>
              </div>
              <div class="right">
                <div class="label">Generated Date</div>
                <div class="value">${formatDate(new Date().toISOString())}</div>
              </div>
            </div>

            <div class="employee-info">
              <div class="info-grid">
                <div class="info-item">
                  <div class="info-label">Employee Name</div>
                  <div class="info-value">${employee.first_name}${employee.last_name ? ` ${employee.last_name}` : ''}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">Role</div>
                  <div class="info-value">${employee.role || 'N/A'}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">Phone</div>
                  <div class="info-value">${employee.phone || 'N/A'}</div>
                </div>
              </div>
            </div>

            <div class="summary-section">
              <div class="summary-title">Payment Summary</div>
              <table class="summary-table">
                <tbody>
                  <tr>
                    <td>Total Work Records</td>
                    <td>${workRecords.length} records</td>
                  </tr>
                  <tr>
                    <td>Total Earned</td>
                    <td>${formatCurrency(totalEarned)}</td>
                  </tr>
                  <tr>
                    <td>Total Salary Payments</td>
                    <td>${salaryPayments.length} payments</td>
                  </tr>
                  <tr>
                    <td>Total Salary Paid</td>
                    <td>${formatCurrency(totalSalaryPaid)}</td>
                  </tr>
                  <tr class="total">
                    <td>Net Balance</td>
                    <td class="${balance < 0 ? 'balance-negative' : balance > 0 ? 'balance-positive' : 'balance-zero'}">
                      ${formatCurrency(balance)}
                      ${balance < 0 ? '<div style="font-size: 12px; font-weight: normal; margin-top: 4px;">(Overpaid)</div>' : ''}
                      ${balance > 0 ? '<div style="font-size: 12px; font-weight: normal; margin-top: 4px;">(Payable to Employee)</div>' : ''}
                      ${balance === 0 ? '<div style="font-size: 12px; font-weight: normal; margin-top: 4px;">(Cleared)</div>' : ''}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="notes">
              <div class="notes-title">📋 Note:</div>
              <ul>
                <li>This is an official payslip generated by NASHAK.</li>
                <li>All payments are calculated based on work records and salary payments.</li>
                <li>For any discrepancies, please contact the accounts department.</li>
              </ul>
            </div>

            <div class="footer">
              <p>Generated on ${formatDate(new Date().toISOString())}</p>
              <p>This is a computer-generated document and does not require a signature.</p>
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

    printWindow.document.write(payslipHTML)
    printWindow.document.close()
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
              <h1 className="text-3xl font-bold text-gray-900">NASHAK</h1>
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
                <h2 className="text-2xl font-bold">NASHAK</h2>
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
                <p className="text-lg font-semibold">{employee.first_name}{employee.last_name ? ` ${employee.last_name}` : ''}</p>
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
                <li>This is an official payslip generated by NASHAK.</li>
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
