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
import { useSettings } from '@/contexts/SettingsContext'
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
  const { settings } = useSettings()
  const currency = settings.currency

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
  const [showPayslip, setShowPayslip] = useState(false)
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
  const monthlySalaryTotal = employee ? ((employee.monthly_salary || 0) * monthlyCount) : 0
  const overtimeTotal = filteredOvertimeRecords.reduce((sum, record) => sum + (record.amount || 0), 0)
  const totalSalary = monthlySalaryTotal + overtimeTotal
  const totalPaid = filteredSalaryPayments.reduce((sum, payment) => sum + (payment.amount || 0), 0)
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

  function clearFilters() {
    const today = new Date()
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1)
    setStartDate(firstDay.toISOString().split('T')[0])
    setEndDate(today.toISOString().split('T')[0])
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
              grid-template-columns: repeat(4, 1fr);
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
            .card-value.purple { color: #9333ea; }
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
              body { padding: 0; }
              .section { page-break-inside: avoid; }
            }
          </style>
        </head>
        <body>
          <div class="report">
            <div class="header">
              <h1>📄 Fixed Employee Report</h1>
              <div class="subtitle">${employee.first_name}${employee.last_name ? ` ${employee.last_name}` : ''} - ${employee.phone || 'N/A'}</div>
            </div>

            <div class="period">
              <strong>Report Period:</strong> ${formatDate(startDate)} to ${formatDate(endDate)} (${monthlyCount} month(s))
            </div>

            <div class="summary-cards">
              <div class="card">
                <div class="card-title">Total (Monthly + OT)</div>
                <div class="card-value green">${formatCurrency(totalSalary)}</div>
                <div class="card-subtitle">Monthly + Overtime</div>
              </div>
              <div class="card">
                <div class="card-title">Overtime Total</div>
                <div class="card-value purple">${formatCurrency(overtimeTotal)}</div>
                <div class="card-subtitle">Extra compensation</div>
              </div>
              <div class="card">
                <div class="card-title">Salary Paid</div>
                <div class="card-value blue">${formatCurrency(totalPaid)}</div>
                <div class="card-subtitle">Total payments</div>
              </div>
              <div class="card">
                <div class="card-title">Balance</div>
                <div class="card-value ${balance < 0 ? 'red' : 'green'}">${formatCurrency(balance)}</div>
                <div class="card-subtitle">${balance < 0 ? 'Overpaid' : 'Outstanding'}</div>
              </div>
            </div>

            <div class="section">
              <div class="section-title">⏱️ Overtime Records</div>
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Description</th>
                    <th class="center">Hours</th>
                    <th class="right">Rate</th>
                    <th class="right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  ${filteredOvertimeRecords.length > 0 ? filteredOvertimeRecords.map(record => `
                    <tr>
                      <td>${formatDate(record.date)}</td>
                      <td>${record.description}</td>
                      <td class="center">${record.hours}</td>
                      <td class="right">${formatCurrency(record.rate)}</td>
                      <td class="right" style="color: #9333ea; font-weight: 600;">${formatCurrency(record.amount)}</td>
                    </tr>
                  `).join('') : '<tr><td colspan="5" class="no-data">No overtime records found</td></tr>'}
                </tbody>
                <tfoot>
                  <tr>
                    <td colspan="4" class="right">Overtime Total:</td>
                    <td class="right" style="color: #9333ea;">${formatCurrency(overtimeTotal)}</td>
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
                      <td>${formatDate(payment.date)}</td>
                      <td>${payment.notes || 'Salary Payment'}</td>
                      <td class="right" style="color: #2563eb; font-weight: 600;">${formatCurrency(payment.amount)}</td>
                    </tr>
                  `).join('') : '<tr><td colspan="3" class="no-data">No salary payments found</td></tr>'}
                </tbody>
                <tfoot>
                  <tr>
                    <td colspan="2" class="right">Total Paid:</td>
                    <td class="right" style="color: #2563eb;">${formatCurrency(totalPaid)}</td>
                  </tr>
                  <tr>
                    <td colspan="2" class="right">Balance (Salary + OT − Paid):</td>
                    <td class="right" style="color: ${balance < 0 ? '#dc2626' : '#16a34a'};">${formatCurrency(balance)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <div class="footer">
              Generated on ${formatDate(new Date().toISOString())} | Fixed Employee Report
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

  function handlePrintPayslip() {
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
              padding: 20px;
              background: white;
            }
            .payslip {
              max-width: 800px;
              margin: 0 auto;
              background: linear-gradient(to bottom right, white, #f9fafb);
              padding: 40px;
              border-radius: 12px;
            }
            .header {
              border-bottom: 4px solid #2563eb;
              padding-bottom: 24px;
              margin-bottom: 24px;
              display: flex;
              justify-content: space-between;
            }
            .header h1 {
              font-size: 28px;
              font-weight: bold;
              color: #1f2937;
              margin-bottom: 8px;
            }
            .header p {
              font-size: 14px;
              color: #6b7280;
            }
            .header .right {
              text-align: right;
            }
            .header .right .label {
              font-size: 12px;
              color: #6b7280;
              margin-bottom: 4px;
            }
            .header .right .value {
              font-size: 14px;
              font-weight: 600;
              color: #374151;
            }
            .info-section {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 24px;
              margin-bottom: 24px;
              background: #eff6ff;
              padding: 20px;
              border-radius: 8px;
              border: 1px solid #bfdbfe;
            }
            .info-block h3 {
              font-size: 11px;
              font-weight: 600;
              color: #6b7280;
              text-transform: uppercase;
              margin-bottom: 12px;
            }
            .info-row {
              display: flex;
              margin-bottom: 8px;
            }
            .info-row .label {
              font-size: 14px;
              font-weight: 500;
              color: #6b7280;
              min-width: 120px;
            }
            .info-row .value {
              font-size: 14px;
              color: #1f2937;
              font-weight: 600;
            }
            .section {
              margin-bottom: 24px;
            }
            .section-title {
              font-size: 14px;
              font-weight: bold;
              color: #374151;
              text-transform: uppercase;
              margin-bottom: 12px;
              display: flex;
              align-items: center;
              gap: 8px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              background: white;
              border-radius: 8px;
              overflow: hidden;
              border: 1px solid #e5e7eb;
            }
            thead {
              background: linear-gradient(to right, #f0fdf4, #dcfce7);
            }
            thead.deductions {
              background: linear-gradient(to right, #fef2f2, #fee2e2);
            }
            th {
              padding: 12px;
              text-align: left;
              font-size: 11px;
              font-weight: 600;
              color: #6b7280;
              text-transform: uppercase;
            }
            th.right {
              text-align: right;
            }
            td {
              padding: 12px;
              font-size: 14px;
              color: #374151;
              border-top: 1px solid #f3f4f6;
            }
            td.right {
              text-align: right;
              font-weight: 600;
            }
            td.component .label {
              font-weight: 500;
              display: block;
            }
            td.component .detail {
              font-size: 12px;
              color: #6b7280;
              display: block;
              margin-top: 2px;
            }
            tfoot {
              background: linear-gradient(to right, #dcfce7, #bbf7d0);
              font-weight: bold;
            }
            tfoot.deductions {
              background: linear-gradient(to right, #fee2e2, #fecaca);
            }
            tfoot td {
              padding: 16px 12px;
              border-top: 2px solid #e5e7eb;
            }
            .amount-green { color: #16a34a; }
            .amount-purple { color: #9333ea; }
            .amount-red { color: #dc2626; }
            .amount-blue { color: #2563eb; }
            .net-pay {
              padding: 24px;
              border-radius: 8px;
              border: 2px solid #d1d5db;
              margin-bottom: 24px;
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
            .net-pay.due {
              background: linear-gradient(to right, #eff6ff, #dbeafe);
              border-color: #93c5fd;
            }
            .net-pay.overpaid {
              background: linear-gradient(to right, #fef2f2, #fee2e2);
              border-color: #fca5a5;
            }
            .net-pay.settled {
              background: linear-gradient(to right, #f9fafb, #f3f4f6);
              border-color: #d1d5db;
            }
            .net-pay .left .title {
              font-size: 14px;
              font-weight: 600;
              color: #6b7280;
              text-transform: uppercase;
              margin-bottom: 4px;
            }
            .net-pay .left .subtitle {
              font-size: 12px;
              color: #6b7280;
            }
            .net-pay .right .amount {
              font-size: 36px;
              font-weight: bold;
              text-align: right;
            }
            .net-pay .right .status {
              font-size: 12px;
              font-weight: 500;
              margin-top: 4px;
              text-align: right;
            }
            .footer {
              margin-top: 24px;
              padding-top: 16px;
              border-top: 1px solid #d1d5db;
              font-size: 12px;
              color: #6b7280;
              font-style: italic;
            }
            @media print {
              body { padding: 0; }
              .payslip { box-shadow: none; }
            }
          </style>
        </head>
        <body>
          <div class="payslip">
            <div class="header">
              <div class="left">
                <h1>💼 PAYSLIP</h1>
                <p>Salary Statement</p>
              </div>
              <div class="right">
                <div class="label">Date Issued</div>
                <div class="value">${formatDate(new Date().toISOString())}</div>
              </div>
            </div>

            <div class="info-section">
              <div class="info-block">
                <h3>Employee Details</h3>
                <div class="info-row">
                  <span class="label">Name:</span>
                  <span class="value">${employee.first_name}${employee.last_name ? ` ${employee.last_name}` : ''}</span>
                </div>
                <div class="info-row">
                  <span class="label">Phone:</span>
                  <span class="value">${employee.phone || 'N/A'}</span>
                </div>
                <div class="info-row">
                  <span class="label">Monthly Salary:</span>
                  <span class="value">${formatCurrency(employee.monthly_salary || 0)}</span>
                </div>
              </div>
              <div class="info-block">
                <h3>Pay Period</h3>
                <div class="info-row">
                  <span class="label">From:</span>
                  <span class="value">${formatDate(startDate)}</span>
                </div>
                <div class="info-row">
                  <span class="label">To:</span>
                  <span class="value">${formatDate(endDate)}</span>
                </div>
                <div class="info-row">
                  <span class="label">Duration:</span>
                  <span class="value">${monthlyCount} month(s)</span>
                </div>
              </div>
            </div>

            <div class="section">
              <div class="section-title">📈 Earnings</div>
              <table>
                <thead>
                  <tr>
                    <th>Component</th>
                    <th class="right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td class="component">
                      <span class="label">Basic Salary</span>
                      <span class="detail">${formatCurrency(employee.monthly_salary || 0)} × ${monthlyCount} month(s)</span>
                    </td>
                    <td class="right amount-green">${formatCurrency(monthlySalaryTotal)}</td>
                  </tr>
                  ${overtimeTotal > 0 ? `
                  <tr>
                    <td class="component">
                      <span class="label">Overtime Pay</span>
                      <span class="detail">${filteredOvertimeRecords.reduce((sum, ot) => sum + parseFloat(ot.hours), 0)} hours worked</span>
                    </td>
                    <td class="right amount-purple">${formatCurrency(overtimeTotal)}</td>
                  </tr>
                  ` : ''}
                </tbody>
                <tfoot>
                  <tr>
                    <td>Gross Salary</td>
                    <td class="right amount-green" style="font-size: 18px;">${formatCurrency(totalSalary)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <div class="section">
              <div class="section-title">💳 Deductions</div>
              <table>
                <thead class="deductions">
                  <tr>
                    <th>Description</th>
                    <th class="right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td class="component">
                      <span class="label">Advance Payments</span>
                    </td>
                    <td class="right amount-red">${formatCurrency(totalPaid)}</td>
                  </tr>
                </tbody>
                <tfoot class="deductions">
                  <tr>
                    <td>Total Deductions</td>
                    <td class="right amount-red" style="font-size: 18px;">${formatCurrency(totalPaid)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <div class="net-pay ${balance < 0 ? 'overpaid' : balance > 0 ? 'due' : 'settled'}">
              <div class="left">
                <div class="title">Net Payable Amount</div>
                <div class="subtitle">
                  ${balance < 0 ? 'Amount overpaid (to be adjusted)' : balance > 0 ? 'Amount due to employee' : 'Fully settled'}
                </div>
              </div>
              <div class="right">
                <div class="amount ${balance < 0 ? 'amount-red' : balance > 0 ? 'amount-blue' : ''}" style="color: ${balance < 0 ? '#dc2626' : balance > 0 ? '#2563eb' : '#6b7280'}">
                  ${formatCurrency(Math.abs(balance))}
                </div>
                ${balance < 0 ? '<div class="status amount-red">(Overpaid)</div>' : balance > 0 ? '<div class="status amount-blue">(Due)</div>' : ''}
              </div>
            </div>

            <div class="footer">
              This is a computer-generated payslip and does not require a signature.
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

  if (loading || !employee) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <p className="text-muted-foreground">Loading...</p>
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
                <Button onClick={() => setShowPayslip(true)} variant="outline">
                  <Wallet className="w-4 h-4 mr-2" />
                  Payslip
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
        <DialogContent className="max-w-3xl">
          <DialogHeader className="border-b pb-4">
            <DialogTitle className="text-2xl font-bold">Add Work (Overtime) – {employee.first_name}{employee.last_name ? ` ${employee.last_name}` : ''}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm text-muted-foreground">Date</label>
                <input
                  type="date"
                  value={overtimeForm.date}
                  onChange={(e) => setOvertimeForm({ ...overtimeForm, date: e.target.value })}
                  className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-ring"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm text-muted-foreground">Hours</label>
                <input
                  type="number"
                  step="0.5"
                  value={overtimeForm.hours}
                  onChange={(e) => setOvertimeForm({ ...overtimeForm, hours: e.target.value })}
                  className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-ring"
                  placeholder="0"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm text-muted-foreground">Rate</label>
                <input
                  type="number"
                  step="0.01"
                  value={overtimeForm.rate}
                  onChange={(e) => setOvertimeForm({ ...overtimeForm, rate: e.target.value })}
                  className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-ring"
                  placeholder="0.00"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm text-muted-foreground">Amount (optional)</label>
                <input
                  type="text"
                  value={overtimeForm.amount ? formatCurrency(parseFloat(overtimeForm.amount)) : ''}
                  readOnly
                  className="w-full px-3 py-2 border border-input rounded-lg bg-muted"
                  placeholder="0.00"
                />
                <p className="text-xs text-muted-foreground mt-1">If left blank, Amount = Hours × Rate.</p>
              </div>
            </div>
            <div className="space-y-2">
              <label className="block text-sm text-muted-foreground">Description</label>
              <input
                type="text"
                value={overtimeForm.description}
                onChange={(e) => setOvertimeForm({ ...overtimeForm, description: e.target.value })}
                className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-ring"
                placeholder="e.g., Extra project work"
                required
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button 
              variant="default" 
              onClick={handleAddOvertime}
              className="bg-green-600 hover:bg-green-700 text-white shadow"
            >
              Save
            </Button>
            <Button 
              variant="secondary" 
              onClick={() => setShowAddOvertime(false)}
              className="bg-gray-300 hover:bg-gray-400 text-black"
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Salary Dialog */}
      <Dialog open={showAddSalary} onOpenChange={setShowAddSalary}>
        <DialogContent className="max-w-lg">
          <DialogHeader className="space-y-4">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-2xl font-bold">💵 Add Salary Payment</DialogTitle>
            </div>
            <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg">
              Adding payment for: <strong>{employee.first_name}{employee.last_name ? ` ${employee.last_name}` : ''}</strong>
            </div>
          </DialogHeader>
          <div className="space-y-5 py-4">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-foreground">Payment Date</label>
              <input
                type="date"
                value={salaryForm.date}
                onChange={(e) => setSalaryForm({ ...salaryForm, date: e.target.value })}
                className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-ring"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-foreground">Amount ({currency})</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-3 flex items-center text-muted-foreground">{currency}</span>
                <input
                  type="number"
                  step="0.01"
                  value={salaryForm.amount}
                  onChange={(e) => setSalaryForm({ ...salaryForm, amount: e.target.value })}
                  className="w-full pl-8 pr-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-ring"
                  placeholder="0.00"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-foreground">Description (optional)</label>
              <textarea
                value={salaryForm.description}
                onChange={(e) => setSalaryForm({ ...salaryForm, description: e.target.value })}
                className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-ring"
                placeholder="e.g., Monthly salary payment"
                rows={3}
              />
              <p className="text-xs text-muted-foreground mt-1">Add any notes about this payment (e.g. month covered, bonus, deduction).</p>
            </div>
          </div>
          <DialogFooter className="pt-2">
            <Button 
              onClick={handleAddSalary}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg shadow active:translate-y-px transition"
            >
              💾 Save Payment
            </Button>
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

      {/* Payslip Dialog */}
      <Dialog open={showPayslip} onOpenChange={setShowPayslip}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <div className="payslip-content bg-gradient-to-br from-white to-gray-50 p-8 rounded-xl shadow-lg">
            {/* Header Section */}
            <div className="border-b-4 border-blue-600 pb-6 mb-6">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-3xl font-bold text-gray-800 mb-2">💼 PAYSLIP</h1>
                  <p className="text-sm text-gray-600">Salary Statement</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500 mb-1">Date Issued</p>
                  <p className="text-sm font-semibold text-gray-700">{formatDate(new Date().toISOString())}</p>
                </div>
              </div>
            </div>

            {/* Employee Information */}
            <div className="grid grid-cols-2 gap-6 mb-6 bg-blue-50 p-5 rounded-lg border border-blue-200">
              <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase mb-3">Employee Details</h3>
                <div className="space-y-2">
                  <div className="flex">
                    <span className="text-sm font-medium text-gray-600 w-24">Name:</span>
                    <span className="text-sm text-gray-800 font-semibold">{employee.first_name}{employee.last_name ? ` ${employee.last_name}` : ''}</span>
                  </div>
                  <div className="flex">
                    <span className="text-sm font-medium text-gray-600 w-24">Phone:</span>
                    <span className="text-sm text-gray-800">{employee.phone || 'N/A'}</span>
                  </div>
                  <div className="flex">
                    <span className="text-sm font-medium text-gray-600 w-24">Monthly Salary:</span>
                    <span className="text-sm text-gray-800 font-semibold">{formatCurrency(employee.monthly_salary || 0)}</span>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase mb-3">Pay Period</h3>
                <div className="space-y-2">
                  <div className="flex">
                    <span className="text-sm font-medium text-gray-600 w-20">From:</span>
                    <span className="text-sm text-gray-800">{formatDate(startDate)}</span>
                  </div>
                  <div className="flex">
                    <span className="text-sm font-medium text-gray-600 w-20">To:</span>
                    <span className="text-sm text-gray-800">{formatDate(endDate)}</span>
                  </div>
                  <div className="flex">
                    <span className="text-sm font-medium text-gray-600 w-20">Duration:</span>
                    <span className="text-sm text-gray-800">{monthlyCount} month(s)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Earnings Section */}
            <div className="mb-6">
              <h3 className="text-sm font-bold text-gray-700 uppercase mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-600" />
                Earnings
              </h3>
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-green-50 to-emerald-50">
                    <tr>
                      <th className="p-3 text-left text-xs font-semibold text-gray-600 uppercase">Component</th>
                      <th className="p-3 text-right text-xs font-semibold text-gray-600 uppercase">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    <tr className="hover:bg-gray-50">
                      <td className="p-3 text-sm text-gray-700">
                        <div className="flex flex-col">
                          <span className="font-medium">Basic Salary</span>
                          <span className="text-xs text-gray-500">{formatCurrency(employee.monthly_salary || 0)} × {monthlyCount} month(s)</span>
                        </div>
                      </td>
                      <td className="p-3 text-right text-base font-semibold text-green-600">{formatCurrency(monthlySalaryTotal)}</td>
                    </tr>
                    {overtimeTotal > 0 && (
                      <tr className="hover:bg-gray-50">
                        <td className="p-3 text-sm text-gray-700">
                          <div className="flex flex-col">
                            <span className="font-medium">Overtime Pay</span>
                            <span className="text-xs text-gray-500">{filteredOvertimeRecords.reduce((sum, ot) => sum + parseFloat(ot.hours), 0)} hours worked</span>
                          </div>
                        </td>
                        <td className="p-3 text-right text-base font-semibold text-purple-600">{formatCurrency(overtimeTotal)}</td>
                      </tr>
                    )}
                  </tbody>
                  <tfoot className="bg-gradient-to-r from-green-100 to-emerald-100">
                    <tr>
                      <td className="p-4 text-left text-base font-bold text-gray-700">Gross Salary</td>
                      <td className="p-4 text-right text-xl font-bold text-green-700">{formatCurrency(totalSalary)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Deductions Section */}
            <div className="mb-6">
              <h3 className="text-sm font-bold text-gray-700 uppercase mb-3 flex items-center gap-2">
                <Wallet className="w-4 h-4 text-blue-600" />
                Deductions
              </h3>
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-red-50 to-orange-50">
                    <tr>
                      <th className="p-3 text-left text-xs font-semibold text-gray-600 uppercase">Description</th>
                      <th className="p-3 text-right text-xs font-semibold text-gray-600 uppercase">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    <tr className="hover:bg-gray-50">
                      <td className="p-3 text-sm text-gray-700">
                        <span className="font-medium">Advance Payments</span>
                      </td>
                      <td className="p-3 text-right text-base font-semibold text-red-600">{formatCurrency(totalPaid)}</td>
                    </tr>
                  </tbody>
                  <tfoot className="bg-gradient-to-r from-red-100 to-orange-100">
                    <tr>
                      <td className="p-4 text-left text-base font-bold text-gray-700">Total Deductions</td>
                      <td className="p-4 text-right text-xl font-bold text-red-700">{formatCurrency(totalPaid)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Net Pay Section */}
            <div className={`rounded-lg p-6 border-2 ${balance < 0 ? 'bg-gradient-to-r from-red-50 to-orange-50 border-red-300' : balance > 0 ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-300' : 'bg-gradient-to-r from-gray-50 to-gray-100 border-gray-300'}`}>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-semibold text-gray-600 uppercase mb-1">Net Payable Amount</p>
                  <p className="text-xs text-gray-500">
                    {balance < 0 ? 'Amount overpaid (to be adjusted)' : balance > 0 ? 'Amount due to employee' : 'Fully settled'}
                  </p>
                </div>
                <div className="text-right">
                  <p className={`text-4xl font-bold ${balance < 0 ? 'text-red-600' : balance > 0 ? 'text-blue-600' : 'text-gray-600'}`}>
                    {formatCurrency(Math.abs(balance))}
                  </p>
                  {balance < 0 && <p className="text-xs text-red-600 font-medium mt-1">(Overpaid)</p>}
                  {balance > 0 && <p className="text-xs text-blue-600 font-medium mt-1">(Due)</p>}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-6 pt-4 border-t border-gray-300 flex justify-between items-center">
              <p className="text-xs text-gray-500 italic">
                This is a computer-generated payslip and does not require a signature.
              </p>
              <Button
                onClick={handlePrintPayslip}
                className="px-6 py-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-lg shadow-md flex items-center gap-2"
              >
                <Printer className="w-4 h-4" />
                Print
              </Button>
            </div>
          </div>
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
