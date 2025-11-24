'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { getPayments, createPayment, deletePayment } from '@/lib/api'
import { formatCurrency, formatDate, generateId } from '@/lib/utils'
import { TrendingUp, TrendingDown, Wallet, Calendar, Plus, X, Trash2, Edit, Trash, FileDown } from 'lucide-react'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

interface PaymentRow {
  id: string
  date: string
  description: string
  amount: string
  type: 'payin' | 'payout'
}

export default function PaymentsPage() {
  const [activeTab, setActiveTab] = useState<'payin' | 'payout'>('payin')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [showAddPaymentForm, setShowAddPaymentForm] = useState(false)
  const [paymentRows, setPaymentRows] = useState<PaymentRow[]>([
    {
      id: '1',
      date: '',
      description: '',
      amount: '',
      type: 'payin'
    }
  ])
  const [payments, setPayments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch payments from Supabase
  useEffect(() => {
    loadPayments()
  }, [])

  async function loadPayments() {
    try {
      setLoading(true)
      const data = await getPayments()
      setPayments(data)
    } catch (error) {
      console.error('Error loading payments:', error)
      alert('Failed to load payments')
    } finally {
      setLoading(false)
    }
  }

  // Filter payments based on type and date range
  const filteredPayments = payments.filter(payment => {
    const matchesType = activeTab === 'payin' ? payment.type === 'credit' : payment.type === 'debit'
    
    const paymentDate = new Date(payment.created_at)
    let matchesDateRange = true
    
    if (fromDate) {
      const from = new Date(fromDate)
      from.setHours(0, 0, 0, 0)
      matchesDateRange = matchesDateRange && paymentDate >= from
    }
    
    if (toDate) {
      const to = new Date(toDate)
      to.setHours(23, 59, 59, 999)
      matchesDateRange = matchesDateRange && paymentDate <= to
    }
    
    return matchesType && matchesDateRange
  })

  // Calculate KPI values
  const totalPayin = payments
    .filter(p => p.type === 'credit')
    .reduce((sum, p) => sum + p.amount, 0)
  
  const totalPayout = payments
    .filter(p => p.type === 'debit')
    .reduce((sum, p) => sum + p.amount, 0)
  
  const balance = totalPayin - totalPayout

  // Payment form functions
  const addPaymentRow = () => {
    const newRow: PaymentRow = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      description: '',
      amount: '',
      type: 'payin'
    }
    setPaymentRows([...paymentRows, newRow])
  }

  const removePaymentRow = (id: string) => {
    if (paymentRows.length > 1) {
      setPaymentRows(paymentRows.filter(row => row.id !== id))
    }
  }

  const updatePaymentRow = (id: string, field: keyof PaymentRow, value: string) => {
    setPaymentRows(paymentRows.map(row => 
      row.id === id ? { ...row, [field]: value } : row
    ))
  }

  const handleDeletePayment = async (paymentId: string) => {
    if (!confirm('Are you sure you want to delete this payment?')) return
    
    try {
      await deletePayment(paymentId)
      setPayments(prev => prev.filter(p => p.id !== paymentId))
    } catch (error) {
      console.error('Error deleting payment:', error)
      alert('Failed to delete payment')
    }
  }

  const handleEditPayment = (paymentId: string) => {
    // TODO: Implement edit functionality
    alert('Edit functionality will be implemented soon')
  }

  const validateAndSubmitPayments = async () => {
    const validRows = paymentRows.filter(row => 
      row.date && row.description.trim() && row.amount && parseFloat(row.amount) > 0 && row.type
    )
    
    if (validRows.length === 0) {
      alert('Please fill in all required fields for at least one payment row.')
      return
    }

    try {
      // Save each payment to Supabase
      for (const row of validRows) {
        await createPayment({
          amount: parseFloat(row.amount),
          type: row.type === 'payin' ? 'credit' : 'debit',
          description: row.description,
          reference: `PAY-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`
        })
      }

      alert(`${validRows.length} payment(s) saved successfully!`)
      
      // Reload payments from database
      await loadPayments()
      
      // Reset form
      setPaymentRows([{
        id: '1',
        date: '',
        description: '',
        amount: '',
        type: 'payin'
      }])
      setShowAddPaymentForm(false)
    } catch (error) {
      console.error('Error saving payments:', error)
      alert('Failed to save payments. Please try again.')
    }
  }

  const generatePDFReport = () => {
    if (!fromDate && !toDate) {
      alert('Please select a date range to generate the report')
      return
    }

    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.width
    const pageHeight = doc.internal.pageSize.height
    
    // Company Header
    doc.setFillColor(41, 128, 185) // Professional blue
    doc.rect(0, 0, pageWidth, 35, 'F')
    
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(24)
    doc.setFont('helvetica', 'bold')
    doc.text('NASHK', 15, 20)
    
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text('Expense & Employee Management System', 15, 27)
    
    // Report Title
    doc.setTextColor(0, 0, 0)
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    const reportTitle = activeTab === 'payin' ? 'PAYIN TRANSACTIONS REPORT' : 'PAYOUT TRANSACTIONS REPORT'
    doc.text(reportTitle, pageWidth / 2, 50, { align: 'center' })
    
    // Date Range
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(100, 100, 100)
    const dateRangeText = fromDate && toDate 
      ? `Period: ${new Date(fromDate).toLocaleDateString()} - ${new Date(toDate).toLocaleDateString()}`
      : fromDate 
      ? `From: ${new Date(fromDate).toLocaleDateString()}`
      : `Until: ${new Date(toDate).toLocaleDateString()}`
    doc.text(dateRangeText, pageWidth / 2, 57, { align: 'center' })
    
    doc.setTextColor(0, 0, 0)
    doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth / 2, 63, { align: 'center' })
    
    // Summary Box
    const payinTotal = filteredPayments.filter(p => p.type === 'credit').reduce((sum, p) => sum + p.amount, 0)
    const payoutTotal = filteredPayments.filter(p => p.type === 'debit').reduce((sum, p) => sum + p.amount, 0)
    const netBalance = payinTotal - payoutTotal
    
    doc.setFillColor(240, 240, 240)
    doc.roundedRect(15, 70, pageWidth - 30, 30, 3, 3, 'F')
    
    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(0, 0, 0)
    
    const summaryY = 80
    doc.text('Total Payin:', 25, summaryY)
    doc.setTextColor(0, 150, 0)
    doc.text(formatCurrency(payinTotal), 70, summaryY)
    
    doc.setTextColor(0, 0, 0)
    doc.text('Total Payout:', 25, summaryY + 8)
    doc.setTextColor(220, 0, 0)
    doc.text(formatCurrency(payoutTotal), 70, summaryY + 8)
    
    doc.setTextColor(0, 0, 0)
    doc.text('Net Balance:', 25, summaryY + 16)
    if (netBalance >= 0) {
      doc.setTextColor(0, 150, 0)
    } else {
      doc.setTextColor(220, 0, 0)
    }
    doc.text(formatCurrency(Math.abs(netBalance)), 70, summaryY + 16)
    
    // Transactions Table
    const tableData = filteredPayments.map(payment => [
      payment.reference,
      new Date(payment.created_at).toLocaleDateString(),
      payment.description,
      formatCurrency(payment.amount),
      payment.type === 'credit' ? 'Payin' : 'Payout'
    ])
    
    autoTable(doc, {
      startY: 110,
      head: [['Reference', 'Date', 'Description', 'Amount', 'Type']],
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontStyle: 'bold',
        fontSize: 9
      },
      bodyStyles: {
        fontSize: 8,
        textColor: 50
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      },
      columnStyles: {
        0: { cellWidth: 35 },
        1: { cellWidth: 25 },
        2: { cellWidth: 70 },
        3: { cellWidth: 30, halign: 'right' },
        4: { cellWidth: 20, halign: 'center' }
      },
      margin: { left: 15, right: 15 }
    })
    
    // Footer
    const finalY = (doc as any).lastAutoTable.finalY || 110
    doc.setFontSize(8)
    doc.setTextColor(150, 150, 150)
    doc.setFont('helvetica', 'italic')
    doc.text(
      'This is a computer-generated report. For any discrepancies, please contact the finance department.',
      pageWidth / 2,
      pageHeight - 15,
      { align: 'center' }
    )
    
    // Page numbers
    const pageCount = (doc as any).internal.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i)
      doc.setFontSize(8)
      doc.setTextColor(100, 100, 100)
      doc.text(`Page ${i} of ${pageCount}`, pageWidth - 20, pageHeight - 10)
    }
    
    // Save PDF
    const fileName = `${activeTab}_report_${fromDate || 'all'}_to_${toDate || 'all'}_${new Date().getTime()}.pdf`
    doc.save(fileName)
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Payments</h1>
            <p className="text-muted-foreground">
              Manage and track your payment transactions
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              onClick={generatePDFReport}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
            >
              <FileDown className="h-4 w-4" />
              Generate Report
            </Button>
            <Button className="flex items-center gap-2" onClick={() => setShowAddPaymentForm(true)}>
              <Plus className="h-4 w-4" />
              Add New Payment
            </Button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Payin</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{formatCurrency(totalPayin)}</div>
              <p className="text-xs text-muted-foreground">
                Money received
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Payout</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{formatCurrency(totalPayout)}</div>
              <p className="text-xs text-muted-foreground">
                Money sent
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Balance</CardTitle>
              <Wallet className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(Math.abs(balance))}
              </div>
              <p className="text-xs text-muted-foreground">
                {balance >= 0 ? 'Positive balance' : 'Negative balance'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">From:</span>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="px-3 py-2 border border-input rounded-md text-sm"
                placeholder="From date"
              />
              <span className="text-sm text-muted-foreground">To:</span>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="px-3 py-2 border border-input rounded-md text-sm"
                placeholder="To date"
              />
              {(fromDate || toDate) && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    setFromDate('')
                    setToDate('')
                  }}
                >
                  Clear
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="space-y-4">
          <div className="flex space-x-1 rounded-lg bg-muted p-1">
            <button
              onClick={() => setActiveTab('payin')}
              className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-all ${
                activeTab === 'payin'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Payin ({payments.filter(p => p.type === 'credit').length})
            </button>
            <button
              onClick={() => setActiveTab('payout')}
              className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-all ${
                activeTab === 'payout'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Payout ({payments.filter(p => p.type === 'debit').length})
            </button>
          </div>

          {/* Payments Table */}
          <Card>
            <CardHeader>
              <CardTitle>
                {activeTab === 'payin' ? 'Payin Transactions' : 'Payout Transactions'}
              </CardTitle>
              <CardDescription>
                {filteredPayments.length} {activeTab} transaction{filteredPayments.length !== 1 ? 's' : ''}
                {(fromDate || toDate) && (
                  <span>
                    {fromDate && toDate ? ` from ${new Date(fromDate).toLocaleDateString()} to ${new Date(toDate).toLocaleDateString()}` : 
                     fromDate ? ` from ${new Date(fromDate).toLocaleDateString()}` : 
                     ` until ${new Date(toDate).toLocaleDateString()}`}
                  </span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="p-8 text-center text-muted-foreground">
                  Loading payments...
                </div>
              ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2 font-medium">Reference</th>
                      <th className="text-left p-2 font-medium">Date</th>
                      <th className="text-left p-2 font-medium">Description</th>
                      <th className="text-left p-2 font-medium">Amount</th>
                      <th className="text-left p-2 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPayments.length > 0 ? (
                      filteredPayments.map((payment) => (
                        <tr key={payment.id} className="border-b hover:bg-muted/50">
                          <td className="p-2 font-mono text-sm">{payment.reference}</td>
                          <td className="p-2 text-sm">{formatDate(new Date(payment.created_at), 'short')}</td>
                          <td className="p-2">
                            <p className="font-medium">{payment.description}</p>
                          </td>
                          <td className="p-2 font-medium">
                            <span className={activeTab === 'payin' ? 'text-green-600' : 'text-red-600'}>
                              {activeTab === 'payin' ? '+' : '-'}{formatCurrency(payment.amount)}
                            </span>
                          </td>
                          <td className="p-2">
                            <div className="flex items-center gap-2">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleEditPayment(payment.id)}
                                className="hover:bg-blue-50 hover:text-blue-600"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleDeletePayment(payment.id)}
                                className="hover:bg-red-50 hover:text-red-600"
                              >
                                <Trash className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-muted-foreground">
                          No {activeTab} transactions found
                          {(fromDate || toDate) && ' for the selected date range'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Add Payment Form Modal */}
        {showAddPaymentForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto mx-4">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Add New Payment</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAddPaymentForm(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-4">
                {paymentRows.map((row, index) => (
                  <div key={row.id} className="border rounded-lg p-4 space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium">Payment {index + 1}</h3>
                      {paymentRows.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removePaymentRow(row.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Date</label>
                        <Input
                          type="date"
                          value={row.date}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => updatePaymentRow(row.id, 'date', e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Description</label>
                        <Input
                          placeholder="Enter description"
                          value={row.description}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => updatePaymentRow(row.id, 'description', e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Amount</label>
                        <Input
                          type="number"
                          placeholder="0.00"
                          step="0.01"
                          value={row.amount}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => updatePaymentRow(row.id, 'amount', e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Type</label>
                        <Select
                          value={row.type}
                          onValueChange={(value: string) => updatePaymentRow(row.id, 'type', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="payin">Pay In</SelectItem>
                            <SelectItem value="payout">Pay Out</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                ))}

                <Button
                  variant="outline"
                  onClick={addPaymentRow}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Another Payment
                </Button>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setShowAddPaymentForm(false)}
                >
                  Cancel
                </Button>
                <Button onClick={validateAndSubmitPayments}>
                  Save Payments
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}